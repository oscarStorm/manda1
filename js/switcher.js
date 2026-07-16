const boidCanvas = document.querySelector("#boid-canvas");
const simulationCanvas = document.querySelector("#simulation-canvas");
const toggleButton = document.querySelector("#simulation-toggle");
const controls = document.querySelector(".controls");

let activeSimulation = "boids";

function showSimulation(name) {
    activeSimulation = name;

    const showingBoids = activeSimulation === "boids";

    boidCanvas.hidden = !showingBoids;
    simulationCanvas.hidden = showingBoids;
    controls.hidden = !showingBoids;

    if (showingBoids) {
        window.limbSimulation.stop();
        window.boidsSimulation.start();
        toggleButton.textContent = "Show simulation.js";
    } else {
        window.boidsSimulation.stop();
        window.limbSimulation.start();
        toggleButton.textContent = "Show boids.js";
    }
}

toggleButton.addEventListener("click", () => {
    showSimulation(activeSimulation === "boids" ? "limb" : "boids");
});

showSimulation("boids");
