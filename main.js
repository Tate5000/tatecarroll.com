import * as THREE from 'three';

// ============================================
// HEART RAIN - Three.js
// ============================================

let scene, camera, renderer, hearts = [];
let heartGeometry;
const HEART_COUNT = 60;

function createHeartShape() {
  const shape = new THREE.Shape();
  const x = 0, y = 0;

  shape.moveTo(x, y + 0.5);
  shape.bezierCurveTo(x, y + 0.5, x - 0.5, y, x - 0.5, y);
  shape.bezierCurveTo(x - 0.5, y - 0.35, x, y - 0.6, x, y - 0.9);
  shape.bezierCurveTo(x, y - 0.6, x + 0.5, y - 0.35, x + 0.5, y);
  shape.bezierCurveTo(x + 0.5, y, x, y + 0.5, x, y + 0.5);

  return shape;
}

function initHeartRain() {
  const canvas = document.getElementById('heart-canvas');

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 30;

  renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Create heart geometry
  const heartShape = createHeartShape();
  const extrudeSettings = {
    depth: 0.4,
    bevelEnabled: true,
    bevelSegments: 2,
    bevelSize: 0.1,
    bevelThickness: 0.1
  };
  heartGeometry = new THREE.ExtrudeGeometry(heartShape, extrudeSettings);
  heartGeometry.center();

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const pointLight1 = new THREE.PointLight(0xff2d95, 2, 100);
  pointLight1.position.set(10, 10, 10);
  scene.add(pointLight1);

  const pointLight2 = new THREE.PointLight(0x00f0ff, 1.5, 100);
  pointLight2.position.set(-10, -10, 10);
  scene.add(pointLight2);

  // Create hearts
  const colors = [0xff2d95, 0xff69b4, 0xff1493, 0xb026ff, 0xff6b9d, 0xff0066];

  for (let i = 0; i < HEART_COUNT; i++) {
    const color = colors[Math.floor(Math.random() * colors.length)];
    const material = new THREE.MeshPhongMaterial({
      color: color,
      emissive: color,
      emissiveIntensity: 0.3,
      shininess: 100,
      transparent: true,
      opacity: 0.7 + Math.random() * 0.3,
    });

    const heart = new THREE.Mesh(heartGeometry, material);

    // Random position
    heart.position.x = (Math.random() - 0.5) * 60;
    heart.position.y = Math.random() * 60 + 20; // Start above screen
    heart.position.z = (Math.random() - 0.5) * 20;

    // Random scale
    const scale = 0.3 + Math.random() * 0.8;
    heart.scale.set(scale, scale, scale);

    // Random rotation
    heart.rotation.x = Math.random() * Math.PI;
    heart.rotation.y = Math.random() * Math.PI;
    heart.rotation.z = Math.random() * Math.PI;

    // Store animation data
    heart.userData = {
      fallSpeed: 0.02 + Math.random() * 0.06,
      rotSpeedX: (Math.random() - 0.5) * 0.02,
      rotSpeedY: (Math.random() - 0.5) * 0.02,
      rotSpeedZ: (Math.random() - 0.5) * 0.01,
      wobbleSpeed: 0.5 + Math.random() * 2,
      wobbleAmount: 0.01 + Math.random() * 0.03,
      initialX: heart.position.x,
      time: Math.random() * 100,
    };

    scene.add(heart);
    hearts.push(heart);
  }

  window.addEventListener('resize', onWindowResize);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animateHearts() {
  requestAnimationFrame(animateHearts);

  hearts.forEach(heart => {
    const data = heart.userData;
    data.time += 0.016;

    // Fall down
    heart.position.y -= data.fallSpeed;

    // Wobble side to side
    heart.position.x = data.initialX + Math.sin(data.time * data.wobbleSpeed) * data.wobbleAmount * 50;

    // Rotate
    heart.rotation.x += data.rotSpeedX;
    heart.rotation.y += data.rotSpeedY;
    heart.rotation.z += data.rotSpeedZ;

    // Reset when below screen
    if (heart.position.y < -30) {
      heart.position.y = 30 + Math.random() * 20;
      heart.position.x = (Math.random() - 0.5) * 60;
      data.initialX = heart.position.x;
      data.time = 0;
    }
  });

  renderer.render(scene, camera);
}

// ============================================
// YOUTUBE AUDIO PLAYER
// ============================================

let ytPlayer = null;
let ytReady = false;

function loadYouTubeAPI() {
  return new Promise((resolve) => {
    if (window.YT && window.YT.Player) {
      resolve();
      return;
    }
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);
    window.onYouTubeIframeAPIReady = resolve;
  });
}

function createYTPlayer() {
  return new Promise((resolve) => {
    ytPlayer = new window.YT.Player('yt-player', {
      videoId: 'AqPBfbLoF_M',
      playerVars: {
        autoplay: 0,
        loop: 1,
        playlist: 'AqPBfbLoF_M', // needed for loop to work
        controls: 0,
        disablekb: 1,
        fs: 0,
        modestbranding: 1,
        rel: 0,
      },
      events: {
        onReady: () => {
          ytReady = true;
          resolve();
        },
        onStateChange: (event) => {
          // If video ends, replay (backup for loop)
          if (event.data === window.YT.PlayerState.ENDED) {
            ytPlayer.playVideo();
          }
        }
      }
    });
  });
}

function playMusic() {
  if (ytReady && ytPlayer) {
    ytPlayer.playVideo();
  }
}

function pauseMusic() {
  if (ytReady && ytPlayer) {
    ytPlayer.pauseVideo();
  }
}

function isMusicPlaying() {
  if (!ytReady || !ytPlayer) return false;
  return ytPlayer.getPlayerState() === window.YT.PlayerState.PLAYING;
}

// ============================================
// ENTER SCREEN
// ============================================

function setupEnterScreen() {
  const enterBtn = document.getElementById('enter-btn');
  const enterScreen = document.getElementById('enter-screen');
  const mainContent = document.getElementById('main-content');
  const heartCanvas = document.getElementById('heart-canvas');

  // Pre-load YouTube API so it's ready when they click
  loadYouTubeAPI().then(() => createYTPlayer());

  enterBtn.addEventListener('click', () => {
    // Start heart rain
    initHeartRain();
    animateHearts();

    // Fade out enter screen
    enterScreen.classList.add('fade-out');

    // Show main content
    setTimeout(() => {
      mainContent.classList.remove('hidden');
      heartCanvas.classList.add('visible');
      enterScreen.style.display = 'none';

      // Setup scroll animations
      setupScrollAnimations();

      // Show clearance badge LAST — after all hero animations finish (~7s)
      setTimeout(() => {
        document.getElementById('clearance-badge').classList.add('visible');
      }, 7000);
    }, 1500);

    // Play music
    playMusic();

    // Add music toggle button
    addMusicToggle();
  });
}

// ============================================
// MUSIC TOGGLE
// ============================================

function addMusicToggle() {
  const toggle = document.createElement('button');
  toggle.id = 'music-toggle';
  toggle.textContent = '♫ Music';
  toggle.title = 'Toggle Music';
  document.body.appendChild(toggle);

  toggle.addEventListener('click', () => {
    if (isMusicPlaying()) {
      pauseMusic();
      toggle.classList.add('muted');
      toggle.textContent = '♫ Off';
    } else {
      playMusic();
      toggle.classList.remove('muted');
      toggle.textContent = '♫ Music';
    }
  });
}

// ============================================
// SCROLL ANIMATIONS
// ============================================

function setupScrollAnimations() {
  // Add fade-in class to section children
  const sections = document.querySelectorAll('.section-inner, .hero-content');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });

  sections.forEach(section => {
    section.classList.add('fade-in-section');
    observer.observe(section);
  });
}

// ============================================
// CURSOR HEARTS (bonus!)
// ============================================

function setupCursorHearts() {
  let lastTime = 0;
  const throttleMs = 100;

  document.addEventListener('mousemove', (e) => {
    const now = Date.now();
    if (now - lastTime < throttleMs) return;
    lastTime = now;

    const heart = document.createElement('div');
    heart.innerHTML = '♥';
    heart.style.cssText = `
      position: fixed;
      left: ${e.clientX}px;
      top: ${e.clientY}px;
      pointer-events: none;
      z-index: 9998;
      font-size: ${12 + Math.random() * 16}px;
      color: ${Math.random() > 0.5 ? '#ff2d95' : '#ff69b4'};
      opacity: 1;
      transition: all 1s ease-out;
      text-shadow: 0 0 10px currentColor;
    `;
    document.body.appendChild(heart);

    requestAnimationFrame(() => {
      heart.style.transform = `translateY(-${30 + Math.random() * 40}px) rotate(${Math.random() * 30 - 15}deg)`;
      heart.style.opacity = '0';
    });

    setTimeout(() => heart.remove(), 1000);
  });
}

// ============================================
// INIT
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  setupEnterScreen();
  setupCursorHearts();
});
