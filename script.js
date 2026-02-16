// Calm Engine v1 - Integrated System
// Sigil: perfect circle (white stroke)
// Gesture: click/tap to create ripple at pointer
// Behavior: slow expansion/fade, max 8 ripples
// Atmosphere: animated gradient background

const canvas = document.getElementById('system-canvas');
const ctx = canvas.getContext('2d');

// Responsive canvas sizing
function resizeCanvas() {
  // Maintain aspect ratio (2:1)
  const w = Math.max(window.innerWidth, 320);
  const h = Math.max(Math.min(w / 2, 480), 220);
  canvas.width = w;
  canvas.height = h;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// --- Animated Gradient Background ---
function drawAnimatedGradient(ctx, width, height, now) {
  const t = (now || performance.now()) * 0.00004;
  const angle = (135 + 15 * Math.sin(t)) * Math.PI / 180;
  const x1 = width / 2 + Math.cos(angle) * width;
  const y1 = height / 2 + Math.sin(angle) * height;
  const x0 = width / 2 - Math.cos(angle) * width;
  const y0 = height / 2 - Math.sin(angle) * height;
  const blue = '#0A3D62';
  const green = '#1B998B';
  const blue2 = '#14497A';
  const green2 = '#23BFA3';
  const grad = ctx.createLinearGradient(x0, y0, x1, y1);
  const stopShift = 0.05 * Math.sin(t * 0.7);
  grad.addColorStop(Math.max(0, 0 + stopShift), blue);
  grad.addColorStop(Math.min(1, 0.5 + stopShift), blue2);
  grad.addColorStop(Math.min(1, 0.7 + stopShift), green2);
  grad.addColorStop(1, green);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);
}

// --- Ripple System ---
const DURATION = 3000; // ms
const R_START = 10;
const R_END = 200;
const MAX_RIPPLES = 8;
let ripples = [];

// --- Preview Circle ---
let preview = { x: null, y: null, visible: false };
canvas.addEventListener('mousemove', e => {
  const rect = canvas.getBoundingClientRect();
  preview.x = (e.clientX - rect.left) * (canvas.width / rect.width);
  preview.y = (e.clientY - rect.top) * (canvas.height / rect.height);
  preview.visible = true;
});
canvas.addEventListener('mouseleave', () => { preview.visible = false; });

// Web Audio API for gentle sound
let audioCtx = null;
function getAudioCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}
function playRippleTone(y) {
  const ctx = getAudioCtx();
  const duration = 0.5;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.value = 220 + 220 * Math.random();
  const canvasHeight = canvas.height;
  const vol = 0.05 + 0.13 * (1 - y / canvasHeight);
  gain.gain.setValueAtTime(vol, now);
  gain.gain.linearRampToValueAtTime(0, now + duration);
  osc.connect(gain).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + duration);
  osc.onended = () => {
    osc.disconnect();
    gain.disconnect();
  };
}

function spawnRipple(x, y) {
  if (ripples.length >= MAX_RIPPLES) ripples.shift();
  ripples.push({
    x, y,
    start: performance.now()
  });
  playRippleTone(y);
}

canvas.addEventListener('click', function(e) {
  const rect = canvas.getBoundingClientRect();
  const x = (e.clientX - rect.left) * (canvas.width / rect.width);
  const y = (e.clientY - rect.top) * (canvas.height / rect.height);
  spawnRipple(x, y);
});
canvas.addEventListener('touchstart', function(e) {
  if (e.touches.length > 0) {
    const rect = canvas.getBoundingClientRect();
    const x = (e.touches[0].clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.touches[0].clientY - rect.top) * (canvas.height / rect.height);
    spawnRipple(x, y);
  }
});

function draw(now) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawAnimatedGradient(ctx, canvas.width, canvas.height, now);
  // Draw all ripples
  const tNow = now || performance.now();
  ripples = ripples.filter(r => (tNow - r.start) < DURATION);
  for (const r of ripples) {
    const t = Math.min(1, (tNow - r.start) / DURATION);
    const radius = R_START + (R_END - R_START) * t;
    const alpha = 1 - t;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(r.x, r.y, radius, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.restore();
  }
  // Draw preview circle if visible
  if (preview.visible && preview.x && preview.y) {
    ctx.save();
    ctx.globalAlpha = 0.18;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(preview.x, preview.y, R_START, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.restore();
  }
}

function animate(now) {
  draw(now);
  requestAnimationFrame(animate);
}

animate();
