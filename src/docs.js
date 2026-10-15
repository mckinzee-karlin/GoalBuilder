/* ===== Credits text ===== */
const CREDITS = [
  ['Project VC progress monitoring scales and Evidence Tracker', 'Project VC © 2026 Center for Literacy and Disability Studies, Department of Health Sciences, UNC-Chapel Hill, licensed under CC BY-SA 4.0 (creativecommons.org/licenses/by-sa/4.0). Source documents: Progress Monitoring Tool Scale Packet, All Scales (revised March 2026) and Evidence Tracker, All Scales. This tool adapts that material: screening questions are asked from the simplest level up, each indicator is paired with a goal-ready skill statement and measurement options, and goal, objective, and data sheet wording is generated from them. Indicator wording is reproduced from the packet. Share-alike applies to the Project VC content reproduced here.'],
  ['Goal components and benchmark rules', 'Goal components (timeframe, conditions, behavior, criterion), objective and benchmark requirements, and progress reporting follow the TEA Question and Answer Document: IEP Measurable Annual Goals (revised October 2026), which cites 19 TAC §89.1055 and 34 CFR §300.320. Copyright © 2026 Texas Education Agency. All rights reserved.'],
  ['Communication checklists', 'The communication forms and functions checklist and the AAC system checklist are informal teacher documentation tools. They are not standardized assessments.'],
  ['Standards-based IEP and PLAAFP elements', 'PLAAFP essential elements from the 2025-26 Texas Education Agency Standards-Based IEP Process Training. Copyright © 2025 Texas Education Agency. All rights reserved.'],
  ['Equipment and technology language', 'Descriptors for equipment and technology (Factor D of Domain 1, Curriculum and Instruction Supports, and Domain 3, Communication Supports) are adapted from the Texas Education Agency New Intensity of Services Funding Model (June 2026). This tool does not score the rubric or assign a funding tier. Funding classifications do not determine placement, location, or services. ARD committees make those decisions individually.'],
  ['TEKS alignment', 'Texas Essential Knowledge and Skills for English Language Arts and Reading (Kindergarten to Grade 8 adopted May 10, 2017; English I to IV adopted June 23, 2017, as amended 6/2019), from the TEA K-12 English Language Arts and Reading Vertical Alignment (06/2019) and the TEA Early Childhood Education Division Language and Literacy Vertical Alignment, Birth to Grade 2. The links between Project VC indicators and TEKS threads are a draft crosswalk prepared for this tool. The ARD committee should confirm each alignment against the current TEKS.']
];
const DISCLAIMER = 'This tool produces draft language for review by the ARD committee. It does not replace evaluation data, professional judgment, or legal and compliance review.';

/* ===== PLAAFP ===== */
function ph(t) { return { t: 'ph', x: '[' + t + ']' }; }
function plaafpModel() {
  const st = S.student, P = S.plaafp; const who = st.label.trim() || 'The student';
  const goals = S.goals.map(g => ({ g, d: deriveGoal(g) })).filter(x => x.d);
  const sec = [];
  sec.push({ h: 'Impact of the disability on involvement and progress in the enrolled-grade curriculum', b: [P.impact.trim() ? { t: 'p', x: P.impact.trim() } : ph('Describe how the disability affects ' + (st.label.trim() || 'the student') + "'s involvement and progress in the enrolled-grade general education curriculum, with the characteristics of the disability that show up in language and literacy instruction")] });
  const AREA = { lang: 'language and communication', read: 'reading and writing' };
  const areaOf = dd => (dd.pw.idx <= 1 ? 'lang' : 'read');
  const gradeNoun = `${/^[AEIOU]/i.test(gradeLabel(st.grade)) ? 'an' : 'a'} ${st.grade === 'PK' ? 'prekindergarten' : gradeLabel(st.grade).replace(/^Grade (\d+) \(.*\)$/, 'Grade $1').replace(/^(Kindergarten)$/, 'kindergarten')} student`;
  const exp = [];
  ['lang', 'read'].forEach(ar => {
    const gl = goals.filter(x => areaOf(x.d) === ar); if (!gl.length) return;
    const labels = [];
    gl.forEach(({ g, d }) => d.teks.forEach(t => { if (t.enrolled.some(e => g.teksSel[e.c]) || (st.grade === 'PK' && t.enrolled.length)) { const l = t.th.label.replace(/; /g, ', ').replace(/^(\w)/, c => c.toLowerCase()); if (!labels.includes(l)) labels.push(l); } }));
    if (labels.length) exp.push({ t: 'p', x: `In ${AREA[ar]}, as ${gradeNoun}, ${who === 'The student' ? 'the student' : who} is expected to learn and demonstrate grade-level skills such as ${joinList(labels)}.` });
    else exp.push(ph(`Select enrolled-grade TEKS on the Goal step to generate a one-sentence summary of grade-level expectations in ${AREA[ar]}`));
    const pre = [], early = [];
    gl.forEach(({ g, d }) => earlierSkills(g, d).forEach(e => { const tx = String(e.t || '').replace(/[.;\s]+$/, ''); const arr = (e.g === 'PK' || e.g === 'IT') ? early : pre; if (tx && !arr.includes(tx)) arr.push(tx); }));
    const nm = who === 'The student' ? 'The student' : who;
    if (pre.length) exp.push({ t: 'p', x: `${nm} is working toward these grade-level skills. Instruction builds on earlier grade-level skills, including the ability to ${pre.slice(0, 3).map(lcFirst).join('; ')}.` });
    if (early.length) exp.push({ t: 'p', x: `${pre.length ? 'It also builds' : nm + ' is working toward these grade-level skills. Instruction builds'} on early learning expectations such as: ${early.slice(0, 3).join('; ')}.` });
  });
  if (!goals.length) exp.push(ph('Select enrolled-grade TEKS on the Goal step to generate a one-sentence summary of grade-level expectations'));
  if (P.expect.trim()) exp.push({ t: 'p', x: P.expect.trim() });
  sec.push({ h: 'Skills expected of enrolled-grade peers in the areas of critical need', b: exp });
  // Baseline, grouped by area
  const baselineFor = ar => {
    const base = [];
    goals.forEach(({ g, d }) => {
      if (areaOf(d) !== ar) return;
      const gi = goals.findIndex(x => x.g === g); const pw = d.pw;
      base.push({ t: 'p', x: `Goal ${gi + 1}: ${pw.title}` });
      const yes = []; pw.levels.forEach(l => l.items.forEach(it => { if (g.ans[it.id] === 'y') yes.push(it); }));
      base.push({ t: 'li', x: yes.length ? 'Skills the student demonstrates, each documented in at least three separate learning events across multiple days and contexts: ' + yes.map(it => stripParen(it.text)).join('; ') + '.' : 'No skills in this area have been documented as demonstrated yet.' });
      d.items.forEach((it, i) => {
        const bc = d.baseCues[i]; const a = g.ans[it.id];
        const stp = a === 'y' ? 'Documented as demonstrated.' : a === 'n' ? 'Not yet demonstrated.' : 'Not enough data yet to confirm.';
        base.push({ t: 'li', x: `Target skill: ${cap(skillOf(pw, it) ? skTitle(skillOf(pw, it)) : stripParen(it.text))}. ${stp} ` + (bc && bc !== 'none' ? `${who} shows the skill with ${CUE[bc].short} cues in familiar activities.` : bc === 'none' ? `${who} did not show the skill with a model. Earlier skills may need to be taught first.` : 'Level of support not yet determined.') });
      });
      const bnTxt = baseTextOf(g.crit); const bline = [bnTxt, g.crit.baseVal.trim()].filter(Boolean).join('. ');
      base.push(bline ? { t: 'li', x: `Baseline performance (${fmtLong(g.crit.baseDate)}): ${bline}` } : ph('Goal ' + (gi + 1) + ': add baseline performance data (for example, percent of opportunities and support level)'));
    });
    return base;
  };
  const hasLang = goals.some(x => areaOf(x.d) === 'lang'), hasRead = goals.some(x => areaOf(x.d) === 'read');
  let noteDone = false; const noteOnce = b => { if (!noteDone && P.baselineNote.trim()) { b.push({ t: 'p', x: P.baselineNote.trim() }); noteDone = true; } return b; };
  if (!goals.length) sec.push({ h: 'Baseline data for current academic and functional skills', b: noteOnce([ph('Complete the screening step to generate baseline data')]) });
  if (hasLang) sec.push({ h: 'Language and communication: baseline data for current academic and functional skills', b: noteOnce(baselineFor('lang')) });
  if (commDone()) {
    const who2 = st.label.trim() || 'The student';
    const ph2 = f => f.phrase;
    const used = COMM_FORMS.filter(f => commFormUsed(f.id)).map(ph2);
    const cb = [];
    if (used.length) cb.push({ t: 'p', x: `${who2} currently communicates through ${joinList(used)} (teacher observation with a communication forms and functions checklist).` });
    else cb.push({ t: 'p', x: `${who2} was observed with a communication forms and functions checklist (teacher observation). No communication form is currently reported for the functions listed below.` });
    const noObs = [];
    COMM_ROWS.forEach(r => {
      const us = COMM_FORMS.filter(f => S.comm.grid[r.id][f.id]).map(ph2);
      const ex = (S.comm.ex[r.id] || '').trim();
      if (S.comm.no[r.id] && !us.length) { noObs.push(r.v); return; }
      if (!us.length) return;
      cb.push({ t: 'li', x: `${cap(r.v)}: through ${joinList(us)}.${ex ? ' For example: ' + ex.replace(/[.\s]+$/, '') + '.' : ''}` });
    });
    if (noObs.length) cb.push({ t: 'li', x: 'Not observed: ' + joinList(noObs) + '.' });
    sec.push({ h: 'Current communication forms and functions', b: cb });
  }
  if (aacDone()) {
    const wl = techWho(), wc = cap(wl);
    const A = S.aac, ab = [];
    const hasAcc = AAC_ACCESS.filter(a => A.need[a.id]).map(a => ({ a, items: a.items.filter(it => A.acc[a.id + '_' + it[0]]).map(it => it[1]) }));
    const flo = AAC_ACCESS.filter(a => !hasAcc.some(x => x.a === a)).map(a => a.label.toLowerCase());
    if (hasAcc.length) {
      ab.push({ t: 'p', x: `Access needs for ${wl}:` });
      hasAcc.forEach(({ a, items }) => ab.push({ t: 'li', x: `${a.label}: ${items.length ? joinList(items) : 'access accommodations are needed (to be specified by the team)'}.` }));
      if (flo.length) ab.push({ t: 'li', x: `Within functional limits: ${joinList(flo)}.` });
    }
    const ans = AAC_FEATS.filter(f => A.feat[f.id]);
    if (ans.length) {
      ab.push({ t: 'p', x: `Features of ${poss(wl)} communication system:` });
      ans.forEach(f => {
        const v = A.feat[f.id]; const nm = f.id === 'lang' && A.langs.trim() ? `${f.short} (${A.langs.trim().replace(/[.\s]+$/, '')})` : f.short;
        ab.push({ t: 'li', x: v === 'use' ? `The system provides ${nm}, and ${wl} uses it.` : v === 'has' ? `The system provides ${nm}. ${wc} is not yet using it.` : `The current system does not provide ${nm}.` });
      });
    } else if (A.langs.trim()) ab.push({ t: 'p', x: `Languages ${wl} needs: ${A.langs.trim().replace(/[.\s]+$/, '')}.` });
    const sup = AAC_SUPPORTS.filter(s => A.sup[s[0]]);
    if (sup.length) { ab.push({ t: 'p', x: 'Supports for the communication system:' }); sup.forEach(s => ab.push(s[0] === 'impl' ? (A.implBy.trim() ? { t: 'li', x: cap(s[2]) + ' ' + A.implBy.trim().replace(/[.\s]+$/, '') + '.' } : ph('Name who provides classroom implementation support')) : { t: 'li', x: cap(s[2]) + '.' })); }
    const mu = techItems('com');
    ab.push(mu ? { t: 'p', x: `${cap(poss(wl))} AT needs are currently being met using ${mu.replace(/\.$/, '')}.` } : ph("Describe how the student's AT needs are currently being met"));
    sec.push({ h: 'Communication system (AAC)', b: ab });
  }
  if (techOn('com')) {
    const T = S.tech.com, D = TECH.com, w = techWho();
    const h = 'Assistive technology for communication';
    if (T.fl.none) sec.push({ h, b: [{ t: 'p', x: D.flags[0][2](w) }] });
    else {
      const mu = techItems('com'); const tb = [];
      if (!aacDone()) tb.push(mu ? { t: 'p', x: `${cap(poss(w))} assistive technology (AT) needs are currently being met using ${mu.replace(/\.$/, '')}.` } : ph("Describe how the student's AT needs are currently being met"));
      D.flags.forEach(f => { if (f[0] !== 'none' && T.fl[f[0]]) tb.push({ t: 'li', x: f[2](w) }); });
      if (T.ex.trim()) tb.push({ t: 'li', x: 'Example: ' + T.ex.trim().replace(/\.?$/, '.') });
      if (tb.length) sec.push({ h, b: tb });
    }
  }
  if (hasRead) sec.push({ h: 'Reading and writing: baseline data for current academic and functional skills', b: noteOnce(baselineFor('read')) });
  sec.push({ h: 'Specific examples of the impact on school life', b: [P.examples.trim() ? { t: 'p', x: P.examples.trim() } : ph('Add one or two classroom examples, such as participation in shared reading, written work, or interaction with peers')] });
  sec.push({ h: 'Progress over the past year', b: [P.progress.trim() ? { t: 'p', x: P.progress.trim() } : ph('Summarize progress data from the past year, or explain limited progress')] });
  sec.push({ h: 'Accommodations, services, and supports, and their effectiveness', b: [P.services.trim() ? { t: 'p', x: P.services.trim() } : ph('List accommodations, specially designed instruction, related services, and AAC or assistive technology supports, with evidence of effectiveness, including with and without information')] });
  // Strengths
  const str = [];
  goals.forEach(({ g, d }) => { const yes = []; d.pw.levels.forEach(l => l.items.forEach(it => { if (g.ans[it.id] === 'y') yes.push(it); })); if (yes.length) str.push({ t: 'li', x: `${d.pw.title}: ` + yes.slice(0, 6).map(it => stripParen(it.text)).join('; ') + (yes.length > 6 ? `; and ${yes.length - 6} more` : '') + '.' }); });
  if (P.strengthsExtra.trim()) str.push({ t: 'p', x: P.strengthsExtra.trim() });
  if (!str.length) str.push(ph('Add academic and functional strengths'));
  sec.push({ h: 'Strengths', b: str });
  sec.push({ h: 'Comparison to enrolled-grade peers', b: [P.peers.trim() ? { t: 'p', x: P.peers.trim() } : ph('Describe where enrolled-grade peers are performing, with benchmark or screener comparisons where available')] });
  // Data sources
  const ds = [];
  const inf = []; if (commDone()) inf.push('communication forms and functions checklist (teacher observation)'); if (aacDone()) inf.push('AAC features checklist'); if (P.informal.trim()) inf.push(P.informal.trim());
  ds.push(inf.length ? { t: 'li', x: 'Informal: ' + inf.join('; ') } : ph('Informal data: parent, student, and teacher input; grades; attendance'));
  const cbm = []; goals.forEach(({ d }) => cbm.push(`Project VC ${d.pw.title} scale and Evidence Tracker`));
  ds.push({ t: 'li', x: 'Curriculum-based: ' + [...new Set(cbm)].join('; ') + (P.cbm.trim() ? '; ' + P.cbm.trim() : '') + (goals.length ? '' : '[add sources]') });
  ds.push(P.crit.trim() ? { t: 'li', x: 'Criterion-referenced: ' + P.crit.trim() } : ph('Criterion-referenced data: universal screeners, district benchmarks, state assessments'));
  sec.push({ h: 'Sources of data', b: ds });
  return sec;
}
function plaafpHTML(sec) {
  return sec.map(s => `<h3>${esc(s.h)}</h3>` + wrapList(s.b)).join('');
}
function wrapList(b) {
  let out = '', open = false;
  b.forEach(x => {
    if (x.t === 'li') { if (!open) { out += '<ul>'; open = true; } out += `<li>${esc(x.x)}</li>`; }
    else { if (open) { out += '</ul>'; open = false; } out += x.t === 'ph' ? `<p class="phx">${esc(x.x)}</p>` : `<p>${esc(x.x)}</p>`; }
  });
  if (open) out += '</ul>';
  return out;
}
function plaafpText(sec) {
  return sec.map(s => s.h.toUpperCase() + '\n' + s.b.map(x => x.t === 'li' ? '- ' + x.x : x.x).join('\n')).join('\n\n');
}

/* ===== Goal text export ===== */
function goalBlocks() {
  return S.goals.map((g, i) => {
    const d = deriveGoal(g); if (!d) return null;
    const sel = selectedTeks(g, d);
    return { i, g, d, goal: g.goalOverride ?? d.goalAuto, objs: objectiveTexts(g, d), align: alignText(g, d), sel };
  }).filter(Boolean);
}
function goalText(b) {
  const L = [];
  L.push(`GOAL ${b.i + 1}`);
  L.push('Timeframe: ' + b.d.comp.timeframe); L.push('Conditions: ' + b.d.comp.conditions); L.push('Behavior: ' + b.d.comp.behavior); L.push('Criterion: ' + b.d.comp.criterion);
  L.push(''); L.push(b.goal);
  if (b.objs.length) { L.push(''); L.push('Short-term objectives and benchmarks'); b.objs.forEach((o, k) => L.push(`${k + 1}. ${o}`)); }
  L.push(''); L.push('Standards alignment'); L.push(b.align);
  L.push(''); L.push('Evaluation');
  L.push(evalText(b.g));
  return L.join('\n');
}
function fullText() {
  const L = [];
  const st = S.student;
  L.push('IEP DRAFT (goal builder output)'); L.push(`Student: ${st.label.trim() || '[student]'}   Enrolled grade: ${gradeLabel(st.grade)}`);
  L.push(`Goal period: ${fmtLong(st.start)} to ${fmtLong(st.end)}`); L.push('');
  L.push('PRESENT LEVELS OF ACADEMIC ACHIEVEMENT AND FUNCTIONAL PERFORMANCE'); L.push(''); L.push(plaafpText(plaafpModel())); L.push('');
  L.push('ANNUAL GOALS'); L.push('');
  goalBlocks().forEach(b => { L.push(goalText(b)); L.push(''); });
  L.push(DISCLAIMER); L.push(''); L.push('SOURCES AND CREDIT');
  CREDITS.forEach(c => { L.push(c[0] + ': ' + c[1]); });
  return L.join('\n');
}

/* ===== Printable styles ===== */
const DS_CSS = `
.ds,.dr{font-family:"Atkinson Hyperlegible",Arial,Helvetica,sans-serif;color:#111;background:#fff;font-size:10.5px;line-height:1.35}
.ds *,.dr *{box-sizing:border-box}
.ds{width:100%}
.ds-page{background:#fff;padding:14px 16px;border:1px solid #c9d2d5;margin-bottom:14px;border-radius:2px}
.ds h1{font-size:15px;margin:0;font-weight:700}
.ds h2{font-size:11.5px;margin:10px 0 4px;font-weight:700;text-transform:uppercase;letter-spacing:.04em}
.ds p{margin:0 0 4px}
.ds-head{display:flex;justify-content:space-between;align-items:flex-end;gap:12px;border-bottom:2px solid #111;padding-bottom:5px;margin-bottom:6px;flex-wrap:wrap}
.ds-meta{display:flex;gap:14px;flex-wrap:wrap;font-size:10.5px}
.ds-meta span b{font-weight:700}
.ds-line{display:inline-block;min-width:90px;border-bottom:1px solid #111;height:12px;vertical-align:bottom}
.ds-goal{border:1.5px solid #111;padding:6px 8px;margin:6px 0;font-size:11px}
.ds-cols{display:grid;grid-template-columns:1.25fr 1fr;gap:10px;margin-bottom:6px}
.ds table{border-collapse:collapse;width:100%}
.ds th,.ds td{border:1px solid #444;padding:2px 4px;text-align:left;vertical-align:top;font-weight:400}
.ds th{background:#e8eef0;font-weight:700;font-size:9.5px}
.ds-kv th{width:30%;background:#f1f4f5}
.ds-log td{height:21px}
.ds-log td.sm{text-align:center;white-space:nowrap}
.ds-c{display:inline-block;border:1px solid #111;border-radius:50%;width:14px;height:14px;line-height:12px;text-align:center;font-size:8.5px;margin:0 1px}
.ds-box{display:inline-block;border:1px solid #111;width:10px;height:10px;vertical-align:-1px;margin-right:3px}
.ds-small{font-size:9px;color:#333}
.ds-m{display:inline-block;border:1px solid #111;border-radius:7px;padding:0 3px;font-size:8px;margin:1px;white-space:nowrap}
.ds-trial{width:16px;padding:0 !important;text-align:center}
.ds-ex{font-size:9px;color:#222;margin:2px 0 0 12px}
.dr{max-width:7.5in;margin:0 auto;padding:18px}
.dr h1{font-size:20px;margin:0 0 4px}
.dr h2{font-size:15px;margin:20px 0 6px;border-bottom:1px solid #999;padding-bottom:3px}
.dr h3{font-size:12.5px;margin:12px 0 3px}
.dr p,.dr li{font-size:11.5px;line-height:1.45;margin:0 0 5px}
.dr ul{margin:0 0 6px;padding-left:18px}
.dr .phx{background:#fff3c4;padding:1px 4px}
.dr table{border-collapse:collapse;width:100%;margin:4px 0 8px}
.dr th,.dr td{border:1px solid #666;padding:3px 5px;font-size:10.5px;text-align:left;vertical-align:top}
.dr th{background:#e8eef0}
.dr .cr p{font-size:9.5px;color:#222}
.dr .meta{font-size:11px;color:#333}
@media print{
 @page{size:letter landscape;margin:.35in}
 .noprint{display:none !important}
 .ds-page{border:0;margin:0;padding:0;page-break-after:always;break-after:page}
 .ds-page:last-child{page-break-after:auto;break-after:auto}
 .dr{padding:0}
}
`;
const DR_PRINT = '@media print{@page{size:letter portrait;margin:.6in}}';

/* ===== Data sheet ===== */
function circ(letters) { return letters.split('').map(c => `<span class="ds-c">${c}</span>`).join(''); }
function sheetHTML(g, n) {
  const d = deriveGoal(g); if (!d) return '';
  const st = S.student, cr = g.crit; const stu = st.label.trim();
  const goal = g.goalOverride ?? d.goalAuto; const pw = d.pw; const isVC = pw.kind === 'vc';
  syncCrit(g);
  const K = cr.kind;
  const trials = K === 'p' ? Math.min(Math.max(+cr.trials || 5, 1), 10) : K === 'd' ? 3 : K === 'i' ? Math.min(Math.max(Math.round((+cr.intMin || 5) * 60 / (+cr.intLen || 10)), 1), 12) : 0;
  const multi = d.items.length > 1;
  const objs = objectiveTexts(g, d);
  const ends = cr.cueEnd;
  const cueRows = ['I', 'G', 'V', 'M'].map(c => `<tr><th style="width:62px">${c} · ${CUE[c].name}</th><td>${esc(CUE[c].def)}</td></tr>`).join('');
  const baseCueTxt = d.items.map((it, i) => { const b = d.baseCues[i]; return `${it.id}: ${b && b !== 'none' ? CUE[b].name : b === 'none' ? 'not yet with model' : 'not determined'}`; }).join('; ');
  const dkFlag = d.items.some(it => g.ans[it.id] !== 'n') ? `<p class="ds-small"><b>Baseline probe:</b> at least one target skill was marked Don't know or was not screened. Use the first three sessions to confirm the baseline before starting instruction.</p>` : '';
  const usedForms = COMM_FORMS.filter(f => commFormUsed(f.id));
  const modeChips = (usedForms.length ? usedForms : COMM_FORMS).map(f => `<span class="ds-m">${esc(f.short)}</span>`).join('');
  const rows = [];
  const cols = 9 + (multi ? 1 : 0) + trials;
  for (let r = 1; r <= 14; r++) {
    rows.push(`<tr>${'<td class="sm">' + r + '</td>'}<td style="width:62px"></td><td></td>${multi ? '<td class="sm">' + circ('abc'.slice(0, d.items.length)) + '</td>' : ''}<td class="sm">${circ('FU')}</td><td class="sm">${circ('FU')}</td><td style="width:130px">${modeChips}</td><td class="sm">${circ('IGVM')}</td>${trials ? Array.from({ length: trials }, () => '<td class="ds-trial"></td>').join('') : '<td style="width:60px"></td>'}<td style="width:36px"></td><td style="width:36px"></td><td class="sm">${circ('NPVW')}</td><td style="width:34px"></td></tr>`);
  }
  const head = `<tr><th>#</th><th>Date</th><th>Activity and materials</th>${multi ? '<th>Skill</th>' : ''}<th>Task</th><th>Partner</th><th>Mode</th><th>Cue used</th>${K === 'p' ? `<th colspan="${trials}">Opportunities (+ correct, − incorrect or no response)</th>` : K === 'd' ? `<th colspan="${trials}">Duration of each episode (${cr.durUnit})</th>` : K === 'i' ? `<th colspan="${trials}">Intervals of ${cr.intLen} seconds (+ behavior occurred, − did not)</th>` : '<th>Tally of occurrences</th>'}<th>${K === 'p' ? 'Total correct' : K === 'd' ? 'Longest' : K === 'i' ? 'Intervals +' : 'Total count'}</th><th>${K === 'p' || K === 'i' ? '%' : 'Met?'}</th><th>Evidence</th><th>Init.</th></tr>`;
  const kv = [
    ['Scale and level', esc(pw.title) + (d.si.targetLevel ? ' · ' + esc(d.si.targetLevel.label) : '')],
    ['Target skill' + (multi ? 's' : ''), d.items.map((it, i) => (multi ? `(${'abc'[i]}) ` : '') + `<b>${esc(it.id)}</b> ${esc(stripParen(it.text))}`).join('<br>')],
    ['Measure', esc(measureLabel(cr))],
    ['Mastery criterion', esc(criterionText(cr, true))],
    ['Support target', esc(`${ends === 'I' ? 'Independent (no cue beyond an expectant wait)' : CUE[ends].name + ' cue or less'}; ${FAM_SHORT[cr.fam]}`)],
    ['Baseline', esc(`${cr.baseVal.trim() || '[not entered]'} (${fmtShort(cr.baseDate)}). Support at baseline: ${baseCueTxt}`)],
    ['Collection', esc(`${cap(FREQ[cr.freq])}; method: ${d.method}`)],
    ['Goal period', esc(`${fmtShort(st.start)} to ${fmtShort(st.end)}`)]
  ].map(([k, v]) => `<tr><th>${k}</th><td>${v}</td></tr>`).join('');
  const page1 = `<section class="ds-page">
<div class="ds-head"><h1>Goal Data Sheet · Goal ${n + 1}</h1><div class="ds-meta"><span><b>Student:</b> ${stu ? esc(stu) : '<i class="ds-line"></i>'}</span><span><b>Grade:</b> ${esc(gradeShort(st.grade))}</span><span><b>Teacher:</b> ${st.teacher.trim() ? esc(st.teacher) : '<i class="ds-line"></i>'}</span></div></div>
<div class="ds-goal"><b>Annual goal.</b> ${esc(goal)}</div>
<div class="ds-goal ds-what"><b>What counts.</b> ${cr.what.trim() ? esc(cr.what.trim()) : '<i class="ds-line" style="min-width:420px"></i>'}</div>
<div class="ds-cols"><div><table class="ds-kv">${kv}</table></div><div><table class="ds-kv">${cueRows}</table><p class="ds-small" style="margin-top:3px">Response codes: + correct or appropriate, − incorrect or no response. Task and partner: F familiar, U unfamiliar. Evidence: N note, P photo, V video or audio, W work sample.</p></div></div>
${dkFlag}
<table class="ds-log">${head}${rows.join('')}</table>
<p class="ds-small" style="margin-top:3px">Project VC © 2026 Center for Literacy and Disability Studies, UNC-Chapel Hill, licensed under CC BY-SA 4.0. Adapted by the Goal Builder.</p>
</section>`;
  /* page 2 */
  const objRows = objs.length ? objs.map((o, k) => `<tr><td style="width:18px">${k + 1}</td><td>${esc(o)}</td><td style="width:70px"></td><td style="width:70px"></td></tr>`).join('') : '<tr><td colspan="4">No short-term objectives selected.</td></tr>';
  const perfCell = (K === 'c' || K === 'd') ? '____ ' + (K === 'd' ? cr.durUnit : 'per ' + (cr.per === 'day' ? 'day' : 'session')) + '<br>Cue: <span class="ds-c">I</span><span class="ds-c">G</span><span class="ds-c">V</span><span class="ds-c">M</span>' : '____ %<br>Cue: <span class="ds-c">I</span><span class="ds-c">G</span><span class="ds-c">V</span><span class="ds-c">M</span>';
  const rep = reportDates().map((dt, k) => `<tr><td>${k + 1}</td><td>${fmtShort(dt)}</td><td style="width:120px">${perfCell}</td><td><span class="ds-box"></span>Goal met<br><span class="ds-box"></span>Sufficient progress<br><span class="ds-box"></span>Insufficient progress</td><td style="width:34%"></td></tr>`).join('');
  let tracker = '';
  if (isVC) {
    const L = d.si.targetLevel || pw.levels[0];
    const tr = d.items.map((it, i) => {
      const ex = [...(it.ex || [])].sort((a, b) => a.length - b.length).slice(0, 2).map(e => `<div class="ds-ex">${esc(e)}</div>`).join('');
      const evRows = [1, 2, 3, 4].map(k => `<tr><td style="width:44px">${k <= 3 ? 'Event ' + k : 'Extra'}</td><td style="width:62px"></td><td style="width:20%"></td><td></td><td style="width:130px"><span class="ds-box"></span>Concrete &nbsp;<span class="ds-box"></span>Digital</td></tr>`).join('');
      return `<h2>${multi ? '(' + 'abc'[i] + ') ' : ''}${esc(it.id)}. ${esc(stripParen(it.text))}</h2><table><tr><th>Learning event</th><th>Date</th><th>Context</th><th>Description of evidence (what the student did)</th><th>Storage</th></tr>${evRows}</table><div class="ds-small">Examples of evidence from Project VC:</div>${ex}`;
    }).join('');
    const tally = L.items.map(it => `<tr><td><b>${esc(it.id)}</b></td><td>${esc(stripParen(it.text))}</td><td style="width:60px">${statusOf(g, it.id)}</td><td style="width:90px"><span class="ds-box"></span><span class="ds-box"></span><span class="ds-box"></span></td></tr>`).join('');
    tracker = `<h2>Evidence Tracker (Project VC) · ${esc(L.label)}</h2><p class="ds-small">An indicator has evidence when there are at least 3 pieces of evidence from 3 separate learning events, collected across multiple days and contexts. A level is achieved when 6 of the 8 indicators meet this standard. Indicate where evidence is stored: concrete (work samples, photographs, teacher notes, data sheets) or digital (videos, audio recordings, digital portfolios, apps).</p>${tr}<h2>Level tally · ${esc(L.label)}</h2><table><tr><th>ID</th><th>Indicator</th><th>Screened</th><th>Events 1, 2, 3</th></tr>${tally}</table><p class="ds-small">Indicators with 3 events: ____ of ${L.items.length} (need ${pw.need}).</p>`;
  }
  const page2 = `<section class="ds-page"><div class="ds-head"><h1>Objectives, Progress, and Evidence · Goal ${n + 1}</h1><div class="ds-meta"><span><b>Student:</b> ${stu ? esc(stu) : '<i class="ds-line"></i>'}</span></div></div>
<h2>Short-term objectives and benchmarks</h2><p class="ds-small">Objectives are steps toward the goal. They are not the criterion for mastering the annual goal.</p><table><tr><th>#</th><th>Objective</th><th>Date started</th><th>Date mastered</th></tr>${objRows}</table>
<h2>Progress reporting (${esc(REPORT[S.student.report])})</h2><p class="ds-small">Report progress in the same measure as the goal. Notations such as "progress being made" alone are not adequate.${S.student.dyslexia === 'yes' ? ' This report also serves as the dyslexia progress report (TEC §29.0031(d)).' : S.student.dyslexia === 'sep' ? ' A separate dyslexia progress report is provided (TEC §29.0031(d)).' : ''}</p><table><tr><th>#</th><th>Due</th><th>Performance</th><th>Progress toward annual goal</th><th>Comments</th></tr>${rep}</table>
${tracker}</section>`;
  return page1 + page2;
}
function creditsHTML() { return `<div class="cr">${CREDITS.map(c => `<p><b>${esc(c[0])}.</b> ${esc(c[1])}</p>`).join('')}<p>${esc(DISCLAIMER)}</p></div>`; }
function wrapDoc(title, body, extraCss) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&display=swap"><style>body{margin:0;background:#eef1f2;padding:12px}.bar{max-width:7.5in;margin:0 auto 10px;display:flex;gap:10px;align-items:center;font-family:Arial,sans-serif;font-size:12px}.bar button{font:inherit;padding:6px 12px;border:1px solid #333;background:#fff;border-radius:4px;cursor:pointer}@media print{body{background:#fff;padding:0}}${DS_CSS}${extraCss || ''}</style></head><body><div class="bar noprint"><button onclick="window.print()">Print</button><span>Use landscape for data sheets and portrait for the IEP draft. Clear the browser headers and footers option if you do not want them printed.</span></div>${body}</body></html>`;
}
function sheetsDoc() {
  const body = '<div class="ds">' + S.goals.map((g, i) => sheetHTML(g, i)).join('') + '<section class="ds-page"><h2>Sources and credit</h2><div class="dr" style="padding:0;max-width:none">' + creditsHTML() + '</div></section></div>';
  return wrapDoc('Goal data sheets', body);
}
function draftDoc() {
  const st = S.student; const blocks = goalBlocks();
  const goalsHTML = blocks.map(b => {
    const ob = b.objs.length ? `<h3>Short-term objectives</h3><ul>${b.objs.map(o => `<li>${esc(o)}</li>`).join('')}</ul>` : '';
    const cmp = `<table><tr><th>Timeframe</th><th>Conditions</th><th>Behavior</th><th>Criterion</th></tr><tr><td>${esc(b.d.comp.timeframe)}</td><td>${esc(b.d.comp.conditions)}</td><td>${esc(b.d.comp.behavior)}</td><td>${esc(b.d.comp.criterion)}</td></tr></table>`;
    return `<h2>Annual goal ${b.i + 1}</h2><p>${esc(b.goal)}</p>${cmp}${ob}<h3>Standards alignment</h3><p>${esc(b.align)}</p><h3>Evaluation</h3><p>${esc(evalText(b.g))}</p>`;
  }).join('');
  const body = `<div class="dr"><h1>IEP draft</h1><p class="meta">Student: ${esc(st.label.trim() || '[student]')} · Enrolled grade: ${esc(gradeLabel(st.grade))} · Goal period: ${esc(fmtLong(st.start))} to ${esc(fmtLong(st.end))}</p><h2>Present levels of academic achievement and functional performance</h2>${plaafpHTML(plaafpModel())}${goalsHTML}<h2>Sources and credit</h2>${creditsHTML()}</div>`;
  return wrapDoc('IEP draft', body, DR_PRINT);
}
