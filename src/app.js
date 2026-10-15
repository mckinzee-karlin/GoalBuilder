/* ===== Events and actions ===== */
let toastTimer;
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 3200);
}
function setBound(path, el) {
  const [o, k] = resolve(path); let v;
  if (el.type === 'checkbox') v = el.checked; else v = el.value;
  if (el.dataset.type === 'num') { if (k === 'baseNum' && v === '') v = null; else { v = v === '' ? 0 : Number(v); if (isNaN(v)) v = 0; } }
  if (k === 'startOverride' && v === '') v = null;
  if ((k === 'goalOverride' || k === 'alignOverride') && String(v).trim() === '') v = null;
  if (k === 'report') v = Number(v);
  o[k] = v;
}
document.addEventListener('input', e => {
  const el = e.target;
  if (el.dataset.obj !== undefined) {
    const g = G(); const d = deriveGoal(g);
    if (!g.objOverride || g.objOverride.length !== d.objectives.length) g.objOverride = d.objectives.map(o => o.text);
    g.objOverride[+el.dataset.obj] = el.value; autosize(el); return;
  }
  if (!el.dataset.bind || el.type === 'checkbox' || el.tagName === 'SELECT') return;
  setBound(el.dataset.bind, el);
  if (el.tagName === 'TEXTAREA') autosize(el);
  if (S.live) S.live();
});
document.addEventListener('change', e => {
  const el = e.target;
  if (el.dataset.act === 'tgt') { const g = G(); g.targets = [el.dataset.id]; resetMeasure(g); g.goalOverride = null; g.objOverride = null; g.alignOverride = null; render(); return; }
  if (el.dataset.act === 'exsel') { const r = el.dataset.r; if (el.value === 'own') S.comm.own[r] = true; else { S.comm.own[r] = false; S.comm.ex[r] = el.value; } render(); return; }
  if (el.dataset.act === 'aacneed') { const ar = el.dataset.a; S.aac.need[ar] = el.dataset.v === 'need'; if (!S.aac.need[ar]) AAC_ACCESS.find(x => x.id === ar).items.forEach(it => { S.aac.acc[ar + '_' + it[0]] = false; }); G().goalOverride = null; render(); return; }
  if (el.dataset.act === 'aacmat') { const g = G(); g.crit.aacOff = g.crit.aacOff || {}; g.crit.aacOff[el.dataset.k] = !el.checked; g.goalOverride = null; g.objOverride = null; render(); return; }
  if (el.dataset.act === 'givchk') { const g = G(); g.crit.giv = g.crit.giv || {}; g.crit.giv[el.dataset.k] = el.checked; g.goalOverride = null; g.objOverride = null; render(); return; }
  if (el.dataset.act === 'whatx') { const g = G(); if (el.value) { const w = g.crit.what.trim(); g.crit.what = w ? w + ' ' + el.value : el.value; } render(); return; }
  if (el.dataset.act === 'teks') { const g = G(); g.teksSel[el.dataset.code] = el.checked; g.alignOverride = null; render(); return; }
  if (!el.dataset.bind) return;
  if (el.tagName === 'TEXTAREA' || (el.tagName === 'INPUT' && el.type !== 'checkbox')) return;
  setBound(el.dataset.bind, el);
  const tm = /^tech\.(cur|com)\.fl\.(\w+)$/.exec(el.dataset.bind);
  if (tm && el.checked) { const fl = S.tech[tm[1]].fl; if (tm[2] === 'none') Object.keys(fl).forEach(k => { if (k !== 'none') fl[k] = false; }); else fl.none = false; }
  if (el.dataset.bind === 'student.grade') S.goals.forEach(g => { g.alignOverride = null; });
  if (el.dataset.bind === 'g.startOverride') { G().tab = null; }
  render();
});
document.addEventListener('toggle', e => { const el = e.target; if (el.tagName === 'DETAILS' && el.dataset.det) S.ui.det[el.dataset.det] = el.open; }, true);
document.addEventListener('click', e => {
  const b = e.target.closest('button[data-act]'); if (!b) return;
  const act = b.dataset.act, v = b.dataset.v; const g = G();
  switch (act) {
    case 'step': S.step = +v; if (S.step === 7) S.ui.sheetGoal = S.active; render(); window.scrollTo(0, 0); return;
    case 'cell': { const row = S.comm.grid[b.dataset.r]; const f = b.dataset.f; row[f] = row[f] ? 0 : 1; if (row[f]) S.comm.no[b.dataset.r] = false; g.goalOverride = null; g.objOverride = null; break; }
    case 'notobs': { const r = b.dataset.r; S.comm.no[r] = !S.comm.no[r]; if (S.comm.no[r]) S.comm.grid[r] = {}; g.goalOverride = null; g.objOverride = null; break; }
    case 'aacf': { const id = b.dataset.id; S.aac.feat[id] = S.aac.feat[id] === v ? '' : v; break; }
    case 'pick': { g.src = v; resetMeasure(g); g.crit.methods = { obs: true, tracker: false, work: false, media: false, aac: false }; g.critInit = false; g.plc = {}; g.ans = {}; g.targets = []; g.cueAns = {}; g.tab = null; g.startOverride = null; g.goalOverride = g.objOverride = g.alignOverride = null; g.teksSel = {}; g.teksSeen = {}; break; }
    case 'chsrc': g.src = null; break;
    case 'plc': { const q = b.dataset.q; g.plc[q] = g.plc[q] === v ? undefined : v; g.tab = null; clearDerived(g); break; }
    case 'ans': { const id = b.dataset.id; g.ans[id] = g.ans[id] === v ? undefined : v; clearDerived(g); break; }
    case 'tab': g.tab = v; break;
    case 'cue': { const id = b.dataset.id, c = b.dataset.c; const ca = g.cueAns[id] || (g.cueAns[id] = {}); ca[c] = ca[c] === v ? undefined : v; clearDerived(g); break; }
    case 'mopt': { const pw = getPW(g); const it = pw.byId[g.targets[0]]; const o = measureOpts(pw, it)[+v]; g.crit.mo = +v; g.crit.pv = o.pd || null; clearDerived(g); break; }
    case 'tgtalt': { g.targets = [b.dataset.id]; resetMeasure(g); g.goalOverride = g.objOverride = g.alignOverride = null; break; }
    case 'ctx': { const a = g.crit.activity.trim(); g.crit.activity = a ? (a.toLowerCase().includes(v.toLowerCase()) ? a : a + ' and ' + v) : v; clearDerived(g); break; }
    case 'setgoal': if (S.step === 7) S.ui.sheetGoal = +v; else { S.active = +v; S.goals.forEach(x => x.confirmDel = false); } break;
    case 'addgoal': S.goals.push(newGoal()); S.active = S.goals.length - 1; S.step = 2; break;
    case 'delgoal': if (!g.confirmDel) { g.confirmDel = true; } else { S.goals.splice(S.active, 1); S.active = Math.max(0, S.active - 1); S.ui.sheetGoal = 0; } break;
    case 'delcancel': g.confirmDel = false; break;
    case 'resetgoal': g.goalOverride = null; break;
    case 'resetobj': g.objOverride = null; break;
    case 'resetalign': g.alignOverride = null; break;
    case 'depth': S.ui.prereqDepth = S.ui.prereqDepth > 2 ? 2 : 99; break;
    case 'copy': copy(v); return;
    case 'save-sheets': saveFile('goal-data-sheets.html', sheetsDoc()); return;
    case 'save-draft': saveFile('iep-draft.html', draftDoc()); return;
    case 'save-txt': saveFile('iep-draft.txt', fullText()); return;
  }
  render();
});
function clearDerived(g) { g.goalOverride = null; g.objOverride = null; }

function textFor(kind) {
  if (kind === 'goal') { const b = goalBlocks().find(x => x.i === S.active); return b ? goalText(b) : ''; }
  if (kind === 'goals') return goalBlocks().map(goalText).join('\n\n');
  if (kind === 'plaafp') return plaafpText(plaafpModel());
  return fullText();
}
async function copy(kind) {
  const text = textFor(kind);
  if (!text) { toast('Nothing to copy yet. Complete the earlier steps first.'); return; }
  try { await navigator.clipboard.writeText(text); toast('Copied to the clipboard.'); S.ui.fallback = ''; }
  catch (err) { S.ui.fallback = text; toast('Copy was blocked. The text is shown below to copy by hand.'); if (S.step === 7) { render(); const fb = $('#fb'); if (fb) { fb.focus(); fb.select(); } } else { S.step = 7; S.ui.sheetGoal = S.active; render(); const fb = $('#fb'); if (fb) { fb.focus(); fb.select(); } } }
}
async function saveFile(filename, data) {
  try {
    const dl = await getDL(); if (!dl) { toast('File downloads are not available in this view.'); return; }
    await dl.save({ filename, data }); toast('Saved ' + filename);
  } catch (err) {
    const c = err && err.code;
    if (c === 'declined') toast('Download canceled.');
    else if (c === 'rate_limited') toast('A download prompt is already open. Wait a moment and try again.');
    else toast('The download could not be completed.');
  }
}
let dlPromise;
function getDL() { if (!dlPromise) dlPromise = (window.claude && window.claude.use) ? Promise.resolve(window.claude.use('downloads')).catch(() => null) : Promise.resolve(null); return dlPromise; }
getDL().then(dl => { S.ui.canDownload = !!dl; if (S.step === 7) render(); });

/* ===== Init ===== */
(function init() {
  const st = document.createElement('style'); st.textContent = DS_CSS + '.paper{overflow-x:auto;background:#dfe5e7;padding:10px;border-radius:6px}.paper .ds{min-width:880px}.doc{font-size:13px}'; document.head.appendChild(st);
  render();
})();
