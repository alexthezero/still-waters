const views = {
  home: document.getElementById('homeView'),
  loading: document.getElementById('loadingView'),
  prayer: document.getElementById('prayerView'),
  journal: document.getElementById('journalView')
};

const prayerInput = document.getElementById('prayerInput');
const charCount = document.getElementById('charCount');
const prayButton = document.getElementById('prayButton');
const justPrayButton = document.getElementById('justPrayButton');
const prayerText = document.getElementById('prayerText');
const scriptureReference = document.getElementById('scriptureReference');
const scriptureThought = document.getElementById('scriptureThought');
const scriptureLink = document.getElementById('scriptureLink');
const saveButton = document.getElementById('saveButton');
const journalCount = document.getElementById('journalCount');
const journalList = document.getElementById('journalList');
const emptyJournal = document.getElementById('emptyJournal');
const toast = document.getElementById('toast');

let selectedTopic = '';
let currentPrayer = null;
let toastTimer;

const JOURNAL_KEY = 'still-waters-prayer-journal-v1';

const scriptures = [
  {
    keys: ['fear', 'afraid', 'scared', 'anxious', 'anxiety', 'worry', 'worried'],
    reference: 'Isaiah 41:10',
    thought: 'You are not asked to face fear alone. God’s presence is steadier than the uncertainty in front of you.'
  },
  {
    keys: ['marriage', 'husband', 'wife', 'relationship', 'together'],
    reference: 'Colossians 3:13–14',
    thought: 'Grace, forgiveness, patience, and love can hold a relationship together even in a difficult season.'
  },
  {
    keys: ['family', 'child', 'children', 'daughter', 'son', 'home'],
    reference: 'Joshua 24:15',
    thought: 'Faith can be practiced inside ordinary family life, one choice and one day at a time.'
  },
  {
    keys: ['money', 'financial', 'finances', 'bill', 'bills', 'job', 'work'],
    reference: 'Matthew 6:31–34',
    thought: 'Today has enough weight of its own. Ask for daily provision and the grace to take the next wise step.'
  },
  {
    keys: ['direction', 'decision', 'decide', 'choice', 'guidance', 'uncertain', 'confused'],
    reference: 'Proverbs 3:5–6',
    thought: 'You do not need to see the entire road before asking God to guide the next faithful step.'
  },
  {
    keys: ['forgive', 'forgiveness', 'resentment', 'hurt', 'betrayal'],
    reference: 'Ephesians 4:31–32',
    thought: 'Forgiveness is not pretending pain did not happen. It is asking God to keep pain from having the final word.'
  },
  {
    keys: ['tired', 'exhausted', 'strength', 'weak', 'overwhelmed', 'heavy'],
    reference: 'Matthew 11:28–30',
    thought: 'Jesus invites weary people to come close, not after they have pulled themselves together, but while they are tired.'
  },
  {
    keys: ['thank', 'grateful', 'gratitude', 'blessed', 'joy'],
    reference: 'Psalm 100:4–5',
    thought: 'Gratitude creates room to notice God’s goodness without denying the hard things that may still be present.'
  },
  {
    keys: ['peace', 'rest', 'sleep', 'night'],
    reference: 'Philippians 4:6–7',
    thought: 'Prayer can become a place to release what your mind keeps trying to carry by itself.'
  },
  {
    keys: [],
    reference: 'Psalm 46:10',
    thought: 'You are allowed to be still. Not every answer has to arrive before you can rest in God’s presence.'
  }
];

function showView(name) {
  Object.entries(views).forEach(([key, view]) => {
    view.hidden = key !== name;
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function getJournal() {
  try {
    return JSON.parse(localStorage.getItem(JOURNAL_KEY) || '[]');
  } catch {
    return [];
  }
}

function setJournal(entries) {
  localStorage.setItem(JOURNAL_KEY, JSON.stringify(entries));
  updateJournalCount();
}

function updateJournalCount() {
  journalCount.textContent = getJournal().length;
}

function showToast(message) {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add('show');
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
}

function selectScripture(text, topic = '') {
  const haystack = `${topic} ${text}`.toLowerCase();
  const match = scriptures.find(item => item.keys.some(key => haystack.includes(key))) || scriptures[scriptures.length - 1];
  return {
    reference: match.reference,
    thought: match.thought,
    url: `https://www.biblegateway.com/passage/?search=${encodeURIComponent(match.reference)}`
  };
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function formatPrayer(text) {
  return text
    .split(/\n\s*\n/)
    .map(part => part.trim())
    .filter(Boolean)
    .map(part => `<p>${escapeHtml(part).replaceAll('\n', '<br>')}</p>`)
    .join('');
}

function summarizeConcern(text) {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (!cleaned) return '';
  const firstSentence = cleaned.match(/^.*?[.!?](?:\s|$)/)?.[0] || cleaned;
  return firstSentence.slice(0, 220).replace(/[.!?]+$/, '');
}

function localPrayer(concern, topic) {
  const brief = summarizeConcern(concern);
  const topicPhrase = topic ? `especially in the area of ${topic.toLowerCase()}` : 'in everything she is carrying today';
  const detail = brief
    ? `You know the concern she brought here today — ${brief.charAt(0).toLowerCase()}${brief.slice(1)}. You understand the parts she can explain and the parts she cannot yet put into words.`
    : 'You know what is weighing on her even when she cannot find the words for it. You see every question, every hope, and every quiet burden.';

  const middleOptions = [
    'Give her wisdom without panic, courage without hardness, and peace that does not depend on having every answer tonight.',
    'Help her separate what she can faithfully do from what she needs to place back into Your hands. Quiet the noise around her enough to recognize the next wise step.',
    'Meet her in the places that feel uncertain. Give her patience for what cannot be rushed, clarity for what needs action, and grace for herself while she is still figuring things out.'
  ];

  const relationshipOptions = [
    'Protect the people she loves. Bring gentleness into strained conversations, honesty where things have gone unspoken, and humility wherever healing needs to begin.',
    'Strengthen her relationships and guard her heart from fear, resentment, and isolation. Give her trustworthy people who can walk beside her with wisdom and love.',
    'Where relationships feel tender, make room for truth and grace to exist together. Help her know when to speak, when to listen, and when simply to rest.'
  ];

  const endingOptions = [
    'Remind her that she does not have to solve tomorrow before she is allowed to rest tonight. Hold what she cannot carry, and guide her one faithful step at a time.',
    'Let her leave this moment a little less burdened than she entered it. Keep drawing her closer to You, not through fear or pressure, but through trust.',
    'Give her enough light for the next step, enough strength for today, and enough peace to release what remains unfinished.'
  ];

  const pick = list => list[Math.floor(Math.random() * list.length)];

  return `Heavenly Father,\n\nI lift her to You ${topicPhrase}. ${detail}\n\n${pick(middleOptions)}\n\n${pick(relationshipOptions)}\n\n${pick(endingOptions)}\n\nThank You for hearing her before the words are polished and for meeting her exactly where she is.\n\nIn Jesus’ name, Amen.`;
}

function containsImmediateRisk(text) {
  const value = text.toLowerCase();
  return [
    'kill myself',
    'end my life',
    'hurt myself',
    'don’t want to live',
    "don't want to live",
    'want to die'
  ].some(phrase => value.includes(phrase));
}

async function requestPrayer(concern, topic) {
  try {
    const response = await fetch('./api/pray', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ concern, topic })
    });

    if (!response.ok) throw new Error(`Prayer service returned ${response.status}`);
    const data = await response.json();
    if (!data.prayer || typeof data.prayer !== 'string') throw new Error('Prayer response was incomplete');

    return {
      prayer: data.prayer.trim(),
      scripture: data.scripture || selectScripture(concern, topic),
      source: 'ai'
    };
  } catch (error) {
    console.info('Still Waters is using the built-in prayer mode.', error.message);
    return {
      prayer: localPrayer(concern, topic),
      scripture: selectScripture(concern, topic),
      source: 'local'
    };
  }
}

async function beginPrayer(forceBlank = false) {
  const concern = forceBlank ? '' : prayerInput.value.trim();

  if (!forceBlank && !concern && !selectedTopic) {
    prayerInput.focus();
    showToast('Share a little of what is on your heart, or choose “just pray for me.”');
    return;
  }

  if (containsImmediateRisk(concern)) {
    showToast('If you may be in immediate danger, contact emergency services or someone you trust right now.');
  }

  prayButton.disabled = true;
  justPrayButton.disabled = true;
  showView('loading');

  const result = await requestPrayer(concern, selectedTopic);
  currentPrayer = {
    id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
    topic: selectedTopic || 'Prayer',
    concern,
    prayer: result.prayer,
    scripture: {
      ...result.scripture,
      url: result.scripture?.url || `https://www.biblegateway.com/passage/?search=${encodeURIComponent(result.scripture?.reference || 'Psalm 46:10')}`
    },
    createdAt: new Date().toISOString()
  };

  prayerText.innerHTML = formatPrayer(currentPrayer.prayer);
  scriptureReference.textContent = currentPrayer.scripture.reference;
  scriptureThought.textContent = currentPrayer.scripture.thought;
  scriptureLink.href = currentPrayer.scripture.url;
  saveButton.textContent = '♡ Save this prayer';
  saveButton.disabled = false;

  prayButton.disabled = false;
  justPrayButton.disabled = false;
  showView('prayer');
}

function saveCurrentPrayer() {
  if (!currentPrayer) return;
  const entries = getJournal();
  if (entries.some(entry => entry.id === currentPrayer.id)) {
    showToast('This prayer is already saved.');
    return;
  }
  entries.unshift(currentPrayer);
  setJournal(entries.slice(0, 100));
  saveButton.textContent = '✓ Saved to your journal';
  showToast('Saved privately on this device.');
}

function renderJournal() {
  const entries = getJournal();
  journalList.innerHTML = '';
  emptyJournal.hidden = entries.length > 0;

  entries.forEach(entry => {
    const card = document.createElement('article');
    card.className = 'journal-entry';
    const date = new Date(entry.createdAt);
    const label = Number.isNaN(date.getTime())
      ? ''
      : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

    card.innerHTML = `
      <div class="journal-entry-head">
        <h3>${escapeHtml(entry.topic || 'Prayer')}</h3>
        <span class="journal-date">${escapeHtml(label)}</span>
      </div>
      <p class="journal-preview">${escapeHtml(entry.prayer || '')}</p>
      <div class="journal-actions">
        <button type="button" data-open="${escapeHtml(entry.id)}">Read prayer</button>
        <button type="button" class="delete" data-delete="${escapeHtml(entry.id)}">Delete</button>
      </div>`;

    journalList.appendChild(card);
  });
}

function openSavedPrayer(id) {
  const entry = getJournal().find(item => item.id === id);
  if (!entry) return;
  currentPrayer = entry;
  prayerText.innerHTML = formatPrayer(entry.prayer);
  scriptureReference.textContent = entry.scripture?.reference || 'Psalm 46:10';
  scriptureThought.textContent = entry.scripture?.thought || 'Be still and remember that you do not have to carry everything at once.';
  scriptureLink.href = entry.scripture?.url || `https://www.biblegateway.com/passage/?search=${encodeURIComponent(entry.scripture?.reference || 'Psalm 46:10')}`;
  saveButton.textContent = '✓ Saved to your journal';
  showView('prayer');
}

function deleteSavedPrayer(id) {
  const remaining = getJournal().filter(item => item.id !== id);
  setJournal(remaining);
  renderJournal();
  showToast('Prayer removed from this device.');
}

prayerInput.addEventListener('input', () => {
  charCount.textContent = `${prayerInput.value.length} / 2000`;
});

prayerInput.addEventListener('keydown', event => {
  if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') beginPrayer(false);
});

document.getElementById('topics').addEventListener('click', event => {
  const button = event.target.closest('[data-topic]');
  if (!button) return;
  const topic = button.dataset.topic;
  selectedTopic = selectedTopic === topic ? '' : topic;
  document.querySelectorAll('.topic-chip').forEach(chip => {
    chip.classList.toggle('active', chip.dataset.topic === selectedTopic);
  });
});

prayButton.addEventListener('click', () => beginPrayer(false));
justPrayButton.addEventListener('click', () => beginPrayer(true));
saveButton.addEventListener('click', saveCurrentPrayer);

document.getElementById('backButton').addEventListener('click', () => showView('home'));
document.getElementById('againButton').addEventListener('click', () => {
  currentPrayer = null;
  prayerInput.value = '';
  charCount.textContent = '0 / 2000';
  selectedTopic = '';
  document.querySelectorAll('.topic-chip').forEach(chip => chip.classList.remove('active'));
  showView('home');
  setTimeout(() => prayerInput.focus(), 250);
});

document.getElementById('journalButton').addEventListener('click', () => {
  renderJournal();
  showView('journal');
});

document.getElementById('journalBackButton').addEventListener('click', () => showView('home'));

journalList.addEventListener('click', event => {
  const openButton = event.target.closest('[data-open]');
  const deleteButton = event.target.closest('[data-delete]');
  if (openButton) openSavedPrayer(openButton.dataset.open);
  if (deleteButton) deleteSavedPrayer(deleteButton.dataset.delete);
});

updateJournalCount();
