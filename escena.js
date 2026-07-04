// ===================== PACTO DE SANGRE — Director de escena =====================
const cinema = document.getElementById('cinema');
const stage = document.getElementById('stage');
const subtitle = document.getElementById('subtitle');
const speakerEl = document.getElementById('speaker');
const lineEl = document.getElementById('line');
const flash = document.getElementById('flash');
const titleCard = document.getElementById('titleCard');
const startOverlay = document.getElementById('startOverlay');
const demon = document.getElementById('demon');
const maxEl = document.getElementById('max');

const playBtn = document.getElementById('playBtn');
const replayBtn = document.getElementById('replayBtn');
const skipBtn = document.getElementById('skipBtn');

let sceneToken = 0;

// ===================== PARTÍCULAS (canvas) =====================
const canvas = document.getElementById('fx');
const ctx = canvas.getContext('2d');
let W = 0, H = 0, dpr = 1;
let mode = 'none';           // 'rain' | 'fire' | 'calm' | 'none'
let rain = [];
let fire = [];
let embers = [];

function resize() {
  const r = cinema.getBoundingClientRect();
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  W = r.width; H = r.height;
  canvas.width = W * dpr; canvas.height = H * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener('resize', resize);

function initRain() {
  rain = [];
  const n = Math.floor(W / 6);
  for (let i = 0; i < n; i++) {
    rain.push({ x: Math.random() * W, y: Math.random() * H, len: 10 + Math.random() * 18, sp: 6 + Math.random() * 8 });
  }
}
function spawnFire() {
  const cx = W * 0.5;
  for (let i = 0; i < 4; i++) {
    fire.push({
      x: cx + (Math.random() - 0.5) * W * 0.34,
      y: H * 0.92,
      vx: (Math.random() - 0.5) * 0.8,
      vy: -(1.4 + Math.random() * 2.6),
      life: 1, size: 3 + Math.random() * 7,
      hue: Math.random()
    });
  }
}
function spawnEmber() {
  embers.push({
    x: Math.random() * W, y: H + 5,
    vx: (Math.random() - 0.5) * 0.4, vy: -(0.4 + Math.random() * 1.1),
    life: 1, size: 1 + Math.random() * 2.2
  });
}

function loop() {
  ctx.clearRect(0, 0, W, H);

  // Lluvia
  if (mode === 'rain') {
    ctx.strokeStyle = 'rgba(150,170,200,0.35)';
    ctx.lineWidth = 1;
    for (const d of rain) {
      ctx.beginPath();
      ctx.moveTo(d.x, d.y);
      ctx.lineTo(d.x - 1.5, d.y + d.len);
      ctx.stroke();
      d.y += d.sp; d.x -= 0.4;
      if (d.y > H) { d.y = -d.len; d.x = Math.random() * W; }
    }
  }

  // Fuego negro (durante el pacto)
  if (mode === 'fire') {
    spawnFire();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = fire.length - 1; i >= 0; i--) {
      const p = fire[i];
      p.x += p.vx; p.y += p.vy; p.vy *= 0.99; p.life -= 0.016;
      if (p.life <= 0) { fire.splice(i, 1); continue; }
      const a = Math.max(0, p.life);
      // núcleo oscuro con halo rojo/púrpura
      const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
      if (p.hue > 0.5) {
        grd.addColorStop(0, `rgba(255,60,120,${a * 0.9})`);
        grd.addColorStop(0.4, `rgba(120,20,110,${a * 0.6})`);
      } else {
        grd.addColorStop(0, `rgba(255,80,40,${a * 0.9})`);
        grd.addColorStop(0.4, `rgba(140,10,30,${a * 0.6})`);
      }
      grd.addColorStop(1, 'rgba(10,0,10,0)');
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
      ctx.fill();
      // punto negro (el "fuego que traga la luz")
      ctx.fillStyle = `rgba(5,0,8,${a * 0.5})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 0.6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  // Brasas ambientales (interior)
  if (mode === 'fire' || mode === 'calm') {
    if (Math.random() < 0.4) spawnEmber();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = embers.length - 1; i >= 0; i--) {
      const e = embers[i];
      e.x += e.vx; e.y += e.vy; e.life -= 0.006;
      if (e.life <= 0 || e.y < -10) { embers.splice(i, 1); continue; }
      ctx.fillStyle = `rgba(255,120,40,${e.life * 0.8})`;
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  requestAnimationFrame(loop);
}

// ===================== UTILIDADES DE TIEMPO / TEXTO =====================
function wait(ms) { return new Promise(res => setTimeout(res, ms)); }

function typeText(text, speed, alive) {
  return new Promise(res => {
    lineEl.textContent = '';
    let i = 0;
    const id = setInterval(() => {
      if (!alive()) { clearInterval(id); return res(); }
      lineEl.textContent += text.charAt(i);
      i++;
      if (i >= text.length) { clearInterval(id); res(); }
    }, speed);
  });
}

// tipo: 'max' | 'demon' | 'lira' | 'narrator'
async function say(name, text, tipo, alive) {
  if (!alive()) return;
  speakerEl.className = 'speaker' + (tipo === 'demon' ? ' demon-speaker' : tipo === 'narrator' ? ' narrator' : '');
  lineEl.className = 'line' + (tipo === 'demon' ? ' demon-line' : tipo === 'narrator' ? ' narrator-line' : '');
  speakerEl.textContent = name;
  speakerEl.style.display = name ? 'inline-block' : 'none';
  subtitle.classList.add('show');
  const speed = tipo === 'demon' ? 42 : 30;
  await typeText(text, speed, alive);
  if (!alive()) return;
  // tiempo de lectura proporcional
  await wait(Math.min(3800, 900 + text.length * 45));
  if (!alive()) return;
  subtitle.classList.remove('show');
  await wait(400);
}

function shakeStage() {
  stage.classList.remove('shake');
  void stage.offsetWidth;
  stage.classList.add('shake');
}
function doFlash() {
  flash.classList.remove('blast');
  void flash.offsetWidth;
  flash.classList.add('blast');
}

// ===================== RESET =====================
function resetScene() {
  cinema.className = 'cinema';
  demon.classList.remove('rage');
  maxEl.classList.remove('step-fwd', 'pact');
  subtitle.classList.remove('show');
  titleCard.classList.remove('show');
  lineEl.textContent = '';
  fire = []; embers = [];
  mode = 'none';
}

// ===================== LÍNEA DE TIEMPO DE LA ESCENA =====================
async function runScene() {
  const myToken = ++sceneToken;
  const alive = () => myToken === sceneToken;

  resetScene();
  resize();
  startOverlay.classList.add('hidden');
  cinema.classList.add('playing');

  // --- EXTERIOR: lluvia sobre los barrios bajos ---
  mode = 'rain'; initRain();
  cinema.classList.add('max-in', 'lira-in');
  await wait(900); if (!alive()) return;
  await say('', 'Lluvia sobre los Barrios Bajos de Ferro. Una torre negra que no debería existir.', 'narrator', alive);
  if (!alive()) return;
  await say('MAX', 'Once desaparecidos... todos entraron aquí. Bien. Entonces vine al lugar correcto.', 'max', alive);
  if (!alive()) return;

  // --- TRANSICIÓN AL INTERIOR ---
  await wait(300);
  mode = 'calm';
  cinema.classList.add('indoors', 'seal-on');
  cinema.classList.remove('lira-in');
  await wait(1400); if (!alive()) return;
  cinema.classList.add('lira-in');

  // --- APARECE VAEL'ZAR ---
  cinema.classList.add('demon-in');
  shakeStage();
  await wait(1400); if (!alive()) return;
  await say("VAEL'ZAR", 'Otro insecto. ¿Vienes a suplicar poder, pequeño? Arrodíllate y ofrece tu alma.', 'demon', alive);
  if (!alive()) return;

  // --- MAX DA UN PASO ---
  maxEl.classList.add('step-fwd');
  await wait(500); if (!alive()) return;
  await say('MAX', 'En realidad... vine a hacerte una oferta a TI.', 'max', alive);
  if (!alive()) return;
  await say("VAEL'ZAR", '¿Una oferta. Un humano. A mí?', 'demon', alive);
  if (!alive()) return;
  await say('MAX', 'Sé que el Rey Demonio te desprecia. Sé que estás solo. Hagamos un pacto: tu poder, mi cuerpo, enemigos en común.', 'max', alive);
  if (!alive()) return;
  await say("VAEL'ZAR", 'Un pacto se sella con sangre y con nombre. Tu voluntad será mía. Serás un guante... y yo la mano.', 'demon', alive);
  if (!alive()) return;

  // --- EL PACTO ---
  maxEl.classList.add('pact');
  mode = 'fire';
  await wait(600); if (!alive()) return;
  await say('MAX', 'Lo sé. Trato hecho.', 'max', alive);
  if (!alive()) return;
  await say('LIRA', '¡Max, NO!', 'lira', alive);
  if (!alive()) return;

  // --- DESTELLO + SELLADO ---
  doFlash(); shakeStage();
  await wait(200); shakeStage();
  await wait(700); if (!alive()) return;
  await say('', 'Lo que el demonio nunca consideró... es que un humano pudiera MENTIR dentro de un pacto de sangre.', 'narrator', alive);
  if (!alive()) return;

  // --- FURIA DEL DEMONIO ---
  demon.classList.add('rage');
  shakeStage();
  await say("VAEL'ZAR", '¿QUÉ... HAS... HECHO?', 'demon', alive);
  if (!alive()) return;
  await say('MAX', 'Vas a tener que esperar tu turno. Ahora tú y yo tenemos el mismo problema... y su nombre es Cassius Valdren.', 'max', alive);
  if (!alive()) return;

  // --- CARTEL FINAL ---
  demon.classList.remove('rage');
  mode = 'calm';
  await wait(400); if (!alive()) return;
  titleCard.classList.add('show');
  await wait(300);
}

// ===================== CONTROLES =====================
playBtn.addEventListener('click', () => { resize(); runScene(); });
replayBtn.addEventListener('click', () => { resize(); runScene(); });
skipBtn.addEventListener('click', () => {
  sceneToken++; // cancela la escena actual
  resetScene();
  cinema.classList.add('playing', 'indoors');
  mode = 'calm';
  titleCard.classList.add('show');
});

// arranque
resize();
loop();
