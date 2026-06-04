/* ============================================================
   Our Space — main.js
   All API calls go to Flask endpoints.
   No authentication — just name personalisation via /api/set-names
   ============================================================ */

// ── User state (seeded from Flask session via SERVER_USER) ──────────────────
let userData = { ...SERVER_USER };

// ── Stars canvas ─────────────────────────────────────────────────────────────
const canvas = document.getElementById('stars');
const ctx    = canvas.getContext('2d');
let stars = [], W, H;

function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
resize();
window.addEventListener('resize', resize);

function initStars() {
  stars = [];
  const n = Math.floor(W * H / 4000);
  for (let i = 0; i < n; i++) {
    stars.push({ x: Math.random()*W, y: Math.random()*H, r: Math.random()*1.2+0.1, o: Math.random(), to: Math.random(), sp: Math.random()*0.008+0.002 });
  }
}
initStars();

function drawStars() {
  ctx.clearRect(0, 0, W, H);
  stars.forEach(s => {
    s.o += (s.to - s.o) * s.sp;
    if (Math.abs(s.o - s.to) < 0.01) s.to = Math.random();
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${s.o * 0.6})`;
    ctx.fill();
  });
  requestAnimationFrame(drawStars);
}
drawStars();

// ── Typewriter ────────────────────────────────────────────────────────────────
const phrases = ["because distance is just a number...", "your heart lives here too...", "every star knows your name...", "a universe made just for us..."];
let pIdx = 0, cIdx = 0, deleting = false;
const tw = document.getElementById('typewriter');

function typeEffect() {
  const phrase = phrases[pIdx];
  if (!deleting) {
    tw.textContent = phrase.slice(0, cIdx++);
    if (cIdx > phrase.length) { deleting = true; setTimeout(typeEffect, 1800); return; }
  } else {
    tw.textContent = phrase.slice(0, cIdx--);
    if (cIdx < 0) { deleting = false; pIdx = (pIdx + 1) % phrases.length; cIdx = 0; setTimeout(typeEffect, 400); return; }
  }
  setTimeout(typeEffect, deleting ? 40 : 70);
}
setTimeout(typeEffect, 2000);

// ── Setup modal (replaces auth) ───────────────────────────────────────────────
function enterSpace() {
  document.getElementById('setupOverlay').classList.add('active');
}
function hideSetupModal() {
  document.getElementById('setupOverlay').classList.remove('active');
}

async function saveNames() {
  const name    = document.getElementById('nameInput').value.trim()    || userData.name;
  const partner = document.getElementById('partnerInput').value.trim() || userData.partner;
  try {
    await fetch('/api/set-names', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, partner }),
    });
  } catch (_) { /* non-critical */ }
  userData = { name, partner };
  hideSetupModal();
  document.getElementById('landing').style.display = 'none';
  const dash = document.getElementById('dashboard');
  dash.style.display = 'block';
  initDashboard();
  showToast(`Welcome to your space, ${name} ✦`);
}

function goToLanding() {
  document.getElementById('dashboard').style.display = 'none';
  document.getElementById('landing').style.display = 'flex';
}

// ── Dashboard init ────────────────────────────────────────────────────────────
function initDashboard() {
  updateGreeting();
  updateTime();
  setInterval(updateTime, 1000);
  initCountdown();
  setInterval(updateCountdown, 1000);
  fetchMemories();
  fetchOWCards();
  fetchLetters();
  loadDailyMessage();

  // Start human chat polling
  fetchMessages();
  setInterval(fetchMessages, 2000);

  // Update dynamic labels
  document.getElementById('aiPartnerName').textContent   = userData.partner;
  document.getElementById('chatPartnerLabel').textContent = userData.partner.toUpperCase();
  document.getElementById('chatWindow').innerHTML = `
    <div class="msg ai">
      <div class="msg-name">${userData.partner.toUpperCase()}</div>
      Hey ${userData.name} 🌸 I've been waiting for you. How are you feeling today?
    </div>`;
}

function updateGreeting() {
  const h = new Date().getHours();
  const g = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : h < 21 ? 'Good evening' : 'Good night';
  document.getElementById('greetingText').textContent = `${g}, ${userData.name} ✦`;
  document.getElementById('greetingSub').textContent  = `${userData.partner.toUpperCase()} IS THINKING OF YOU RIGHT NOW`;
}

function updateTime() {
  const now = new Date();
  const fmt = d => d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  document.getElementById('localTime').textContent = fmt(now);
  const partnerD = new Date(now.getTime() + 30 * 60 * 1000);
  const pt = document.getElementById('partnerTime');
  if (pt) pt.textContent = `${userData.partner}'s time: ${fmt(partnerD)}`;
}

let meetingDate = new Date(Date.now() + 12 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000);

function initCountdown() { updateCountdown(); }

function updateCountdown() {
  const diff = meetingDate - Date.now();
  if (diff < 0) return;
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  const pad = n => String(n).padStart(2, '0');
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  set('cd-days', d); set('cd-hours', pad(h)); set('cd-mins', pad(m)); set('cd-secs', pad(s));
}

// ── Daily message ─────────────────────────────────────────────────────────────
function getTimeOfDay() {
  const h = new Date().getHours();
  return h < 12 ? 'morning' : h < 17 ? 'afternoon' : h < 21 ? 'evening' : 'night';
}

function loadDailyMessage() {
  const msgs = [
    `Hey ${userData.name}, I was just thinking about the way you smile when you're pretending not to be happy. You can't hide it from me. Even across all this distance, I know you.`,
    `Good ${getTimeOfDay()}, my love. The sky here looks different today — softer, like it knows we're apart. But you know what? Every cloud feels a little like you.`,
    `${userData.name}, I want you to know that the space between us isn't empty. It's filled with every "I miss you" we've ever felt but didn't say.`,
    `I was listening to our playlist today and I swear I could feel you here. Distance can't touch the things we've built together.`,
  ];
  const el = document.getElementById('dailyMsg');
  if (el) el.textContent = msgs[new Date().getDate() % msgs.length];
}

// ── Section navigation ────────────────────────────────────────────────────────
function showSection(id) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  const sec = document.getElementById(id);
  if (sec) sec.classList.add('active');
  const map = { home: 0, ai: 1, memories: 2, openWhen: 3, letters: 4 };
  const links = document.querySelectorAll('.nav-link');
  if (map[id] !== undefined && links[map[id]]) links[map[id]].classList.add('active');
  // close mobile nav when navigating
  const nav = document.querySelector('.nav');
  if (nav && nav.classList.contains('open')) {
    nav.classList.remove('open');
    const hb = document.getElementById('hamburgerBtn'); if (hb) hb.setAttribute('aria-expanded', 'false');
  }
}

// Toggle mobile nav (hamburger)
function toggleNav() {
  const nav = document.querySelector('.nav');
  if (!nav) return;
  const isOpen = nav.classList.toggle('open');
  const hb = document.getElementById('hamburgerBtn'); if (hb) hb.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
}

// ── Mood ──────────────────────────────────────────────────────────────────────
function selectMood(el) {
  document.querySelectorAll('.mood-chip').forEach(c => c.classList.remove('sel'));
  el.classList.add('sel');
  showToast('Mood saved: ' + el.textContent.trim());
}

// ── AI Chat ───────────────────────────────────────────────────────────────────
let currentMode = 'romantic';

function setMode(el, mode) {
  document.querySelectorAll('.mode-chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  currentMode = mode;
  showToast('Switched to ' + mode + ' mode ✦');
}

function handleChatKey(e) {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
}

async function sendMessage() {
  const inp  = document.getElementById('chatInput');
  const win  = document.getElementById('chatWindow');
  const text = inp.value.trim();
  if (!text) return;
  inp.value = '';
  // Post the message to the simple messages API (human chat)
  showToast('Sending...');
  try {
    const res = await fetch('/api/send-message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sender: userData.name, message: text }),
    });
    if (res.ok) {
      // Refresh messages (server returns the full stored list via polling)
      await fetchMessages();
      showToast('Message sent ✦');
    } else {
      showToast('Could not send message ✦');
    }
  } catch (e) {
    showToast('Network error — message not sent');
  }
}

// Fetch messages and render into the chat window
async function fetchMessages() {
  const win = document.getElementById('chatWindow');
  try {
    const res = await fetch('/api/messages');
    if (!res.ok) return;
    const data = await res.json();
    // render
    win.innerHTML = '';
    data.forEach(m => {
      const el = document.createElement('div');
      el.className = m.sender === userData.name ? 'msg user' : 'msg ai';
      el.innerHTML = `<div class="msg-name">${m.sender === userData.name ? userData.name : userData.partner.toUpperCase()}</div>${m.text}`;
      win.appendChild(el);
    });
    win.scrollTop = win.scrollHeight;
  } catch (_) { /* silent */ }
}

// ── Memories ──────────────────────────────────────────────────────────────────
async function fetchMemories() {
  const grid = document.getElementById('memoryGrid');
  if (!grid) return;
  try {
    const res  = await fetch('/api/memories');
    const data = await res.json();
    grid.innerHTML = '';
    data.forEach(m => {
      const card = document.createElement('div');
      card.className = 'memory-card';
      card.innerHTML = `
        <div class="memory-img" style="background:${m.color}">${m.emoji}</div>
        <div class="memory-body">
          <div class="memory-date">${m.date}</div>
          <div class="memory-title">${m.title}</div>
          <div class="memory-text">${m.text}</div>
          <div class="memory-tags">${m.tags.map(t => `<span class="mem-tag">${t}</span>`).join('')}</div>
        </div>`;
      card.addEventListener('click', () => showToast('Memory opened: ' + m.title));
      grid.appendChild(card);
    });
    const add = document.createElement('div');
    add.className = 'add-memory-btn';
    add.innerHTML = '<span style="font-size:2rem">+</span><span style="font-size:0.85rem;letter-spacing:0.1em">add a memory</span>';
    add.addEventListener('click', () => showToast('Memory vault opening soon ✦'));
    grid.appendChild(add);
  } catch (_) { /* silently fail */ }
}

// ── Open When ─────────────────────────────────────────────────────────────────
async function fetchOWCards() {
  const grid = document.getElementById('owGrid');
  if (!grid) return;
  try {
    const res  = await fetch('/api/open-when');
    const data = await res.json();
    grid.innerHTML = '';
    data.forEach(ow => {
      const card = document.createElement('div');
      card.className = `ow-card ${ow.type}`;
      card.innerHTML = `<span class="ow-emoji">${ow.emoji}</span><div class="ow-title">${ow.title}</div><div class="ow-sub">${ow.sub}</div><div class="ow-lock">TAP TO OPEN ✦</div>`;
      card.addEventListener('click', () => openOWCard(ow));
      grid.appendChild(card);
    });
  } catch (_) { /* silently fail */ }
}

function openOWCard(ow) {
  document.getElementById('owEmoji').textContent   = ow.emoji;
  document.getElementById('owMessage').textContent = ow.message;
  document.getElementById('owContent').classList.add('open');
}
function closeOWCard() { document.getElementById('owContent').classList.remove('open'); }

// ── Future Letters ────────────────────────────────────────────────────────────
async function fetchLetters() {
  const grid = document.getElementById('lettersGrid');
  if (!grid) return;
  try {
    const res  = await fetch('/api/letters');
    const data = await res.json();
    renderLetters(data);
  } catch (_) { /* silently fail */ }
}

function renderLetters(letters) {
  const grid = document.getElementById('lettersGrid');
  if (!grid) return;
  grid.innerHTML = '';
  letters.forEach(l => {
    const card = document.createElement('div');
    card.className = `letter-card ${l.locked ? 'locked' : ''}`;
    card.innerHTML = `
      <span class="letter-seal">${l.locked ? 'SEALED' : 'OPENED'}</span>
      <span class="envelope">${l.emoji}</span>
      <div class="letter-cd">${l.cd}</div>
      <div class="letter-from">${l.from_}</div>
      <div class="letter-hint">${l.hint}</div>`;
    card.addEventListener('click', () => {
      if (l.locked) showToast('This letter is sealed with love 🔒 — not yet time...');
      else showToast('Letter: ' + l.from_ + ' ✦ Opening...');
    });
    grid.appendChild(card);
  });
}

async function sealLetter() {
  const text = document.getElementById('letterText').value.trim();
  const date = document.getElementById('letterDate').value;
  if (!text) { showToast('Write something first 💌'); return; }
  try {
    const res  = await fetch('/api/letters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, date }),
    });
    const data = await res.json();
    if (data.ok) {
      document.getElementById('letterText').value = '';
      document.getElementById('letterDate').value = '';
      showToast('Letter sealed with love ✦ It will wait for the right moment.');
      fetchLetters();
    }
  } catch (_) { showToast('Could not seal the letter right now 💌'); }
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function showToast(msg) {
  const t = document.getElementById('toast');
  document.getElementById('toast-msg').textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 3000);
}

// ── Easter Egg ────────────────────────────────────────────────────────────────
let secretSeq = [], secretCode = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
document.addEventListener('keydown', e => {
  secretSeq.push(e.keyCode);
  secretSeq = secretSeq.slice(-10);
  if (JSON.stringify(secretSeq) === JSON.stringify(secretCode)) {
    showToast('✦ Achievement Unlocked: You Found the Secret ✦');
    for (let i = 0; i < 20; i++) {
      const s = stars[Math.floor(Math.random() * stars.length)];
      if (s) { s.to = 1; s.r = 3; }
    }
  }
});

canvas.addEventListener('click', e => {
  const nearStar = stars.find(s => Math.hypot(s.x - e.clientX, s.y - e.clientY) < 8);
  if (nearStar) {
    const msgs = ["a star just blushed for you ✦", "even the cosmos knows your name", "you are made of stardust and love", "distance is just space between two hearts"];
    showToast(msgs[Math.floor(Math.random() * msgs.length)]);
    nearStar.r = 3; nearStar.to = 1;
  }
});
