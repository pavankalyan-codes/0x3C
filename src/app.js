const cardEl = document.getElementById("card");
const titleEl = document.getElementById("title");
const contentEl = document.getElementById("content");
const categoryEl = document.getElementById("category");
const difficultyEl = document.getElementById("difficulty");
const timeEl = document.getElementById("time");
const timebarEl = document.getElementById("timebar");
const sourceEl = document.getElementById("source");
const statusEl = document.getElementById("status");
const progressEl = document.getElementById("progress");
const errorBox = document.getElementById("error");
const errorMessage = document.getElementById("errorMessage");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

let cards = [];
let index = 0;
let isAnimating = false;
let timerId = null;
let timerDuration = 0;
let timerEnd = 0;

const getSourceUrl = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get("src") || "content/networking.json";
};

const isCardValid = (card, seenIds) => {
  if (!card || typeof card !== "object") return { valid: false, reason: "Invalid object" };
  const required = ["id", "title", "category", "difficulty", "readTimeSec", "content"];
  for (const key of required) {
    if (!(key in card)) return { valid: false, reason: `Missing ${key}` };
  }
  if (seenIds.has(card.id)) return { valid: false, reason: "Duplicate id" };
  if (typeof card.readTimeSec !== "number" || card.readTimeSec > 60) {
    return { valid: false, reason: "readTimeSec > 60" };
  }
  if (!Array.isArray(card.content) || card.content.length < 3 || card.content.length > 6) {
    return { valid: false, reason: "content length out of bounds" };
  }
  return { valid: true };
};

const setStatus = (text) => {
  statusEl.textContent = text;
};

const setError = (message) => {
  errorMessage.textContent = message;
  errorBox.hidden = false;
  cardEl.setAttribute("aria-hidden", "true");
};

const stopTimer = () => {
  if (timerId) {
    window.clearInterval(timerId);
    timerId = null;
  }
};

const startTimer = (seconds) => {
  stopTimer();
  timerDuration = Math.max(1, Math.round(seconds));
  timerEnd = Date.now() + timerDuration * 1000;

  const tick = () => {
    const remainingMs = Math.max(0, timerEnd - Date.now());
    const remaining = Math.ceil(remainingMs / 1000);
    if (remainingMs <= 0) {
      timeEl.textContent = "Time complete";
    } else {
      timeEl.textContent = `Time ${remaining}s left`;
    }
    if (timebarEl) {
      const progress = remainingMs / (timerDuration * 1000);
      timebarEl.style.transform = `scaleX(${progress})`;
    }
    if (remainingMs <= 0) {
      stopTimer();
    }
  };

  tick();
  timerId = window.setInterval(tick, 250);
};

const renderCard = (card) => {
  titleEl.textContent = card.title;
  categoryEl.textContent = card.category;
  difficultyEl.textContent = card.difficulty;
  timeEl.textContent = `Time ${card.readTimeSec}s`;
  sourceEl.textContent = card.source || "";

  contentEl.innerHTML = "";
  for (const line of card.content) {
    const li = document.createElement("li");
    li.textContent = line;
    contentEl.appendChild(li);
  }

  progressEl.textContent = `${index + 1} / ${cards.length}`;
  startTimer(card.readTimeSec);
};

const animateTo = (nextIndex) => {
  if (isAnimating || cards.length === 0) return;
  isAnimating = true;
  cardEl.classList.add("is-exit");
  stopTimer();
  window.setTimeout(() => {
    index = nextIndex;
    renderCard(cards[index]);
    cardEl.classList.remove("is-exit");
    isAnimating = false;
  }, 220);
};

const nextCard = () => {
  if (cards.length === 0) return;
  const nextIndex = (index + 1) % cards.length;
  animateTo(nextIndex);
};

const prevCard = () => {
  if (cards.length === 0) return;
  const nextIndex = (index - 1 + cards.length) % cards.length;
  animateTo(nextIndex);
};

const attachEvents = () => {
  prevBtn.addEventListener("click", prevCard);
  nextBtn.addEventListener("click", nextCard);

  window.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight") nextCard();
    if (event.key === "ArrowLeft") prevCard();
  });

  let startX = 0;
  let active = false;

  cardEl.addEventListener("pointerdown", (event) => {
    startX = event.clientX;
    active = true;
    cardEl.setPointerCapture(event.pointerId);
  });

  cardEl.addEventListener("pointerup", (event) => {
    if (!active) return;
    const delta = event.clientX - startX;
    active = false;
    if (Math.abs(delta) > 60) {
      if (delta < 0) nextCard();
      if (delta > 0) prevCard();
    }
  });
};

const loadCards = async () => {
  setStatus("Loading cards...");
  const src = getSourceUrl();
  try {
    const res = await fetch(src, { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to fetch ${src}`);
    const data = await res.json();
    if (!Array.isArray(data)) throw new Error("JSON must be an array of cards");

    const seenIds = new Set();
    const valid = [];
    const warnings = [];
    for (const card of data) {
      const result = isCardValid(card, seenIds);
      if (result.valid) {
        seenIds.add(card.id);
        valid.push(card);
      } else {
        warnings.push(`${card?.id || "unknown"}: ${result.reason}`);
      }
    }

    if (valid.length === 0) {
      throw new Error("No valid cards found. Check schema rules.");
    }

    if (warnings.length > 0) {
      console.warn("Invalid cards skipped:", warnings);
    }

    cards = valid;
    index = 0;
    renderCard(cards[index]);
    setStatus(`${cards.length} cards loaded`);
  } catch (error) {
    console.error(error);
    setStatus("Failed to load cards");
    setError(error.message || "Unable to load cards");
  }
};

attachEvents();
loadCards();
