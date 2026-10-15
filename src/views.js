/* ===== Views ===== */
const STEPS = ['Student', 'Communication', 'Screen', 'Target skills', 'Criteria', 'Goal and TEKS', 'PLAAFP', 'Print and export'];
const $ = s => document.querySelector(s);
const field = (label, inner, hint, cls) => `<div class="field ${cls || ''}"><label>${label}</label>${inner}${hint ? `<p class="hint">${hint}</p>` : ''}</div>`;
let fid = 0;
const inp = (path, o = {}) => {
  const id = 'f' + (++fid); const v = getBound(path);
  const t = o.type || 'text';
  if (t === 'textarea') return `<textarea id="${id}" data-bind="${path}" rows="${o.rows || 3}" placeholder="${esc(o.ph || '')}">${esc(v)}</textarea>`;
  return `<input id="${id}" type="${t}" data-bind="${path}" ${o.num ? 'data-type="num"' : ''} value="${esc(v)}" ${o.min != null ? `min="${o.min}"` : ''} ${o.max != null ? `max="${o.max}"` : ''} ${o.step ? `step="${o.step}"` : ''} placeholder="${esc(o.ph || '')}" ${o.w ? `style="max-width:${o.w}"` : ''}>`;
};
const sel = (path, opts, o = {}) => {
  const id = 'f' + (++fid); const v = String(getBound(path) ?? '');
  return `<select id="${id}" data-bind="${path}" ${o.num ? 'data-type="num"' : ''}>${opts.map(([val, lab]) => `<option value="${esc(val)}" ${String(val) === v ? 'selected' : ''}>${esc(lab)}</option>`).join('')}</select>`;
};
const chk = (path, label) => { const id = 'f' + (++fid); return `<label class="check" for="${id}"><input id="${id}" type="checkbox" data-bind="${path}" ${getBound(path) ? 'checked' : ''}><span>${label}</span></label>`; };
function resolve(path) {
  const p = path.split('.'); let o = p[0] === 'g' ? G() : S[p[0]]; for (let i = 1; i < p.length - 1; i++) o = o[p[i]];
  return [o, p[p.length - 1]];
}
function getBound(path) { const [o, k] = resolve(path); return o[k]; }
function seg(act, cur, opts, data) {
  return `<div class="seg" role="radiogroup">${opts.map(([v, l]) => `<button type="button" role="radio" aria-checked="${cur === v}" class="${cur === v ? 'on ' + v : ''}" data-act="${act}" data-v="${v}" ${data}>${l}</button>`).join('')}</div>`;
}
const YND = [['y', 'Yes'], ['n', 'No'], ['d', "Don't know"]];
function det(key, summary, inner) { return `<details data-det="${key}" ${S.ui.det[key] ? 'open' : ''}><summary>${summary}</summary>${inner}</details>`; }

function stepperHTML() {
  return `<ol>${STEPS.map((n, i) => `<li><button type="button" data-act="step" data-v="${i}" ${i === S.step ? 'aria-current="step"' : ''} class="${i === S.step ? 'cur' : ''}"><span class="n">${i + 1}</span><span class="t">${n}</span></button></li>`).join('')}</ol>`;
}
function goalTabsHTML() {
  if (![2, 3, 4, 5, 7].includes(S.step)) return '';
  const tabs = S.goals.map((g, i) => {
    const pw = getPW(g); return `<button type="button" data-act="setgoal" data-v="${i}" class="gt ${i === (S.step === 7 ? S.ui.sheetGoal : S.active) ? 'on' : ''}">Goal ${i + 1}${pw ? `<small>${esc(pw.title.split(' ')[0])}</small>` : ''}</button>`;
  }).join('');
  const del = S.goals.length > 1 && S.step !== 7 ? (G().confirmDel ? `<button type="button" class="btn danger sm" data-act="delgoal">Confirm remove goal ${S.active + 1}</button><button type="button" class="btn sm" data-act="delcancel">Cancel</button>` : `<button type="button" class="btn sm" data-act="delgoal">Remove goal ${S.active + 1}</button>`) : '';
  return `<div class="gtabs">${tabs}${S.step !== 7 ? '<button type="button" class="gt add" data-act="addgoal">+ Add goal</button>' : ''}<span class="grow"></span>${del}</div>`;
}

/* ---- Step 0 ---- */
function viewStudent() {
  S.live = null;
  return `<section class="card"><h2>Student and timeline</h2>
<p class="muted">These entries appear in the goal wording, PLAAFP, and printouts. Nothing is saved or sent anywhere, and everything clears when this page closes. Use initials or a local ID in place of a name.</p>
<div class="grid2">
${field('Student initials or ID', inp('student.label', { ph: 'Example: J.R.' }), 'Leave blank to write "the student" in the goal.')}
${field('Enrolled grade', sel('student.grade', GRADES), 'Standards-based IEPs align goals to the enrolled-grade TEKS, with prerequisite TEKS used for scaffolding.')}
${field('Teacher or case manager (optional)', inp('student.teacher'))}
${field('Reporting schedule', sel('student.report', Object.entries(REPORT), { num: true }), 'Controls the progress reporting rows on the data sheet.')}
${field('Goal start date', inp('student.start', { type: 'date' }))}
${field('Annual goal end date', inp('student.end', { type: 'date' }), 'Usually the next annual ARD date.')}
</div>
<div class="field">${chk('student.aac', 'This student uses or needs AAC (speech-generating device, symbol communication system, or similar)')}<p class="hint">Adds the AAC features checklist on the Communication step and AAC language samples to the data collection options.</p></div>
<div class="field">${chk('student.alt', 'This student takes an alternate assessment (STAAR Alternate 2)')}<p class="hint">Short-term objectives or benchmarks are required in the annual goal for these students. Each goal then needs at least two.</p></div>
${field('Dyslexia progress report', sel('student.dyslexia', [['na', 'Not applicable'], ['yes', 'Goal progress report also serves as the dyslexia progress report'], ['sep', 'A separate dyslexia progress report is provided']]), 'For IEPs developed or amended as of July 1, 2027, the IEP documents which option applies (TEC §29.0031(d)).')}
</section>
<section class="card"><h2>How the tool works</h2>
<p class="muted">This tool is not an assessment. It documents what the student uses and needs so that the IEP can state it clearly.</p>
<ol class="steps">
<li><b>Communication (optional).</b> Record how the student currently communicates and, for AAC users, what the system provides. This fills in the PLAAFP and the goal conditions.</li>
<li><b>Screen.</b> Choose a Project VC scale. Answer the placement questions from the simplest up to find the starting level, then record Yes, No, or Don't know for each skill.</li>
<li><b>Target skills.</b> The tool lists skills without evidence at the current level, written as goal-ready skills and tagged by impact and how carefully they need to be measured. Select one skill, then identify the level of support the student needs today. Add another goal for a second area.</li>
<li><b>Criteria.</b> Set the conditions, define what counts, choose how the skill is measured, and enter the baseline, mastery rule, support level, and data collection method.</li>
<li><b>Goal and TEKS.</b> Review the annual goal in its four components (timeframe, conditions, behavior, criterion), the short-term objectives, and enrolled-grade and prerequisite TEKS.</li>
<li><b>PLAAFP.</b> Draft present levels using the TEA essential elements, with baseline data filled in from the screening.</li>
<li><b>Print and export.</b> Download data sheets and an IEP draft, or copy the text.</li>
</ol></section>`;
}

/* ---- Assistive technology card ---- */
function techCard(kind) {
  const D = TECH[kind], T = S.tech[kind]; const pre = 'tech.' + kind + '.';
  const box = f => chk(pre + 'fl.' + f[0], esc(f[1]));
  const col = ([k, t]) => `<div class="rcol"><h4>${t}</h4>${D.flags.filter(f => f[3] === k).map(box).join('')}</div>`;
  const ctx = D.flags.filter(f => f[3] === 'ctx');
  const warn = techWarn(kind);
  return `<section class="card"><h2>${esc(D.title)}</h2>
<p class="muted">${esc(D.intro)}</p>
<div class="rub"><div class="rcol"><h4>No support required</h4>${box(D.flags[0])}</div>${TECH_TIERS.map(col).join('')}</div>
<div class="field"><label>Need for the technology</label>${ctx.map(box).join('')}</div>
${T.fl.none || S.student.aac ? '' : field("The student's AT needs are currently being met using...", inp(pre + 'items', { type: 'textarea', rows: 2, ph: D.ph }), 'Write a phrase that completes the sentence.')}
${T.fl.none ? '' : field('Example or evidence (optional)', inp(pre + 'ex', { type: 'textarea', rows: 2, ph: `Example: Without access to robust AAC, ${techWho()} cannot express ideas, wants, or needs during the school day and misses opportunities to participate in education.` }), 'A specific observation with and without the tool is the strongest support.')}
${warn ? `<div class="note warn">${esc(warn)}</div>` : ''}
<div class="note info">Check only what is true for this student and documented elsewhere in the IEP. The rubric is scored from the whole IEP, so the PLAAFP, supplementary aids and services, and goals should agree. This tool does not assign a score or a funding tier.</div>
</section>`;
}

/* ---- Communication step ---- */
function viewComm() {
  S.live = null;
  const nf = COMM_FORMS.length;
  const grpHead = `<tr><th class="fn" rowspan="2">The student currently uses...</th><th colspan="${COMM_FORMS.filter(f => f.grp === 0).length}" class="grp">Without tools</th><th colspan="${COMM_FORMS.filter(f => f.grp === 1).length}" class="grp">With tools</th><th class="grp" rowspan="2">Not observed</th></tr><tr>${COMM_FORMS.map(f => `<th class="frm">${esc(f.label)}</th>`).join('')}</tr>`;
  const rows = COMM_ROWS.map(r => {
    const exv = S.comm.ex[r.id] || '';
    return `<tr class="frow"><th class="fn" scope="row"><span class="fnl">${esc(r.label)}</span><span class="exline"><label for="ex-${r.id}">For example:</label><textarea id="ex-${r.id}" rows="1" data-bind="comm.ex.${r.id}" aria-label="Example for ${esc(r.label)}">${esc(exv)}</textarea></span></th>${COMM_FORMS.map(f => { const on = S.comm.grid[r.id][f.id] || 0; return `<td><button type="button" class="cell ${on ? 's2' : ''}" data-act="cell" data-r="${r.id}" data-f="${f.id}" role="checkbox" aria-checked="${!!on}" aria-label="${esc(r.label)} through ${esc(f.label)}">${on ? '\u2713' : ''}</button></td>`; }).join('')}<td><button type="button" class="cell ${S.comm.no[r.id] ? 's1' : ''}" data-act="notobs" data-r="${r.id}" role="checkbox" aria-checked="${!!S.comm.no[r.id]}" aria-label="${esc(r.label)}: not observed">${S.comm.no[r.id] ? '\u2713' : ''}</button></td></tr>`;
  }).join('');
  const aacOn = S.student.aac;
  return `<section class="card"><h2>Communication forms and functions</h2>
<p class="muted">An informal teacher observation. For each purpose, check every way the student currently communicates it, or check Not observed. Add an example under a purpose when one helps. Examples that are filled in appear in the PLAAFP, and blank ones do not. This step is optional.</p>
<div class="tscroll"><table class="cgrid">${grpHead}${rows}</table></div>
<p class="hint">Not a standardized assessment. Complete it with input from the speech-language pathologist and family where possible.</p>
<div class="note info">Gesture dictionary reminder: keep a running list of the student's gestures and what each one means, and share it with every communication partner so that gestures are recognized as communication.</div></section>
<section class="card"><h2>AAC system</h2>
<div class="field">${chk('student.aac', 'This student uses or needs AAC')}</div>
${aacOn ? aacBody() : '<p class="muted">Select the box above to document access needs and the features of the communication system.</p>'}
</section>
${techCard('com')}`;
}
function aacBody() {
  const A = S.aac;
  const access = AAC_ACCESS.map(a => `<div class="afeat"><h4>${esc(a.label)}</h4><div class="accrow" role="radiogroup" aria-label="${esc(a.label)} access"><label class="check"><input type="radio" name="need-${a.id}" data-act="aacneed" data-a="${a.id}" data-v="wfl" ${A.need[a.id] ? '' : 'checked'}><span>Within functional limits</span></label><label class="check"><input type="radio" name="need-${a.id}" data-act="aacneed" data-a="${a.id}" data-v="need" ${A.need[a.id] ? 'checked' : ''}><span>Access needs in this area</span></label></div>${A.need[a.id] ? `<div class="accrow">${a.items.map(it => chk('aac.acc.' + a.id + '_' + it[0], esc(cap(it[1])))).join('')}</div>` : ''}</div>`).join('');
  const feats = AAC_FEATS.map(f => `<div class="afeat"><h4>${esc(f.label)}</h4>${seg('aacf', A.feat[f.id], AAC_FEAT_OPTS, `data-id="${f.id}"`)}${f.id === 'lang' && A.feat.lang ? `<div class="field">${'<label>Languages the student needs</label>'}${inp('aac.langs', { ph: 'Example: English and Spanish' })}</div>` : ''}</div>`).join('');
  const gap = aacGap() ? `<div class="note warn">A robust system gives the student access to all needed languages, core words, fringe words, personally relevant words, and the alphabet, even before the student is using them. Consider how the team will add the missing features.</div>` : '';
  return `<div class="note info">AAC is a system of tools, such as speech, gestures, picture symbols, light-tech and mid-tech tools, and a high-tech device. Features below count whichever tools provide them.</div>
<h3>Access needs</h3><p class="muted">Each area is within functional limits unless you select access needs. Checked accommodations appear in the PLAAFP.</p>${access}
<h3>Features of the communication system</h3><p class="muted">For each feature, record whether the student's current system provides it and whether the student uses it.</p>${feats}${gap}
<h3>Supports</h3><div class="field">${AAC_SUPPORTS.map(s => chk('aac.sup.' + s[0], esc(s[0] === 'impl' ? 'Classroom implementation support from (name or role)' : s[1])) + (s[0] === 'impl' && S.aac.sup.impl ? inp('aac.implBy', { ph: 'Example: the SLP or AT specialist' }) : '')).join('')}</div>
${field("The student's AT needs are currently being met using...", inp('tech.com.items', { type: 'textarea', rows: 2, ph: TECH.com.ph }), 'Write a phrase that completes the sentence.')}`;
}

/* ---- Step 1 ---- */
function pathwayPicker() {
  const P = allPathways();
  const card = p => `<button type="button" class="pcard" data-act="pick" data-v="${p.key}"><b>${esc(p.title)}</b><span>${esc(p.desc.replace(/^This scale supports (tracking )?/i, '').replace(/^(students'?|student)\s+/i, '').slice(0, 170))}</span></button>`;
  return `<section class="card"><h2>Choose a Project VC scale for this goal</h2><p class="muted">Each goal addresses one scale. Add another goal afterward for a second area.</p><div class="pgrid">${P.vc.map(card).join('')}</div></section>`;
}
function viewScreen() {
  S.live = null; const g = G();
  if (!g.src) return pathwayPicker();
  const pw = getPW(g); const si = screenInfo(g, pw);
  let top = `<section class="card"><div class="rowb"><div><h2>${esc(pw.title)}</h2><p class="muted">${esc(pw.desc)}</p></div><button type="button" class="btn sm" data-act="chsrc">Change</button></div></section>`;
  let place = '';
  if (pw.kind === 'vc') {
    const pl = si.pl;
    place = `<section class="card"><h2>Where to start</h2><p class="muted">Answer from the simplest question up. The first No stops the sequence, and the starting level is the last level answered Yes. Use Don't know when you have not seen enough to answer.</p>
${pl.visible.map((q, k) => `<div class="q"><p><span class="code">${k + 1}</span> ${esc(q.q)}</p>${seg('plc', g.plc[q.n], YND, `data-q="${q.n}"`)}</div>`).join('')}
${pl.differentScale ? `<div class="note warn"><b>Consider a different scale.</b> A Yes on the last question indicates the student already uses print conventions beyond this scale. Choose another scale, or set a starting level below.</div>` : ''}
${pl.dk.length ? `<div class="note info">Don't know was selected, so the starting level below is provisional. It reflects the questions answered Yes. Gather observations on the skill in the last question before finalizing.</div>` : ''}
${pl.done && pl.computed ? `<div class="note ok"><b>Starting level: ${esc(pl.computed)}${pl.provisional ? ' (provisional)' : ''}.</b></div>` : ''}
<div class="field inline" style="margin-top:10px"><label for="startsel">Starting level</label><select id="startsel" data-bind="g.startOverride">${`<option value="">${pl.computed ? 'Use placement result (' + pl.computed + ')' : 'Select a level'}</option>` + pw.levels.map(l => `<option value="${l.code}" ${g.startOverride === l.code ? 'selected' : ''}>${l.code}</option>`).join('')}</select></div></section>`;
  }
  if (si.startIx < 0) return top + place + `<div class="note info">Complete the placement questions to begin screening skills.</div>`;
  const ix = (() => { const t = pw.levels.findIndex(l => l.code === g.tab); if (t >= si.startIx) return t; return si.targetIx >= 0 ? si.targetIx : pw.levels.length - 1; })();
  const tabs = pw.levels.map((L, i) => {
    if (i < si.startIx) return '';
    const s = levelStatus(g, pw, L);
    return `<button type="button" role="tab" aria-selected="${i === ix}" class="lt ${i === ix ? 'on' : ''} ${s.complete ? 'done' : ''}" data-act="tab" data-v="${esc(L.code)}"><b>${esc(pw.kind === 'vc' ? L.code : L.code)}</b><small>${s.y}/${s.total}${s.complete ? ' · met' : ''}</small></button>`;
  }).join('');
  const L = pw.levels[ix]; const ls = levelStatus(g, pw, L);
  const ask = 'Does the student show this skill, with evidence from at least 3 separate learning events across multiple days and contexts?';
  const items = L.items.map(it => {
    const opts = YND;
    const exs = (it.ex || []).length ? det('ex-' + it.id, `Examples of evidence (${it.ex.length})`, `<ul class="ex">${it.ex.map(e => `<li>${esc(e)}</li>`).join('')}</ul>`) : '';
    return `<div class="item ${g.ans[it.id] || ''}"><div class="itop"><span class="code">${esc(it.id)}</span><p>${esc(it.text)}</p></div>${it.tag ? `<p class="tag">${esc(it.tag)}</p>` : ''}${seg('ans', g.ans[it.id], opts, `data-id="${it.id}"`)}${exs}</div>`;
  }).join('');
  const sumTxt = si.allDone ? `All screened levels are met. This scale has no further level to target.` : si.targetLevel ? `Target level: <b>${esc(si.targetLevel.code)}</b>. ${levelStatus(g, pw, si.targetLevel).y} of ${levelStatus(g, pw, si.targetLevel).total} ${pw.kind === 'vc' ? 'indicators have evidence; ' + pw.need + ' are needed to achieve the level.' : 'goals are met.'}` : '';
  return top + place + `<section class="card"><h2>Screen skills</h2>
<div class="ltabs" role="tablist">${tabs}</div>
<div class="lvl"><h3>${esc(L.label)}${L.desc ? '' : ''}</h3>${L.desc ? `<p class="muted">${esc(L.desc)}</p>` : ''}${L.outcome ? `<p><b>Outcome.</b> ${esc(L.outcome)}</p>` : ''}${L.note ? det('note-' + L.code, 'Notes on this level', `<p class="muted">${esc(L.note)}</p>`) : ''}</div>
<p class="ask">${ask}</p>
<div class="items">${items}</div>
${(() => { const fl = L.items.filter(it => modeFlagged(pw, it)); return fl.length ? `<div class="note info">${fl.map(it => it.id).join(' and ')} ${fl.length > 1 ? 'name' : 'names'} a communication form that is not currently reported on the Communication step. The level still needs ${pw.need} of ${L.items.length} indicators.</div>` : ''; })()}
<div class="note ${ls.complete ? 'ok' : 'info'}">${ls.complete ? `<b>${esc(L.code)} is met</b> (${ls.y} of ${ls.total}). Open the next level tab to screen it.` : `${ls.y} Yes, ${ls.n} No, ${ls.d} Don't know, ${ls.u} not answered.`}</div>
${sumTxt ? `<p class="sumline">${sumTxt}</p>` : ''}</section>`;
}

/* ---- Step 2: targets ---- */
function viewTargets() {
  S.live = null; const g = G(); const pw = getPW(g);
  if (!pw) return `<div class="note info">Choose a skill area on the Screen step first. <button type="button" class="btn sm" data-act="step" data-v="2">Go to Screen</button></div>`;
  const si = screenInfo(g, pw); const L = si.targetLevel;
  if (!L) return `<div class="note info">${si.allDone ? 'Every screened level on this scale is met. Choose another scale for a new goal.' : 'Finish the placement questions on the Screen step.'} <button type="button" class="btn sm" data-act="step" data-v="2">Go to Screen</button></div>`;
  const miss0 = missingItems(g, pw, L).filter(m => { const s0 = skillOf(pw, m); return !(s0 && s0.rm); });
  const hiRank = it => { const s = skillOf(pw, it); return s && s.hi ? 0 : 1; };
  const miss = [...miss0.filter(m => !modeFlagged(pw, m)).map((m, k) => ({ m, k })).sort((a, c) => hiRank(a.m) - hiRank(c.m) || a.k - c.k).map(x => x.m), ...miss0.filter(m => modeFlagged(pw, m))];
  const nFlag = miss0.filter(m => modeFlagged(pw, m)).length;
  const firstOnScale = miss0.find(m => !modeFlagged(pw, m));
  g.targets = g.targets.filter(id => miss.some(m => m.id === id)).slice(0, 1);
  if (!g.targets.length && miss.length) { g.targets = [miss[0].id]; resetMeasure(g); }
  const unscreened = miss.filter(m => !g.ans[m.id]).length;
  const plainOf = it => { const s = skillOf(pw, it); return s ? cap(skTitle(s)) : stripParen(it.text); };
  const list = miss.map(it => {
    const on = g.targets.includes(it.id); const s = skillOf(pw, it);
    const btl = s ? s.bt.filter(k => SK[k]).map(k => cap(SK[k].b)) : []; const tr = (t, n) => t.length > n ? t.slice(0, n - 2).trim() + '...' : t;
    const bt = btl.join('; '); const btShow = btl.length > 1 ? tr(btl[0], 40) + ' and ' + (btl.length - 1) + ' more' : btl.length ? tr(btl[0], 58) : '';
    return `<label class="tcard ${on ? 'on' : ''}"><input type="radio" name="tgt" data-act="tgt" data-id="${esc(it.id)}" ${on ? 'checked' : ''}><span class="tbody"><span class="code">${esc(it.id)}</span> ${esc(plainOf(it))}${s ? `<span class="vcsrc">Project VC indicator: ${esc(stripParen(it.text))}</span>` : ''}${s && s.n ? `<span class="vcsrc">Note: ${esc(s.n)}</span>` : ''}<span class="tmeta">${s && s.hi ? '<em class="pill hi">High impact</em>' : ''}${s && s.mc ? '<em class="pill mc">Measure carefully</em>' : ''}${s && s.ev ? '<em class="pill ev">Evidence only</em>' : ''}${bt ? `<em class="pill bt" title="${esc(bt)}">Builds toward: ${esc(btShow)}</em>` : ''}${firstOnScale && it.id === firstOnScale.id ? '<em class="pill nxt">Next on the scale</em>' : ''}${modeFlagged(pw, it) ? `<em class="pill dk">No ${esc(COMM_FORMS.find(f => f.id === modeNeed(pw, it)).phrase)} currently reported</em>` : ''}<em class="pill ${g.ans[it.id] === 'n' ? 'no' : 'dk'}">${statusOf(g, it.id)}</em></span></span></label>`;
  }).join('');
  const cueBlocks = g.targets.map(id => {
    const it = pw.byId[id]; const ca = g.cueAns[id] || (g.cueAns[id] = {});
    let out = ''; let stop = false;
    for (const c of ['I', 'G', 'V', 'M']) {
      if (stop) break;
      out += `<div class="q"><p><b>${CUE[c].name}.</b> ${esc(CUE[c].def)}<br>In a familiar activity, does the student show this skill with this level of support?</p>${seg('cue', ca[c], YND, `data-id="${esc(id)}" data-c="${c}"`)}</div>`;
      if (ca[c] === 'y') stop = true; else if (!ca[c]) stop = true;
    }
    const b = baseCueOf(g, id);
    const res = b === 'none' ? `<div class="note warn"><b>No response with a model.</b> The student may need earlier skills first. Review the previous level on the Screen step, or select a different target skill.</div>` : b ? `<div class="note ok"><b>Baseline support: ${CUE[b].name}.</b> Objectives will step down from this level to the end cue you choose on the Criteria step.</div>` : '';
    return `<div class="tblock"><h3><span class="code">${esc(it.id)}</span> ${esc(plainOf(it))}</h3>${out}${res}</div>`;
  }).join('');
  const strong = L.items.filter(it => g.ans[it.id] === 'y');
  const selIt = g.targets.length ? pw.byId[g.targets[0]] : null; const selSk = selIt ? skillOf(pw, selIt) : null;
  const evCard = selSk && selSk.ev ? (() => {
    const alts = selSk.ev.map(k => ({ k, it: pw.byId[k.split(':')[1]] })).filter(a => a.it && miss.some(m => m.id === a.it.id));
    return `<section class="card ev"><h2>Consider a more measurable skill</h2><p class="muted">This skill mainly serves as evidence for the level. It is hard to count the same way every time. You can still select it.</p>
${alts.length ? `<p><b>Skills that are easier to measure and build toward the same level:</b></p><div class="altlist">${alts.map(a => `<div class="alt"><span>${esc(cap(skTitle(SK[a.k])))}</span><button type="button" class="btn sm" data-act="tgtalt" data-id="${esc(a.it.id)}">Select instead</button></div>`).join('')}</div>` : ''}
<p><b>If you keep this skill,</b> the Criteria step offers these ways to measure it:</p><ul class="plain">${selSk.o.map(o => `<li>${esc(optName(o))}: ${esc(optHint(o))}</li>`).join('')}</ul></section>`;
  })() : '';
  const exCard = selIt && (selIt.ex || []).length ? `<section class="card"><h2>Examples of this skill from Project VC</h2><p class="muted">From the Project VC Evidence Tracker. Use them to decide whether the student shows the skill and what it looks like in a classroom.</p><ul class="ex">${selIt.ex.map(e => `<li>${esc(e)}</li>`).join('')}</ul></section>` : '';
  const addCard = g.targets.length ? `<section class="card"><h2>Add a goal in another area?</h2><p class="muted">This goal addresses ${esc(pw.title)}. Many students need goals in more than one area, such as expressive communication and engagement with text. Each goal gets its own measure and data sheet.</p><button type="button" class="btn pri" data-act="addgoal">Add a goal in another area</button></section>` : '';
  return `<section class="card"><h2>Select a target skill</h2>
<p class="muted">These skills at ${esc(L.label)} do not yet have evidence. Choose the one skill that will make the most difference for this student. One skill per goal gives the clearest data. Skills marked High impact tend to open the most communication and learning opportunities.</p>
${unscreened ? `<div class="note info">${unscreened} skill${unscreened > 1 ? 's were' : ' was'} not screened. Return to the Screen step to answer them, or select a skill and answer the support questions below.</div>` : ''}
${nFlag ? `<div class="note info">${nFlag} skill${nFlag > 1 ? 's name' : ' names'} a communication form that is not currently reported on the Communication step. ${nFlag > 1 ? 'They are' : 'It is'} listed last. A level still needs 6 of 8 indicators.</div>` : ''}
<div class="tlist">${list}</div>
${g.targets.some(id => g.ans[id] === 'd' || !g.ans[id]) ? `<div class="note info">The selected skill is marked Don't know or not screened. The data sheet includes a baseline probe so the first sessions confirm the baseline.</div>` : ''}
</section>
${evCard}
${exCard}
<section class="card"><h2>Level of support today</h2><p class="muted">Ask from least to most support. The first Yes sets the baseline support level, and the goal scaffolds from there. The levels are independent, gesture, verbal, and model.</p>
${cueBlocks || '<p class="muted">Select a target skill above.</p>'}</section>
${addCard}
${strong.length ? `<section class="card"><h2>Skills already in place at ${esc(L.code)}</h2><p class="muted">These support the target skill and appear as strengths in the PLAAFP.</p><ul class="plain">${strong.map(it => `<li><span class="code">${esc(it.id)}</span> ${esc(it.text)}</li>`).join('')}</ul></section>` : ''}`;
}
function optName(o) { return o.k === 'c' ? 'Number of ' + o.u : o.k === 'p' ? 'Percent of opportunities' : o.k === 'd' ? 'Duration' : 'Percent of intervals'; }
function optHint(o) { return o.k === 'c' ? 'Tally each occurrence.' : o.k === 'p' ? 'Score each opportunity you present.' : o.k === 'd' ? 'Time how long the skill continues without a break.' : 'Check each short interval for the skill.'; }
const GENERIC_WHAT = ['The student shows the target skill during the activity at or below the support level written in the goal.', 'A response made on purpose in the activity and directed to the partner or the materials.'];
function ensureCrit(g) {
  if (g.critInit) return; g.critInit = true; const pw = getPW(g); if (!pw) return;
  g.crit.methods.tracker = true; g.crit.vcEvidence = true;
  if (S.student.aac) g.crit.methods.aac = true;
}
function viewCriteria() {
  const g = G(); const pw = getPW(g);
  if (!pw || !g.targets.length) return `<div class="note info">Select a target skill on the Target skills step first. <button type="button" class="btn sm" data-act="step" data-v="3">Go to Target skills</button></div>`;
  ensureCrit(g); const cr = g.crit; const opt = syncCrit(g);
  const it0 = pw.byId[g.targets[0]]; const opts = measureOpts(pw, it0); const sk0 = skillOf(pw, it0); const ctx = [...new Set([...(sk0 ? sk0.act : []), ...SCALE_CONTEXTS[pw.idx]])];
  const givs = givenItems(g); const whats = sk0 && sk0.w.length ? sk0.w : GENERIC_WHAT;
  S.live = () => { const el = $('#critprev'); if (el) el.innerHTML = critPreview(g); };
  const focusItems = g.targets.map(id => pw.byId[id]).filter(Boolean);
  const focus = `<section class="card focus"><h2>This goal</h2><p class="muted">${esc(pw.title)}. Target skill:</p><ul>${focusItems.map(it => { const s = skillOf(pw, it); return `<li>${esc(s ? cap(skTitle(s)) : stripParen(it.text))}</li>`; }).join('')}</ul></section>`;
  return focus + `<section class="card"><h2>Conditions</h2><p class="muted">Be specific about where the skill occurs and what is provided. These conditions must be present every time progress is measured.</p>
${field('Activity or routine', inp('g.crit.activity', { ph: 'Type an activity or select a suggestion' }), `Suggestions: ${ctx.map(c => `<button type="button" class="chip" data-act="ctx" data-v="${esc(c)}">${esc(c)}</button>`).join(' ')}`)}
<div class="field"><label>Materials and supports</label>
${aacMaterials().length ? `<p class="hint">From the AAC section. Uncheck any that do not apply during this activity.</p><div class="matlist">${aacMaterials().map(m => `<label class="check"><input type="checkbox" data-act="aacmat" data-k="${m.k}" ${(cr.aacOff || {})[m.k] ? '' : 'checked'}><span>${esc(cap(m.t))}</span></label>`).join('')}</div>` : ''}
${givs.length ? `<p class="hint">Access and language input. Check any that will be in place every time progress is measured.</p><div class="matlist">${givs.map(m => `<label class="check"><input type="checkbox" data-act="givchk" data-k="${m.k}" ${m.chk ? 'checked' : ''}><span>${esc(cap(m.t))}</span></label>`).join('')}</div>` : ''}
${inp('g.crit.materials', { ph: aacMaterials().length ? 'Other materials, such as familiar books' : 'Example: familiar books and a core vocabulary communication page' })}
<p class="hint">Name the materials, AAC system, or access method that will be provided each time. Do not write "accommodations listed on the accommodations page."</p></div>
</section>
<section class="card"><h2>Measure and mastery</h2>
<div class="field"><label>How will progress be measured?</label><div class="moptlist" role="radiogroup">${opts.map((o, ix) => `<button type="button" role="radio" aria-checked="${cr.mo === ix || (cr.mo >= opts.length && ix === 0)}" class="mopt ${(cr.mo === ix || (cr.mo >= opts.length && ix === 0)) ? 'on' : ''}" data-act="mopt" data-v="${ix}"><b>${esc(optName(o))}</b><span>${esc(optHint(o))}</span>${sk0 && sk0.dm === ix ? '<em class="sugg">Suggested for this skill</em>' : ''}</button>`).join('')}</div></div>
<div class="field"><label for="whatc">What counts</label><textarea id="whatc" data-bind="g.crit.what" rows="3" placeholder="Describe what the student does that you will count, so every partner scores it the same way.">${esc(cr.what)}</textarea>
<div class="rowb" style="margin-top:6px"><select id="whatx" data-act="whatx" aria-label="Insert an example"><option value="">Insert an example...</option>${whats.map(w => `<option value="${esc(w)}">${esc(w.length > 90 ? w.slice(0, 88) + '...' : w)}</option>`).join('')}</select></div>
<p class="hint">Define it in your own words. The definition prints at the top of the data sheet.</p></div>
${opt.pt ? field(opt.pl || 'Parameter', inp('g.crit.pv', { type: 'number', num: true, min: 1, max: 99 }), `Appears in the goal as: ${esc(cr.ptxt)}.`) : ''}
<div class="grid3">
${field(cr.kind === 'c' ? 'Baseline occurrences' : cr.kind === 'd' ? 'Baseline duration' : 'Baseline percent', inp('g.crit.baseNum', { type: 'number', num: true, min: 0, max: 100, step: 1 }), 'From probe or session data, using the same conditions as the goal.')}
${cr.kind === 'c' ? field('Occurrences required', inp('g.crit.count', { type: 'number', num: true, min: 1, max: 100 }), 'Count of ' + esc(cr.u) + (cr.ptxt ? ' ' + esc(cr.ptxt) : '') + '.') + field('Counted per', sel('g.crit.per', [['session', 'session'], ['day', 'school day']])) : ''}
${cr.kind === 'c' && cr.per === 'session' ? field('Session length (minutes)', inp('g.crit.sessMin', { type: 'number', num: true, min: 1, max: 120 }), 'Appears as: per ' + esc(perText(cr)) + '. The activity comes from Conditions above.') : ''}
${cr.kind === 'p' ? field('Target percent', inp('g.crit.pct', { type: 'number', num: true, min: 10, max: 100, step: 5 }), 'Set from expected growth over baseline, not a passing rate such as 70%.') + field('Opportunities per session', inp('g.crit.trials', { type: 'number', num: true, min: 1, max: 10 }), 'The data sheet prints this many trial boxes (up to 10).') : ''}
${cr.kind === 'd' ? field('Target duration', inp('g.crit.dur', { type: 'number', num: true, min: 1, max: 120 }), 'Longest continuous stretch.') + field('Unit', sel('g.crit.durUnit', [['minutes', 'minutes'], ['seconds', 'seconds']])) : ''}
${cr.kind === 'i' ? field('Target percent of intervals', inp('g.crit.pct', { type: 'number', num: true, min: 10, max: 100, step: 5 })) + field('Interval length (seconds)', inp('g.crit.intLen', { type: 'number', num: true, min: 5, max: 60 })) + field('Observation length (minutes)', inp('g.crit.intMin', { type: 'number', num: true, min: 1, max: 30 }), 'The data sheet prints one box per interval (up to 12).') : ''}
${field('Sessions meeting criterion', `<div class="pair">${inp('g.crit.k', { type: 'number', num: true, min: 1, max: 10 })}<span>of</span>${inp('g.crit.m', { type: 'number', num: true, min: 1, max: 12 })}</div>`, cr.kind === 'c' && cr.per === 'day' ? 'Consecutive data-collection days.' : 'Consecutive data-collection sessions.')}
</div>
<div class="grid2">
${field('Support level at mastery', sel('g.crit.cueEnd', [['I', 'Independent (no cue beyond an expectant wait)'], ['G', 'Gesture cue or less'], ['V', 'Verbal cue or less']]), 'Objectives step down from the baseline support to this level.')}
${field('Familiarity at mastery', sel('g.crit.fam', Object.entries({ fam: 'Familiar activities and partners', ut: 'Familiar and new activities', up: 'Familiar and new partners', both: 'New activities and new partners' })), 'Adds a generalization step to the objectives.')}
</div>
<div class="field"><label class="check" for="modeson"><input id="modeson" type="checkbox" data-bind="g.crit.modesOn" ${modesOn(g) ? 'checked' : ''}><span>Name multimodal communication in the conditions</span></label><p class="hint">Adds a phrase such as "using ${esc(modesPhrase(((screenInfo(g, pw).targetLevel) || {}).code))}" so any form the student uses counts. Left out when a target skill names one specific form.</p></div>
${true ? `<div class="field">${chk('g.crit.vcEvidence', 'Also require the Project VC evidence standard')}<p class="hint">At least 3 pieces of evidence from 3 separate learning events, across multiple days and contexts. This is what moves the student to the next level.</p></div>` : ''}
</section>
<section class="card"><h2>Data collection</h2>
<div class="field"><label>Methods</label><div class="checks">${METHODS.map(m => chk('g.crit.methods.' + m[0], esc(m[1]))).join('')}</div></div>
<div class="grid2">
${field('Data collection frequency', sel('g.crit.freq', Object.entries(FREQ)))}
${field('Baseline date', inp('g.crit.baseDate', { type: 'date' }))}
</div>
${field('Baseline notes', inp('g.crit.baseVal', { type: 'textarea', rows: 2, ph: 'Example: 3 observations during classroom routines with verbal cues' }), 'Optional. Describe how the baseline was collected. Used in the PLAAFP and on the data sheet.')}
<div class="field">${S.student.alt ? '<p class="note info">Objectives are required because this student takes an alternate assessment. At least two are generated for each target skill.</p>' : chk('g.crit.objectives', 'Generate short-term objectives and benchmarks (at least two per target skill)')}</div>
</section>
<section class="card"><h2>Criteria preview</h2><div id="critprev">${critPreview(g)}</div></section>`;
}
function critPreview(g) {
  const d = deriveGoal(g); if (!d) return '';
  return `<p class="goalbox">${esc(g.goalOverride ?? d.goalAuto)}</p><p class="hint">Edit the final wording on the next step.</p>`;
}

/* ---- Step 4: goal and TEKS ---- */
function autosizeAll() { document.querySelectorAll('textarea').forEach(autosize); }
function autosize(el) { el.style.height = 'auto'; el.style.height = Math.min(el.scrollHeight + 2, 900) + 'px'; }
function viewGoal() {
  const g = G(); const pw = getPW(g);
  if (!pw || !g.targets.length) return `<div class="note info">Select a target skill first. <button type="button" class="btn sm" data-act="step" data-v="3">Go to Target skills</button></div>`;
  ensureCrit(g); ensureTeksDefaults(g);
  S.live = null;
  const d = deriveGoal(g); const checks = goalChecks(g, d); const objs = objectiveTexts(g, d);
  const ck = checks.map(c => `<li class="${c.ok ? 'ok' : 'warnc'}"><b>${c.n}</b><span>${c.ok ? (c.note || 'Complete') : esc(c.fix)}</span></li>`).join('');
  const teksHTML = d.teks.map(t => {
    const depth = S.ui.prereqDepth;
    const entry = e => `<label class="tk"><input type="checkbox" data-act="teks" data-code="${esc(e.c)}" ${g.teksSel[e.c] ? 'checked' : ''}><span><span class="code">${esc(e.c)}</span> ${esc(e.t)}</span></label>`;
    const enrolledH = t.enrolled.length ? t.enrolled.map(entry).join('') : `<p class="muted">No ${esc(gradeShort(S.student.grade))} TEKS in this thread. This skill is typically introduced in earlier grades.</p>`;
    const pre = t.prereq.slice(0, depth).map(p => `<h5>${esc(gradeLabel(p.g))}</h5>${p.list.map(entry).join('')}`).join('');
    const anchors = t.anchors.map(entry).join('');
    return `<div class="tthread"><h4>${esc(t.th.label)}<small>${esc(t.th.strand)}</small></h4>
<h5>${S.student.grade === 'PK' ? 'Prekindergarten guidelines' : 'Enrolled grade: ' + esc(gradeLabel(S.student.grade))}</h5>${enrolledH}
${pre ? `<h5 class="sect">Prerequisites</h5>${pre}` : ''}
${anchors ? `<h5 class="sect">${S.student.grade === 'PK' ? 'Infant, toddler, and three-year-old guidelines' : 'Prekindergarten and early learning guidelines'}</h5>${anchors}` : ''}</div>`;
  }).join('');
  const maxPre = Math.max(0, ...d.teks.map(t => t.prereq.length));
  const objHTML = objs.length ? objs.map((o, k) => `<div class="objrow"><label for="ob${k}">Objective ${k + 1}</label><textarea id="ob${k}" data-obj="${k}" rows="3">${esc(o)}</textarea></div>`).join('') : `<p class="muted">${g.crit.objectives ? 'No objectives generated.' : 'Short-term objectives are turned off on the Criteria step.'}</p>`;
  return `<section class="card"><div class="rowb"><h2>Annual goal</h2><div class="btnrow"><button type="button" class="btn sm" data-act="copy" data-v="goal">Copy goal</button>${g.goalOverride != null ? '<button type="button" class="btn sm" data-act="resetgoal">Reset to generated text</button>' : ''}</div></div>
<textarea id="goaltxt" class="big" data-bind="g.goalOverride" rows="5">${esc(d.goal)}</textarea>
<p class="hint">The text updates when you change the criteria, until you edit it here.</p>
<div class="comp"><div><h4>Timeframe</h4><p>${esc(d.comp.timeframe)}</p></div><div><h4>Conditions</h4><p>${esc(d.comp.conditions)}</p></div><div><h4>Behavior</h4><p>${esc(d.comp.behavior)}</p></div><div><h4>Criterion</h4><p>${esc(d.comp.criterion)}</p></div></div>
<p class="hint">These are the four components required in a measurable annual goal (19 TAC §89.1055(d)). The checks below also cover the SMART elements.</p>
<ul class="smart">${ck}</ul></section>
<section class="card"><div class="rowb"><h2>Short-term objectives and benchmarks</h2>${g.objOverride ? '<button type="button" class="btn sm" data-act="resetobj">Reset to generated text</button>' : ''}</div>
<p class="muted">Each objective has its own timeframe, conditions, behavior, and criterion. Dates are distinct, and each objective differs from the others in its conditions or criterion. Objectives are steps toward the goal and are not the criterion for mastering it.${S.student.alt ? ' They are required for this student.' : ''}</p>${objHTML}</section>
<section class="card"><div class="rowb"><h2>TEKS alignment</h2>${maxPre > S.ui.prereqDepth || S.ui.prereqDepth > 2 ? `<button type="button" class="btn sm" data-act="depth">${S.ui.prereqDepth > 2 ? 'Show fewer prerequisite grades' : 'Show all prerequisite grades'}</button>` : ''}</div>
<div class="note info"><b>Draft crosswalk.</b> The links from the screened skills to TEKS are suggestions prepared for this tool. Confirm each against the current TEKS and the student's present levels before adding it to the IEP.</div>
${teksHTML || '<p class="muted">No TEKS threads are linked to the selected skills.</p>'}</section>
<section class="card"><div class="rowb"><h2>Standards-based alignment statement</h2>${g.alignOverride != null ? '<button type="button" class="btn sm" data-act="resetalign">Reset to generated text</button>' : ''}</div>
<textarea id="aligntxt" data-bind="g.alignOverride" rows="4">${esc(alignText(g, d))}</textarea></section>`;
}

/* ---- Step 5: PLAAFP ---- */
function viewPlaafp() {
  const hasGoals = S.goals.some(g => g.src && g.targets.length);
  S.live = () => { const el = $('#plaafpprev'); if (el) el.innerHTML = plaafpHTML(plaafpModel()); };
  const f = (label, path, hint, rows) => field(label, inp(path, { type: 'textarea', rows: rows || 3 }), hint);
  return `<section class="card"><h2>PLAAFP draft</h2>
<p class="muted">Follows the TEA standards-based IEP essential elements. Baseline data, strengths, and enrolled-grade expectations fill in from your screening. Add the sections the screening cannot supply.</p>
${hasGoals ? '' : '<div class="note info">No screening data yet. The baseline section fills in after you complete the Screen and Target skills steps.</div>'}
<div class="plaafp-grid"><div>
${f('Impact of the disability on involvement and progress in the enrolled-grade curriculum', 'plaafp.impact', 'Describe the disability characteristics that are unique to the student, any related services needs, and how they affect involvement and progress in the enrolled-grade curriculum.', 4)}
${f('Additional grade-level expectations', 'plaafp.expect', 'Optional. The draft already summarizes expectations in one sentence from the selected TEKS. Add one more sentence if needed. TEA guidance is to summarize expectations and not list standards in the PLAAFP.', 2)}
${f('Specific examples of the impact', 'plaafp.examples', 'One or two concrete examples from academics, social interaction, or behavior.')}
${f('Additional baseline notes', 'plaafp.baselineNote', 'Optional. Functional skills, behavior, or other baseline data in the area of need.', 2)}
${f('Additional strengths', 'plaafp.strengthsExtra', 'Academic and non-academic strengths, including functional areas. Screened skills are added automatically.', 2)}
${f('Progress over the past year', 'plaafp.progress', 'Data on progress in academic or functional skills. Explain limited progress if applicable.')}
${f('Accommodations, services, and supports, and their effectiveness', 'plaafp.services', 'Include with and without information that supports each accommodation. List AAC and other assistive technology here as supplementary aids and services so they match the assistive technology sections.', 4)}
${f('Comparison to enrolled-grade peers', 'plaafp.peers', 'Benchmark or screener scores compared with enrolled-grade peers, or a description of peer performance.')}
<h3 style="margin-top:14px">Sources of current data</h3>
${f('Informal', 'plaafp.informal', 'Parent, student, and teacher input; grades; attendance; discipline.', 2)}
${f('Curriculum-based', 'plaafp.cbm', 'Project VC scales are listed automatically. Add intervention progress monitoring or other CBMs.', 2)}
${f('Criterion-referenced', 'plaafp.crit', 'Universal screeners, district benchmarks, state assessments.', 2)}
</div><div class="prev"><div class="rowb"><h3>Preview</h3><button type="button" class="btn sm" data-act="copy" data-v="plaafp">Copy PLAAFP</button></div><div id="plaafpprev" class="doc">${plaafpHTML(plaafpModel())}</div></div></div>
</section>`;
}

/* ---- Step 6: export ---- */
function viewExport() {
  S.live = null;
  const gi = Math.min(S.ui.sheetGoal, S.goals.length - 1); const g = S.goals[gi];
  const ready = S.goals.filter(x => x.src && x.targets.length).length;
  const can = S.ui.canDownload;
  const dlBtn = (act, label) => can ? `<button type="button" class="btn pri" data-act="${act}">${label}</button>` : '';
  return `<section class="card"><h2>Print and export</h2>
<p class="muted">${ready} of ${S.goals.length} goal${S.goals.length > 1 ? 's are' : ' is'} ready. Nothing is stored here, so download or copy what you need before closing the page.</p>
<div class="btnrow wrap">${dlBtn('save-sheets', 'Download data sheets (.html)')}${dlBtn('save-draft', 'Download IEP draft (.html)')}${dlBtn('save-txt', 'Download text (.txt)')}<button type="button" class="btn" data-act="copy" data-v="all">Copy everything</button><button type="button" class="btn" data-act="copy" data-v="goals">Copy goals</button><button type="button" class="btn" data-act="copy" data-v="plaafp">Copy PLAAFP</button></div>
${can === false ? '<p class="hint">File downloads are not available in this view. Use the copy buttons, or open the page in the Claude app or browser.</p>' : ''}
<p class="hint">To print, open the downloaded file in a browser and choose Print. Data sheets are laid out for landscape letter paper, and the IEP draft for portrait.</p>
${S.ui.fallback ? `<div class="field"><label for="fb">Copy manually (select all, then copy)</label><textarea id="fb" rows="8" readonly>${esc(S.ui.fallback)}</textarea></div>` : ''}
</section>
<section class="card"><h2>Data sheet preview</h2>${g && g.src && g.targets.length ? `<div class="paper"><div class="ds">${sheetHTML(g, gi)}</div></div>` : '<p class="muted">Complete the goal steps to preview its data sheet.</p>'}</section>`;
}

/* ---- Layout ---- */
function navHTML() {
  const back = S.step > 0 ? `<button type="button" class="btn" data-act="step" data-v="${S.step - 1}">Back</button>` : '<span></span>';
  const next = S.step < STEPS.length - 1 ? `<button type="button" class="btn pri" data-act="step" data-v="${S.step + 1}">Next: ${STEPS[S.step + 1]}</button>` : '';
  return back + next;
}
function creditsPanel() {
  return `<details data-det="credits" ${S.ui.det.credits ? 'open' : ''}><summary>Sources and credit</summary>${CREDITS.map(c => `<p><b>${esc(c[0])}.</b> ${esc(c[1])}</p>`).join('')}<p>${esc(DISCLAIMER)}</p></details>`;
}
function render() {
  const y = window.scrollY; fid = 0;
  const views = [viewStudent, viewComm, viewScreen, viewTargets, viewCriteria, viewGoal, viewPlaafp, viewExport];
  $('#stepper').innerHTML = stepperHTML();
  $('#gtabs').innerHTML = goalTabsHTML();
  $('#view').innerHTML = views[S.step]();
  $('#nav').innerHTML = navHTML();
  $('#credits').innerHTML = creditsPanel();
  document.querySelectorAll('#view textarea:not(.big)').forEach(autosize);
  const bg = document.getElementById('goaltxt'); if (bg) autosize(bg);
  window.scrollTo(0, y);
}
