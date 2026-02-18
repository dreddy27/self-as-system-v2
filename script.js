// Breath Engine v2 - Final Version

// ============================================
// V1 REFLECTION MODAL
// ============================================

const v1Modal = document.getElementById('v1-modal');
const openModalBtn = document.getElementById('open-modal');
const closeModalBtn = document.getElementById('close-modal');

openModalBtn.addEventListener('click', () => {
  v1Modal.classList.add('visible');
});

closeModalBtn.addEventListener('click', () => {
  v1Modal.classList.remove('visible');
});

v1Modal.addEventListener('click', (e) => {
  if (e.target === v1Modal) {
    v1Modal.classList.remove('visible');
  }
});

// ============================================
// LANDING PAGE
// ============================================

const landingOverlay = document.getElementById('landing-overlay');
const landingCanvas = document.getElementById('landing-canvas');
const landingCtx = landingCanvas.getContext('2d');
const breath1 = document.getElementById('breath1');
const breath2 = document.getElementById('breath2');
const breath3 = document.getElementById('breath3');
const mainContainer = document.getElementById('main-container');

function resizeLandingCanvas() {
  landingCanvas.width = window.innerWidth;
  landingCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeLandingCanvas);
resizeLandingCanvas();

// Landing background animation
let landingTime = 0;
function animateLandingBackground() {
  if (!landingOverlay.classList.contains('fade-out')) {
    landingTime += 0.01;
    const w = landingCanvas.width;
    const h = landingCanvas.height;
    
    landingCtx.fillStyle = '#000';
    landingCtx.fillRect(0, 0, w, h);
    
    const grad1 = landingCtx.createRadialGradient(w/2, h/2, 0, w/2, h/2, Math.max(w, h) * 0.8);
    const pulse = Math.sin(landingTime * 0.6) * 0.05;
    grad1.addColorStop(0, `rgba(10, 61, 98, ${0.22 + pulse})`);
    grad1.addColorStop(0.4, `rgba(15, 75, 105, ${0.15 + pulse * 0.8})`);
    grad1.addColorStop(0.7, `rgba(10, 50, 80, ${0.1 + pulse * 0.5})`);
    grad1.addColorStop(1, 'rgba(0, 0, 0, 1)');
    landingCtx.fillStyle = grad1;
    landingCtx.fillRect(0, 0, w, h);
    
    // Floating orbs
    landingCtx.shadowBlur = 70;
    for (let i = 0; i < 4; i++) {
      const angle = landingTime * 0.25 + i * (Math.PI / 2);
      const radius = 160 + Math.sin(landingTime * 0.35 + i) * 35;
      const x = w/2 + Math.cos(angle) * radius;
      const y = h/2 + Math.sin(angle) * radius;
      const size = 55 + Math.sin(landingTime * 0.45 + i * 1.5) * 18;
      
      const orbGrad = landingCtx.createRadialGradient(x, y, 0, x, y, size);
      orbGrad.addColorStop(0, 'rgba(35, 191, 163, 0.35)');
      orbGrad.addColorStop(0.5, 'rgba(35, 191, 163, 0.12)');
      orbGrad.addColorStop(1, 'rgba(35, 191, 163, 0)');
      
      landingCtx.shadowColor = 'rgba(35, 191, 163, 0.5)';
      landingCtx.fillStyle = orbGrad;
      landingCtx.beginPath();
      landingCtx.arc(x, y, size, 0, Math.PI * 2);
      landingCtx.fill();
    }
    landingCtx.shadowBlur = 0;
    requestAnimationFrame(animateLandingBackground);
  }
}
animateLandingBackground();

// Breathing sequence
function showBreathSequence() {
  const duration = 3500;
  breath1.classList.add('visible');
  setTimeout(() => {
    breath1.classList.remove('visible');
    breath1.classList.add('fade');
    breath2.classList.add('visible');
  }, duration);
  setTimeout(() => {
    breath2.classList.remove('visible');
    breath2.classList.add('fade');
    breath3.classList.add('visible');
  }, duration * 2);
  setTimeout(() => {
    breath3.classList.remove('visible');
    breath3.classList.add('fade');
  }, duration * 3);
}
setTimeout(showBreathSequence, 900);

// Click to enter
landingOverlay.addEventListener('click', () => {
  landingOverlay.classList.add('fade-out');
  setTimeout(() => {
    landingOverlay.style.display = 'none';
    mainContainer.classList.add('visible');
  }, 2200);
});

// ============================================
// MAIN CANVAS
// ============================================

const canvas = document.getElementById('system-canvas');
const ctx = canvas.getContext('2d');
const topInfo = document.getElementById('top-info');
const bottomInfo = document.getElementById('bottom-info');
const breathCountEl = document.querySelector('.breath-count');

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

let breathIntensity = 0;
let totalBreaths = 0;

// Enhanced gradient background
function drawGradient(ctx, width, height, now) {
  const t = (now || performance.now()) * 0.00018;
  const grad1 = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, Math.max(width, height) * 0.75);
  const intensity = 0.15 + (breathIntensity * 0.22);
  grad1.addColorStop(0, `rgba(10, 61, 98, ${intensity})`);
  grad1.addColorStop(0.4, `rgba(15, 75, 105, ${intensity * 0.75})`);
  grad1.addColorStop(0.7, `rgba(10, 50, 80, ${intensity * 0.5})`);
  grad1.addColorStop(1, 'rgba(0, 0, 0, 1)');
  ctx.fillStyle = grad1;
  ctx.fillRect(0, 0, width, height);
  
  // Rotating accent gradient
  const angle = t * 22;
  const grad2 = ctx.createLinearGradient(
    width/2 + Math.cos(angle) * width * 0.5,
    height/2 + Math.sin(angle) * height * 0.5,
    width/2 - Math.cos(angle) * width * 0.5,
    height/2 - Math.sin(angle) * height * 0.5
  );
  grad2.addColorStop(0, 'rgba(35, 191, 163, 0)');
  grad2.addColorStop(0.5, `rgba(35, 191, 163, ${breathIntensity * 0.12})`);
  grad2.addColorStop(1, 'rgba(35, 191, 163, 0)');
  ctx.fillStyle = grad2;
  ctx.fillRect(0, 0, width, height);
}

// Ripple system
const R_MIN = 28;
const R_MAX = 320;
const GROWTH_RATE = 0.68;
const FADE_DURATION = 2600;
const NUM_RINGS = 6;
const RING_SPACING = 40;

let ripple = null;
let isHolding = false;
let holdStartTime = 0;

// Audio
let audioCtx = null;
let currentOsc = null;
let currentGain = null;

function getAudioCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

function startTone(y) {
  const ctx = getAudioCtx();
  const now = ctx.currentTime;
  
  if (currentOsc) {
    try {
      currentOsc.stop();
      currentOsc.disconnect();
      currentGain.disconnect();
    } catch(e) {}
  }
  
  currentOsc = ctx.createOscillator();
  currentGain = ctx.createGain();
  currentOsc.type = 'sine';
  currentOsc.frequency.value = 170 + 115 * (1 - y / canvas.height);
  currentGain.gain.setValueAtTime(0, now);
  currentGain.gain.linearRampToValueAtTime(0.055, now + 0.4);
  currentOsc.connect(currentGain).connect(ctx.destination);
  currentOsc.start(now);
}

function stopTone() {
  if (currentOsc && currentGain) {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;
    currentGain.gain.cancelScheduledValues(now);
    currentGain.gain.setValueAtTime(currentGain.gain.value, now);
    currentGain.gain.linearRampToValueAtTime(0, now + 0.65);
    currentOsc.stop(now + 0.75);
    setTimeout(() => {
      if (currentOsc) {
        try {
          currentOsc.disconnect();
          currentGain.disconnect();
        } catch(e) {}
        currentOsc = null;
        currentGain = null;
      }
    }, 850);
  }
}

function startBreath(x, y) {
  ripple = {
    x, y,
    phase: 'inhale',
    radius: R_MIN,
    exhaleStartTime: null,
    exhaleStartRadius: null
  };
  isHolding = true;
  holdStartTime = performance.now();
  startTone(y);
  topInfo.classList.add('breathing');
  bottomInfo.classList.add('breathing');
  breathCountEl.classList.add('active');
}

function endBreath() {
  if (ripple && ripple.phase === 'inhale') {
    ripple.phase = 'exhale';
    ripple.exhaleStartTime = performance.now();
    ripple.exhaleStartRadius = ripple.radius;
    totalBreaths++;
    breathCountEl.textContent = `${totalBreaths} breath${totalBreaths === 1 ? '' : 's'}`;
  }
  isHolding = false;
  stopTone();
  topInfo.classList.remove('breathing');
  bottomInfo.classList.remove('breathing');
  setTimeout(() => {
    breathCountEl.classList.remove('active');
  }, 350);
}

// Events
function getCoords(e) {
  let clientX, clientY;
  if (e.touches && e.touches.length > 0) {
    clientX = e.touches[0].clientX;
    clientY = e.touches[0].clientY;
  } else {
    clientX = e.clientX;
    clientY = e.clientY;
  }
  return { x: clientX, y: clientY };
}

canvas.addEventListener('mousedown', (e) => {
  const coords = getCoords(e);
  startBreath(coords.x, coords.y);
});

canvas.addEventListener('mouseup', endBreath);
canvas.addEventListener('mouseleave', endBreath);

canvas.addEventListener('touchstart', (e) => {
  e.preventDefault();
  const coords = getCoords(e);
  startBreath(coords.x, coords.y);
});

canvas.addEventListener('touchend', (e) => {
  e.preventDefault();
  endBreath();
});

canvas.addEventListener('touchcancel', (e) => {
  e.preventDefault();
  endBreath();
});

// Update ripple
function updateRipple(now) {
  if (!ripple) return;
  
  if (ripple.phase === 'inhale') {
    const elapsed = now - holdStartTime;
    ripple.radius = Math.min(R_MAX, R_MIN + (elapsed * GROWTH_RATE));
    breathIntensity = Math.min(1, (ripple.radius - R_MIN) / (R_MAX - R_MIN));
  } else if (ripple.phase === 'exhale') {
    const elapsed = now - ripple.exhaleStartTime;
    const progress = Math.min(1, elapsed / FADE_DURATION);
    ripple.radius = ripple.exhaleStartRadius * (1 - progress * 0.38);
    ripple.alpha = 1 - progress;
    breathIntensity = Math.max(0, breathIntensity - 0.011);
    if (progress >= 1) {
      ripple = null;
      breathIntensity = 0;
    }
  }
}

// Draw ripple with enhanced glow
function drawRipple(ctx) {
  if (!ripple) return;
  
  const alpha = ripple.alpha !== undefined ? ripple.alpha : 1;
  ctx.save();
  
  for (let i = 0; i < NUM_RINGS; i++) {
    const ringRadius = ripple.radius - (i * RING_SPACING);
    if (ringRadius > 0) {
      const ringAlpha = alpha * (1 - i * 0.075);
      
      // Outer glow
      ctx.globalAlpha = ringAlpha * 0.35;
      ctx.strokeStyle = '#23BFA3';
      ctx.lineWidth = 5;
      ctx.shadowBlur = 38;
      ctx.shadowColor = 'rgba(35, 191, 163, 0.75)';
      ctx.beginPath();
      ctx.arc(ripple.x, ripple.y, ringRadius, 0, 2 * Math.PI);
      ctx.stroke();
      
      // Main ring
      ctx.globalAlpha = ringAlpha;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.shadowBlur = 24;
      ctx.shadowColor = 'rgba(255, 255, 255, 0.6)';
      ctx.beginPath();
      ctx.arc(ripple.x, ripple.y, ringRadius, 0, 2 * Math.PI);
      ctx.stroke();
    }
  }
  
  ctx.restore();
}

// Instruction text
function drawInstruction(ctx) {
  if (!ripple && !isHolding && totalBreaths === 0) {
    ctx.save();
    ctx.globalAlpha = 0.55;
    ctx.font = '16px DM Sans';
    ctx.fillStyle = '#23BFA3';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Press and hold to breathe', canvas.width / 2, canvas.height / 2);
    ctx.restore();
  }
}

// Main draw loop
function draw(now) {
  updateRipple(now);
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawGradient(ctx, canvas.width, canvas.height, now);
  drawRipple(ctx);
  drawInstruction(ctx);
}

function animate(now) {
  draw(now);
  requestAnimationFrame(animate);
}

animate();
