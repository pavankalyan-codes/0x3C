const deckEl = document.getElementById("deck");
const statusEl = document.getElementById("status");
const progressEl = document.getElementById("progress");
const errorBox = document.getElementById("error");
const errorMessage = document.getElementById("errorMessage");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

let cards = [];
let index = 0;
let timerId = null;
let timerEnd = 0;
let activeCard = null;
let startX = 0;
let startY = 0;
let moveX = 0;
let moveY = 0;
let stackDirection = 1;
let isButtonAnimating = false;

const stackSize = 3;
const swipeThreshold = 120;

const getSourceUrl = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get("src") || "content/content.json";
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
};

const stopTimer = () => {
  if (timerId) {
    window.clearInterval(timerId);
    timerId = null;
  }
};

const startTimer = (cardEl) => {
  stopTimer();
  if (!cardEl) return;
  const readTime = Number(cardEl.dataset.readTime || 0);
  if (!readTime) return;
  const timeEl = cardEl.querySelector(".time");
  const timebarEl = cardEl.querySelector(".timebar-fill");
  timerEnd = Date.now() + readTime * 1000;

  const tick = () => {
    const remainingMs = Math.max(0, timerEnd - Date.now());
    const remaining = Math.ceil(remainingMs / 1000);
    if (timeEl) {
      timeEl.textContent = remainingMs <= 0 ? "Time complete" : `Time ${remaining}s left`;
    }
    if (timebarEl) {
      const progress = remainingMs / (readTime * 1000);
      timebarEl.style.transform = `scaleX(${progress})`;
    }
    if (remainingMs <= 0) {
      stopTimer();
    }
  };

  tick();
  timerId = window.setInterval(tick, 250);
};

const buildCard = (card) => {
  const el = document.createElement("article");
  el.className = "card deck-card";
  el.setAttribute("aria-label", "Learning card");
  el.dataset.id = card.id;
  el.dataset.readTime = card.readTimeSec;

  const points = card.content
    .map((line) => `<li>${line}</li>`)
    .join("");

  el.innerHTML = `
    <div class="card-header">
      <div class="pill">${card.category}</div>
      <div class="difficulty">${card.difficulty}</div>
    </div>
    <h1 class="title">${card.title}</h1>
    <div class="divider"></div>
    <ul class="points">${points}</ul>
    <footer class="card-footer">
      <span class="time">Time ${card.readTimeSec}s</span>
      <span class="source">${card.source || ""}</span>
    </footer>
    <div class="timebar" aria-hidden="true">
      <span class="timebar-fill"></span>
    </div>
  `;

  return el;
};

const renderDeck = (direction = stackDirection) => {
  deckEl.innerHTML = "";
  const count = Math.min(stackSize, cards.length);
  for (let i = 0; i < count; i += 1) {
    const offset = i === 0 ? 0 : direction * i;
    const cardIndex = (index + offset + cards.length) % cards.length;
    const el = buildCard(cards[cardIndex]);
    deckEl.appendChild(el);
  }

  initCards();
};

const initCards = () => {
  const deckCards = deckEl.querySelectorAll(".deck-card");
  deckCards.forEach((card, i) => {
    card.style.zIndex = deckCards.length - i;
    card.style.transform = `translate3d(0, 0, 0) scale(${(20 - i) / 20})`;
    card.style.opacity = `${(10 - i) / 10}`;
    card.style.pointerEvents = i === 0 ? "auto" : "none";
    if (i === 0) {
      attachCardEvents(card);
      startTimer(card);
    }
  });
  progressEl.textContent = `${index + 1} / ${cards.length}`;
};

const swipeCard = (direction) => {
  if (isButtonAnimating) return;
  const deckCards = deckEl.querySelectorAll(".deck-card");
  if (!deckCards.length) return;
  const card = deckCards[0];
  stopTimer();
  const moveOutWidth = document.body.clientWidth * 1.5;
  const toX = direction > 0 ? moveOutWidth : -moveOutWidth;
  const rotate = direction > 0 ? 12 : -12;
  isButtonAnimating = true;
  card.classList.add("dragging");
  card.style.transform = `translate3d(${toX}px, -80px, 0) rotate(${rotate}deg)`;
  window.setTimeout(() => {
    index = direction > 0 ? (index + 1) % cards.length : (index - 1 + cards.length) % cards.length;
    renderDeck(direction);
    isButtonAnimating = false;
  }, 260);
};

const attachCardEvents = (card) => {
  if (card.dataset.bound) return;
  card.dataset.bound = "true";

  const onMove = (event) => {
    if (!activeCard || activeCard !== card) return;
    moveX = event.clientX - startX;
    moveY = event.clientY - startY;
    const rotation = moveX / 10;
    card.style.transform = `translate3d(${moveX}px, ${moveY}px, 0) rotate(${rotation}deg)`;
    stackDirection = moveX >= 0 ? 1 : -1;
  };

  const onUp = () => {
    if (!activeCard || activeCard !== card) return;
    deckEl.classList.remove("show-stack");
    card.classList.remove("dragging");

    if (Math.abs(moveX) > swipeThreshold) {
      const direction = moveX > 0 ? 1 : -1;
      const toX = direction > 0 ? 1000 : -1000;
      card.style.transform = `translate3d(${toX}px, ${moveY}px, 0) rotate(${moveX / 10}deg)`;
      window.setTimeout(() => {
        index = direction > 0 ? (index + 1) % cards.length : (index - 1 + cards.length) % cards.length;
        renderDeck(direction);
      }, 220);
    } else {
      card.style.transform = "";
      renderDeck(1);
    }

    activeCard = null;
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", onUp);
    window.removeEventListener("pointercancel", onUp);
  };

  card.addEventListener("pointerdown", (event) => {
    activeCard = card;
    deckEl.classList.add("show-stack");
    startX = event.clientX;
    startY = event.clientY;
    moveX = 0;
    moveY = 0;
    stackDirection = 1;
    card.setPointerCapture(event.pointerId);
    card.classList.add("dragging");
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
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
    renderDeck();
    setStatus(`${cards.length} cards loaded`);
  } catch (error) {
    console.error(error);
    setStatus("Failed to load cards");
    setError(error.message || "Unable to load cards");
  }
};

prevBtn.addEventListener("click", () => swipeCard(-1));
nextBtn.addEventListener("click", () => swipeCard(1));

window.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight") swipeCard(1);
  if (event.key === "ArrowLeft") swipeCard(-1);
});

loadCards();
