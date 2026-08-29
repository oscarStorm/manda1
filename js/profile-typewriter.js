const profileTyping = document.getElementById("profile-typing");

const profileLines = [
"My name is Oscar Storm, and I'm a Computer Science student.",
"I live in Frederiksberg with my girlfriend and our son, who just turned 7!",
"",
"I've been running Linux as my main OS for about a year now, and I haven't looked back since.",
"I'm interested in every part of the tech stack, from top to bottom.",
"Not just how the different layers fit together, but how the technology actually works — from hardware to software.",
"",
"I think the entire IT industry is evolving rapidly with the rise of AI, and it's exciting to be along for the ride.",
"To gain hands-on experience with agentic coding, I've set up an open-source local AI environment.",
"My current setup uses Gemma and Hermes as the agent harness.",
"",
"Outside of tech, I enjoy playing chess and building personal projects, some of which are public on GitHub.",
"",
"I'm currently looking for opportunities in the IT industry and encourage employers to reach out if they think I could be a good fit.",
"",
"Contact information:",
"Email: oscar.emil.storm@gmail.com",
"GitHub: https://github.com/oscarStorm",
"Phone: +45 53535623"
];

const characterDelay = 40;
const delayBetweenLines = 600;

let lineIndex = 0;
let characterIndex = 0;
let currentLine;

function createLine() {
  currentLine = document.createElement("span");
  currentLine.className = "profile-line profile-line-current";
  profileTyping.append(currentLine);
}

function typeProfile() {
  if (!currentLine) {
    createLine();
  }

  const text = profileLines[lineIndex];
  currentLine.textContent = text.substring(0, characterIndex + 1);
  characterIndex += 1;

  if (characterIndex < text.length) {
    setTimeout(typeProfile, characterDelay);
    return;
  }

  if (lineIndex === profileLines.length - 1) {
    return;
  }

  currentLine.classList.remove("profile-line-current");
  lineIndex += 1;
  characterIndex = 0;
  currentLine = null;
  setTimeout(typeProfile, delayBetweenLines);
}

typeProfile();
