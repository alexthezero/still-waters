'use strict';

const byId = id => document.getElementById(id);
const views = { home: byId('homeView'), loading: byId('loadingView'), prayer: byId('prayerView'), journal: byId('journalView') };
const JOURNAL_KEY = 'still-waters-prayer-journal-v1';
// Keep the existing optional server prayer flow; the full scenario experience is local.
const onGitHubPages = window.location.hostname.endsWith('.github.io');
const PRAYER_API_URL = window.STILL_WATERS_API_URL || (onGitHubPages ? '' : './api/pray');
const nextWrittenPrayer = createPrayerPicker(PRAYER_LIBRARY);
let currentPrayer = null;
let lastTopic = '';
let toastTimer;
let pendingRequest = null;
let requestVersion = 0;

function showToast(message) {
  clearTimeout(toastTimer);
  byId('toast').textContent = message;
  byId('toast').classList.add('show');
  toastTimer = setTimeout(() => byId('toast').classList.remove('show'), 3500);
}

function showView(name, updateHistory = true) {
  if (!views[name]) name = 'home';
  Object.entries(views).forEach(([key, view]) => { view.hidden = key !== name; });
  if (updateHistory && name !== 'loading' && window.location.hash !== '#' + name) {
    window.history.pushState({ view: name }, '', '#' + name);
  }
  window.scrollTo({ top: 0, behavior: 'instant' });
  const heading = { home: 'homeHeading', prayer: 'prayerTitle', journal: 'journalHeading' }[name];
  if (heading) byId(heading).focus({ preventScroll: true });
}

function stopPendingRequest() {
  requestVersion += 1;
  pendingRequest?.abort();
  pendingRequest = null;
  byId('prayButton').disabled = false;
}

function goHome() {
  stopPendingRequest();
  byId('supportNote').hidden = true;
  showView('home');
  const lastButton = [...document.querySelectorAll('[data-topic]')].find(button => button.dataset.topic === lastTopic);
  if (lastButton) lastButton.focus({ preventScroll: true });
}

function escapeHtml(value) {
  return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
}

function formatPrayer(text) {
  return String(text).split(/\n\s*\n/).map(part => part.trim()).filter(Boolean)
    .map(part => '<p>' + escapeHtml(part).replaceAll('\n', '<br>') + '</p>').join('');
}

function getJournal() {
  try {
    const entries = JSON.parse(localStorage.getItem(JOURNAL_KEY) || '[]');
    if (!Array.isArray(entries)) return [];
    return entries.filter(entry => entry && typeof entry.id === 'string' && typeof entry.prayer === 'string').slice(0, 100);
  } catch { return []; }
}

function updateJournalCount() { byId('journalCount').textContent = getJournal().length; }

function setJournal(entries) {
  try {
    localStorage.setItem(JOURNAL_KEY, JSON.stringify(entries));
    updateJournalCount();
    return true;
  } catch {
    showToast('This browser could not save the change. You can still read every prayer.');
    return false;
  }
}

function isSaved(prayer) {
  return getJournal().some(entry => entry.id === prayer.id || (prayer.catalogId && entry.catalogId === prayer.catalogId));
}

function scriptureFor(topic) {
  const guide = PRAYER_LIBRARY[topic] || PRAYER_LIBRARY.General;
  return { reference: guide.reference, thought: guide.reflection };
}

function showPrayer(prayer) {
  currentPrayer = prayer;
  const guide = PRAYER_LIBRARY[prayer.topic] || PRAYER_LIBRARY.General;
  const scripture = prayer.scripture || scriptureFor(prayer.topic);
  byId('prayerTopic').textContent = guide.label;
  byId('prayerTitle').textContent = prayer.title || 'A prayer to return to';
  byId('prayerContext').textContent = prayer.matched
    ? 'A written prayer selected for what you shared. Take your time.'
    : 'Let these words be prayed over you. Take your time.';
  byId('prayerText').innerHTML = formatPrayer(prayer.prayer);
  byId('closingThought').textContent = prayer.thought || '';
  byId('closingThought').hidden = !prayer.thought;
  byId('prayerNumber').textContent = Number.isInteger(prayer.index) ? (prayer.index + 1) + ' of ' + guide.prayers.length : '';
  byId('scriptureReference').textContent = scripture.reference || guide.reference;
  byId('scriptureThought').textContent = scripture.thought || guide.reflection;
  // Never trust a stored or remote URL as an active link.
  byId('scriptureLink').href = 'https://www.biblegateway.com/passage/?search=' + encodeURIComponent(scripture.reference || guide.reference) + '&version=KJV';
  const saved = isSaved(prayer);
  byId('saveButton').textContent = saved ? '✓ Saved in your journal' : '♡ Save this prayer';
  byId('saveButton').disabled = saved;
  byId('sourceNote').textContent = prayer.source === 'ai'
    ? 'An AI-written prayer for encouragement and reflection.'
    : prayer.source === 'written'
      ? 'An original written prayer for encouragement and reflection.'
      : 'A prayer saved from an earlier visit.';
  byId('anotherButton').textContent = prayer.source === 'ai' ? 'Read a written prayer for this situation' : 'Read another prayer';
  showView('prayer');
}

function openScenario(topic = 'General', matched = false) {
  stopPendingRequest();
  if (!Object.hasOwn(PRAYER_LIBRARY, topic)) topic = 'General';
  lastTopic = topic;
  let selection = nextWrittenPrayer(topic);
  // A saved prayer may not be the picker's last item.
  if (currentPrayer?.catalogId === selection.catalogId) selection = nextWrittenPrayer(topic);
  showPrayer({ ...selection, matched, createdAt: new Date().toISOString() });
}

// Free text is never inserted into a written prayer or retained in a new journal entry.
function matchSituation(text) {
  const value = text.toLowerCase();
  const matchers = [
    ['Grief', /\b(grief|grieving|died|death|funeral|bereave|passed away|miscarriage|missing someone)\b/],
    ['Work', /\b(work|workplace|job|boss|coworker|coworkers|career|fired|layoff|promotion|manager|colleague|colleagues)\b/],
    ['Marriage', /\b(marriage|husband|wife|partner|relationship|divorce|affair|cheating|betrayal|arguing|fight|fighting)\b/],
    ['Motherhood', /\b(motherhood|mom|mother|parenting|baby|toddler|newborn|parent|postpartum)\b/],
    ['Finances', /\b(money|finances|financial|bill|bills|debt|rent|mortgage|afford|paycheck)\b/],
    ['Faith', /\b(faith|god|belief|believe|doubt|doubts|church|spiritual)\b/],
    ['Loneliness', /\b(alone|lonely|loneliness|unseen|unwanted|unloved|isolated|worthless|not enough)\b/],
    ['Forgiveness', /\b(forgive|forgiveness|resentment|bitter|bitterness|hurt|regret|guilt|guilty|ashamed)\b/],
    ['Rest', /\b(sleep|sleeping|insomnia|bedtime|rest|night)\b/],
    ['Strength', /\b(overwhelmed|overwhelming|exhausted|exhaustion|tired|burnout|drained|too much|stretched)\b/],
    ['Fear', /\b(anxious|anxiety|worried|worry|afraid|fear|scared|panic|overthinking)\b/],
    ['Direction', /\b(decision|choose|choice|direction|uncertain|confused|what to do|guidance|waiting)\b/],
    ['Family', /\b(family|daughter|son|children|child|sister|brother|father|parents|home)\b/],
    ['Gratitude', /\b(thank|thanks|thankful|grateful|gratitude|blessed|joy|happy)\b/]
  ];
  return matchers.find(([, pattern]) => pattern.test(value))?.[0] || 'General';
}

function containsImmediateRisk(text) {
  return /kill myself|end my life|hurt myself|don['’]t want to live|do not want to live|want to die/i.test(text);
}

async function beginPersonalPrayer() {
  if (pendingRequest) return;
  const concern = byId('prayerInput').value.trim();
  const topic = byId('personalTopic').value || matchSituation(concern);
  if (!concern && !byId('personalTopic').value) {
    byId('prayerInput').focus();
    showToast('Share a little, choose a situation, or use “Just pray over me.”');
    return;
  }
  byId('supportNote').hidden = !containsImmediateRisk(concern);
  if (!PRAYER_API_URL || !concern) { openScenario(topic, Boolean(concern)); return; }
  stopPendingRequest();
  const version = requestVersion;
  const controller = new AbortController();
  pendingRequest = controller;
  const timeout = setTimeout(() => controller.abort(), 15000);
  byId('prayButton').disabled = true;
  showView('loading', false);
  try {
    const response = await fetch(PRAYER_API_URL, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ concern, topic }), signal: controller.signal
    });
    if (!response.ok) throw new Error('Prayer service unavailable');
    const data = await response.json();
    if (typeof data.prayer !== 'string' || !data.prayer.trim()) throw new Error('Prayer response incomplete');
    if (version !== requestVersion) return;
    const id = window.crypto?.randomUUID?.() || Date.now() + '-' + Math.random();
    showPrayer({ id, topic, title: 'A prayer for what you shared', prayer: data.prayer.trim(),
      scripture: scriptureFor(topic), source: 'ai', createdAt: new Date().toISOString() });
  } catch {
    if (version !== requestVersion) return;
    openScenario(topic, true);
    showToast('A written prayer is here for you while personal prayer is unavailable.');
  } finally {
    clearTimeout(timeout);
    if (pendingRequest === controller) pendingRequest = null;
    byId('prayButton').disabled = false;
  }
}

function saveCurrentPrayer() {
  if (!currentPrayer || isSaved(currentPrayer)) return;
  const entries = getJournal();
  // Do not silently evict earlier prayers when this browser's journal is full.
  if (entries.length >= 100) { showToast('Your journal holds 100 prayers. Remove one to make room for another.'); return; }
  const { concern, ...savedPrayer } = currentPrayer;
  if (!setJournal([savedPrayer, ...entries])) return;
  byId('saveButton').textContent = '✓ Saved in your journal';
  byId('saveButton').disabled = true;
  showToast('Saved in this browser on this device.');
}

function renderJournal() {
  const entries = getJournal();
  byId('journalList').replaceChildren();
  byId('emptyJournal').hidden = entries.length > 0;
  for (const entry of entries) {
    const card = document.createElement('article');
    card.className = 'journal-entry';
    const date = new Date(entry.createdAt);
    const label = Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    card.innerHTML = '<div class="journal-entry-head"><h2>' + escapeHtml(entry.title || entry.topic || 'Prayer') + '</h2><span class="journal-date">' + escapeHtml(label) + '</span></div>'
      + '<p class="journal-preview">' + escapeHtml(entry.prayer) + '</p>'
      + '<div class="journal-actions"><button type="button" data-open="' + escapeHtml(entry.id) + '">Read prayer</button><button type="button" class="delete" data-delete="' + escapeHtml(entry.id) + '">Remove</button></div>';
    byId('journalList').appendChild(card);
  }
}

byId('topics').addEventListener('click', event => {
  const button = event.target.closest('[data-topic]');
  if (button) { byId('supportNote').hidden = true; openScenario(button.dataset.topic); }
});
byId('justPrayButton').addEventListener('click', () => { byId('supportNote').hidden = true; openScenario('General'); });
byId('anotherButton').addEventListener('click', () => openScenario(currentPrayer?.topic || 'General'));
byId('prayButton').addEventListener('click', beginPersonalPrayer);
byId('saveButton').addEventListener('click', saveCurrentPrayer);
byId('prayerInput').addEventListener('input', () => { byId('charCount').textContent = byId('prayerInput').value.length + ' / 2000'; });
byId('prayerInput').addEventListener('keydown', event => {
  if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') { event.preventDefault(); beginPersonalPrayer(); }
});
for (const id of ['backButton', 'journalBackButton', 'againButton', 'cancelButton']) byId(id).addEventListener('click', goHome);
byId('homeLink').addEventListener('click', event => { event.preventDefault(); goHome(); });
byId('journalButton').addEventListener('click', () => {
  stopPendingRequest(); byId('supportNote').hidden = true; renderJournal(); showView('journal');
});
byId('journalList').addEventListener('click', event => {
  const openButton = event.target.closest('[data-open]');
  const deleteButton = event.target.closest('[data-delete]');
  if (openButton) {
    const entry = getJournal().find(item => item.id === openButton.dataset.open);
    if (entry) showPrayer(entry);
  }
  if (deleteButton) {
    const entry = getJournal().find(item => item.id === deleteButton.dataset.delete);
    if (!entry || !window.confirm('Remove this prayer from this browser’s journal?')) return;
    if (setJournal(getJournal().filter(item => item.id !== entry.id))) {
      renderJournal(); byId('journalHeading').focus({ preventScroll: true }); showToast('Prayer removed from this browser.');
    }
  }
});
window.addEventListener('popstate', () => {
  stopPendingRequest(); byId('supportNote').hidden = true;
  const target = window.location.hash.slice(1);
  if (target === 'journal') { renderJournal(); showView('journal', false); }
  else if (target === 'prayer' && currentPrayer) showView('prayer', false);
  else showView('home', false);
});

for (const [topic, guide] of Object.entries(PRAYER_LIBRARY)) {
  if (topic === 'General') continue;
  const option = document.createElement('option');
  option.value = topic; option.textContent = guide.label; byId('personalTopic').appendChild(option);
}
if (PRAYER_API_URL) {
  byId('privacyNote').textContent = 'Choosing a situation stays on this device. Submitting these words sends them to the prayer service and, when configured, OpenAI to write a prayer. If unavailable, a written prayer is selected instead.';
  byId('prayButton').textContent = 'Pray with me';
}
updateJournalCount();
if (window.location.hash === '#journal') { renderJournal(); showView('journal', false); }
else if (window.location.hash && window.location.hash !== '#home') window.history.replaceState({ view: 'home' }, '', '#home');
