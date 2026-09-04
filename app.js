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
const PRAYER_API_URL = window.STILL_WATERS_API_URL || './api/pray';

const scriptures = [
  {
    keys: ['fear', 'afraid', 'scared', 'anxious', 'anxiety', 'worry', 'worried'],
    reference: 'Isaiah 41:10',
    thought: 'You are not asked to face fear alone. God’s presence is steadier than the uncertainty in front of you.'
  },
  {
    keys: ['marriage', 'husband', 'wife', 'partner', 'relationship', 'together'],
    reference: 'Colossians 3:13–14',
    thought: 'Grace, forgiveness, patience, and love can hold a relationship together even in a difficult season.'
  },
  {
    keys: ['family', 'child', 'children', 'daughter', 'son', 'home'],
    reference: 'Joshua 24:15',
    thought: 'Faith can be practiced inside ordinary family life, one choice and one day at a time.'
  },
  {
    keys: ['money', 'financial', 'finances', 'bill', 'bills'],
    reference: 'Matthew 6:31–34',
    thought: 'Today has enough weight of its own. Ask for daily provision and the grace to take the next wise step.'
  },
  {
    keys: ['work', 'career', 'job', 'workplace', 'boss', 'coworker', 'coworkers', 'employment'],
    reference: 'Colossians 3:23–24',
    thought: 'Your work can be approached with faithfulness, integrity, and purpose even when the environment around you feels difficult.'
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

const topicPrayers = {
  Marriage: {
    focus: 'her marriage and the person she has chosen to share her life with',
    paragraphs: [
      'Where love feels difficult to read, give her patience before fear writes the story for her. Help her distinguish between what she knows, what she fears, and what still needs an honest conversation.',
      'Protect the tenderness between them. Where distance has grown, create room for truth without cruelty, listening without defensiveness, and affection that is expressed in ways each of them can actually receive.',
      'If there are wounds beneath the surface, bring them into the light with gentleness. Give both of them humility to own what is theirs, courage to repair what can be repaired, and wisdom about healthy boundaries where they are needed.'
    ]
  },
  Family: {
    focus: 'her family and the people whose lives are woven closely into hers',
    paragraphs: [
      'Give her wisdom for the responsibilities she carries at home. Help her love deeply without believing she must control every outcome.',
      'Bring peace into the places where family life feels strained, noisy, or uncertain. Make room for patience, honesty, forgiveness, and the kind of grace that survives imperfect days.',
      'Protect the people she loves and guide the decisions that affect them. Help her recognize what needs action, what needs conversation, and what needs to be surrendered to You.'
    ]
  },
  Fear: {
    focus: 'the fear that has been taking up too much room in her mind',
    paragraphs: [
      'Slow the thoughts that keep racing ahead of reality. Give her courage to face what is true without being ruled by everything that could go wrong.',
      'When uncertainty feels louder than Your presence, steady her. Remind her that courage does not require the absence of fear; it can look like taking the next faithful step while still feeling afraid.',
      'Give her discernment about what deserves attention and what is only anxiety asking for another hour of her peace.'
    ]
  },
  Finances: {
    focus: 'the financial pressure and responsibility she is carrying',
    paragraphs: [
      'Provide for the needs in front of her and give her wisdom with every practical decision. Replace panic with clarity and shame with steady, responsible action.',
      'Help her see the difference between an urgent problem and a frightening possibility. Give her patience to make sound choices rather than choices driven by fear.',
      'Open appropriate doors for provision, work, support, and opportunity. Teach her to trust You while still being faithful with what is in her hands today.'
    ]
  },
  Work: {
    focus: 'her work, responsibilities, and the people she encounters there',
    paragraphs: [
      'Give her clarity when expectations are confusing and steadiness when the workday becomes heavy. Help her do good work without tying her worth to performance or approval.',
      'Give her wisdom in difficult conversations, patience with coworkers, and courage when she needs to speak honestly or advocate for herself.',
      'Guide her career decisions. If a door should be pursued, give her confidence to move toward it; if patience is needed, give her strength to remain faithful without becoming discouraged.'
    ]
  },
  Direction: {
    focus: 'the decisions and unanswered questions in front of her',
    paragraphs: [
      'Quiet the pressure to solve everything at once. Give her enough clarity for the next step rather than demanding that she see the entire road.',
      'Help her recognize the difference between wisdom, fear, impulse, and outside pressure. Surround her with counsel that is trustworthy and grounded.',
      'Close paths that would pull her away from what is healthy and faithful, and give her courage to walk through the right doors when they become clear.'
    ]
  },
  Forgiveness: {
    focus: 'the hurt she is carrying and the difficult work of forgiveness',
    paragraphs: [
      'Do not let forgiveness become another way of pretending the wound did not matter. Give her room to tell the truth about what hurt while refusing to let bitterness shape who she becomes.',
      'Show her what forgiveness can look like with wisdom and healthy boundaries. Give her patience if healing is slower than she wishes it were.',
      'Where reconciliation is safe and appropriate, soften hearts and make honest repair possible. Where distance is necessary, give her peace without hatred.'
    ]
  },
  Strength: {
    focus: 'the places where she feels tired, stretched thin, or unsure how much more she can carry',
    paragraphs: [
      'Give her strength that is not built on pretending she is fine. Help her receive rest without guilt and support without feeling that she has failed.',
      'Show her what truly needs her energy today and what can wait. Protect her from carrying responsibilities that were never hers to hold alone.',
      'Renew her physically, emotionally, and spiritually. Let small signs of grace become enough encouragement to keep moving one day at a time.'
    ]
  },
  Gratitude: {
    focus: 'the good things she wants to notice and thank You for',
    paragraphs: [
      'Keep gratitude from becoming shallow or forced. Let it help her notice goodness even while some parts of life remain unresolved.',
      'Thank You for the people, provisions, ordinary moments, and quiet mercies that are easy to overlook. Give her eyes to recognize them.',
      'Let gratitude deepen her trust and make her more generous with patience, affection, encouragement, and joy.'
    ]
  }
};

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
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
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

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function concernInsight(concern, topic) {
  const text = concern.toLowerCase();

  if (!text.trim()) {
    return 'You know what she has not been able to put into words. Meet her beneath the noise, where the questions, hopes, disappointments, and needs are known fully by You.';
  }

  if (/does(n['’]?t| not).*love|no longer.*love|stopped.*lov|falling out of love|doesn['’]?t care|not care anymore/.test(text)) {
    return 'You see how painful it is when love feels uncertain. You know the fear underneath that uncertainty: the fear of being unwanted, of losing closeness, and of not knowing whether the distance she feels is temporary or something deeper.';
  }

  if (/leave me|leaving me|lose (him|her|them)|break.?up|divorce|separat/.test(text)) {
    return 'You see the fear of losing a relationship that matters deeply to her. Hold her steady while she faces what is real, without forcing her heart to live inside the worst possible outcome.';
  }

  if (/cheat|affair|betray|lied|lying|trust/.test(text)) {
    return 'You see the wound that appears when trust becomes fragile. You know the questions that follow hurt, the instinct to protect herself, and the longing to know what is true.';
  }

  if (/fight|argu|conflict|not talking|won['’]?t talk|communication|distant|distance|cold/.test(text)) {
    return 'You see the tension beneath the conversations that are not going well and the things that may still be left unsaid. Give her wisdom to pursue clarity without turning every difficult moment into a verdict on the whole relationship.';
  }

  if (/alone|lonely|isolated|nobody|no one/.test(text)) {
    return 'You see the loneliness underneath what she shared and the ache of feeling unseen or unsupported. Remind her that needing closeness is not weakness, and guide her toward people and conversations where she can be known honestly.';
  }

  if (/overwhelm|too much|exhaust|burn.?out|tired|drained/.test(text)) {
    return 'You see how much she has been carrying and how difficult it becomes to think clearly when everything feels urgent at once. Give her permission to be human, to rest, and to receive help.';
  }

  if (/job|work|boss|cowork|career|workplace|fired|layoff|promotion/.test(text)) {
    return 'You see the pressure connected to her work and how easily uncertainty there can follow her home. Guard her confidence, help her see situations clearly, and keep one difficult day or one person’s opinion from defining her worth.';
  }

  if (/money|financial|bill|debt|rent|mortgage|afford|paycheck/.test(text)) {
    return 'You see the pressure that comes when money feels too tight or the future feels financially uncertain. Give her a clear mind for practical decisions and protect her from carrying tomorrow’s fear as though it has already happened.';
  }

  if (/anxious|anxiety|worried|worry|afraid|fear|scared|panic/.test(text)) {
    return 'You see the fear behind the words she shared and the way uncertainty can make every possibility feel immediate. Slow her thoughts enough to separate what is true today from what fear is predicting about tomorrow.';
  }

  if (/decision|choose|choice|direction|what should|don['’]?t know what to do|confused/.test(text)) {
    return 'You see how difficult it is to choose when several paths carry consequences. Give her freedom from the pressure to make a perfect decision and wisdom to recognize the next faithful one.';
  }

  if (topic === 'Marriage') {
    return 'You know the part of her marriage that feels unsettled right now. You see both the love she wants to protect and the questions she may be afraid to ask out loud.';
  }

  if (topic === 'Work') {
    return 'You know what has made work feel heavier lately. You see the pressures, personalities, expectations, and decisions that she carries long after the workday ends.';
  }

  return 'You understand what she meant beneath the words she typed. You know the part that hurts, the part that hopes, and the part that is still trying to understand what to do next.';
}

function genericTopic(concern, topic) {
  const selected = topicPrayers[topic];
  if (selected) return selected;
  return {
    focus: topic ? `what she is carrying in the area of ${topic.toLowerCase()}` : 'everything she is carrying today',
    paragraphs: [
      'Give her wisdom without panic, courage without hardness, and peace that does not require every question to be answered tonight.',
      'Help her recognize what is hers to act on and what she needs to release into Your hands. Give her patience with the things that cannot be rushed.',
      'Surround her with people who are honest, wise, and safe. Keep drawing her closer to You through trust rather than fear or pressure.'
    ]
  };
}

function localPrayer(concern, topic) {
  const guide = genericTopic(concern, topic);
  const insight = concernInsight(concern, topic);
  const shuffled = [...guide.paragraphs].sort(() => Math.random() - 0.5);
  const closing = pick([
    'When her mind tries to solve the entire future tonight, bring her back to the grace available for this moment. Give her enough light for the next step and enough peace to leave the rest with You.',
    'Do not let uncertainty convince her that she is abandoned. Give her strength for what needs courage, softness for what needs grace, and rest from what she cannot control.',
    'Help her move forward without rushing past what her heart needs to process. Give her wisdom for tomorrow, but for this moment, let her simply be held in Your presence.'
  ]);

  return `Heavenly Father,\n\nI bring her before You in ${guide.focus}. ${insight}\n\n${shuffled[0]}\n\n${shuffled[1]}\n\n${shuffled[2]}\n\n${closing}\n\nRemind her that she does not need perfectly formed words for You to hear her. Meet her with truth, mercy, wisdom, and the kind of peace that makes room to breathe again.\n\nIn Jesus’ name, Amen.`;
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
    const response = await fetch(PRAYER_API_URL, {
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
    source: result.source,
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
