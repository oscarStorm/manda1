const element = document.getElementById("typing");

const messages = [
  "Hello there, i'm Oscar",
  "Have a look around!",
  "i've made a couple of simulations",
  "the worm page explore procedural animations using inverse kinematics",
  "the page you are on now is the classic algorithm used to describe a flocking system",
  "try altering the parameters in the top left corner!",
  "There is also some small handrawn pixelart games!"
];

let messageIndex = 0;
let characterIndex = 0;
let deleting = false;

function type() {
  const current = messages[messageIndex];

  if (!deleting) {
    element.textContent = current.substring(0, characterIndex++);
  } else {
    element.textContent = current.substring(0, characterIndex--);
  }

  let speed = deleting ? 40 : 80;

  if (!deleting && characterIndex > current.length) {
    deleting = true;
    speed = 2500; // Pause before deleting
  }

  if (deleting && characterIndex < 0) {
    deleting = false;
    messageIndex = (messageIndex + 1) % messages.length;
    speed = 10;
  }

  setTimeout(type, speed);
}

type();
