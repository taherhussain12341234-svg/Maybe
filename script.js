/* This uses Three.js to create simple representations of each artifact.
   In a full implementation, glTF models could be loaded instead. */
function init3DModels() {
  const canvas = document.querySelector('#modelCanvas');
  if (!canvas || !window.THREE) return;
  const renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:true});
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth/canvas.clientHeight, 0.1, 100);
  camera.position.set(3,2.5,5); camera.lookAt(0,0.5,0);
  scene.add(new THREE.AmbientLight(0xffffff,0.6));
  const dl = new THREE.DirectionalLight(0xffffff,0.8);
  dl.position.set(3,5,2);
  scene.add(dl);

  // Materials
  const matGray = color => new THREE.MeshStandardMaterial({color, roughness:0.7});
  // Build buggy (toy version)
  const buggy = new THREE.Group();
  scene.add(buggy);
  // Base platform
  const base = new THREE.Mesh(new THREE.BoxGeometry(2,0.1,1.1), matGray(0xc9ccd4));
  base.position.set(0,0.55,0);
  buggy.add(base);
  // Wheels (cylinders)
  const wheelGeom = new THREE.CylinderGeometry(0.35,0.35,0.2,18);
  for (let x of [-0.8,0.8]) {
    for (let z of [-0.55,0.55]) {
      const wheel = new THREE.Mesh(wheelGeom, matGray(0x333640));
      wheel.rotation.x = Math.PI/2;
      wheel.position.set(x,0.3,z);
      buggy.add(wheel);
    }
  }
  // Rover dish
  const dish = new THREE.Mesh(new THREE.ConeGeometry(0.3,0.12,20), matGray(0xeeeeee));
  dish.position.set(0.9,1.35,0);
  dish.rotation.z = Math.PI;
  buggy.add(dish);
  // Label parts
  base.userData.tooltip = 'Rover body: protects computers and electronics.';
  dish.userData.tooltip = 'Antenna dish: sends data to Earth.';
  buggy.children.filter(obj => obj.userData.tooltip).forEach(obj => {
    obj.cursor = 'pointer';
  });

  // Helicoopter
  const heli = new THREE.Group();
  heli.visible = false;
  scene.add(heli);
  const heliBody = new THREE.Mesh(new THREE.CylinderGeometry(0.4,0.4,0.5,16), matGray(0xdfe3ea));
  heliBody.position.set(0,1.3,0);
  heli.add(heliBody);
  // Rotor blades group
  const rotorGroup = new THREE.Group();
  heli.add(rotorGroup);
  const bladeMat = matGray(0xeee066);
  // two blades
  for (let y of [1.6,1.95]) {
    const blade = new THREE.Mesh(new THREE.BoxGeometry(2.2,0.025,0.12), bladeMat);
    rotorGroup.add(blade);
    blade.position.y = y;
  }
  rotorGroup.userData.tooltip = 'Counter-rotating blades (1.2m tip-to-tip) spin ~2400 rpm to lift in Mars air.';
  rotorGroup.cursor = 'pointer';

  // Surveyor 3 lander (simplified)
  const surv = new THREE.Group();
  surv.visible = false;
  scene.add(surv);
  const survBody = new THREE.Mesh(new THREE.BoxGeometry(0.9,0.5,0.9), matGray(0xdfe3ea));
  survBody.position.set(0,1,0);
  surv.add(survBody);
  const legGeom = new THREE.CylinderGeometry(0.04,0.04,1.42,12);
  for (let ang of [0, 2.09, 4.19]) {
    const leg = new THREE.Mesh(legGeom, matGray(0x9aa3b5));
    leg.position.set(0.725,0.2,0);
    leg.rotation.z = 0.56;
    leg.userData.tooltip = 'Landing leg with wide pad for soft touchdown.';
    surv.add(leg);
    leg.rotation.y = ang;
  }
  survBody.userData.tooltip = 'Surveyor 3: six-legged lander that dug soil trenches (Apr 1967).';
  survBody.cursor = 'pointer';

  // Perseverance rover (simplified)
  const pov = new THREE.Group();
  pov.visible = false;
  scene.add(pov);
  // Body
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.7,0.5,1.05), matGray(0xe8ebf5));
  body.position.set(0,0.85,0);
  pov.add(body);
  // Wheels
  const wheelMesh = new THREE.CylinderGeometry(0.3,0.3,0.22,18);
  for (let x of [-0.7,0,0.7]) {
    for (let z of [-0.7,0.7]) {
      const w = new THREE.Mesh(wheelMesh, matGray(0x2b3370));
      w.rotation.x = Math.PI/2;
      w.position.set(x,0.3,z);
      w.userData.tooltip = 'Martian rover wheel with tread (no air in Mars!).';
      pov.add(w);
    }
  }
  // Mast cameras
  const mast = new THREE.Group();
  mast.position.set(0.55,1.1,0.3);
  pov.add(mast);
  const cam1 = new THREE.Mesh(new THREE.BoxGeometry(0.34,0.2,0.2), matGray(0x222a4a));
  const cam2 = new THREE.Mesh(new THREE.BoxGeometry(0.06,0.06,0.06), new THREE.MeshStandardMaterial({color:0x38bdf8}));
  cam1.position.set(0,0.85,0);
  cam2.position.set(0.17,0.85,0.06);
  mast.add(cam1, cam2);
  mast.userData.tooltip = 'Perseverance mast: houses cameras and the laser spectrometer.';
  mast.cursor = 'pointer';

  // Raycaster for tooltips
  const raycaster = new THREE.Raycaster(), mouse = new THREE.Vector2();
  canvas.addEventListener('pointerdown', e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left)/rect.width)*2 - 1;
    mouse.y = -((e.clientY - rect.top)/rect.height)*2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects([...scene.children, ...scene.children.flatMap(g=>g.children)]);
    if (intersects.length) {
      let obj = intersects[0].object;
      while (obj && !obj.userData.tooltip) obj = obj.parent;
      if (obj && obj.userData.tooltip) {
        alert(obj.userData.tooltip); // simple popup (could be a styled tooltip)
      }
    }
  });

  // Simple animation loop
  let currentModel = 'buggy';
  function animate() {
    requestAnimationFrame(animate);
    rotorGroup.rotation.y += 0.02;
    if (currentModel==='buggy') {
      buggy.visible = true; heli.visible = surv.visible = pov.visible = false;
      buggy.rotation.y += 0.004;
    } else if (currentModel==='heli') {
      buggy.visible = false; heli.visible = true; surv.visible = pov.visible = false;
      rotorGroup.rotation.y += 0.05;
    } else if (currentModel==='surv') {
      buggy.visible = heli.visible = false; surv.visible = true; pov.visible = false;
    } else if (currentModel==='pov') {
      buggy.visible = heli.visible = surv.visible = false; pov.visible = true;
      pov.rotation.y += 0.004;
    }
    renderer.render(scene, camera);
  }
  animate();

  // Functions to switch models
  function showModel(model) {
    currentModel = model;
  }
  // Example: buttons or menu could call showModel('heli'), etc.
}
// Call on load
window.addEventListener('load', init3DModels);

// ==================== RADAR MAP ====================
const SITES = {
  moon: [
    {name:'Surveyor 3', x:0.30, y:0.62, year:1967, what:'Surveyor 3 lander (3-legged robot).', why:'No engine to lift off.', how:'Apollo 12 brought back its camera to study lunar weathering.'},
    {name:'Apollo 11 site', x:0.70, y:0.35, year:1969, what:'Lunar Laser Retroreflector array placed by Apollo 11.', why:'Only works on Moon.', how:'Lasers still bounce off it to measure the Earth–Moon distance.'},
    {name:'Apollo 15 Rover', x:0.55, y:0.78, year:1971, what:'Parked Lunar Rover at Hadley (Apollo 15).', why:'Needed space for moonrocks.', how:'Proved rovers work on Moon.'}
  ],
  mars: [
    {name:'Ingenuity', x:0.65, y:0.62, year:'2021–24', what:'First Martian helicopter (72 flights).', why:'Rotor blade broken.', how:'Demonstrated Mars flight.'},
    {name:'Perseverance LZ', x:0.30, y:0.40, year:2021, what:'Landing site of Perseverance (delivered Ingenuity).', why:'Lander descent stage stays.', how:'Mark where Mars flight began.'},
    {name:'Sample Depot', x:0.45, y:0.78, year:'2022–23', what:'Ten sealed rock tubes at Three Forks, Mars.', why:'No funded return mission.', how:'Waiting for future explorers.'}
  ]
};
let radarSweep = 0, found = {moon:0, mars:0};
const radarCanvas = $('radarMap'), radarCtx = radarCanvas.getContext('2d');
let radarWorld = 'moon';

function initRadar() {
  radarWorld = 'moon'; found = {moon:0, mars:0};
  drawRadar();
}
$('tMoon').addEventListener('click', () => { radarWorld='moon'; updateMapButtons(); drawRadar(); });
$('tMars').addEventListener('click', () => { radarWorld='mars'; updateMapButtons(); drawRadar(); });
function updateMapButtons() {
  $('tMoon').className = (radarWorld==='moon'?'':'alt');
  $('tMars').className = (radarWorld==='mars'?'':'alt');
  $('found-count').textContent = found[radarWorld]+'/3 found';
}

radarCanvas.addEventListener('click', e => {
  const rect = radarCanvas.getBoundingClientRect();
  const mx = (e.clientX-rect.left)/rect.width;
  const my = (e.clientY-rect.top)/rect.height;
  // Check each site for hit
  SITES[radarWorld].forEach((site,i) => {
    const dx = mx - site.x, dy = my - site.y;
    if (Math.hypot(dx,dy) < 0.05 && !site.found) {
      site.found = true;
      found[radarWorld]++;
      $('found-count').textContent = found[radarWorld]+'/3 found';
      // Show info
      $('info').innerHTML = &lt;h3>${site.name} · ${site.year}&lt;/h3>           &lt;p>&lt;b>What it is:&lt;/b> ${site.what}&lt;br>           &lt;b>Why it stayed:&lt;/b> ${site.why}&lt;br>           &lt;b>How it helps:&lt;/b> ${site.how}&lt;/p>;
      scoreStars(1);
    }
  });
});

function drawRadar() {
  // Clear
  radarCtx.fillStyle = '#0a0f1c';
  radarCtx.fillRect(0,0,radarCanvas.width, radarCanvas.height);
  // Draw rings & crosshair
  radarCtx.strokeStyle = '#1f6e55'; radarCtx.lineWidth=1;
  for (let i=1; i<=3; i++) {
    radarCtx.beginPath();
    radarCtx.arc(radarCanvas.width/2, radarCanvas.height/2, i*75,0,2*Math.PI);
    radarCtx.stroke();
  }
  radarCtx.beginPath();
  radarCtx.moveTo(radarCanvas.width/2,0);
  radarCtx.lineTo(radarCanvas.width/2, radarCanvas.height);
  radarCtx.moveTo(0, radarCanvas.height/2);
  radarCtx.lineTo(radarCanvas.width, radarCanvas.height/2);
  radarCtx.stroke();
  // Animate sweep (just visual, optional)
  radarSweep += 0.03;
  radarCtx.fillStyle = 'rgba(95,208,160,0.2)';
  radarCtx.beginPath();
  radarCtx.moveTo(radarCanvas.width/2, radarCanvas.height/2);
  radarCtx.arc(radarCanvas.width/2, radarCanvas.height/2, 300, radarSweep, radarSweep+0.02);
  radarCtx.lineTo(radarCanvas.width/2, radarCanvas.height/2);
  radarCtx.fill();

  // Draw sites
  SITES[radarWorld].forEach((site,i) => {
    const px = site.x * radarCanvas.width;
    const py = site.y * radarCanvas.height;
    radarCtx.beginPath();
    radarCtx.arc(px, py, 8, 0, 2*Math.PI);
    radarCtx.fillStyle = site.found ? '#ff5f5f' : (radarWorld==='moon' ? '#5fd0a0' : '#ff5f5f');
    radarCtx.fill();
    if (site.found) {
      radarCtx.fillStyle = '#eef1f7';
      radarCtx.font = '12px sans-serif';
      radarCtx.fillText(site.name, px+10, py+4);
    }
  });
  requestAnimationFrame(drawRadar);
}

// ==================== SOFT LANDING GAME ====================
const lander = {x:160, y:40, vx:0, vy:0, fuel:100, g:0.035};
let landing = false, level=0;
function startLanding() {
  level++;
  lander.x = 160; lander.y = 40;
  lander.vx = (Math.random()-0.5)*1.5;
  lander.vy = 0;
  lander.fuel = 100;
  lander.pad = 50 + Math.random()*220;
  lander.pw = Math.max(14,28-3*level);
  lander.done = false;
  landing=true;
  $('landerMsg').textContent = 'Level '+level;
}
startLanding();
const ctxL = $('gameLander').getContext('2d');
function animateLanding() {
  ctxL.clearRect(0,0,320,400);
  // Landscape
  ctxL.fillStyle='#4a5168'; ctxL.fillRect(0,372,320,28);
  // Pad
  ctxL.fillStyle='#5fd0a0'; ctxL.fillRect(lander.pad-lander.pw,370,lander.pw*2,4);
  // Lander
  ctxL.fillStyle='#eef1f7';
  ctxL.fillRect(lander.x-9,lander.y,18,12);
  ctxL.fillRect(lander.x-13,lander.y+12,4,6);
  ctxL.fillRect(lander.x+9,lander.y+12,4,6);
  // Engine flame
  if (keys.up && lander.fuel>0) {
    ctxL.fillStyle='#f2c14e';
    ctxL.beginPath();
    ctxL.moveTo(lander.x-5, lander.y+12);
    ctxL.lineTo(lander.x, lander.y+26);
    ctxL.lineTo(lander.x+5, lander.y+12);
    ctxL.fill();
  }
  // HUD
  ctxL.fillStyle='#9aa6bf'; ctxL.font='12px sans-serif';
  ctxL.fillText(Fuel ${Math.max(0,Math.floor(lander.fuel))}  Speed ${lander.vy.toFixed(1)}, 8, 16);

  if (landing) {
    // Controls: apply thrust if keys set
    if (keys.up && lander.fuel>0) { lander.vy -= 0.06; lander.fuel -= 0.35; }
    if (keys.left && lander.fuel>0) { lander.vx -= 0.025; lander.fuel -= 0.1; }
    if (keys.right && lander.fuel>0) { lander.vx += 0.025; lander.fuel -= 0.1; }
    // Gravity
    lander.vy += lander.g;
    // Move
    lander.x += lander.vx;
    lander.y += lander.vy;
    // Screen bounds
    if (lander.x<8) lander.x=8;
    if (lander.x>312) lander.x=312;
    // Check landing or crash
    if (lander.y >= 360) {
      landing=false;
      const onPad = (Math.abs(lander.x-lander.pad) < lander.pw);
      const safe = (onPad && Math.abs(lander.vx)<1 && lander.vy<1.6);
      if (safe) {
        $('landerMsg').textContent = Soft landing! Level ${level} complete.;
        scoreStars(3);
      } else if (!onPad) {
        $('landerMsg').textContent = 'Missed the pad. Try again.';
      } else {
        $('landerMsg').textContent = 'Crash! Too fast. Slow down.';
      }
    }
  }
  requestAnimationFrame(animateLanding);
}
animateLanding();

// Key handling
const keys = {left:0, right:0, up:0};
window.addEventListener('keydown', e => {
  if (e.key==='ArrowUp') keys.up=1;
  if (e.key==='ArrowLeft') keys.left=1;
  if (e.key==='ArrowRight') keys.right=1;
});
window.addEventListener('keyup', e => {
  if (e.key==='ArrowUp') keys.up=0;
  if (e.key==='ArrowLeft') keys.left=0;
  if (e.key==='ArrowRight') keys.right=0;
});
$('btnUp').addEventListener('mousedown', () => keys.up=1);
$('btnUp').addEventListener('mouseup', () => keys.up=0);
$('btnLeft').addEventListener('mousedown', () => keys.left=1);
$('btnLeft').addEventListener('mouseup', () => keys.left=0);
$('btnRight').addEventListener('mousedown', () => keys.right=1);
$('btnRight').addEventListener('mouseup', () => keys.right=0);
$('btnNew').addEventListener('click', startLanding);

// ==================== LASER AIM GAME ====================
const ctxX = $('gameLaser').getContext('2d');
let laserAngle = 0, hits=0, shots=0, targetX = Math.random()*360+60;
function drawLaser() {
  // Clear sky/ground
  ctxX.clearRect(0,0,480,180);
  ctxX.fillStyle='#4a5168'; ctxX.fillRect(0,160,480,20);
  // Mirror (target)
  ctxX.fillStyle='#d9dde6'; ctxX.fillRect(targetX-22,20,44,14);
  ctxX.fillStyle='#f2c14e'; ctxX.fillRect(targetX-14,24,28,6);
  // Laser dot moving
  const dotX = 240 + Math.sin(laserAngle*(1+hits*0.3))*200;
  ctxX.fillStyle='#5fd0a0';
  ctxX.beginPath(); ctxX.arc(dotX,150,10,0,2*Math.PI); ctxX.fill();
  // Laser line (faint)
  ctxX.strokeStyle='rgba(95,208,160,0.25)';
  ctxX.beginPath(); ctxX.moveTo(dotX, 140); ctxX.lineTo(dotX, 34); ctxX.stroke();
  laserAngle += 0.03;
  requestAnimationFrame(drawLaser);
}
drawLaser();

// Fire button
$('btnFire').addEventListener('click', () => {
  const dotX = 240 + Math.sin(laserAngle*(1+hits*0.3))*200;
  shots++;
  // If hit (within 22 px)
  if (Math.abs(dotX-targetX) < 22) {
    hits++;
    scoreStars(1);
    $('laserMsg').textContent = Hit! ${hits}/5;
    if (hits===5) {
      $('laserMsg').textContent = Great! ${hits}/5 hits in ${shots} shots.;
      // Reset after short delay
      setTimeout(() => {
        hits=0; shots=0;
        $('laserMsg').textContent='';
        targetX = Math.random()*360+60;
      }, 1000);
    }
  } else {
    $('laserMsg').textContent = Miss. ${hits}/5;
  }
});

// ==================== STORY QUIZ & TIMELINE ====================
const quizQuestions = [
  {
    q: "Why did Surveyor 3 stay on the Moon?",
    choices: ["It had no way to lift off", "It was lost", "It was too heavy to see"],
    answer: 0
  },
  {
    q: "What do scientists bounce off the Apollo mirrors?",
    choices: ["Radio songs", "Laser light", "Sunshine"],
    answer: 1
  },
  {
    q: "Why did Apollo 15 leave the buggy behind?",
    choices: ["It broke", "Needed room/fuel for rocks", "Nobody liked it"],
    answer: 1
  },
  {
    q: "What did Ingenuity prove?",
    choices: ["Mars has no wind", "Helicopters can fly on Mars", "Mars has oceans"],
    answer: 1
  },
  {
    q: "What is waiting on the ground at the Mars depot?",
    choices: ["Ten sealed sample tubes", "A spare helicopter", "A flag"],
    answer: 0
  }
];
let quizIndex=0, quizScore=0;
function showQuiz() {
  const container = $('quizContainer');
  if (quizIndex >= quizQuestions.length) {
    container.innerHTML = &lt;h3>You scored ${quizScore}/${quizQuestions.length}&lt;/h3>         &lt;p>${quizScore > 4 ? 'Mission expert!' : 'Try again to learn more.'}&lt;/p>         &lt;button id="quizRestart">Play again&lt;/button>;
    $('quizRestart').addEventListener('click', () => {
      quizIndex=0; quizScore=0; showQuiz();
    });
    return;
  }
  const q = quizQuestions[quizIndex];
  let html = &lt;div class="quiz">&lt;p>&lt;b>${quizIndex+1}. ${q.q}&lt;/b>&lt;/p>;
  q.choices.forEach((choice,i) => {
    html += &lt;button data-i="${i}">${choice}&lt;/button>;
  });
  html += &lt;/div>;
  container.innerHTML = html;
  container.querySelectorAll('button').forEach(btn => {
    btn.onclick = () => {
      const selected = +btn.dataset.i;
      if (selected === q.answer) { quizScore++; scoreStars(1); btn.classList.add('correct'); }
      else { btn.classList.add('wrong'); }
      // disable all
      container.querySelectorAll('button').forEach(b => b.disabled=true);
      setTimeout(() => { quizIndex++; showQuiz(); }, 800);
    };
  });
}
showQuiz();

// Timeline game
const timelineEvents = [
  {year:1967, text:"Surveyor 3 lands"},
  {year:1969, text:"Apollo 11 leaves a mirror"},
  {year:1971, text:"Apollo 15 parks the buggy"},
  {year:2021, text:"Ingenuity flies on Mars"},
  {year:2023, text:"Mars sample tubes set down"}
];
let timelineOrder = [], timelineScore=0, timelineMsg = $('timelineMsg');
function initTimeline() {
  const container = $('timelineButtons');
  container.innerHTML = '';
  // Shuffle events
  const shuffled = timelineEvents.slice().sort(() => Math.random()-0.5);
  shuffled.forEach((ev,i) => {
    const btn = document.createElement('button');
    btn.className='alt';
    btn.textContent = ev.text;
    btn.onclick = () => {
      if (ev.year === timelineEvents[timelineScore].year) {
        btn.disabled=true; btn.classList.remove('alt'); btn.classList.add('correct');
        scoreStars(1);
        timelineScore++;
        if (timelineScore === timelineEvents.length) {
          timelineMsg.textContent = "Perfect timeline! 🎉 Bonus stars earned.";
          scoreStars(3);
        } else {
          timelineMsg.textContent = '';
        }
      } else {
        timelineMsg.textContent = 'Wrong order. Try again from start.';
        // reset
        timelineScore = 0;
        initTimeline();
      }
    };
    container.append(btn);
  });
  timelineMsg.textContent = '';
  timelineScore = 0;
}
initTimeline();

// =============== EXPLORER STARS AND BADGE ===============
let stars = 0;
function scoreStars(n) {
  stars += n;
  const rankNames = ['Rookie','Space Cadet','Astronaut','Commander','Legend'];
  let rank = rankNames[0];
  if (stars >= 5) rank = rankNames[1];
  if (stars >= 12) rank = rankNames[2];
  if (stars >= 20) rank = rankNames[3];
  if (stars >= 30) rank = rankNames[4];
  $('page-indicator').textContent = ★ ${stars} · ${rank};
  $('rank').textContent = You have ★ ${stars}. Rank: ${rank}!;
}

// Initialize UI
initPages();
updateNav();
