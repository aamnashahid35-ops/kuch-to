let gameState = "TITLE"; // TITLE, CUSTOMIZE, BRIEFING, SELECT, GAME, COMPLETE, GAMEOVER
let currentMission = 0;
let currentScenario = 0;
let badgesEarned = 0;
let correctAnswersCount = 0;

let cadetName = "Cadet Orion";

// Mission Reward Titles
let missionRewards = [
  "🌙 Lunar Dust Master",
  "🌪️ Martian Storm Rider",
  "🛰️ Orbital Docking Pro",
  "🚀 Deep Space Navigator",
  "⭐ Asteroid Outpost Hero"
];
let unlockedRewards = [];

// Avatar Customization State
let suitColorIndex = 0;
let suitColors = [
  { name: "Classic White", col: [240, 244, 248] },
  { name: "Cosmic Gold", col: [250, 204, 21] },
  { name: "Nebula Blue", col: [56, 189, 248] },
  { name: "Martian Crimson", col: [239, 68, 68] }
];

let visorIndex = 0;
let visorStyles = ["Dark Obsidian", "Golden Glow", "Cyan Hologram", "Emerald Tint"];

let faceIndex = 0;
let faceTypes = ["😊 Happy Smile", "😎 Star-Eyed", "🤓 Tech-Geek", "🚀 Determined"];

let resources = {
  oxygen: 100,
  water: 100,
  food: 100,
  power: 100
};

let particles = [];
let celebrationParticles = [];
let audioCtx = null;
let bgmInterval = null;

function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    startBGM();
  }
}

// Background music loop
function startBGM() {
  if (bgmInterval) return;
  bgmInterval = setInterval(() => {
    if (!audioCtx || gameState === "TITLE") return;
    let now = audioCtx.currentTime;
    let chord = [261.63, 329.63, 392.00, 523.25];
    chord.forEach((freq, idx) => {
      let osc = audioCtx.createOscillator();
      let gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + (idx * 0.2));
      gain.gain.setValueAtTime(0.001, now + (idx * 0.2));
      gain.gain.linearRampToValueAtTime(0.04, now + (idx * 0.2) + 0.4);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + (idx * 0.2) + 2.0);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now + (idx * 0.2));
      osc.stop(now + (idx * 0.2) + 2.2);
    });
  }, 4000);
}

function playClickSound() {
  initAudio();
  if (!audioCtx) return;
  let now = audioCtx.currentTime;
  let osc = audioCtx.createOscillator();
  let gain = audioCtx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(440, now);
  osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);
  gain.gain.setValueAtTime(0.2, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(now);
  osc.stop(now + 0.08);
}

function playVictorySound() {
  initAudio();
  if (!audioCtx) return;
  let now = audioCtx.currentTime;
  let notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
  notes.forEach((freq, index) => {
    let osc = audioCtx.createOscillator();
    let gain = audioCtx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, now + index * 0.12);
    gain.gain.setValueAtTime(0.3, now + index * 0.12);
    gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.12 + 0.5);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now + index * 0.12);
    osc.stop(now + index * 0.12 + 0.5);
  });
}

function playSuccessSound() {
  initAudio();
  if (!audioCtx) return;
  let now = audioCtx.currentTime;
  let notes = [587.33, 880.00, 1174.66];
  notes.forEach((freq, index) => {
    let osc = audioCtx.createOscillator();
    let gain = audioCtx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now + index * 0.1);
    gain.gain.setValueAtTime(0.3, now + index * 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.1 + 0.4);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now + index * 0.1);
    osc.stop(now + index * 0.1 + 0.4);
  });
}

function playAlarmSound() {
  initAudio();
  if (!audioCtx) return;
  let now = audioCtx.currentTime;
  let osc = audioCtx.createOscillator();
  let gain = audioCtx.createGain();
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(160, now);
  osc.frequency.setValueAtTime(110, now + 0.15);
  osc.frequency.setValueAtTime(160, now + 0.3);
  gain.gain.setValueAtTime(0.35, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(now);
  osc.stop(now + 0.5);
}

const missions = [
  {
    id: 1,
    title: "Mission 1: Lunar Base Arrival",
    location: "Moon Outpost",
    briefing: "Welcome to the Moon! The Moon has no atmosphere, extreme thermal shifts, and abrasive lunar regolith dust that clings tightly to space suits and clogs air intake valves.\n\nReal NASA Procedure: When Apollo astronauts faced dust accumulation on equipment, they used specialized vacuum brushes and electrostatic dust removal tools. They strictly avoided using high-pressure gas reserves because venting oxygen compromises life support safety.",
    scenarios: [
      {
        question: "Dust is clogging your habitat air filter. How do you clear it?",
        options: [
          { text: "Blast high-pressure oxygen directly from reserve tanks.", correct: false, eff: { oxygen: -25, power: -10 }, feedback: "Consequence! Venting high-pressure oxygen wastes vital breathing air reserves." },
          { text: "Use specialized vacuum brush and gentle cleaning tools.", correct: true, eff: { oxygen: 5, power: -5 }, feedback: "Correct! Regular maintenance saves gas and protects life support filters." },
          { text: "Ignore the dust and turn off habitat ventilation.", correct: false, eff: { oxygen: -35, power: -15 }, feedback: "Consequence! Stagnant air builds up toxic carbon dioxide levels." }
        ]
      },
      {
        question: "The water recycler needs a filter cartridge change. What do you do?",
        options: [
          { text: "Follow the checklist and swap the carbon filter cartridge.", correct: true, eff: { water: 10, power: -5 }, feedback: "Correct! Standard procedures ensure safe, clean drinking water." },
          { text: "Skip the swap to save time and drink raw gray water.", correct: false, eff: { water: -30, food: -10 }, feedback: "Consequence! Unfiltered water causes equipment contamination and illness." },
          { text: "Flush the entire system with raw seawater brought from Earth.", correct: false, eff: { water: -40, power: -20 }, feedback: "Consequence! Salt ruins internal recycling membranes permanently." }
        ]
      },
      {
        question: "Lunar night is approaching (lasts 14 Earth days). Power action?",
        options: [
          { text: "Keep all base floodlights and research equipment at max brightness.", correct: false, eff: { power: -40, oxygen: -10 }, feedback: "Consequence! Batteries drain completely, cutting off habitat power." },
          { text: "Disconnect all cords and rely entirely on burning station trash.", correct: false, eff: { power: -30, food: -20 }, feedback: "Consequence! Toxic smoke fills the habitat cabin." },
          { text: "Angle solar panels to batteries & switch to low-draw mode.", correct: true, eff: { power: 10, oxygen: -5 }, feedback: "Correct! Conserving power keeps life support running through the dark." }
        ]
      }
    ]
  },
  {
    id: 2,
    title: "Mission 2: Martian Dust Storm",
    location: "Mars Habitat",
    briefing: "Mars features a thin CO2 atmosphere, sub-zero temperatures, and global dust storms that block sunlight for weeks. Conserving battery power and protecting mechanical equipment is critical.\n\nReal NASA Procedure: During Martian dust storms, rovers and habitat systems enter safe-mode. Astronauts retract solar arrays to prevent abrasion damage and switch to backup geothermal or nuclear power cells.",
    scenarios: [
      {
        question: "A massive dust storm hits your solar panels! Immediate action?",
        options: [
          { text: "Retract arrays & switch to backup geothermal cell.", correct: true, eff: { power: -10 }, feedback: "Correct! Protecting delicate panels from abrasive dust saves energy." },
          { text: "Leave solar panels wide open to catch any scattered light.", correct: false, eff: { power: -45, water: -10 }, feedback: "Consequence! Fine abrasive dust permanently ruins the solar cells." },
          { text: "Send a crew member outside with a broom during the storm.", correct: false, eff: { oxygen: -50, water: -25 }, feedback: "Consequence! High-speed storm winds blow the astronaut away." }
        ]
      },
      {
        question: "The storm blocks light for greenhouse crops. How do you ration?",
        options: [
          { text: "Provide LED spectrum light only to high-yield crops.", correct: true, eff: { food: 5, power: -10 }, feedback: "Correct! Smart load-shedding keeps crops alive without a blackout." },
          { text: "Turn off all greenhouse lights entirely to save 100% power.", correct: false, eff: { food: -35, oxygen: -10 }, feedback: "Consequence! Crops wither away and habitat oxygen levels drop." },
          { text: "Feed the plants standard astronaut freeze-dried meals.", correct: false, eff: { food: -20, power: -15 }, feedback: "Consequence! Plants cannot eat human food and perish." }
        ]
      },
      {
        question: "Before stepping outside into the Martian atmosphere, you must:",
        options: [
          { text: "Skip the check to hurry outside and save 5 minutes.", correct: false, eff: { oxygen: -40, water: -15 }, feedback: "Consequence! An unnoticed valve leak causes rapid oxygen depletion." },
          { text: "Check helmet seal, suit pressure, and oxygen backpack.", correct: true, eff: { oxygen: 10 }, feedback: "Correct! Pre-checks prevent catastrophic pressure leaks." },
          { text: "Wear a regular winter jacket over your normal clothes.", correct: false, eff: { oxygen: -50, food: -20 }, feedback: "Consequence! Freezing temperatures and lack of pressure incapacitate you instantly." }
        ]
      }
    ]
  },
  {
    id: 3,
    title: "Mission 3: Orbital Space Station Docking",
    location: "Low Earth Orbit",
    briefing: "Operating in Low Earth Orbit means microgravity challenges, orbital debris avoidance, and precise spacecraft docking requirements.\n\nReal NASA Procedure: Astronauts approach docking ports using meticulous micro-thruster burns, keeping closing speeds well under 0.2 meters per second to avoid damaging station seals. Strict waste containment and daily resistance exercise are mandatory to prevent muscle atrophy.",
    scenarios: [
      {
        question: "Approaching the space station module. Safe docking speed is:",
        options: [
          { text: "Speed up to finish quickly before dinner time.", correct: false, eff: { power: -30, oxygen: -20 }, feedback: "Consequence! Hard impact damages the station port and seals." },
          { text: "Slow micro-adjustments well under 0.2 m/s.", correct: true, eff: { power: -5 }, feedback: "Correct! Precision maneuvers prevent docking collar damage." },
          { text: "Ram into the station hatch at full thruster power to lock instantly.", correct: false, eff: { power: -50, oxygen: -30 }, feedback: "Consequence! Catastrophic hull breach triggers emergency bulkhead closure." }
        ]
      },
      {
        question: "How do you pack solid waste for disposal and atmospheric burn-up?",
        options: [
          { text: "Leave waste floating loosely in storage lockers.", correct: false, eff: { oxygen: -30, food: -15 }, feedback: "Consequence! Unsecured waste floats into ventilation filters." },
          { text: "Throw waste out of the airlock window into open space.", correct: false, eff: { water: -25, power: -20 }, feedback: "Consequence! Creates dangerous high-speed space debris orbiting Earth." },
          { text: "Seal securely in designated disposal cargo bags.", correct: true, eff: { water: 5 }, feedback: "Correct! Proper containment maintains cabin hygiene." }
        ]
      },
      {
        question: "Why must astronauts complete daily resistance exercise in space?",
        options: [
          { text: "To prevent muscle weakening and bone density loss.", correct: true, eff: { food: 10, water: -5 }, feedback: "Correct! Resistance training keeps you strong for return to Earth gravity." },
          { text: "Skip exercise to play zero-gravity video games all day.", correct: false, eff: { food: -25, water: -25 }, feedback: "Consequence! Lack of exercise causes severe physical fatigue and muscle loss." },
          { text: "To generate electricity for the station by pedaling a bicycle.", correct: false, eff: { power: -20, food: -15 }, feedback: "Consequence! Exercise machines use power rather than generate enough." }
        ]
      }
    ]
  },
  {
    id: 4,
    title: "Mission 4: Deep Space Deep Dive",
    location: "Deep Space Transit",
    briefing: "Far from Earth, deep space exposes travelers to intense cosmic radiation and solar flare hazards. Communication delays require total crew self-reliance.\n\nReal NASA Procedure: During solar particle events, astronauts take shelter in central station compartments shielded by dense water tanks and food storage. With 30-minute radio signal delays, crews rely on onboard computer manuals rather than waiting for Mission Control.",
    scenarios: [
      {
        question: "Solar flare warning alert! High radiation incoming. Where do you go?",
        options: [
          { text: "Move crew into water-shielded storm shelter.", correct: true, eff: { power: -10, oxygen: 5 }, feedback: "Correct! Water acts as a natural radiation shield." },
          { text: "Stay in observation cupola to watch the light show.", correct: false, eff: { oxygen: -40, food: -20 }, feedback: "Consequence! Unshielded radiation exposure triggers emergency lockdown." },
          { text: "Put on sunglasses and stand next to the window.", correct: false, eff: { oxygen: -50, food: -30 }, feedback: "Consequence! Cosmic radiation penetrates glass and harms crew health." }
        ]
      },
      {
        question: "A glitch occurs with a 30-minute Earth communication delay. Action?",
        options: [
          { text: "Wait helplessly for Mission Control to reply before moving.", correct: false, eff: { power: -35, oxygen: -25 }, feedback: "Consequence! Waiting 60 round-trip minutes lets a minor glitch escalate." },
          { text: "Rely on onboard computer training manuals to solve it.", correct: true, eff: { power: -5 }, feedback: "Correct! Deep space astronauts must be self-reliant problem solvers." },
          { text: "Unplug the main computer and hit it with a wrench.", correct: false, eff: { power: -45, oxygen: -20 }, feedback: "Consequence! Destroys essential navigation systems." }
        ]
      },
      {
        question: "Moisture sensors indicate a daily hydration imbalance. You:",
        options: [
          { text: "Chug massive amounts at once and skip drinking later.", correct: false, eff: { water: -35, power: -10 }, feedback: "Consequence! Irregular hydration strains body chemistry and recyclers." },
          { text: "Stop drinking water entirely to save storage space.", correct: false, eff: { water: -50, food: -20 }, feedback: "Consequence! Severe dehydration leads to crew collapse." },
          { text: "Drink exact measured electrolyte pouches recommended.", correct: true, eff: { water: 15 }, feedback: "Correct! Proper hydration balance keeps crew alertness high." }
        ]
      }
    ]
  },
  {
    id: 5,
    title: "Mission 5: Asteroid Outpost Rescue",
    location: "Near-Earth Asteroid",
    briefing: "Landing on a tumbling Near-Earth Asteroid involves near-zero gravity and rugged terrain. You must anchor securely and manage equipment thermal limits.\n\nReal NASA Procedure: Astronauts secure themselves using magnetic tether spikes to prevent floating away in microgravity. When core drilling equipment overheats during sample extraction, crews practice patient thermal management by pausing work to let diamond bits cool naturally.",
    scenarios: [
      {
        question: "Landing on a tumbling near-zero gravity asteroid. How do you anchor?",
        options: [
          { text: "Deploy magnetic tether spikes and secure slowly.", correct: true, eff: { power: -10, oxygen: 5 }, feedback: "Correct! Magnetic anchors prevent your team from drifting into space." },
          { text: "Jump out of the lander and catch yourself on a rock.", correct: false, eff: { oxygen: -45, water: -20 }, feedback: "Consequence! Without gravity, you float away burning jetpack fuel." },
          { text: "Tie yourself to a balloon filled with helium.", correct: false, eff: { oxygen: -40, power: -30 }, feedback: "Consequence! Balloons require atmospheric pressure and fail in space." }
        ]
      },
      {
        question: "Drilling for ice core samples when the drill core overheats:",
        options: [
          { text: "Force the drill faster through the rock to finish quickly.", correct: false, eff: { power: -40, food: -10 }, feedback: "Consequence! Overheating fries the drill motor and ruins samples." },
          { text: "Pause drilling to let the diamond bit cool down naturally.", correct: true, eff: { water: 10, power: -5 }, feedback: "Correct! Patient thermal management protects science gear." },
          { text: "Pour hot coffee onto the drill bit to warm it up.", correct: false, eff: { water: -30, power: -20 }, feedback: "Consequence! Adding heat to an overheated motor destroys it instantly." }
        ]
      },
      {
        question: "Return thruster igniter misfires at departure time. You:",
        options: [
          { text: "Give up and wait for an alien spacecraft rescue.", correct: false, eff: { oxygen: -50, power: -40 }, feedback: "Consequence! Waiting around depletes your emergency oxygen reserves." },
          { text: "Hit the thruster housing repeatedly with a hammer.", correct: false, eff: { power: -35, oxygen: -25 }, feedback: "Consequence! Damages delicate fuel valves." },
          { text: "Run diagnostic loop on backup igniter circuits with manual override.", correct: true, eff: { power: -5, oxygen: 5 }, feedback: "Correct! Manual overrides are crucial astronaut survival skills." }
        ]
      }
    ]
  }
];

let feedbackMessage = "";
let isCorrectAnswer = false;
let showFeedbackPopup = false;

function setup() {
  createCanvas(800, 600);
  textAlign(CENTER, CENTER);
  rectMode(CORNER);

  for (let i = 0; i < 60; i++) {
    particles.push({
      x: random(width),
      y: random(height),
      size: random(1.5, 4),
      speed: random(0.2, 1),
      alpha: random(100, 255)
    });
  }
}

function draw() {
  drawMaximalReferenceBackground();
  updateAndDrawCelebrationParticles();

  if (gameState === "TITLE") {
    drawTitleScreen();
  } else if (gameState === "CUSTOMIZE") {
    drawCustomizeScreen();
  } else if (gameState === "BRIEFING") {
    drawBriefingScreen();
  } else if (gameState === "SELECT") {
    drawSelectScreen();
  } else if (gameState === "GAME") {
    drawGameScreen();
  } else if (gameState === "COMPLETE") {
    drawCompleteScreen();
  } else if (gameState === "GAMEOVER") {
    drawGameOverScreen();
  }
}

function drawMaximalReferenceBackground() {
  background(11, 23, 56);
  noStroke();
  for (let p of particles) {
    p.y += p.speed;
    if (p.y > height) {
      p.y = 0;
      p.x = random(width);
    }
    fill(255, 255, 255, p.alpha);
    ellipse(p.x, p.y, p.size, p.size);
  }

  // Planet & Moon[cite: 4]
  push();
  fill(249, 115, 22);
  arc(50, 70, 140, 140, -QUARTER_PI, HALF_PI + QUARTER_PI);
  fill(234, 88, 12, 200);
  arc(50, 70, 110, 110, -QUARTER_PI, HALF_PI);
  noFill();
  stroke(255, 220, 150, 180);
  strokeWeight(4);
  ellipse(50, 70, 170, 50);
  pop();

  // Cartoon Astronaut[cite: 4]
  push();
  translate(95, 260);
  rotate(-0.1);
  fill(240, 244, 248);
  stroke(56, 189, 248);
  strokeWeight(2);
  ellipse(0, 30, 55, 65);
  fill(240, 244, 248);
  ellipse(0, -15, 65, 65);
  fill(15, 23, 42);
  noStroke();
  ellipse(0, -15, 50, 45);
  stroke(240, 244, 248);
  strokeWeight(8);
  line(-25, 20, -50, -10);
  pop();

  // Space Shuttle[cite: 4]
  push();
  translate(100, 480);
  fill(249, 115, 22);
  ellipse(-20, 70, 60, 40);
  fill(250, 204, 21);
  ellipse(-20, 70, 30, 20);
  fill(255, 255, 255, 200);
  ellipse(-40, 80, 80, 40);
  ellipse(10, 90, 70, 40);
  rotate(-QUARTER_PI * 0.4);
  fill(240, 244, 248);
  stroke(30, 41, 59);
  strokeWeight(2);
  rect(-20, -50, 40, 100, 15);
  fill(239, 68, 68);
  ellipse(0, -10, 14, 14);
  fill(15, 23, 42);
  rect(-8, -35, 16, 15, 4);
  pop();

  // Glowing Earth[cite: 4]
  push();
  translate(720, 530);
  fill(14, 116, 144);
  noStroke();
  ellipse(0, 0, 320, 320);
  fill(74, 222, 128, 220);
  beginShape();
  vertex(-60, -80);
  bezierVertex(-10, -100, 40, -60, 80, -20);
  bezierVertex(100, 40, 40, 100, -20, 80);
  bezierVertex(-80, 60, -100, -20, -60, -80);
  endShape(CLOSE);
  fill(255, 255, 255, 180);
  ellipse(-40, -40, 70, 25);
  ellipse(30, 30, 90, 30);
  pop();

  // Cockpit Dashboard[cite: 4]
  push();
  fill(30, 41, 59);
  stroke(56, 189, 248);
  strokeWeight(3);
  beginShape();
  vertex(-50, 650);
  vertex(100, 530);
  vertex(300, 510);
  vertex(500, 510);
  vertex(700, 530);
  vertex(850, 650);
  endShape(CLOSE);
  fill(6, 182, 212);
  rect(150, 560, 80, 25, 6);
  rect(570, 560, 80, 25, 6);
  fill(255, 215, 0);
  stroke(255);
  strokeWeight(2);
  ellipse(400, 535, 45, 45);
  pop();
}

function triggerCelebration() {
  for (let i = 0; i < 50; i++) {
    celebrationParticles.push({
      x: width / 2,
      y: height / 2,
      vx: random(-7, 7),
      vy: random(-7, 7),
      col: color(random(100, 255), random(100, 255), 255),
      size: random(6, 14),
      life: 255
    });
  }
}

function updateAndDrawCelebrationParticles() {
  for (let i = celebrationParticles.length - 1; i >= 0; i--) {
    let cp = celebrationParticles[i];
    cp.x += cp.vx;
    cp.y += cp.vy;
    cp.life -= 5;

    fill(cp.col._getRed(), cp.col._getGreen(), cp.col._getBlue(), cp.life);
    noStroke();
    ellipse(cp.x, cp.y, cp.size, cp.size);

    if (cp.life <= 0) {
      celebrationParticles.splice(i, 1);
    }
  }
}

function drawTitleScreen() {
  fill(16, 35, 80, 245);
  stroke(56, 189, 248);
  strokeWeight(3.5);
  rect(110, 60, 580, 440, 28);

  noStroke();
  fill(250, 204, 21);
  textSize(16);
  text("✨ NASA CADET SPACE ACADEMY ✨", 400, 100);

  fill(255);
  textSize(28);
  text("Junior Astronaut Trainer", 400, 142);

  drawAvatarPreview(400, 225, 75);

  fill(74, 222, 128);
  textSize(15);
  text(`Cadet: ${cadetName} | Face: ${faceTypes[faceIndex]}`, 400, 295);

  // Customize Button
  fill(56, 189, 248);
  stroke(255);
  strokeWeight(2);
  rect(280, 338, 240, 48, 16);
  noStroke();
  fill(8, 15, 38);
  textSize(17);
  text("🎨 Customize Avatar", 400, 362);

  // Launch Button
  fill(74, 222, 128);
  stroke(255);
  strokeWeight(2);
  rect(280, 402, 240, 48, 16);
  noStroke();
  fill(8, 15, 38);
  textSize(17);
  text("🚀 Launch Missions!", 400, 426);
}

function drawCustomizeScreen() {
  fill(16, 35, 80, 250);
  stroke(56, 189, 248);
  strokeWeight(3.5);
  rect(110, 45, 580, 460, 28);

  noStroke();
  fill(250, 204, 21);
  textSize(24);
  text("🎨 Astronaut Customizer", 400, 80);

  drawAvatarPreview(400, 145, 65);

  // Suit Color Button
  fill(35, 50, 95);
  stroke(56, 189, 248);
  strokeWeight(2);
  rect(170, 205, 460, 40, 14);
  noStroke();
  fill(255);
  textSize(15);
  text(`Suit Theme: ${suitColors[suitColorIndex].name} (Click)`, 400, 225);

  // Visor Style Button
  fill(35, 50, 95);
  stroke(56, 189, 248);
  strokeWeight(2);
  rect(170, 255, 460, 40, 14);
  noStroke();
  fill(255);
  textSize(15);
  text(`Visor Style: ${visorStyles[visorIndex]} (Click)`, 400, 275);

  // Facial Expression Button
  fill(35, 50, 95);
  stroke(56, 189, 248);
  strokeWeight(2);
  rect(170, 305, 460, 40, 14);
  noStroke();
  fill(255);
  textSize(15);
  text(`Expression: ${faceTypes[faceIndex]} (Click)`, 400, 325);

  fill(56, 189, 248);
  textSize(13);
  text("✨ Click boxes to style your space suit! ✨", 400, 370);

  // Done Button
  fill(74, 222, 128);
  stroke(255);
  strokeWeight(2);
  rect(280, 395, 240, 42, 14);
  noStroke();
  fill(8, 15, 38);
  textSize(16);
  text("Save & Back ➔", 400, 416);
}

function drawAvatarPreview(x, y, sz) {
  let suitCol = suitColors[suitColorIndex].col;
  
  fill(suitCol[0], suitCol[1], suitCol[2]);
  stroke(255);
  strokeWeight(2);
  ellipse(x, y + sz * 0.5, sz * 1.2, sz * 0.9);

  fill(240, 244, 248, 230);
  stroke(56, 189, 248);
  strokeWeight(2);
  ellipse(x, y, sz, sz);

  if (visorIndex === 0) fill(15, 23, 42);
  else if (visorIndex === 1) fill(234, 179, 8);
  else if (visorIndex === 2) fill(6, 182, 212);
  else fill(16, 185, 129);

  noStroke();
  ellipse(x, y, sz * 0.75, sz * 0.6);

  fill(250, 204, 21);
  if (faceIndex === 0) {
    ellipse(x - sz * 0.15, y - sz * 0.05, 5, 5);
    ellipse(x + sz * 0.15, y - sz * 0.05, 5, 5);
    noFill();
    stroke(250, 204, 21);
    strokeWeight(2);
    arc(x, y + sz * 0.05, 16, 12, 0, PI);
  } else if (faceIndex === 1) {
    textSize(14);
    text("⭐ ⭐", x, y - 2);
    noFill();
    stroke(250, 204, 21);
    strokeWeight(2);
    arc(x, y + sz * 0.08, 14, 10, 0, PI);
  } else if (faceIndex === 2) {
    noFill();
    stroke(56, 189, 248);
    strokeWeight(2);
    rect(x - sz * 0.22, y - sz * 0.12, 16, 12, 3);
    rect(x + sz * 0.06, y - sz * 0.12, 16, 12, 3);
    line(x - sz * 0.06, y - sz * 0.06, x + sz * 0.06, y - sz * 0.06);
    noStroke();
    fill(250, 204, 21);
    ellipse(x, y + sz * 0.1, 10, 6);
  } else {
    stroke(250, 204, 21);
    strokeWeight(2);
    line(x - sz * 0.22, y - sz * 0.08, x - sz * 0.08, y - sz * 0.02);
    line(x + sz * 0.22, y - sz * 0.08, x + sz * 0.08, y - sz * 0.02);
    noFill();
    rect(x - sz * 0.12, y + sz * 0.05, sz * 0.24, 4, 2);
  }
}

function drawBriefingScreen() {
  fill(16, 35, 80, 245);
  stroke(56, 189, 248);
  strokeWeight(3.5);
  rect(80, 40, 640, 460, 28);

  noStroke();
  fill(250, 204, 21);
  textSize(14);
  text("📜 MISSION BRIEFING & ENVIRONMENT INFO 📜", 400, 70);

  let mission = missions[currentMission];
  fill(255);
  textSize(22);
  text(mission.title, 400, 105);

  fill(11, 23, 56, 220);
  stroke(56, 189, 248, 120);
  strokeWeight(2);
  rect(110, 130, 580, 260, 16);

  noStroke();
  fill(226, 232, 240);
  textSize(14);
  textAlign(LEFT, TOP);
  text(mission.briefing, 130, 145, 540, 235);
  textAlign(CENTER, CENTER);

  fill(74, 222, 128);
  stroke(255);
  strokeWeight(2);
  rect(280, 415, 240, 45, 14);
  noStroke();
  fill(8, 15, 38);
  textSize(17);
  text("Begin Mission ➔", 400, 437);
}

function drawSelectScreen() {
  fill(16, 35, 80, 240);
  stroke(56, 189, 248);
  strokeWeight(3.5);
  rect(60, 40, 680, 460, 28);

  noStroke();
  fill(250, 204, 21);
  textSize(26);
  text("🛸 CHOOSE TRAINING MISSION 🛸", 400, 80);

  for (let i = 0; i < missions.length; i++) {
    let yPos = 115 + (i * 72);
    fill(30, 45, 85, 220);
    stroke(56, 189, 248, 150);
    strokeWeight(2);
    rect(100, yPos, 600, 60, 14);

    noStroke();
    fill(255);
    textSize(16);
    textAlign(LEFT, CENTER);
    text(missions[i].title, 120, yPos + 30);

    fill(74, 222, 128);
    stroke(255);
    strokeWeight(1.5);
    rect(560, yPos + 12, 120, 34, 10);
    noStroke();
    fill(8, 15, 38);
    textSize(14);
    textAlign(CENTER, CENTER);
    text("Launch 🚀", 620, yPos + 29);
  }
}

function drawGameScreen() {
  // Top Status Bar[cite: 4]
  fill(16, 35, 80, 245);
  stroke(56, 189, 248);
  strokeWeight(2.5);
  rect(40, 20, 720, 75, 20);

  noStroke();
  fill(255);
  textSize(15);
  textAlign(LEFT, CENTER);
  text(`${cadetName} | ${missions[currentMission].title}`, 60, 42);

  drawMeter(60, 65, "O₂", resources.oxygen, color(59, 130, 246));
  drawMeter(240, 65, "Water", resources.water, color(6, 182, 212));
  drawMeter(420, 65, "Food", resources.food, color(16, 185, 129));
  drawMeter(600, 65, "Power", resources.power, color(245, 158, 11));

  // Pause Button[cite: 4]
  fill(16, 35, 80, 245);
  stroke(56, 189, 248);
  strokeWeight(2.5);
  ellipse(745, 58, 44, 44);
  fill(255);
  noStroke();
  rect(738, 48, 4, 20, 2);
  rect(748, 48, 4, 20, 2);

  // Main Quiz Container Box[cite: 4]
  fill(16, 35, 80, 250);
  stroke(56, 189, 248);
  strokeWeight(3.5);
  rect(60, 110, 680, 390, 28);

  // Scenario Header Pill[cite: 4]
  fill(25, 50, 105);
  stroke(56, 189, 248);
  strokeWeight(2);
  rect(310, 95, 180, 36, 18);
  noStroke();
  fill(250, 204, 21);
  textSize(14);
  text("⭐", 330, 113);
  text("⭐", 470, 113);
  fill(255);
  textSize(14);
  textAlign(CENTER, CENTER);
  text(`Scenario ${currentScenario + 1} of 3`, 400, 113);

  // Astronaut Cat[cite: 4]
  push();
  translate(690, 125);
  fill(40, 40, 50);
  ellipse(-12, 12, 16, 14);
  ellipse(12, 12, 16, 14);
  fill(240, 244, 248, 240);
  stroke(56, 189, 248);
  strokeWeight(2.5);
  ellipse(0, 0, 75, 75);
  fill(15, 23, 42);
  noStroke();
  ellipse(0, 0, 58, 52);
  fill(30, 30, 40);
  ellipse(0, 4, 38, 32);
  triangle(-18, -8, -12, -22, -4, -10);
  triangle(18, -8, 12, -22, 4, -10);
  fill(250, 204, 21);
  ellipse(-8, 2, 7, 10);
  ellipse(8, 2, 7, 10);
  fill(15, 23, 42);
  ellipse(-8, 2, 3, 6);
  ellipse(8, 2, 3, 6);
  pop();

  // Question Text[cite: 4]
  noStroke();
  fill(250, 204, 21);
  textSize(17); 
  textAlign(CENTER, CENTER);
  let scenario = missions[currentMission].scenarios[currentScenario];
  text(scenario.question, 90, 160, 620, 45);

  // Option Cards[cite: 4]
  let optionIcons = ["⚡", "🛰️", "🚀"];
  for (let i = 0; i < scenario.options.length; i++) {
    let optY = 215 + (i * 90);
    fill(30, 50, 95);
    stroke(56, 189, 248);
    strokeWeight(2.5);
    rect(90, optY, 620, 78, 18);

    fill(250, 204, 21);
    noStroke();
    textSize(16);
    text("⭐", 715, optY + 39);

    fill(255);
    textSize(14);
    textAlign(CENTER, CENTER);
    text(`${optionIcons[i]}   ${scenario.options[i].text}`, 110, optY, 580, 78);
  }

  // Feedback Popup Modal
  if (showFeedbackPopup) {
    fill(5, 10, 20, 240);
    rect(0, 0, width, height);

    let boxColor = isCorrectAnswer ? color(16, 185, 129, 255) : color(239, 68, 68, 255);
    fill(16, 35, 80, 250);
    stroke(boxColor);
    strokeWeight(4);
    rect(150, 150, 500, 300, 24);

    noStroke();
    fill(isCorrectAnswer ? color(74, 222, 128) : color(248, 113, 113));
    textSize(24);
    text(isCorrectAnswer ? "🏆 CONGRATULATIONS!" : "⚠️ CRITICAL WARNING!", 400, 195);

    fill(255);
    textSize(14);
    textAlign(CENTER, TOP);
    text(feedbackMessage, 180, 235, 440, 130);
    textAlign(CENTER, CENTER);

    fill(isCorrectAnswer ? color(74, 222, 128) : color(239, 68, 68));
    stroke(255);
    strokeWeight(2);
    rect(300, 385, 200, 45, 14);
    noStroke();
    fill(8, 15, 38);
    textSize(16);
    text("Continue ➔", 400, 407);
  }
}

function drawMeter(x, y, label, val, col) {
  fill(255);
  textSize(12);
  textAlign(LEFT, CENTER);
  text(`${label}: ${val}%`, x, y - 8);

  fill(35, 50, 95);
  noStroke();
  rect(x, y, 90, 8, 4);
  fill(col);
  rect(x, y, (val / 100) * 90, 8, 4);
}

function drawCompleteScreen() {
  fill(16, 35, 80, 250);
  stroke(255, 215, 0);
  strokeWeight(3.5);
  rect(150, 110, 500, 350, 24);

  noStroke();
  fill(250, 204, 21);
  textSize(26);
  text("🏆 Mission Accomplished! 🏆", 400, 155);

  // Display Unlocked Reward Title
  fill(74, 222, 128);
  textSize(16);
  text(`Reward Unlocked: ${missionRewards[currentMission]}`, 400, 210);

  fill(255);
  textSize(14);
  text(`Badges Earned: ${badgesEarned}/5`, 400, 255);
  text(`Correct Answers: ${correctAnswersCount}/3`, 400, 285);
  text("You successfully mastered space life support systems!", 400, 320);

  fill(74, 222, 128);
  stroke(255);
  strokeWeight(2);
  rect(280, 375, 240, 45, 14);
  noStroke();
  fill(8, 15, 38);
  textSize(16);
  text("Mission Select", 400, 397);
}

function drawGameOverScreen() {
  fill(16, 35, 80, 250);
  stroke(239, 68, 68);
  strokeWeight(3.5);
  rect(150, 120, 500, 320, 24);

  noStroke();
  fill(239, 68, 68);
  textSize(28);
  text("⚠️ Mission Failed ⚠️", 400, 175);

  fill(255);
  textSize(15);
  text(`Correct Answers: ${correctAnswersCount}/3 (Need at least 2)`, 400, 230);
  text("Review your astronaut training and try again.", 400, 265);

  fill(239, 68, 68);
  stroke(255);
  strokeWeight(2);
  rect(280, 350, 240, 48, 14);
  noStroke();
  fill(255);
  textSize(16);
  text("Retry Mission 🔄", 400, 374);
}

function mousePressed() {
  initAudio();

  if (gameState === "TITLE") {
    if (mouseX > 280 && mouseX < 520 && mouseY > 350 && mouseY < 398) {
      playClickSound();
      gameState = "CUSTOMIZE";
    } else if (mouseX > 280 && mouseX < 520 && mouseY > 415 && mouseY < 463) {
      playClickSound();
      gameState = "SELECT";
    }
  } else if (gameState === "CUSTOMIZE") {
    if (mouseX > 170 && mouseX < 630 && mouseY > 205 && mouseY < 245) {
      playClickSound();
      suitColorIndex = (suitColorIndex + 1) % suitColors.length;
    } else if (mouseX > 170 && mouseX < 630 && mouseY > 255 && mouseY < 295) {
      playClickSound();
      visorIndex = (visorIndex + 1) % visorStyles.length;
    } else if (mouseX > 170 && mouseX < 630 && mouseY > 305 && mouseY < 345) {
      playClickSound();
      faceIndex = (faceIndex + 1) % faceTypes.length;
    } else if (mouseX > 280 && mouseX < 520 && mouseY > 395 && mouseY < 437) {
      playClickSound();
      gameState = "TITLE";
    }
  } else if (gameState === "BRIEFING") {
    if (mouseX > 280 && mouseX < 520 && mouseY > 415 && mouseY < 460) {
      playClickSound();
      gameState = "GAME";
    }
  } else if (gameState === "SELECT") {
    for (let i = 0; i < missions.length; i++) {
      let yPos = 115 + (i * 72);
      if (mouseX > 560 && mouseX < 680 && mouseY > yPos + 12 && mouseY < yPos + 46) {
        playClickSound();
        currentMission = i;
        currentScenario = 0;
        correctAnswersCount = 0;
        resources = { oxygen: 100, water: 100, food: 100, power: 100 };
        
        for (let s of missions[currentMission].scenarios) {
          s.options = shuffle(s.options);
        }

        showFeedbackPopup = false;
        gameState = "BRIEFING";
      }
    }
  } else if (gameState === "GAME") {
    if (dist(mouseX, mouseY, 745, 58) < 22) {
      playClickSound();
      gameState = "SELECT";
      return;
    }

    let scenario = missions[currentMission].scenarios[currentScenario];

    if (!showFeedbackPopup) {
      for (let i = 0; i < scenario.options.length; i++) {
        let optY = 215 + (i * 90);
        if (mouseX > 90 && mouseX < 710 && mouseY > optY && mouseY < optY + 78) {
          let opt = scenario.options[i];
          feedbackMessage = opt.feedback;
          isCorrectAnswer = opt.correct;
          showFeedbackPopup = true;

          if (isCorrectAnswer) {
            correctAnswersCount++;
            triggerCelebration();
            playSuccessSound();
          } else {
            playAlarmSound();
          }

          if (opt.eff.oxygen) resources.oxygen = constrain(resources.oxygen + opt.eff.oxygen, 0, 100);
          if (opt.eff.water) resources.water = constrain(resources.water + opt.eff.water, 0, 100);
          if (opt.eff.food) resources.food = constrain(resources.food + opt.eff.food, 0, 100);
          if (opt.eff.power) resources.power = constrain(resources.power + opt.eff.power, 0, 100);
        }
      }
    } else {
      if (mouseX > 300 && mouseX < 500 && mouseY > 385 && mouseY < 430) {
        playClickSound();
        showFeedbackPopup = false;

        if (resources.oxygen <= 0 || resources.water <= 0 || resources.food <= 0 || resources.power <= 0) {
          gameState = "GAMEOVER";
          return;
        }

        currentScenario++;
        if (currentScenario >= missions[currentMission].scenarios.length) {
          if (correctAnswersCount >= 2) {
            badgesEarned = min(5, badgesEarned + 1);
            if (!unlockedRewards.includes(missionRewards[currentMission])) {
              unlockedRewards.push(missionRewards[currentMission]);
            }
            triggerCelebration();
            playVictorySound();
            gameState = "COMPLETE";
          } else {
            gameState = "GAMEOVER";
          }
        }
      }
    }
  } else if (gameState === "COMPLETE") {
    if (mouseX > 280 && mouseX < 520 && mouseY > 375 && mouseY < 420) {
      playClickSound();
      gameState = "SELECT";
    }
  } else if (gameState === "GAMEOVER") {
    if (mouseX > 280 && mouseX < 520 && mouseY > 350 && mouseY < 398) {
      playClickSound();
      resources = { oxygen: 100, water: 100, food: 100, power: 100 };
      currentScenario = 0;
      correctAnswersCount = 0;
      showFeedbackPopup = false;
      gameState = "GAME";
    }
  }
}