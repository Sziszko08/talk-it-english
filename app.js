/* Talk It! AI conversation practice for Hungarian learners of American English. Vanilla JS, no backend. */
(() => {
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const main = $('#main');
const LSP = 'talkit-progress-v1', LSS = 'talkit-settings-v1';
const today = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const load = (k, d) => { try { return Object.assign(d, JSON.parse(localStorage.getItem(k)) || {}); } catch { return d; } };
const PRESETS = {
  xai: { base: 'https://api.x.ai/v1', model: 'grok-4.3', models: ['grok-4.3', 'grok-4.20-0309-non-reasoning', 'grok-4.7', 'grok-4-latest'] },
  openai: { base: 'https://api.openai.com/v1', model: 'gpt-4o-mini', models: ['gpt-4o-mini', 'gpt-4o', 'gpt-4.1-mini'] },
  custom: { base: '', model: '', models: [] }
};
let S = load(LSS, { provider: 'xai', base: PRESETS.xai.base, model: PRESETS.xai.model, key: '', voice: '', rate: 1, handsFree: false, autoHu: false, theme: '', level: 'A1' });
let P = load(LSP, { sessions: [], streak: 0, lastDay: null, seconds: 0, words: 0, vocab: {} });
const saveS = () => localStorage.setItem(LSS, JSON.stringify(S));
const saveP = () => { try { localStorage.setItem(LSP, JSON.stringify(P)); } catch {} };
const hasKey = () => !!(S.key && S.base && S.model);
const LEVELS = ['A1', 'A2', 'B1'];
const LEVEL_HU = { A1: 'Kezdő', A2: 'Alapfok', B1: 'Középfok' };
const UNLOCK = 3; // sessions recommended before next level (soft)

function toast(t) { const el = $('#toast'); el.textContent = t; el.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove('show'), 3200); }
function markActive() {
  const d = today(); if (P.lastDay === d) return;
  const y = new Date(Date.now() - 864e5); const ys = y.getFullYear() + '-' + String(y.getMonth() + 1).padStart(2, '0') + '-' + String(y.getDate()).padStart(2, '0');
  P.streak = P.lastDay === ys ? P.streak + 1 : 1; P.lastDay = d; saveP(); updTop();
}
function updTop() {
  $('#streak').textContent = '🔥 ' + (P.streak || 0);
  const m = $('#modePill'); m.textContent = hasKey() ? 'AI' : 'Demo'; m.classList.toggle('ai', hasKey());
  m.title = hasKey() ? 'AI mód: ' + S.model : 'Demo mód: nincs API kulcs';
}

// ---------- speech synthesis (voice picker from Say It!) ----------
const synth = window.speechSynthesis;
let voices = [];
function loadVoices() {
  if (!synth) return;
  const all = synth.getVoices() || [];
  voices = all.filter(v => /en[-_]US/i.test(v.lang));
  if (!voices.length) voices = all.filter(v => /^en/i.test(v.lang));
  const rank = v => (/natural|neural|premium|enhanced|google/i.test(v.name) ? 0 : 1) + (/samantha|aria|jenny|guy|ava|allison/i.test(v.name) ? 0 : 0.5) + (/en[-_]US/i.test(v.lang) ? 0 : 2);
  voices.sort((a, b) => rank(a) - rank(b));
  const sel = $('#voiceSel');
  sel.innerHTML = voices.length ? voices.map(v => `<option value="${esc(v.name)}">${esc(v.name)} (${esc(v.lang)})</option>`).join('') : '<option value="">Nincs angol hang telepítve</option>';
  if (S.voice && voices.some(v => v.name === S.voice)) sel.value = S.voice;
}
if (synth) { loadVoices(); try { synth.addEventListener ? synth.addEventListener('voiceschanged', loadVoices) : (synth.onvoiceschanged = loadVoices); } catch { synth.onvoiceschanged = loadVoices; } }
let speaking = false;
function speak(text, rate) {
  return new Promise(res => {
    if (!synth || !text) return res();
    try { synth.cancel(); } catch {}
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US'; u.rate = rate || +S.rate || 1;
    const v = voices.find(v => v.name === S.voice) || voices[0]; if (v) u.voice = v;
    let done = false; const fin = () => { if (done) return; done = true; speaking = false; setStatus(''); res(); };
    u.onend = u.onerror = fin;
    speaking = true; setStatus('🔊 A tutor beszél... (koppints a 🎤-ra a megszakításhoz)');
    try { synth.speak(u); } catch { return fin(); }
    setTimeout(fin, 2500 + text.length * 110 / (u.rate || 1)); // safety for engines that never fire onend
  });
}
const stopSpeak = () => { try { synth && synth.cancel(); } catch {} speaking = false; };

// ---------- speech recognition ----------
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
let activeRec = null;
function listen(onInterim) {
  return new Promise((res, rej) => {
    if (!SR) return rej(new Error('unsupported'));
    if (activeRec) try { activeRec.abort(); } catch {}
    const r = new SR(); activeRec = r;
    r.lang = 'en-US'; r.maxAlternatives = 3; r.interimResults = true; r.continuous = false;
    let finalT = '', alts = [], conf = null, t0 = Date.now(), settled = false;
    r.onresult = e => {
      let interim = '';
      for (let i = e.resultIndex || 0; i < e.results.length; i++) {
        const resI = e.results[i];
        if (resI.isFinal || resI.isFinal === undefined) {
          finalT += (finalT ? ' ' : '') + resI[0].transcript.trim();
          if (typeof resI[0].confidence === 'number' && resI[0].confidence > 0) conf = resI[0].confidence;
          alts = []; for (let j = 0; j < resI.length; j++) alts.push(resI[j].transcript);
        } else interim += resI[0].transcript;
      }
      onInterim && onInterim(finalT + ' ' + interim);
    };
    r.onerror = e => { if (settled) return; settled = true; activeRec = null; rej(new Error(e.error || 'error')); };
    r.onend = () => { activeRec = null; if (settled) return; settled = true; if (finalT.trim()) res({ text: finalT.trim(), alts: alts.length ? alts : [finalT], conf, secs: (Date.now() - t0) / 1000 }); else rej(new Error('no-speech')); };
    try { r.start(); } catch (e) { settled = true; rej(e); }
  });
}
const srErr = e => ({ 'not-allowed': 'A mikrofon hozzáférés tiltva. Engedélyezd a böngészőben (https vagy localhost kell).', 'service-not-allowed': 'A beszédfelismerés nem engedélyezett ezen az oldalon (https kell).', 'no-speech': 'Nem hallottam semmit. Próbáld újra, vagy írd be a választ.', 'network': 'A beszédfelismeréshez internet kell.', 'audio-capture': 'Nem található mikrofon.', 'aborted': 'Leállítva.', 'unsupported': 'Ez a böngésző nem támogatja a beszédfelismerést. Használj Chrome-ot vagy Edge-et, vagy írd be a választ.' }[e.message] || 'Hiba a felismerésnél: ' + e.message);

// ---------- text scoring (from Say It!) ----------
const CONTR = { "i'm": 'i am', "you're": 'you are', "it's": 'it is', "don't": 'do not', "can't": 'can not', cannot: 'can not', "i'll": 'i will', "i'd": 'i would', "let's": 'let us', "that's": 'that is', "what's": 'what is', "where's": 'where is', "you'll": 'you will' };
const NUMS = { 1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five', 6: 'six', 10: 'ten' };
const norm = s => String(s).toLowerCase().replace(/[’`]/g, "'").split(/\s+/).map(w => w.replace(/[^a-z0-9']/g, '')).filter(Boolean).map(w => CONTR[w] || NUMS[w] || w.replace(/'/g, '')).join(' ').split(' ').filter(Boolean);
function lev(a, b) {
  const m = a.length, n = b.length; if (!m || !n) return m || n;
  let p = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++) { const c = [i]; for (let j = 1; j <= n; j++) c[j] = Math.min(p[j] + 1, c[j - 1] + 1, p[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); p = c; }
  return p[n];
}
function score(target, alts) {
  const tw = norm(target); let best = { score: 0, heard: alts[0] || '', hits: tw.map(() => false), words: tw, target };
  for (const alt of alts) {
    const aw = norm(alt);
    const hits = tw.map(w => aw.some(x => x === w || (w.length > 3 && lev(x, w) <= 1)));
    const wp = hits.filter(Boolean).length / Math.max(tw.length, 1);
    const a = aw.join(' '), t = tw.join(' ');
    const cp = 1 - lev(a, t) / Math.max(a.length, t.length, 1);
    const sc = Math.round(100 * (0.6 * wp + 0.4 * Math.max(0, cp)));
    if (sc > best.score) best = { score: sc, heard: alt, hits, words: tw, target };
  }
  return best;
}

// ---------- LLM ----------
function systemPrompt(sc, lvl) {
  const lc = {
    A1: 'CEFR A1 (absolute beginner). Use VERY short sentences (max 8 words each, max 2 sentences). Only the most common 500 English words. Present simple only. No idioms, no phrasal verbs.',
    A2: 'CEFR A2 (elementary). Short sentences (max 12 words, max 3 sentences). Common everyday words. Present, past simple, "going to" future. Avoid idioms.',
    B1: 'CEFR B1 (intermediate). Natural but clear sentences (max 4 sentences). Everyday vocabulary, some common phrasal verbs and idioms are OK. Varied tenses.'
  }[lvl];
  return `You are a warm, patient American English conversation tutor for a Hungarian learner. Use American English spelling and vocabulary (apartment, cookie, check, subway).
LEVEL: ${lc}
ROLE-PLAY: You play ${sc.role}. Scenario goal: ${sc.goal}
RULES:
- Always stay in the role and the scenario. If the learner goes off topic or writes in Hungarian, gently bring them back in simple English.
- Ask exactly ONE question at a time, and keep the conversation moving.
- The learner's message comes from speech recognition: ignore missing punctuation, capitalization and obvious recognition glitches. Do not correct those.
- Corrections: only real grammar or word-choice mistakes, max 2 per turn, the most important first. If the sentence was fine, return an empty list. Never correct in the "reply"; keep "reply" in character.
- Explanations ("hu", "why_hu", "pronunciation_tip_hu") are in natural Hungarian. Do not use em-dashes.
- suggested_answers: exactly 2 short, level-appropriate English answers the learner could say next.
- new_words: 0-3 useful words or phrases from YOUR reply that may be new for this level, with Hungarian meaning.
- When the scenario goal is complete (usually after 8-12 turns), say a friendly goodbye and set "done": true.
OUTPUT: Respond with ONLY a JSON object, no markdown, no extra text:
{"reply":"English reply in character","hu":"Hungarian translation of reply","corrections":[{"said":"learner's wrong phrase","better":"corrected phrase","why_hu":"short Hungarian explanation"}],"pronunciation_tip_hu":"optional short tip about a word in your reply that is hard for Hungarians, or empty string","suggested_answers":["...","..."],"new_words":[{"en":"...","hu":"..."}],"done":false}`;
}
class LLMError extends Error { constructor(kind, msg) { super(msg); this.kind = kind; } }
async function chat(messages, { timeout = 45000, json = true } = {}) {
  const url = S.base.replace(/\/+$/, '') + '/chat/completions';
  const ctl = new AbortController(); const tm = setTimeout(() => ctl.abort(), timeout);
  let r;
  try {
    r = await fetch(url, { method: 'POST', signal: ctl.signal, headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + S.key }, body: JSON.stringify({ model: S.model, messages, temperature: 0.7, max_tokens: 700, stream: false }) });
  } catch (e) {
    clearTimeout(tm);
    if (e.name === 'AbortError') throw new LLMError('timeout', 'Az AI nem válaszolt időben. Próbáld újra.');
    throw new LLMError('network', 'Nem sikerült elérni az AI szolgáltatót. Ellenőrizd az internetet és a végpont címét. Ha egyéni végpontot használsz, lehet, hogy nem engedi a böngészőből érkező kéréseket (CORS).');
  }
  clearTimeout(tm);
  if (!r.ok) {
    let detail = ''; try { const j = await r.json(); detail = (j.error && (j.error.message || j.error)) || j.message || ''; } catch {}
    detail = String(detail).slice(0, 160);
    if (r.status === 401 || r.status === 403) throw new LLMError('auth', 'Érvénytelen vagy hiányzó API kulcs (' + r.status + '). Ellenőrizd a kulcsot a Beállításokban.');
    if (r.status === 429) throw new LLMError('rate', 'Túl sok kérés vagy elfogyott a keret (429). Várj egy kicsit, vagy nézd meg az egyenleged a szolgáltatónál.');
    if (r.status === 404) throw new LLMError('model', 'A végpont vagy a modell nem található (404). Ellenőrizd a modell nevét. ' + detail);
    if (r.status === 400) throw new LLMError('bad', 'A szolgáltató hibásnak találta a kérést (400). Lehet, hogy rossz a modell neve. ' + detail);
    throw new LLMError('server', 'A szolgáltató hibát jelzett (' + r.status + '). Próbáld újra később.');
  }
  let j; try { j = await r.json(); } catch { throw new LLMError('parse', 'Az AI válasza nem olvasható.'); }
  const content = j?.choices?.[0]?.message?.content;
  const text = Array.isArray(content) ? content.map(c => c.text || '').join('') : content;
  if (!text || !String(text).trim()) throw new LLMError('empty', 'Az AI üres választ adott. Próbáld újra.');
  return String(text);
}
// Robust parse: JSON (maybe fenced / with prose) -> object; else plain text fallback
function parseTutor(text) {
  const out = { reply: '', hu: '', corrections: [], tip: '', sugg: [], words: [], done: false, raw: text, plain: false };
  let t = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '');
  let obj = null;
  try { obj = JSON.parse(t); } catch {
    const a = t.indexOf('{'), b = t.lastIndexOf('}');
    if (a >= 0 && b > a) { try { obj = JSON.parse(t.slice(a, b + 1)); } catch {} }
  }
  if (obj && typeof obj === 'object' && (obj.reply || obj.response || obj.message)) {
    out.reply = String(obj.reply || obj.response || obj.message).trim();
    out.hu = typeof obj.hu === 'string' ? obj.hu : (obj.translation || '');
    out.corrections = (Array.isArray(obj.corrections) ? obj.corrections : []).filter(c => c && (c.better || c.correct)).slice(0, 3)
      .map(c => ({ said: String(c.said || c.original || ''), better: String(c.better || c.correct || ''), why: String(c.why_hu || c.explanation || c.why || '') }))
      .filter(c => norm(c.said).join(' ') !== norm(c.better).join(' '));
    out.tip = typeof (obj.pronunciation_tip_hu ?? obj.pronunciation_tip) === 'string' ? (obj.pronunciation_tip_hu ?? obj.pronunciation_tip) : '';
    out.sugg = (Array.isArray(obj.suggested_answers) ? obj.suggested_answers : []).filter(x => typeof x === 'string' && x.trim()).slice(0, 3);
    out.words = (Array.isArray(obj.new_words) ? obj.new_words : []).filter(w => w && w.en).slice(0, 4).map(w => ({ en: String(w.en), hu: String(w.hu || '') }));
    out.done = obj.done === true;
    return out;
  }
  // plain-text fallback: strip markdown-ish markers and sections
  out.plain = true;
  const lines = t.split('\n');
  const m = t.match(/reply\s*[:\-]\s*(.+)/i);
  out.reply = (m ? m[1] : lines.filter(l => l.trim() && !/^\s*(hu|corrections?|suggested|tip)/i.test(l)).slice(0, 4).join(' ')).replace(/[*#_`]/g, '').replace(/^"|"$/g, '').trim();
  if (!out.reply) out.reply = t.slice(0, 400);
  return out;
}

// ---------- views & navigation ----------
let session = null; // active conversation
function go(view, arg) {
  if (session && view !== 'chat') endListening();
  document.body.classList.toggle('chatting', view === 'chat');
  main.innerHTML = ''; main.style.animation = 'none'; void main.offsetWidth; main.style.animation = '';
  views[view](arg); window.scrollTo(0, 0);
}
const views = {};
const lvlSessions = l => P.sessions.filter(s => s.level === l).length;
const levelOpen = l => { const i = LEVELS.indexOf(l); return i === 0 || lvlSessions(LEVELS[i - 1]) >= UNLOCK; };
const scDone = id => P.sessions.some(s => s.scId === id);

views.home = () => {
  const L = S.level; const list = SCENARIOS[L];
  const totalMin = Math.round(P.seconds / 60);
  main.innerHTML = `
  <div class="hero"><h1>Szia! Beszélgessünk angolul 👋</h1><p>Válassz szituációt, nyomd meg a mikrofont, és beszélj. Az AI tutor egyszerű amerikai angolsággal válaszol, és magyarul magyarázza a hibáidat.</p>
  <div class="row">${hasKey() ? '' : '<button class="btn primary" id="hKey">🔑 AI kulcs beállítása</button>'}<button class="btn" id="hFree">🗨️ Szabad beszélgetés</button><button class="btn" id="hProg">📈 Haladás</button></div></div>
  ${hasKey() ? '' : '<div class="soft-lock">🎭 <b>Demo mód:</b> API kulcs nélkül a ⭐ jelölt szituációk forgatókönyv szerint működnek, és a kiejtésed a várt válaszhoz hasonlítjuk. A teljes, szabad AI beszélgetéshez állíts be kulcsot.</div>'}
  <div class="levels" role="radiogroup" aria-label="Szint">${LEVELS.map(l => `<button role="radio" aria-checked="${l === L}" data-level="${l}" class="${l === L ? 'on' : ''}">${l}<small>${LEVEL_HU[l]}${levelOpen(l) ? '' : ' · javasolt később'}</small></button>`).join('')}</div>
  ${levelOpen(L) ? '' : `<div class="soft-lock">💡 Ezt a szintet akkor ajánljuk, ha már legalább ${UNLOCK} beszélgetést befejeztél a(z) ${LEVELS[LEVELS.indexOf(L) - 1]} szinten (eddig: ${lvlSessions(LEVELS[LEVELS.indexOf(L) - 1])}). Ha bátor vagy, nyugodtan kipróbálhatod!</div>`}
  <section><h2>Szituációk (${L})</h2><div class="grid">${list.map(s => {
    const avail = hasKey() || (s.demo && DEMO[s.id]);
    return `<button class="cat" data-sc="${s.id}" ${avail ? '' : 'aria-disabled="true" style="opacity:.55"'}>${s.demo && DEMO[s.id] && !hasKey() ? '<span class="tag">⭐ Demo</span>' : scDone(s.id) ? '<span class="tag done">✓ Kész</span>' : ''}<div class="ic">${s.ic}</div><b>${esc(s.t)}</b><p>${esc(s.d)}</p></button>`;
  }).join('')}</div></section>
  <div class="stats">
    <div class="stat"><b>${P.sessions.length}</b><small>beszélgetés</small></div>
    <div class="stat"><b>${totalMin}</b><small>perc beszéd</small></div>
    <div class="stat"><b>${P.words}</b><small>kimondott szó</small></div>
    <div class="stat"><b>${Object.keys(P.vocab).length}</b><small>új kifejezés</small></div>
  </div>
  <p class="small muted">🔒 A beszélgetések szövege AI módban a választott szolgáltatóhoz kerül. A kulcsod és a haladásod csak ebben a böngészőben van.</p>`;
  main.querySelectorAll('[data-level]').forEach(b => b.onclick = () => { S.level = b.dataset.level; saveS(); views.home(); });
  main.querySelectorAll('[data-sc]').forEach(b => b.onclick = () => {
    const sc = list.find(x => x.id === b.dataset.sc);
    if (!hasKey() && !(sc.demo && DEMO[sc.id])) { toast('Ehhez a szituációhoz AI kulcs kell. Demo módban a ⭐ jelöltek érhetők el.'); return; }
    startSession(sc);
  });
  $('#hFree').onclick = () => go('free'); $('#hProg').onclick = () => go('progress');
  const hk = $('#hKey'); if (hk) hk.onclick = openSettings;
};
views.free = () => {
  main.innerHTML = `<h1>🗨️ Szabad beszélgetés</h1><p class="muted">Válassz témát, és beszélgess kötetlenül a(z) ${S.level} szintednek megfelelően.</p>
  ${hasKey() ? '' : '<div class="soft-lock">🔑 A szabad beszélgetéshez AI kulcs kell. <button class="btn sm primary" id="fKey">Beállítás</button></div>'}
  <div class="grid">${FREE_TOPICS.map((t, i) => `<button class="cat" data-t="${i}"><div class="ic">${t[0]}</div><b>${esc(t[1])}</b></button>`).join('')}</div>
  <div class="row" style="margin-top:14px"><button class="btn ghost" id="back">← Vissza</button></div>`;
  const fk = $('#fKey'); if (fk) fk.onclick = openSettings;
  $('#back').onclick = () => go('home');
  main.querySelectorAll('[data-t]').forEach(b => b.onclick = () => {
    if (!hasKey()) { openSettings(); return; }
    const t = FREE_TOPICS[+b.dataset.t];
    startSession({ id: 'free-' + b.dataset.t, ic: t[0], t: 'Szabad: ' + t[1], d: '', role: 'a friendly American conversation partner', goal: 'Have a relaxed, natural conversation about ' + t[2] + '. Share small personal opinions too and ask follow-up questions. Never end the conversation by yourself unless the learner says goodbye.', free: true });
  });
};

// ---------- conversation session ----------
function startSession(sc) {
  const demo = !hasKey();
  session = { sc, level: S.level, demo, history: [], msgs: [], corrections: [], words: [], tips: [], userWords: 0, secs: 0, start: Date.now(), node: demo ? 's' : null, busy: false, ended: false, autoListen: S.handsFree, expected: null };
  markActive();
  go('chat');
  if (demo) demoTutor('s'); else aiTurn(null);
}
function setStatus(t) { const s = $('#status'); if (s) s.textContent = t; }
views.chat = () => {
  const sc = session.sc;
  main.innerHTML = `
  <div class="chathead"><button class="icon-btn" id="cBack" aria-label="Vissza">←</button><span class="ic">${sc.ic}</span><div><b>${esc(sc.t)}</b><small>${session.level} · ${session.demo ? 'Demo mód' : 'AI: ' + esc(S.model)}</small></div><span class="sp"></span><button class="btn sm ghost" id="cEnd">✓ Befejezés</button></div>
  <div class="msgs" id="msgs" aria-live="polite"></div>
  <div class="dock">
    <div class="sugg" id="sugg"></div>
    <div class="interim" id="interim"></div>
    <div class="microw">
      <button class="round ${session.autoListen ? 'on' : ''}" id="hf" title="Kihangosított mód (automatikus figyelés)" aria-pressed="${session.autoListen}">🔁</button>
      <button class="mic-big" id="mic" aria-label="Nyomd meg és beszélj">🎤</button>
      <button class="round" id="kb" title="Írás billentyűzettel" aria-label="Szöveges bevitel">⌨️</button>
    </div>
    <div class="status" id="status">${SR ? 'Koppints a mikrofonra, vagy tartsd lenyomva beszéd közben.' : 'A böngésző nem támogatja a beszédfelismerést: írd be a válaszod.'}</div>
    <form class="textrow" id="tform" ${SR ? 'hidden' : ''}><input id="tin" type="text" placeholder="Írd ide angolul..." autocomplete="off" aria-label="Válasz angolul"><button class="btn primary">Küldés</button></form>
  </div>`;
  $('#cBack').onclick = () => { if (session.msgs.some(m => m.who === 'u') && confirm('Befejezed a beszélgetést és megnézed az összegzést?')) finishSession(); else if (!session.msgs.some(m => m.who === 'u')) { endListening(); session = null; go('home'); } };
  $('#cEnd').onclick = () => finishSession();
  $('#kb').onclick = () => { const f = $('#tform'); f.hidden = !f.hidden; if (!f.hidden) $('#tin').focus(); };
  $('#hf').onclick = () => { session.autoListen = !session.autoListen; S.handsFree = session.autoListen; saveS(); $('#hf').classList.toggle('on', session.autoListen); $('#hf').setAttribute('aria-pressed', session.autoListen); toast(session.autoListen ? 'Kihangosított mód bekapcsolva: a tutor után automatikusan figyelek.' : 'Kihangosított mód kikapcsolva.'); };
  $('#tform').onsubmit = e => { e.preventDefault(); const v = $('#tin').value.trim(); if (!v) return; $('#tin').value = ''; userSaid({ text: v, alts: [v], conf: null, secs: 0, typed: true }); };
  bindMic();
  session.msgs.forEach(renderMsg);
};
// push-to-talk: tap toggles; long press (>350ms) = hold to talk, release to stop
function bindMic() {
  const m = $('#mic'); let downAt = 0, holdT = null, holding = false;
  m.addEventListener('pointerdown', e => { if (!SR || session.busy) return; downAt = Date.now(); holding = false; holdT = setTimeout(() => { holding = true; if (!activeRec) startListening(); }, 350); });
  m.addEventListener('pointerup', () => { clearTimeout(holdT); if (holding) { holding = false; activeRec && activeRec.stop(); } });
  m.addEventListener('pointerleave', () => { clearTimeout(holdT); if (holding) { holding = false; activeRec && activeRec.stop(); } });
  m.addEventListener('click', () => {
    if (holding || Date.now() - downAt > 350 && downAt) { downAt = 0; return; }
    downAt = 0;
    if (!SR) { $('#tform').hidden = false; $('#tin').focus(); toast(srErr(new Error('unsupported'))); return; }
    if (session.busy) return;
    if (activeRec) { activeRec.stop(); return; }
    startListening();
  });
}
function micState(st) { const m = $('#mic'); if (!m) return; m.classList.toggle('rec', st === 'rec'); m.classList.toggle('busy', st === 'busy'); m.textContent = st === 'rec' ? '⏹' : st === 'busy' ? '⏳' : '🎤'; m.setAttribute('aria-label', st === 'rec' ? 'Figyelés leállítása' : 'Nyomd meg és beszélj'); }
async function startListening() {
  if (!session || session.ended) return;
  stopSpeak(); micState('rec'); setStatus('🎙️ Figyelek... beszélj angolul (koppints a leállításhoz)');
  const im = $('#interim');
  try {
    const r = await listen(t => { if (im) im.textContent = t; });
    if (im) im.textContent = ''; micState('');
    userSaid(r);
  } catch (e) {
    if (im) im.textContent = ''; micState('');
    if (e.message !== 'aborted') { setStatus(srErr(e)); if (e.message === 'not-allowed' || e.message === 'service-not-allowed') { const f = $('#tform'); if (f) f.hidden = false; session.autoListen = false; } }
    else setStatus('');
  }
}
function endListening() { if (activeRec) try { activeRec.abort(); } catch {} stopSpeak(); }

function addMsg(m) { session.msgs.push(m); renderMsg(m); return m; }
function renderMsg(m) {
  const box = $('#msgs'); if (!box) return;
  const el = document.createElement('div');
  if (m.who === 'sys') { el.className = 'sys' + (m.err ? ' err' : ''); el.innerHTML = esc(m.text) + (m.retry ? ' <button class="btn sm ghost" data-retry>🔁 Újra</button>' : '') + (m.err && m.kind === 'auth' ? ' <button class="btn sm ghost" data-set>⚙️ Beállítások</button>' : ''); }
  else if (m.who === 't') {
    el.className = 'msg t';
    el.innerHTML = `<div class="b" lang="en">${esc(m.text)}</div>
      ${m.hu ? `<div class="huT" lang="hu" ${S.autoHu ? '' : 'hidden'}>🇭🇺 ${esc(m.hu)}</div>` : '<div class="huT" lang="hu" hidden></div>'}
      ${m.tip ? `<div class="ptip">🗣️ ${esc(m.tip)}</div>` : ''}
      <div class="tools"><button data-play>🔊 Meghallgat</button><button data-slow>🐢 Lassan</button><button data-hu>🇭🇺 Mit jelent?</button></div>`;
    el.querySelector('[data-play]').onclick = () => speak(m.text);
    el.querySelector('[data-slow]').onclick = () => speak(m.text, 0.65);
    el.querySelector('[data-hu]').onclick = () => translateMsg(m, el);
  } else {
    el.className = 'msg u';
    const meta = [m.typed ? '⌨️ beírva' : '🎤 kimondva', m.conf != null ? 'felismerés: ' + Math.round(m.conf * 100) + '%' : ''].filter(Boolean).join(' · ');
    el.innerHTML = `<div class="b" lang="en">${esc(m.text)}</div><div class="meta">${meta}</div>${m.demoFb || ''}${(m.corr || []).map(c => `<div class="corr">✏️ <s>${esc(c.said)}</s> → <ins>${esc(c.better)}</ins>${c.why ? `<div>${esc(c.why)}</div>` : ''}</div>`).join('')}
      <div class="tools"><button data-play>🔊</button></div>`;
    el.querySelector('[data-play]').onclick = () => speak(m.text);
  }
  el.querySelectorAll('[data-retry]').forEach(b => b.onclick = () => { el.remove(); session.msgs = session.msgs.filter(x => x !== m); aiTurn(null, true); });
  el.querySelectorAll('[data-set]').forEach(b => b.onclick = openSettings);
  m.el = el; box.appendChild(el); box.scrollTop = box.scrollHeight;
}
function rerenderMsg(m) { if (!m.el) return; const old = m.el; const box = $('#msgs'); renderMsg(m); box.replaceChild(m.el, old); }
async function translateMsg(m, el) {
  const h = el.querySelector('.huT');
  if (m.hu) { h.hidden = !h.hidden; return; }
  if (session.demo || !hasKey()) { h.hidden = false; h.textContent = '🇭🇺 Nincs elérhető fordítás.'; return; }
  h.hidden = false; h.textContent = '🇭🇺 Fordítás...';
  try { const t = await chat([{ role: 'system', content: 'Translate the user text into natural Hungarian. Output only the translation, no em-dashes.' }, { role: 'user', content: m.text }], { timeout: 20000 }); m.hu = t.trim(); h.textContent = '🇭🇺 ' + m.hu; }
  catch (e) { h.textContent = '🇭🇺 ' + e.message; }
}
function showSugg(list, label = 'Ha elakadtál, mondd például:') {
  const s = $('#sugg'); if (!s) return;
  s.innerHTML = list && list.length ? `<span class="lab">${esc(label)}</span>` + list.map(x => `<button data-s="${esc(x)}">${esc(x)}</button>`).join('') : '';
  s.querySelectorAll('[data-s]').forEach(b => b.onclick = () => speak(b.dataset.s));
  s.querySelectorAll('[data-s]').forEach(b => b.title = 'Koppints a meghallgatáshoz, majd mondd ki te is');
}
function typing(on) {
  const box = $('#msgs'); if (!box) return; let t = $('#typing');
  if (on && !t) { t = document.createElement('div'); t.id = 'typing'; t.className = 'msg t'; t.innerHTML = '<div class="b typing" aria-label="A tutor gépel"><i></i><i></i><i></i></div>'; box.appendChild(t); box.scrollTop = box.scrollHeight; }
  if (!on && t) t.remove();
}
async function tutorSpeaks(text) {
  await speak(text);
  if (session && !session.ended && session.autoListen && SR && !session.busy && document.body.classList.contains('chatting')) startListening();
}
function userSaid(r) {
  if (!session || session.ended || session.busy) return;
  const words = norm(r.text).length; session.userWords += words; session.secs += r.secs || 0;
  const m = addMsg({ who: 'u', text: r.text, conf: r.conf, typed: r.typed });
  showSugg([]);
  if (session.demo) demoUser(m, r); else aiTurn(m);
}

// --- AI mode ---
async function aiTurn(userMsg, isRetry) {
  if (userMsg) session.history.push({ role: 'user', content: userMsg.text });
  const msgs = [{ role: 'system', content: systemPrompt(session.sc, session.level) }];
  if (!session.history.length) msgs.push({ role: 'user', content: '(The learner just opened the app. Start the role-play: greet them in character and ask your first question.)' });
  else msgs.push(...session.history.slice(-20));
  session.busy = true; micState('busy'); typing(true); setStatus('⏳ A tutor gondolkodik...');
  try {
    const raw = await chat(msgs);
    if (!session || !document.body.classList.contains('chatting')) return;
    const t = parseTutor(raw);
    typing(false);
    session.history.push({ role: 'assistant', content: JSON.stringify({ reply: t.reply }) });
    const um = userMsg || [...session.msgs].reverse().find(x => x.who === 'u');
    if (userMsg && t.corrections.length) { userMsg.corr = t.corrections; session.corrections.push(...t.corrections); rerenderMsg(userMsg); }
    t.words.forEach(w => { session.words.push(w); });
    if (t.tip) session.tips.push(t.tip);
    addMsg({ who: 't', text: t.reply, hu: t.hu, tip: t.tip });
    if (t.plain) addMsg({ who: 'sys', text: 'ℹ️ Az AI most nem a várt formátumban válaszolt, ezért javítások és fordítás nélkül látod.' });
    showSugg(t.sugg);
    session.busy = false; micState(''); setStatus('');
    if (t.done) { session.ended = true; addMsg({ who: 'sys', text: '🎉 A szituáció véget ért. Nézd meg az összegzést!' }); await speak(t.reply); finishSession(); return; }
    tutorSpeaks(t.reply);
  } catch (e) {
    typing(false); session.busy = false; micState(''); setStatus('');
    if (userMsg) session.history.pop(); // allow retry of same message
    const retryMsg = { who: 'sys', err: true, kind: e.kind, text: '⚠️ ' + (e.message || 'Ismeretlen hiba.'), retry: e.kind !== 'auth' };
    if (userMsg) { retryMsg.retry = false; retryMsg.text += ' Mondd vagy írd újra a mondatod.'; session.msgs = session.msgs.filter(x => x !== userMsg); userMsg.el && userMsg.el.remove(); }
    addMsg(retryMsg);
  }
}

// --- Demo mode (scripted branching) ---
function demoTutor(id) {
  const D = DEMO[session.sc.id]; const n = D.nodes[id]; session.node = id; session.expected = n;
  addMsg({ who: 't', text: n.tutor, hu: n.hu });
  showSugg(n.ex, '💡 ' + n.hint + ' Például:');
  if (n.end) { session.endPending = true; }
  tutorSpeaks(n.tutor);
}
function demoUser(m, r) {
  const n = session.expected; if (!n) return;
  let best = null; for (const ex of n.ex) { const s = score(ex, r.alts); if (!best || s.score > best.score) best = s; }
  const cls = best.score >= 80 ? 'good' : best.score >= 50 ? 'mid' : 'low';
  const msg = best.score >= 80 ? 'Szép! Érthető volt.' : best.score >= 50 ? 'Majdnem! Figyelj a pirossal jelölt szavakra.' : 'Ez eltér a várt választól. Próbáld a javasolt mondattal!';
  const wordsHtml = best.words.map((w, i) => `<span class="${best.hits[i] ? 'w-ok' : 'w-miss'}">${esc(w)}</span>`).join(' ');
  m.demoFb = `<div class="corr" style="border-color:var(--${cls === 'good' ? 'ok' : cls === 'mid' ? 'warn' : 'bad'})">🎯 ${best.score}% · ${msg}<div class="small">Várt minta: ${wordsHtml}</div>${r.typed || best.score === 100 ? '' : '<div class="small muted">A pirossal jelölt szavakat a felismerő nem hallotta (vagy másképp mondtad).</div>'}</div>`;
  if (best.score < 80) session.corrections.push({ said: r.text, better: best.target, why: best.score < 50 ? 'Ezt a mintamondatot érdemes gyakorolni.' : 'Figyelj a kiemelt szavakra: ' + best.words.filter((w, i) => !best.hits[i]).join(', ') });
  rerenderMsg(m);
  if (n.end) { session.ended = true; setTimeout(() => finishSession(), 600); return; }
  const heard = norm(r.text);
  let next = n.next;
  if (n.br) for (const [keys, to] of n.br) if (keys.some(k => heard.some(w => w.startsWith(k)))) { next = to; break; }
  session.busy = true; micState('busy');
  setTimeout(() => { session.busy = false; micState(''); demoTutor(next); }, 450);
}

// ---------- summary & progress ----------
function finishSession() {
  if (!session) return go('home');
  endListening();
  const s = session; session = null;
  const userTurns = s.msgs.filter(m => m.who === 'u').length;
  if (!userTurns) return go('home');
  if (s.demo) DEMO[s.sc.id].vocab.forEach(([en, hu]) => s.words.push({ en, hu }));
  const seen = new Set(); const words = s.words.filter(w => { const k = w.en.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; }).slice(0, 8);
  words.forEach(w => P.vocab[w.en.toLowerCase()] = w.hu);
  const tipsL = TIPS[s.level]; const tip = s.tips[0] || tipsL[(P.sessions.length) % tipsL.length];
  const rec = { id: Date.now(), date: new Date().toISOString(), level: s.level, scId: s.sc.id, title: s.sc.t, ic: s.sc.ic, demo: s.demo, turns: userTurns, words: s.userWords, secs: Math.round(s.secs), mins: Math.max(1, Math.round((Date.now() - s.start) / 60000)), newWords: words, corrections: s.corrections.slice(0, 3), tip };
  P.sessions.unshift(rec); P.sessions = P.sessions.slice(0, 100);
  P.seconds += rec.secs; P.words += rec.words; markActive(); saveP();
  go('summary', rec);
}
views.summary = rec => {
  const L = rec.level, nxt = LEVELS[LEVELS.indexOf(L) + 1];
  const justUnlocked = nxt && lvlSessions(L) === UNLOCK;
  main.innerHTML = `<div class="summary"><h1>🎉 Szép munka!</h1><p class="muted">${rec.ic} ${esc(rec.title)} · ${L} · ${rec.turns} válasz, ${rec.words} kimondott szó</p>
  ${justUnlocked ? `<div class="hero"><b>🌱 Szép haladás!</b><p>Már ${UNLOCK} beszélgetést befejeztél ${L} szinten. Ha szeretnéd, kipróbálhatod a(z) ${nxt} szintet is.</p></div>` : ''}
  <div class="panel"><h2>📚 Új szavak, kifejezések</h2>${rec.newWords.length ? '<ul>' + rec.newWords.map(w => `<li><b lang="en">${esc(w.en)}</b> = ${esc(w.hu)} <button class="btn sm ghost" data-say="${esc(w.en)}">🔊</button></li>`).join('') + '</ul>' : '<p class="muted">Most nem volt új kifejezés.</p>'}</div>
  <div class="panel"><h2>✏️ A legfontosabb javítások</h2>${rec.corrections.length ? '<ul>' + rec.corrections.map(c => `<li><s>${esc(c.said)}</s> → <b lang="en">${esc(c.better)}</b> <button class="btn sm ghost" data-say="${esc(c.better)}">🔊</button>${c.why ? `<div class="small muted">${esc(c.why)}</div>` : ''}</li>`).join('') + '</ul>' : '<p>Nem volt jelentős hiba. Nagyon ügyes vagy! 👏</p>'}</div>
  <div class="panel"><h2>💡 Tipp</h2><p>${esc(rec.tip)}</p></div>
  <div class="row"><button class="btn primary" id="again">🔁 Újra ezt</button><button class="btn" id="home">🏠 Főoldal</button><button class="btn ghost" id="prog">📈 Haladás</button></div></div>`;
  main.querySelectorAll('[data-say]').forEach(b => b.onclick = () => speak(b.dataset.say));
  $('#home').onclick = () => go('home'); $('#prog').onclick = () => go('progress');
  $('#again').onclick = () => { const sc = SCENARIOS[rec.level].find(x => x.id === rec.scId); if (sc) { S.level = rec.level; startSession(sc); } else go('free'); };
};
views.progress = () => {
  const fmt = d => new Date(d).toLocaleString('hu-HU', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  main.innerHTML = `<h1>📈 Haladás</h1>
  <div class="stats"><div class="stat"><b>${P.sessions.length}</b><small>beszélgetés</small></div><div class="stat"><b>${Math.round(P.seconds / 60)}</b><small>perc beszéd</small></div><div class="stat"><b>${P.words}</b><small>kimondott szó</small></div><div class="stat"><b>🔥 ${P.streak || 0}</b><small>napos sorozat</small></div></div>
  <div class="panel lvlprog"><h2>Szintek</h2>${LEVELS.map(l => { const n = lvlSessions(l), tot = SCENARIOS[l].length, done = SCENARIOS[l].filter(s => scDone(s.id)).length; return `<div><b>${l}</b> ${LEVEL_HU[l]}: ${done}/${tot} szituáció kipróbálva, ${n} beszélgetés${levelOpen(l) ? '' : ' (javasolt később)'}<div class="bar"><i style="width:${Math.round(100 * done / tot)}%"></i></div></div>`; }).join('')}</div>
  <div class="panel"><h2>Előzmények</h2>${P.sessions.length ? P.sessions.slice(0, 30).map((s, i) => `<div class="hist"><span>${s.ic} ${esc(s.title)} <span class="muted small">${s.level}${s.demo ? ' · demo' : ''}</span></span><span class="muted small">${fmt(s.date)} <button class="btn sm ghost" data-h="${i}">Összegzés</button></span></div>`).join('') : '<p class="muted">Még nincs befejezett beszélgetés.</p>'}</div>
  <div class="panel"><h2>Szótár (${Object.keys(P.vocab).length})</h2><p class="small">${Object.entries(P.vocab).slice(-40).map(([e, h]) => `<b lang="en">${esc(e)}</b> = ${esc(h)}`).join(' · ') || '<span class="muted">Üres.</span>'}</p></div>
  <button class="btn ghost" id="back">← Vissza</button>`;
  main.querySelectorAll('[data-h]').forEach(b => b.onclick = () => go('summary', P.sessions[+b.dataset.h]));
  $('#back').onclick = () => go('home');
};

// ---------- settings ----------
const dlg = $('#settings');
function fillModels(p) { $('#modelList').innerHTML = (PRESETS[p] || PRESETS.custom).models.map(m => `<option value="${esc(m)}">`).join(''); }
function openSettings() {
  $('#provSel').value = S.provider; $('#baseIn').value = S.base; $('#modelIn').value = S.model; $('#keyIn').value = S.key;
  $('#rateSel').value = String(S.rate); $('#handsFree').checked = S.handsFree; $('#autoHu').checked = S.autoHu; $('#keyStatus').textContent = '';
  fillModels(S.provider); loadVoices(); dlg.showModal();
}
function readSettings() {
  S.provider = $('#provSel').value; S.base = $('#baseIn').value.trim(); S.model = $('#modelIn').value.trim(); S.key = $('#keyIn').value.trim();
  S.rate = +$('#rateSel').value; S.handsFree = $('#handsFree').checked; S.autoHu = $('#autoHu').checked; S.voice = $('#voiceSel').value || S.voice; saveS(); updTop();
}
$('#provSel').onchange = e => { const p = PRESETS[e.target.value]; fillModels(e.target.value); if (e.target.value !== 'custom') { $('#baseIn').value = p.base; $('#modelIn').value = p.model; } else { $('#baseIn').value = ''; $('#modelIn').value = ''; $('#baseIn').focus(); } };
$('#keyShow').onclick = () => { const k = $('#keyIn'); k.type = k.type === 'password' ? 'text' : 'password'; };
$('#clearKey').onclick = () => { $('#keyIn').value = ''; readSettings(); $('#keyStatus').textContent = 'Kulcs törölve. Demo mód aktív.'; };
$('#testKey').onclick = async () => {
  readSettings(); const st = $('#keyStatus');
  if (!hasKey()) { st.textContent = '⚠️ Add meg a végpontot, a modellt és a kulcsot.'; return; }
  if (!/^https:\/\//.test(S.base) && !/^http:\/\/(localhost|127\.0\.0\.1)/.test(S.base)) { st.textContent = '⚠️ A végpontnak https:// címmel kell kezdődnie.'; return; }
  st.textContent = '⏳ Tesztelés...';
  try { await chat([{ role: 'user', content: 'Say OK.' }], { timeout: 20000 }); st.textContent = '✅ Működik! Az AI mód aktív.'; }
  catch (e) { st.textContent = '❌ ' + e.message; }
};
$('#settingsForm').addEventListener('submit', () => { readSettings(); if (!session) go(document.body.classList.contains('chatting') ? 'home' : currentView()); });
dlg.addEventListener('close', () => readSettings());
const currentView = () => $('.summary') ? 'home' : $('.hero') ? 'home' : 'home';
$('#voiceSel').onchange = e => { S.voice = e.target.value; saveS(); };
$('#testVoice').onclick = () => { S.voice = $('#voiceSel').value; S.rate = +$('#rateSel').value; speak("Hi! I'm your English tutor. Let's talk!"); };
$('#exportBtn').onclick = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(P, null, 1)], { type: 'application/json' })); a.download = 'talk-it-haladas.json'; a.click(); };
$('#importFile').onchange = e => { const f = e.target.files[0]; if (!f) return; f.text().then(t => { const j = JSON.parse(t); if (!Array.isArray(j.sessions)) throw 0; P = Object.assign({ sessions: [], streak: 0, lastDay: null, seconds: 0, words: 0, vocab: {} }, j); saveP(); updTop(); toast('Haladás betöltve.'); }).catch(() => toast('Hibás fájl.')); };
$('#resetBtn').onclick = () => { if (confirm('Biztosan törlöd a haladást és az előzményeket? (A kulcs megmarad.)')) { P = { sessions: [], streak: 0, lastDay: null, seconds: 0, words: 0, vocab: {} }; saveP(); updTop(); toast('Haladás nullázva.'); } };

// ---------- theme, init ----------
function applyTheme() { const t = S.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'); document.documentElement.dataset.theme = t; }
$('#themeBtn').onclick = () => { S.theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'; saveS(); applyTheme(); };
$('#settingsBtn').onclick = openSettings;
$('#homeBtn').onclick = () => { if (session) $('#cBack').click(); else go('home'); };
$('#homeBtn').onkeydown = e => { if (e.key === 'Enter') $('#homeBtn').click(); };
document.addEventListener('keydown', e => {
  if (!session || e.target.matches('input,select,textarea') || dlg.open) return;
  if (e.key === 'm' || e.key === 'M' || (e.code === 'Space' && !e.repeat)) { e.preventDefault(); $('#mic') && $('#mic').click(); }
});
applyTheme(); updTop();
const warn = [];
if (!SR) warn.push('A böngésződ nem támogatja a beszédfelismerést (Chrome, Edge vagy Safari ajánlott). Gépelve is tudsz válaszolni.');
if (!window.isSecureContext) warn.push('A mikrofon csak https vagy localhost alatt működik.');
if (!synth) warn.push('A böngésződ nem tud felolvasni.');
if (warn.length) { const b = $('#banner'); b.hidden = false; b.textContent = '⚠️ ' + warn.join(' '); }
go('home');
if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('sw.js').catch(() => {});
window.__talkit = { parseTutor, score, get session() { return session; } };
})();
