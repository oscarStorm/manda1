const element = document.getElementById("typing");

const messages = [
  "Hello there, i'm Oscar",
  "Have a look around!",
  "I've made a couple of simulations",
  "The worm page explore procedural animations using inverse kinematics",
  "The page you are on now is the classic algorithm used to describe a flocking system",
  "Try altering the parameters in the top left corner!",
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
//the lover speed is the faster it deletes. It's time between actions
  let speed = deleting ? 15 : 45;

  if (!deleting && characterIndex > current.length) {
    deleting = true;
    speed = 1800; // Pause before deleting
  }

  if (deleting && characterIndex < 0) {
    deleting = false;
    messageIndex = (messageIndex + 1) % messages.length;
    speed = 30;
  }

  setTimeout(type, speed);
}

type();
