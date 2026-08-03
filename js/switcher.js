const boidCanvas = document.querySelector("#boid-canvas");
const simulationCanvas = document.querySelector("#simulation-canvas");
const gameFrame = document.querySelector("#game-frame");
const toggleButton = document.querySelector("#simulation-toggle");
const wormButton = document.querySelector("#worm-toggle");
const gameButton = document.querySelector("#game-toggle");
const typing = document.querySelector("#typing");

const controls = document.querySelector(".controls");

let activeSimulation = "boids";

function pauseGameAudio() {
  const gameWindow = gameFrame.contentWindow;

  if (typeof gameWindow?.pauseEmbeddedGameAudio === "function") {
    gameWindow.pauseEmbeddedGameAudio();
  }
}

function resumeGameAudio() {
  const gameWindow = gameFrame.contentWindow;

  if (typeof gameWindow?.resumeEmbeddedGameAudio === "function") {
    gameWindow.resumeEmbeddedGameAudio();
  }
}

function showSimulation(name) {
  activeSimulation = name;

  const showingBoids = activeSimulation === "boids";
  const showingWorm = activeSimulation === "worm";
  const showingGame = activeSimulation === "game";
  const showingTyping = showingBoids || showingWorm;

  boidCanvas.hidden = !showingBoids;
  simulationCanvas.hidden = !showingWorm;
  gameFrame.hidden = !showingGame;
  controls.hidden = !showingBoids;
  typing.hidden = !showingTyping;

  if (showingBoids) {
    pauseGameAudio();
    window.limbSimulation.stop();
    window.boidsSimulation.start();
  } else if (showingWorm) {
    pauseGameAudio();
    window.boidsSimulation.stop();
    window.limbSimulation.start();
  } else {
    resumeGameAudio();
    window.boidsSimulation.stop();
    window.limbSimulation.stop();
  }
}

toggleButton.addEventListener("click", () => {
  showSimulation("boids");
});


wormButton.addEventListener("click", () => {
  showSimulation("worm");
});

gameButton.addEventListener("click", () => {
  showSimulation("game");
});


showSimulation("boids");
