const element = document.getElementById("typing");

const messages = [
    "Computer Science Student",
    "Linux Enthusiast",
    "Always play e4 as white",
    "Github: https://github.com/oscarStorm",
    "Mail: oscar.emil.storm@gmail.com"
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
        speed = 200;
    }

    setTimeout(type, speed);
}

type();
