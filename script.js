const MAX_MISTAKES = 6;
const WORDS = [
  { word: "dolphin", category: "Animals" },
  { word: "penguin", category: "Animals" },
  { word: "giraffe", category: "Animals" },
  { word: "kitchen", category: "Around the house" },
  { word: "blanket", category: "Around the house" },
  { word: "notebook", category: "School" },
  { word: "library", category: "Places" },
  { word: "mountain", category: "Nature" },
  { word: "rainbow", category: "Nature" },
  { word: "baseball", category: "Sports" },
  { word: "sandwich", category: "Food" },
  { word: "pineapple", category: "Food" },
  { word: "airplane", category: "Travel" },
  { word: "backpack", category: "Travel" },
  { word: "treasure", category: "Adventure" },
];

const alphabet = "abcdefghijklmnopqrstuvwxyz".split("");

const elements = {
  bodyParts: document.querySelectorAll(".body-part"),
  category: document.querySelector("#category"),
  keyboard: document.querySelector("#keyboard"),
  message: document.querySelector("#message"),
  mistakes: document.querySelector("#mistakes"),
  newGame: document.querySelector("#new-game"),
  word: document.querySelector("#word"),
  wrongLetters: document.querySelector("#wrong-letters"),
};

const state = {
  answer: "",
  category: "",
  guessed: new Set(),
  wrong: new Set(),
  isGameOver: false,
};

function choosePuzzle() {
  const puzzle = WORDS[Math.floor(Math.random() * WORDS.length)];

  state.answer = puzzle.word;
  state.category = puzzle.category;
  state.guessed = new Set();
  state.wrong = new Set();
  state.isGameOver = false;
}

function renderKeyboard() {
  elements.keyboard.innerHTML = "";

  alphabet.forEach((letter) => {
    const button = document.createElement("button");
    button.className = "key";
    button.type = "button";
    button.textContent = letter;
    button.setAttribute("aria-label", `Guess ${letter.toUpperCase()}`);
    button.dataset.letter = letter;
    button.addEventListener("click", () => guessLetter(letter));
    elements.keyboard.append(button);
  });
}

function renderWord() {
  elements.word.innerHTML = "";

  state.answer.split("").forEach((letter) => {
    const slot = document.createElement("span");
    slot.className = "letter-slot";

    if (letter === " ") {
      slot.classList.add("space");
      slot.textContent = "";
    } else {
      slot.textContent = state.guessed.has(letter) ? letter : "";
    }

    elements.word.append(slot);
  });
}

function renderStatus() {
  const mistakes = state.wrong.size;

  elements.category.textContent = `Category: ${state.category}`;
  elements.mistakes.textContent = `Mistakes: ${mistakes} / ${MAX_MISTAKES}`;
  elements.wrongLetters.textContent =
    mistakes > 0 ? [...state.wrong].join(" ").toUpperCase() : "None yet";

  elements.bodyParts.forEach((part) => {
    const partNumber = Number(part.dataset.part);
    part.classList.toggle("visible", partNumber <= mistakes);
  });

  document.querySelectorAll(".key").forEach((button) => {
    const letter = button.dataset.letter;
    const hasBeenGuessed = state.guessed.has(letter);
    const isWrong = state.wrong.has(letter);

    button.disabled = state.isGameOver || hasBeenGuessed || isWrong;
    button.classList.toggle("correct", hasBeenGuessed);
    button.classList.toggle("wrong", isWrong);
  });
}

function hasWon() {
  return state.answer
    .split("")
    .every((letter) => letter === " " || state.guessed.has(letter));
}

function setMessage(text, className = "") {
  elements.message.textContent = text;
  elements.message.className = `message${className ? ` ${className}` : ""}`;
}

function revealAnswer() {
  state.answer.split("").forEach((letter) => {
    if (letter !== " ") {
      state.guessed.add(letter);
    }
  });
}

function finishGame(message, className) {
  state.isGameOver = true;
  setMessage(message, className);
  renderWord();
  renderStatus();
}

function guessLetter(letter) {
  if (state.isGameOver || state.guessed.has(letter) || state.wrong.has(letter)) {
    return;
  }

  if (state.answer.includes(letter)) {
    state.guessed.add(letter);
    setMessage(`Nice! "${letter.toUpperCase()}" is in the word.`);
  } else {
    state.wrong.add(letter);
    setMessage(`Nope, no "${letter.toUpperCase()}".`);
  }

  if (hasWon()) {
    finishGame("You won! Great guessing.", "win");
    return;
  }

  if (state.wrong.size >= MAX_MISTAKES) {
    const answer = state.answer.toUpperCase();
    revealAnswer();
    finishGame(`Game over. The word was ${answer}.`, "loss");
    return;
  }

  renderWord();
  renderStatus();
}

function startGame() {
  choosePuzzle();
  renderKeyboard();
  renderWord();
  renderStatus();
  setMessage("Pick a letter to begin.");
}

elements.newGame.addEventListener("click", startGame);

document.addEventListener("keydown", (event) => {
  const letter = event.key.toLowerCase();

  if (/^[a-z]$/.test(letter)) {
    guessLetter(letter);
  }
});

startGame();
