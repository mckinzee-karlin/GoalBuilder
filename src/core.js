/* ===== Data ===== */
const D = JSON.parse(document.getElementById('appdata').textContent);

/* ===== Helpers ===== */
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const cap = s => s ? s[0].toUpperCase() + s.slice(1) : s;
const lcFirst = s => s ? s[0].toLowerCase() + s.slice(1) : s;
const joinList = a => a.length <= 1 ? (a[0] || '') : a.length === 2 ? a.join(' and ') : a.slice(0, -1).join(', ') + ', and ' + a[a.length - 1];
const todayISO = () => { const d = new Date(); return isoOf(d); };
const isoOf = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
const parseISO = s => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || ''); return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null; };
const fmtLong = s => { const d = parseISO(s); return d ? d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '[date]'; };
const fmtShort = s => { const d = parseISO(s); return d ? d.toLocaleDateString('en-US', { year: 'numeric', month: 'numeric', day: 'numeric' }) : ''; };
const addDays = (d, n) => { const x = new Date(d.getTime()); x.setDate(x.getDate() + n); return x; };
function defaultEnd() { const d = new Date(); d.setFullYear(d.getFullYear() + 1); d.setDate(d.getDate() - 1); return isoOf(d); }

const GRADES = [
  ['PK', 'Prekindergarten (PK3 or PK4)'], ['K', 'Kindergarten'], ['1', 'Grade 1'], ['2', 'Grade 2'], ['3', 'Grade 3'], ['4', 'Grade 4'],
  ['5', 'Grade 5'], ['6', 'Grade 6'], ['7', 'Grade 7'], ['8', 'Grade 8'], ['E1', 'Grade 9 (English I)'], ['E2', 'Grade 10 (English II)'],
  ['E3', 'Grade 11 (English III)'], ['E4', 'Grade 12 (English IV)']
];
const gradeLabel = k => (GRADES.find(g => g[0] === k) || [k, k])[1];
const gradeShort = k => k === 'PK' ? 'PK' : k === 'K' ? 'K' : /^E\d$/.test(k) ? 'Eng ' + ['I', 'II', 'III', 'IV'][+k[1] - 1] : 'Gr ' + k;
const TEKS_GRADES = D.teks.grades; // K..8, E1..E4

const CUE_ORDER = ['M', 'V', 'G', 'I']; // most to least support
const CUE = {
  I: { name: 'Independent', short: 'independent', def: 'Wait with an expectant look. No gesture, question, or model is given.' },
  G: { name: 'Gesture', short: 'gesture', def: 'Point or gesture toward the materials or response options, then wait.' },
  V: { name: 'Verbal', short: 'verbal', def: 'Give a spoken or signed question or direction that leads toward the response.' },
  M: { name: 'Model', short: 'model', def: 'Show the response, then give the student a turn to do it.' }
};
const SCALE_CONTEXTS = {
  0: ['academic routines', 'shared reading', 'group discussions about academic content', 'language-based academic routines', 'small-group instruction', 'student-directed language activities', 'classroom routines'],
  1: ['academic routines', 'shared reading', 'read-alouds of instructional-level text', 'academic vocabulary routines', 'following classroom directions', 'student-directed language activities', 'classroom routines'],
  2: ['alphabet and letter-sound activities', 'predictable chart writing', 'word study', 'shared reading', 'student-directed language activities', 'classroom routines'],
  3: ['shared reading of familiar texts', 'teacher read-alouds', 'partner reading', 'independent reading of new texts', 'student-directed language activities', 'classroom routines'],
  4: ['shared reading', 'environmental print activities', 'shared writing', 'book handling routines', 'student-directed language activities', 'classroom routines']
};
const METHODS = [
  ['obs', 'teacher observation recorded on a data sheet'],
  ['tracker', 'documentation in the Project VC Evidence Tracker'],
  ['work', 'work samples'],
  ['media', 'photographs, video, or audio recordings'],
  ['aac', 'AAC system language samples or usage logs']
];
const FAM = {
  fam: 'in familiar activities with familiar partners',
  ut: 'in familiar and new activities with familiar partners',
  up: 'in familiar activities with familiar and new partners',
  both: 'in familiar and new activities with familiar and new partners'
};
const FAM_SHORT = { fam: 'familiar activities with familiar partners', ut: 'familiar and new activities, familiar partners', up: 'familiar activities, familiar and new partners', both: 'familiar and new activities and partners' };
const FREQ = { daily: 'daily', two: 'twice per week', weekly: 'weekly', biweekly: 'every two weeks' };
const REPORT = { 6: 'every 6 weeks', 9: 'every 9 weeks', 18: 'each semester (about 18 weeks)' };

/* ===== Communication checklist data ===== */
const COMM_FORMS = [
  { id: 'voc', label: 'Vocalization or speech', short: 'Voc', phrase: 'speech or vocalizations', sym: 'speech', grp: 0 },
  { id: 'face', label: 'Facial expression', short: 'Face', phrase: 'facial expressions', grp: 0 },
  { id: 'body', label: 'Body movement', short: 'Body', phrase: 'body movement', grp: 0 },
  { id: 'gaze', label: 'Eye gaze', short: 'Gaze', phrase: 'eye gaze', grp: 0 },
  { id: 'sign', label: 'Signs or symbolic gestures', short: 'Sign', phrase: 'signs or symbolic gestures', sym: 'signs', grp: 0 },
  { id: 'pic', label: 'Objects or pictures', short: 'Pic', phrase: 'objects or picture symbols', sym: 'picture symbols', grp: 1 },
  { id: 'aac', label: 'AAC device or app', short: 'AAC', phrase: 'AAC', sym: 'AAC', grp: 1 },
];
const COMM_ROWS = [
  { id: 'agree', label: 'Agree or confirm', v: 'agreeing or confirming' },
  { id: 'disagree', label: 'Disagree or deny', v: 'disagreeing or denying' },
  { id: 'greet', label: 'Greet or part', v: 'greeting or parting' },
  { id: 'protest', label: 'Protest or reject', v: 'protesting or rejecting' },
  { id: 'reqObj', label: 'Request an object', v: 'requesting an object' },
  { id: 'direct', label: 'Direct the actions of others', v: 'directing the actions of others' },
  { id: 'reqHelp', label: 'Request assistance', v: 'requesting assistance' },
  { id: 'reqMore', label: 'Request recurrence (more or again)', v: 'requesting more or requesting something again' },
  { id: 'reqInfo', label: 'Request information', v: 'requesting information' },
  { id: 'comObj', label: 'Comment on an object', v: 'commenting on an object' },
  { id: 'comAct', label: 'Comment on an action', v: 'commenting on an action' },
  { id: 'labPer', label: 'Label or name a person', v: 'labeling or naming a person' },
  { id: 'labThing', label: 'Label or name a thing', v: 'labeling or naming a thing' },
  { id: 'emotion', label: 'Express emotion', v: 'expressing emotion' }
];
/* AAC access needs by area (SETT-style) */
const AAC_ACCESS = [
  { id: 'vision', label: 'Vision', items: [['hcs', 'high-contrast symbols'], ['mask', 'masking'], ['large', 'large icons'], ['tee', 'touch enter and exit'], ['kg', 'keyguard'], ['vscan', 'visual scanning with zoom'], ['ascan', 'auditory scanning']] },
  { id: 'hearing', label: 'Hearing', items: [['amp', 'amplification'], ['bt', 'Bluetooth connection with a hearing aid'], ['freq', 'adjusted voice output frequency'], ['vfb', 'visual feedback for selection'], ['icon', 'icons in the message window']] },
  { id: 'fine', label: 'Fine motor', items: [['mask', 'masking'], ['large', 'large icons'], ['stylus', 'stylus'], ['kg', 'keyguard'], ['tee', 'touch enter and exit'], ['dwell', 'dwell time'], ['sw1', 'single-switch scanning'], ['sw2', 'multi-switch scanning'], ['head', 'head pointing'], ['eye', 'eye gaze']] },
  { id: 'gross', label: 'Gross motor', items: [['wc', 'wheelchair mount'], ['table', 'table mount'], ['floor', 'rolling floor stand'], ['sw', 'switch scanning'], ['head', 'head pointing'], ['eye', 'eye gaze']] }
];
/* Features of a robust system: three answers each */
const AAC_FEATS = [
  { id: 'lang', label: 'Vocabulary in every language the student needs', short: 'vocabulary in every language the student needs' },
  { id: 'func', label: 'Ability to participate in the full range of communication functions (requesting, commenting, protesting, refusing, greeting, asking and answering questions)', short: 'the full range of communication functions (requesting, commenting, protesting, refusing, greeting, asking and answering questions)' },
  { id: 'core', label: 'Core vocabulary', short: 'core vocabulary' },
  { id: 'fringe', label: 'Fringe vocabulary (people, places, topics, interests)', short: 'fringe vocabulary (people, places, topics, interests)' },
  { id: 'pers', label: 'Personally relevant vocabulary (favorites, family, humor, opinions)', short: 'personally relevant vocabulary (favorites, family, humor, opinions)' },
  { id: 'alpha', label: 'Access to the entire alphabet', short: 'the entire alphabet' },
  { id: 'morph', label: 'Grammatical endings (-ing, -s, -ed)', short: 'grammatical endings (-ing, -s, -ed)' }
];
const AAC_FEAT_OPTS = [['use', 'Has it and uses it'], ['has', 'Has it, not yet using'], ['no', 'System does not provide it']];
const AAC_SUPPORTS = [
  ['nobackup', 'A no-tech backup is available', 'a no-tech backup is available'],
  ['model', 'Partners are trained to model on the system (aided language input)', 'communication partners are trained to model on the system (aided language input)'],
  ['caregiver', 'Caregiver training is offered', 'caregiver training is offered'],
  ['vocplan', 'Vocabulary is planned with the family for individually relevant words', 'vocabulary is planned with the family for individually relevant words'],
  ['impl', 'Classroom implementation support from', 'classroom implementation support is provided by']
];
const MODE_NEED = { '0:E1c': 'body', '0:E1d': 'voc', '0:E1e': 'face' };

/* ===== Assistive technology (TEA intensity of services rubric, Factor D, adapted) ===== */
// Flag: [key, label, sentence(w), tier]  tier: none|min|mod|sig|ctx
const TECH_TIERS = [['min', 'Minimum'], ['mod', 'Moderate'], ['sig', 'Significant']];
const TECH = {
  com: {
    title: 'Assistive technology for communication',
    intro: "Layout and wording follow Factor D of the TEA rubric for Domain 3, Communication Supports. Check each statement that is true for this student.",
    ph: 'Example: a dynamic display speech-generating device with an 84-location grid, organized for language learning through motor planning, and a no-tech core board that matches the home page of the device',
    flags: [
      ['none', 'Standard materials; no special technology or equipment required', w => `${cap(w)} communicates with standard materials. No special equipment or technology is documented as required for communication.`, 'none'],
      ['sup', 'Equipment or technology supplements communication, but the student can typically demonstrate functional communication without it', w => `Equipment or technology supplements ${poss(w)} communication, and ${w} can typically demonstrate functional communication without it.`, 'min'],
      ['tmin', 'Minimal training required for staff or the student', w => `Minimal training is required for staff or ${w}.`, 'min'],
      ['rout', 'Equipment or technology is routinely required for the student to communicate effectively and access instruction across significant portions of the day', w => `Equipment or technology is routinely required for ${w} to communicate effectively and access instruction across significant portions of the day.`, 'mod'],
      ['tmod', 'Staff and the student need predictable training and ongoing support', w => `Staff and ${w} need predictable training and ongoing support.`, 'mod'],
      ['found', "Equipment or technology is foundational to the student's ability to communicate; without it, the student cannot meaningfully express needs, participate, or demonstrate learning", w => `Equipment or technology is foundational to ${poss(w)} ability to communicate. Without it, ${w} cannot meaningfully express needs, participate, or demonstrate learning.`, 'sig'],
      ['indiv', 'Systems are highly individualized and complex', () => 'The system is highly individualized and complex.', 'sig'],
      ['tsig', 'Requires intensive training, ongoing programming, and staff facilitation', () => 'The system requires intensive training, ongoing programming, and staff facilitation.', 'sig'],
      ['beyond', "Goes beyond what most peers in the student's age group need", () => "This goes beyond the equipment and technology most peers in the student's age group need.", 'ctx'],
      ['essential', 'Needed for the student to take part in learning toward the current IEP goals', w => `It is essential for ${poss(w)} participation toward the current IEP goals.`, 'ctx']
    ]
  }
};
function poss(w) { return /s$/i.test(w) && w !== 'the student' ? w + "'" : w + "'s"; }
function techWho() { const l = S.student.label.trim(); return l || 'the student'; }
function techOn(kind) { const T = S.tech[kind]; return !!T.items.trim() || Object.values(T.fl).some(Boolean); }
function techItems(kind) { const T = S.tech[kind]; return T.items.trim(); }
function techWarn(kind) {
  const T = S.tech[kind], D = TECH[kind];
  if (T.fl.none && Object.entries(T.fl).some(([k, v]) => v && k !== 'none')) return 'Standard materials only is checked along with other statements. Clear one or the other.';
  const has = t => D.flags.some(f => f[3] === t && T.fl[f[0]]);
  if (has('min') && has('sig')) return 'Statements from the Minimum and Significant columns are both checked. Review them so the PLAAFP reads consistently.';
  return '';
}

/* ===== State ===== */
function newGoal() {
  return {
    uid: Math.random().toString(36).slice(2, 8), src: null, plc: {}, startOverride: null, ans: {}, tab: null, targets: [], cueAns: {},
    crit: { aacOff: {}, giv: {}, measure: 'count', kind: 'c', mo: 0, pv: null, u: 'occurrences', ptxt: '', pct: 80, trials: 5, k: 3, m: 4, count: 3, dur: 2, durUnit: 'minutes', intLen: 10, intMin: 5, sessMin: 10, what: '', per: 'session', cueEnd: 'I', baseNum: null, modesOn: null, fam: 'fam', activity: '', materials: '', methods: { obs: true, tracker: false, work: false, media: false, aac: false }, vcEvidence: false, freq: 'weekly', baseVal: '', baseDate: todayISO(), objectives: true },
    teksSel: {}, teksSeen: {}, goalOverride: null, objOverride: null, alignOverride: null, confirmDel: false, critInit: false
  };
}
const S = {
  step: 0,
  student: { label: '', grade: '3', aac: false, alt: false, dyslexia: 'na', teacher: '', start: todayISO(), end: defaultEnd(), report: 9 },
  goals: [newGoal()], active: 0,
  comm: { grid: {}, no: {}, ex: {}, own: {} },
  aac: { need: {}, acc: {}, feat: {}, langs: '', sup: {}, implBy: '' },
  tech: { com: { items: '', fl: {}, ex: '' } },
  plaafp: { impact: '', expect: '', examples: '', progress: '', services: '', peers: '', strengthsExtra: '', informal: '', cbm: '', crit: '', baselineNote: '' },
  ui: { det: {}, prereqDepth: 99, sheetGoal: 0, canDownload: null, fallback: '' }
};
COMM_ROWS.forEach(r => { S.comm.grid[r.id] = {}; S.comm.no[r.id] = false; S.comm.ex[r.id] = ''; S.comm.own[r.id] = false; });
TECH.com.flags.forEach(f => { S.tech.com.fl[f[0]] = false; });
AAC_ACCESS.forEach(a => { S.aac.need[a.id] = false; a.items.forEach(it => { S.aac.acc[a.id + '_' + it[0]] = false; }); });
AAC_FEATS.forEach(f => { S.aac.feat[f.id] = ''; });
AAC_SUPPORTS.forEach(s => { S.aac.sup[s[0]] = false; });
const G = () => S.goals[S.active];
function resetMeasure(g) {
  const pw = getPW(g); const it = pw && g.targets.length ? pw.byId[g.targets[0]] : null; const s = skillOf(pw, it);
  g.crit.mo = s ? s.dm : 0; g.crit.pv = null; g.crit.what = ''; g.crit.giv = {}; g.crit.per = s && s.per ? s.per : 'session';
}
function commDone() { return COMM_ROWS.some(r => S.comm.no[r.id] || COMM_FORMS.some(f => (S.comm.grid[r.id][f.id] || 0) > 0)); }
function commFormUsed(id) { return COMM_ROWS.some(r => (S.comm.grid[r.id][id] || 0) > 0); }
function aacDone() { const A = S.aac; return Object.values(A.need).some(Boolean) || Object.values(A.acc).some(Boolean) || Object.values(A.feat).some(Boolean) || Object.values(A.sup).some(Boolean) || !!A.langs.trim(); }
function aacGap() { return AAC_FEATS.some(f => S.aac.feat[f.id] === 'no'); }
function modeNeed(pw, it) { return MODE_NEED[pw.idx + ':' + it.id] || null; }
function modeFlagged(pw, it) { const m = modeNeed(pw, it); return !!(m && commDone() && !commFormUsed(m)); }
function modesOn(g) { return g.crit.modesOn != null ? g.crit.modesOn : (commDone() || S.student.aac); }
function modesPhrase(lvl) {
  const used = COMM_FORMS.filter(f => commFormUsed(f.id));
  if (lvl === 'E1' || lvl === 'E2') {
    const l = used.map(f => f.phrase);
    return `multimodal communication (e.g., ${joinList(l.length ? l : ['gestures and body movement', 'eye gaze', 'facial expressions', 'objects or pictures'])})`;
  }
  const sym = used.filter(f => f.sym).map(f => f.sym);
  return `multimodal symbolic communication (e.g., ${joinList(sym.length ? sym : ['speech', 'signs', 'picture symbols', 'AAC'])})`;
}

/* ===== Pathways ===== */
const pwCache = {};
function getPW(g) {
  if (!g || !g.src) return null;
  if (pwCache[g.src]) return pwCache[g.src];
  const i = +g.src.split(':')[1]; const sc = D.vc[i];
  const pw = {
    kind: 'vc', idx: i, title: sc.title, desc: sc.desc, placement: sc.placement, need: 6, short: sc.title,
    levels: sc.levels.map(L => ({ code: L.code, label: 'Level ' + L.code, desc: sc.levelDescs[L.code] || '', outcome: L.outcome, note: L.note, items: L.indicators.map(x => ({ id: x.id, text: x.text, ex: x.ex || [], teks: x.teks || [], level: L.code, kind: 'vc' })) }))
  };
  pw.byId = {}; pw.levels.forEach(L => L.items.forEach(it => pw.byId[it.id] = it));
  return pwCache[g.src] = pw;
}
function allPathways() {
  return { vc: D.vc.map((sc, i) => ({ key: 'vc:' + i, title: sc.title, desc: sc.desc })) };
}

/* ===== Screening logic ===== */
function placementQs(pw) { return pw.placement.slice(0, -1).slice().reverse(); }
function placementInfo(g, pw) {
  if (pw.kind !== 'vc') return { visible: [], start: g.startOverride || pw.levels[0].code, done: true, computed: pw.levels[0].code, dk: [], differentScale: false };
  // Asked from the simplest level up. The lowest "still learning" question is skipped.
  // The first No stops the sequence. The starting level is the last level answered Yes (E1 when the first answer is No).
  const vis = []; let last = pw.levels[0].code, done = false, dk = [], diff = false;
  const qs = placementQs(pw);
  for (let ix = 0; ix < qs.length; ix++) {
    const q = qs[ix]; vis.push(q); const a = g.plc[q.n];
    if (!a) break;
    if (a === 'n') { done = true; break; }
    if (a === 'd') { dk.push(q.n); done = true; break; }
    if (/different scale/i.test(q.yes)) { diff = true; done = true; break; }
    const m = /Levels?\s+([A-Z]\d(?:-\d)?)/.exec(q.yes); if (m) last = m[1];
    if (ix === qs.length - 1) done = true;
  }
  return { visible: vis, computed: done ? last : null, start: g.startOverride || (done ? last : null), done, dk, differentScale: diff, provisional: dk.length > 0 };
}
function levelStatus(g, pw, L) {
  let y = 0, n = 0, d = 0, na = 0, u = 0;
  L.items.forEach(it => { const a = g.ans[it.id]; if (a === 'y') y++; else if (a === 'n') n++; else if (a === 'd') d++; else if (a === 'na') na++; else u++; });
  const total = L.items.length - na;
  const need = pw.kind === 'vc' ? pw.need : total;
  return { y, n, d, na, u, total, need, answered: y + n + d, complete: total > 0 && y >= need };
}
function screenInfo(g, pw) {
  const pl = placementInfo(g, pw);
  const startIx = pl.start ? Math.max(0, pw.levels.findIndex(l => l.code === pl.start)) : -1;
  let targetIx = -1, allDone = false;
  if (startIx >= 0) {
    for (let i = startIx; i < pw.levels.length; i++) { if (!levelStatus(g, pw, pw.levels[i]).complete) { targetIx = i; break; } }
    if (targetIx < 0) allDone = true;
  }
  return { pl, startIx, targetIx, allDone, targetLevel: targetIx >= 0 ? pw.levels[targetIx] : null };
}
function missingItems(g, pw, L) { return L.items.filter(it => { const a = g.ans[it.id]; return a !== 'y' && a !== 'na'; }); }
function statusOf(g, id) { const a = g.ans[id]; return a === 'n' ? 'No' : a === 'd' ? "Don't know" : a === 'y' ? 'Yes' : a === 'na' ? 'N/A' : 'Not screened'; }
function baseCueOf(g, id) {
  const a = g.cueAns[id] || {};
  for (const c of ['I', 'G', 'V', 'M']) { if (a[c] === 'y') return c; if (!a[c]) return null; }
  return 'none';
}
function cueForObjectives(g, id) { const b = baseCueOf(g, id); return (b && b !== 'none') ? b : 'M'; }

/* ===== Behavior wording ===== */
function stripParen(t) { return t.replace(/\s*\([^)]*\)\s*\.?\s*$/, '').replace(/\s+/g, ' ').trim().replace(/\.$/, ''); }
function conj(w) {
  const l = w.toLowerCase(); const irr = { has: 'have', does: 'do', goes: 'go', is: 'be' };
  if (irr[l]) return irr[l];
  if (/(ss|x|ch|sh)es$/.test(l)) return l.slice(0, -2);
  if (/[^aeiou]ies$/.test(l)) return l.slice(0, -3) + 'y';
  if (/s$/.test(l) && !/(ss|us|is)$/.test(l)) return l.slice(0, -1);
  return l;
}
function behaviorOf(item) {
  let t = stripParen(item.text).replace(/^The student (will )?/i, '');
  let pre = '';
  const m = /^(When|During|After|Before|If|While)\b([^,]*),\s*(.*)$/.exec(t);
  if (m) { pre = m[1] + m[2]; t = m[3]; }
  const w = t.split(' '); let i = 0;
  if (/ly$/i.test(w[0]) && w.length > 1) { w[0] = lcFirst(w[0]); i = 1; }
  w[i] = conj(w[i]);
  if ((w[i + 1] === 'and' || w[i + 1] === 'or') && w[i + 2] && /s$/.test(w[i + 2]) && !/(ss|us|is)$/.test(w[i + 2]) && /^[A-Za-z]+$/.test(w[i + 2]) && ['activates', 'deactivates', 'identifies', 'uses', 'starts', 'ends', 'recognizes', 'responds', 'selects', 'produces', 'initiates', 'asks', 'tells', 'writes', 'reads', 'spells', 'combines', 'requests'].includes(w[i + 2].toLowerCase())) w[i + 2] = conj(w[i + 2]);
  return { pre, vp: w.join(' ') };
}

/* ===== Goal derivation ===== */
function studentRef() { return S.student.label.trim() || 'the student'; }
function cueClause(c) { return c === 'I' ? 'with no cues beyond an expectant wait' : c === 'M' ? 'with a model' : 'with no more than a ' + CUE[c].short + ' cue'; }
function baseNumOf(cr) { return (cr.baseNum === '' || cr.baseNum == null || isNaN(+cr.baseNum)) ? null : +cr.baseNum; }
const durU = (n, u) => (n === 1 ? u.replace(/s$/, '') : u);
function targetVal(cr) { return cr.kind === 'c' ? cr.count : cr.kind === 'd' ? cr.dur : cr.pct; }
function perText(cr) {
  if (cr.per === 'day') return 'school day';
  const m = +cr.sessMin; const a = String(cr.activity || '').trim().replace(/^during\s+/i, '');
  return `${m > 0 ? m + '-minute ' : ''}${a ? a + ' ' : ''}session`;
}
function critOpt(g) {
  const pw = getPW(g); const it = pw && g.targets.length ? pw.byId[g.targets[0]] : null;
  const o = measureOpts(pw, it); return o[g.crit.mo] || o[0];
}
function syncCrit(g) {
  const cr = g.crit; const opt = critOpt(g); cr.kind = opt.k;
  cr.measure = opt.k === 'c' ? 'count' : opt.k === 'd' ? 'dur' : 'percent';
  cr.u = opt.u || 'occurrences';
  if (opt.pt && (cr.pv == null || cr.pv === '')) cr.pv = opt.pd;
  cr.ptxt = opt.pt ? opt.pt.replace('{n}', cr.pv) : '';
  return opt;
}
function criterionText(cr, withEvidence, o) {
  o = o || {}; const val = o.val != null ? o.val : targetVal(cr); const bn = baseNumOf(cr); const base = o.base && bn != null;
  const tail = ` across ${cr.k} of ${cr.m} consecutive data-collection ${cr.kind === 'c' && cr.per === 'day' ? 'days' : 'sessions'}`;
  let t;
  if (cr.kind === 'c') t = `at least ${val} ${cr.u}${cr.ptxt ? ' ' + cr.ptxt : ''} per ${perText(cr)}${base ? `, up from a baseline of ${bn} per ${perText(cr)},` : ''}${tail}`;
  else if (cr.kind === 'd') t = `for at least ${val} ${durU(val, cr.durUnit)} continuously${base ? `, up from a baseline of ${bn} ${durU(bn, cr.durUnit)},` : ''}${tail}`;
  else if (cr.kind === 'i') t = `in at least ${val}% of ${cr.intLen}-second intervals during a ${cr.intMin}-minute observation${base ? `, up from a baseline of ${bn}%` : ''}${tail}`;
  else t = `in at least ${val}% of opportunities${base ? `, up from a baseline of ${bn}%` : ''} (a minimum of ${cr.trials} opportunities per session)${tail}`;
  if (withEvidence && cr.vcEvidence) t += ', with evidence documented in at least 3 separate learning events across multiple days and contexts';
  return t;
}
function interimTarget(cr) {
  const bn = baseNumOf(cr) || 0; const tv = targetVal(cr);
  if (cr.kind === 'c' || cr.kind === 'd') return Math.max(1, Math.min(tv - 1, Math.round((bn + tv) / 2)));
  return Math.max(5, Math.min(tv - 5, Math.round((bn + tv) / 2 / 5) * 5));
}
function measureLabel(cr) {
  if (cr.kind === 'c') return `Count of ${cr.u}${cr.ptxt ? ' ' + cr.ptxt : ''} per ${perText(cr)}`;
  if (cr.kind === 'd') return `Longest continuous duration, in ${cr.durUnit}`;
  if (cr.kind === 'i') return `Percent of ${cr.intLen}-second intervals during a ${cr.intMin}-minute observation`;
  return `Percent of opportunities, at least ${cr.trials} opportunities per session`;
}
function baseTextOf(cr) {
  const bn = baseNumOf(cr); if (bn == null) return '';
  if (cr.kind === 'c') return `${cr.u}${cr.ptxt ? ' ' + cr.ptxt : ''}, ${bn} per ${perText(cr)}`;
  if (cr.kind === 'd') return `${bn} ${durU(bn, cr.durUnit)} continuously`;
  if (cr.kind === 'i') return `${bn}% of intervals`;
  return `${bn}% of opportunities`;
}
function methodText(cr) {
  const l = METHODS.filter(m => cr.methods[m[0]]).map(m => m[1]);
  return l.length ? joinList(l) : '[select a data collection method]';
}
function aacMaterials() {
  const A = S.aac, out = [];
  if (!(S.student.aac || aacDone())) return out;
  const sys = techItems('com'); if (sys) out.push({ k: 'sys', t: sys.replace(/[.\s]+$/, '') });
  const acc = []; AAC_ACCESS.filter(a => A.need[a.id]).forEach(a => a.items.forEach(it => { if (A.acc[a.id + '_' + it[0]] && !acc.includes(it[1])) acc.push(it[1]); }));
  if (acc.length) out.push({ k: 'acc', t: 'access supports (' + joinList(acc) + ')' });
  if (A.sup.nobackup) out.push({ k: 'nobackup', t: 'a no-tech backup' });
  if (A.sup.model) out.push({ k: 'model', t: 'partner modeling on the system (aided language input)' });
  return out;
}
function givenItems(g) {
  const pw = getPW(g); const it = pw && g.targets.length ? pw.byId[g.targets[0]] : null; const s = skillOf(pw, it);
  const on = !!S.student.aac; const out = [{ k: 'gaac', t: 'unrestricted access to AAC throughout the school day', on }];
  if (!S.aac.sup.model) out.push({ k: 'galm', t: 'aided language models from partners throughout the school day', on });
  if (s) s.g.forEach((t, i) => out.push({ k: 'gs' + i, t, on: true }));
  return out.map(o => { const v = (g.crit.giv || {})[o.k]; return { ...o, chk: v == null ? o.on : v }; });
}
function matText(g) {
  const off = g.crit.aacOff || {}; const l = aacMaterials().filter(m => !off[m.k]).map(m => m.t);
  givenItems(g).filter(x => x.chk).forEach(x => l.push(x.t));
  const o = String(g.crit.materials || '').trim().replace(/^(when )?given\s+/i, '').replace(/[.\s]+$/, ''); if (o) l.push(o);
  return l.length ? joinList(l) : '';
}
function condText(g, beh, lvl, skipModes) {
  const cr = g.crit; const parts = [];
  if (cr.activity.trim()) parts.push('during ' + cr.activity.trim().replace(/^during\s+/i, ''));
  const mt = matText(g); if (mt) parts.push('when given ' + mt);
  if (modesOn(g) && !skipModes) parts.push('using ' + modesPhrase(lvl));
  if (beh && beh.pre) parts.push(lcFirst(beh.pre));
  return parts.length ? cap(parts.join(', ')) : '[add the activity and materials]';
}
const lcx = x => x.startsWith('[') ? x : lcFirst(x);
function deriveGoal(g) {
  const pw = getPW(g); if (!pw) return null;
  const si = screenInfo(g, pw); const cr = g.crit;
  const items = g.targets.map(id => pw.byId[id]).filter(Boolean);
  syncCrit(g);
  const behs = items.map(it => { const s = skillOf(pw, it); const bh = s ? { pre: s.pre || '', vp: s.b } : behaviorOf(it); return (cr.kind !== 'c' && cr.ptxt) ? { ...bh, vp: bh.vp + ' ' + cr.ptxt } : bh; });
  const lvl = si.targetLevel ? si.targetLevel.code : '';
  const skipModes = items.some(it => modeNeed(pw, it));
  const cond = condText(g, behs[0], lvl, skipModes);
  const stu = studentRef();
  let vp;
  if (behs.length === 0) vp = '[select a target skill]';
  else if (behs.length === 1) vp = behs[0].vp;
  else vp = 'demonstrate each of the following skills: ' + behs.map((b, i) => `(${'abc'[i]}) ${b.vp}`).join('; ');
  const comp = {
    timeframe: `By ${fmtLong(S.student.end)}`,
    conditions: `${lcx(cond)}, ${FAM[cr.fam]} and ${cueClause(cr.cueEnd)}`,
    behavior: `${stu} will ${vp}`,
    criterion: `${criterionText(cr, true, { base: true })}, as measured by ${methodText(cr)}`
  };
  const goalAuto = `${comp.timeframe}, ${comp.conditions}, ${comp.behavior}, ${comp.criterion}.`;
  // Objectives and benchmarks: each carries a timeframe, condition, behavior, and criterion; dates are distinct; each differs in condition or criterion.
  const objs = [];
  const wantObj = cr.objectives || S.student.alt;
  if (wantObj && items.length) {
    const sd = parseISO(S.student.start), ed = parseISO(S.student.end);
    const endIx = CUE_ORDER.indexOf(cr.cueEnd);
    items.forEach((it, ti) => {
      const b = behs[ti]; const base = cueForObjectives(g, it.id); const bix = CUE_ORDER.indexOf(base);
      let specs = [];
      if (bix <= endIx) for (let i = bix; i <= endIx; i++) specs.push({ cue: CUE_ORDER[i], fam: 'fam' });
      else specs.push({ cue: cr.cueEnd, fam: 'fam' });
      if (cr.fam !== 'fam') specs.push({ cue: cr.cueEnd, fam: cr.fam });
      if (specs.length < 2) specs = [{ cue: specs[0].cue, fam: specs[0].fam, interim: true }, { cue: specs[0].cue, fam: specs[0].fam }];
      const m = specs.length; const it2 = interimTarget(cr);
      specs.forEach((sp, k) => {
        const dt = sd && ed ? isoOf(addDays(sd, Math.round((ed - sd) / 86400000 * (k + 1) / (m + 1)))) : '';
        const label = items.length > 1 ? `(${'abc'[ti]}) ` : '';
        const crit = criterionText(cr, false, sp.interim ? { val: it2 } : {});
        objs.push({ ti, date: dt, text: `${label}By ${fmtLong(dt)}, ${lcx(condText(g, b, lvl, skipModes))}, ${FAM[sp.fam]} and ${cueClause(sp.cue)}, ${stu} will ${b.vp}, ${crit}.` });
      });
    });
  }
  return { pw, si, items, behs, cond, comp, goalAuto, goal: g.goalOverride ?? goalAuto, objectives: objs, crit: comp.criterion, method: methodText(cr), teks: teksFor(g, items), baseCues: items.map(it => baseCueOf(g, it.id)) };
}
function objectiveTexts(g, d) { return g.objOverride && g.objOverride.length === d.objectives.length ? g.objOverride : d.objectives.map(o => o.text); }
function evalText(g) {
  const cr = g.crit; const unit = measureLabel(cr).replace(/^(\w)/, x => x.toLowerCase());
  let t = `Data are collected ${FREQ[cr.freq]}. Progress is reported ${REPORT[S.student.report]} in the same measure as the goal (${unit} and level of support), not as general notations such as "progress being made." Method: ${methodText(cr)}.`;
  if (S.student.dyslexia === 'yes') t += ' The goal progress report will also meet the dyslexia progress report requirements (TEC §29.0031(d)).';
  if (S.student.dyslexia === 'sep') t += ' A separate progress report will be provided to the parent to meet the dyslexia progress report requirements (TEC §29.0031(d)).';
  return t;
}

/* ===== TEKS ===== */
function threadsOf(items) { const s = []; items.forEach(it => (it.teks || []).forEach(t => { if (!s.includes(t) && D.teks.threads[t]) s.push(t); })); return s; }
function gradeIx(k) { return TEKS_GRADES.indexOf(k); }
function teksFor(g, items) {
  const enr = S.student.grade; const out = [];
  threadsOf(items).forEach(tid => {
    const th = D.teks.threads[tid];
    let enrolled = [], prereq = [], anchors = [];
    if (enr === 'PK') {
      enrolled = (th.pk || []).map(e => ({ ...e, g: 'PK' }));
      anchors = (th.it || []).map(c => ({ c, t: D.teks.it[c] || '', g: 'IT' }));
    } else {
      const ix = gradeIx(enr);
      enrolled = (th.grades[enr] || []).map(e => ({ ...e, g: enr }));
      for (let i = ix - 1; i >= 0; i--) { const gk = TEKS_GRADES[i]; (th.grades[gk] || []).length && prereq.push({ g: gk, list: th.grades[gk].map(e => ({ ...e, g: gk })) }); }
      anchors = [...(th.pk || []).map(e => ({ ...e, g: 'PK' })), ...(th.it || []).map(c => ({ c, t: D.teks.it[c] || '', g: 'IT' }))];
    }
    out.push({ tid, th, enrolled, prereq, anchors });
  });
  return out;
}
const BAND = ['IT', 'PK', 'K', '1', '2', '3', '4', '5', '6', '7', '8'];
const LEVEL_BAND = { E1: 'IT', E2: 'PK', T3: 'K', T4: '1', C5: '2', C6: '3', C7: '4' };
function enrolledIx() { const e = S.student.grade; if (e === 'PK') return 1; const i = BAND.indexOf(e); return i < 0 ? 99 : i; }
function entriesAt(t, band) {
  if (band === 'IT') return t.anchors.filter(e => e.g === 'IT');
  if (band === 'PK') return t.anchors.filter(e => e.g === 'PK');
  const p = t.prereq.find(x => x.g === band); return p ? p.list : [];
}
function earliestEntries(t, levelCode) {
  // The band the student is working in, from the Project VC level. If the thread has no entries there, look upward toward the enrolled grade, then downward.
  const start = BAND.indexOf(LEVEL_BAND[levelCode] || 'IT'); const top = enrolledIx();
  if (start >= top) return [];
  for (let i = start; i < top; i++) { const e = entriesAt(t, BAND[i]); if (e.length) return e; }
  for (let i = start - 1; i >= 0; i--) { const e = entriesAt(t, BAND[i]); if (e.length) return e; }
  return [];
}
function ensureTeksDefaults(g) {
  const pw = getPW(g); if (!pw) return;
  const items = g.targets.map(id => pw.byId[id]).filter(Boolean);
  const key = S.student.grade; const lvl = screenInfo(g, pw).targetLevel; const lc = lvl ? lvl.code : '';
  teksFor(g, items).forEach(t => {
    const sk = t.tid + '|' + key + '|' + lc;
    if (!g.teksSeen[sk]) { g.teksSeen[sk] = true; t.enrolled.forEach(e => { g.teksSel[e.c] = true; }); earliestEntries(t, lc).forEach(e => { g.teksSel[e.c] = true; }); }
  });
}
function selectedTeks(g, d) {
  const enrolled = [], prereq = [], anchors = []; const seen = new Set();
  d.teks.forEach(t => {
    t.enrolled.forEach(e => { if (g.teksSel[e.c] && !seen.has(e.c)) { seen.add(e.c); enrolled.push({ ...e, thread: t.th.label }); } });
    t.prereq.forEach(p => p.list.forEach(e => { if (g.teksSel[e.c] && !seen.has(e.c)) { seen.add(e.c); prereq.push({ ...e, thread: t.th.label }); } }));
    t.anchors.forEach(e => { if (g.teksSel[e.c] && !seen.has(e.c)) { seen.add(e.c); anchors.push({ ...e, thread: t.th.label }); } });
  });
  return { enrolled, prereq, anchors };
}
function nearestPrereq(g, d) {
  // For each thread, the selected prerequisite entry from the nearest lower grade.
  const out = [];
  d.teks.forEach(t => { for (const p of t.prereq) { const e = p.list.find(x => g.teksSel[x.c]); if (e) { out.push({ ...e, thread: t.th.label }); break; } } });
  return out;
}
function earlierSkills(g, d) {
  // For the PLAAFP: per thread, the nearest selected earlier-grade skill, else the nearest selected early learning guideline.
  const out = [];
  d.teks.forEach(t => {
    for (const p of t.prereq) { const e = p.list.find(x => g.teksSel[x.c]); if (e) { out.push(e); return; } }
    for (const gk of ['PK', 'IT']) { const e = t.anchors.find(x => x.g === gk && g.teksSel[x.c]); if (e) { out.push(e); return; } }
  });
  return out;
}
function alignText(g, d) {
  if (g.alignOverride != null) return g.alignOverride;
  const sel = selectedTeks(g, d); const gl = gradeLabel(S.student.grade);
  const clean = e => String(e.t || '').replace(/[.;\s]+$/, '');
  const list = a => a.map(clean).filter(Boolean).join('; ');
  let t = `Enrolled grade: ${gl}.`;
  if (sel.enrolled.length) t += ` Enrolled-grade expectations this goal supports: ${list(sel.enrolled)}.`;
  else t += ' No enrolled-grade expectations are selected yet. Select at least one to complete the standards-based alignment.';
  const near = nearestPrereq(g, d);
  if (near.length) t += ` Prerequisite skills used to scaffold instruction: ${near.map(e => `${clean(e)} (${gradeShort(e.g)})`).join('; ')}.`;
  if (sel.anchors.length) t += ` Early learning guidelines: ${list(sel.anchors)}.`;
  return t;
}
function goalChecks(g, d) {
  const cr = g.crit; const sd = parseISO(S.student.start), ed = parseISO(S.student.end);
  const days = sd && ed ? Math.round((ed - sd) / 86400000) + 1 : 0;
  const sel = selectedTeks(g, d); const bn = baseNumOf(cr);
  const target = targetVal(cr);
  const anyMethod = Object.values(cr.methods).some(Boolean);
  const nObj = d.objectives.length; const per = d.items.length ? nObj / d.items.length : 0;
  const out = [
    { n: 'Timeframe', ok: !!(sd && ed && ed > sd && days <= 365), fix: days > 365 ? 'Annual goals cannot span more than 365 days.' : 'Set start and end dates on the Student step.' },
    { n: 'Conditions', ok: d.items.length > 0 && !!(cr.activity.trim() && matText(g)), fix: d.items.length ? 'Name the specific activity and the materials or supports. Generic statements are not enough.' : 'Select a target skill.' },
    { n: 'Behavior', ok: d.items.length > 0, fix: 'Select a target skill that can be observed and counted.' },
    { n: 'What counts', ok: !!cr.what.trim(), fix: 'Define what counts as an occurrence so that every partner scores it the same way.' },
    { n: 'Criterion', ok: bn != null && target > bn && ((cr.kind !== 'p' && cr.kind !== 'i') || cr.pct <= 100), fix: bn == null ? 'Enter a numeric baseline so the criterion shows growth.' : 'The target must be higher than the baseline.' },
    { n: 'Data method', ok: anyMethod && (cr.kind !== 'p' || cr.trials > 0), fix: 'Choose at least one data collection method.' },
    { n: 'Standards', ok: sel.enrolled.length > 0, fix: 'Select at least one enrolled-grade TEKS.' }
  ];
  if (cr.objectives || S.student.alt) out.push({ n: 'Objectives', ok: per >= 2, fix: 'At least two objectives or benchmarks are needed.' });
  else out.push({ n: 'Objectives', ok: true, fix: '', note: 'Not included' });
  return out;
}
function reportDates() {
  const sd = parseISO(S.student.start), ed = parseISO(S.student.end); const out = [];
  if (!sd || !ed) return out;
  const wk = +S.student.report || 9;
  for (let i = 1; i <= 12; i++) { const dt = addDays(sd, wk * 7 * i); if (dt > addDays(ed, 6)) break; out.push(isoOf(dt > ed ? ed : dt)); }
  if (!out.length || out[out.length - 1] !== isoOf(ed)) { if (out.length < 12) out.push(isoOf(ed)); }
  return out;
}
