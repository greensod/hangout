// ============================================
// APP — all the magic happens here ✨
// ============================================

(() => {

const ACTIVITIES = [
  { id: "park",       emoji: "🌳", label: "Park Picnic" },
  { id: "restaurant", emoji: "🍝", label: "Fancy Dinner" },
  { id: "home",       emoji: "🏠", label: "Cozy Home Night" },
  { id: "wander",     emoji: "🚶‍♀️", label: "Wander Around" },
  { id: "movie",      emoji: "🎬", label: "Movie Marathon" },
  { id: "cafe",       emoji: "☕", label: "Café Hopping" },
  { id: "shopping",   emoji: "🛍️", label: "Shopping Spree" },
  { id: "craft",      emoji: "🎨", label: "Craft & Paint" },
  { id: "arcade",     emoji: "🕹️", label: "Arcade Fun" },
  { id: "other",      emoji: "✨", label: "Surprise Me / Other" }
];

const YEAR = 2026;

let myName = localStorage.getItem("psd_name") || "";
let selectedDate = null;       // { iso, label }
let selectedActivity = null;   // { id, label }
let calMonth = 0;
let resultsPollHandle = null;

// ---------- screen navigation ----------
function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");

  if (id !== "screen-results" && resultsPollHandle) {
    clearInterval(resultsPollHandle);
    resultsPollHandle = null;
  }
}

// ---------- ambient sparkles ----------
function initSparkles() {
  const layer = document.getElementById("sparkle-layer");
  const symbols = ["✨", "💫", "⭐", "💖", "🌸"];
  const count = window.innerWidth < 600 ? 14 : 24;
  for (let i = 0; i < count; i++) {
    const el = document.createElement("span");
    el.className = "sparkle";
    el.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    el.style.left = Math.random() * 100 + "vw";
    el.style.fontSize = 10 + Math.random() * 14 + "px";
    el.style.setProperty("--drift", (Math.random() * 60 - 30) + "px");
    const duration = 10 + Math.random() * 12;
    el.style.animationDuration = `${duration}s, ${2 + Math.random() * 2}s`;
    el.style.animationDelay = `-${Math.random() * duration}s`;
    layer.appendChild(el);
  }
}

function spawnConfetti() {
  const layer = document.getElementById("confetti-layer");
  const symbols = ["🎉", "👑", "💖", "✨", "🌷", "💫"];
  for (let i = 0; i < 36; i++) {
    const el = document.createElement("span");
    el.className = "confetti-bit";
    el.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    el.style.left = Math.random() * 100 + "vw";
    el.style.animationDuration = 2.2 + Math.random() * 1.8 + "s";
    el.style.animationDelay = Math.random() * 0.6 + "s";
    layer.appendChild(el);
    setTimeout(() => el.remove(), 5000);
  }
}

// ---------- SCREEN 1: name ----------
function initNameScreen() {
  const form = document.getElementById("form-name");
  const input = document.getElementById("input-name");
  const hint = document.getElementById("name-hint");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const val = input.value.trim();
    if (!val) return;
    myName = val;
    localStorage.setItem("psd_name", myName);

    hint.textContent = "checking the royal scrolls...";
    const state = await Storage.getState();
    if (state.proposals[myName]) {
      // already submitted — jump straight to results
      hint.textContent = "";
      goToResults();
    } else {
      hint.textContent = "";
      document.getElementById("greet-name").textContent = myName;
      showScreen("screen-invite");
    }
  });
}

// ---------- SCREEN 2: invite ----------
function initInviteScreen() {
  const btnPlan = document.getElementById("btn-lets-plan");
  const btnNotNow = document.getElementById("btn-not-now");
  const funny = document.getElementById("funny-text");

  btnPlan.addEventListener("click", () => {
    showScreen("screen-calendar");
  });

  btnNotNow.addEventListener("click", () => {
    btnNotNow.style.display = "none";
    funny.classList.add("show");
  });
}

// ---------- SCREEN 3: calendar ----------
function renderCalendar() {
  const grid = document.getElementById("cal-grid");
  const label = document.getElementById("cal-month-label");
  const monthNames = ["January","February","March","April","May","June",
                       "July","August","September","October","November","December"];

  label.textContent = `${monthNames[calMonth]} ${YEAR}`;
  grid.innerHTML = "";

  const firstDayWeekday = new Date(YEAR, calMonth, 1).getDay();
  const daysInMonth = new Date(YEAR, calMonth + 1, 0).getDate();

  const today = new Date();
  today.setHours(0,0,0,0);

  for (let i = 0; i < firstDayWeekday; i++) {
    const empty = document.createElement("div");
    empty.className = "cal-day empty";
    grid.appendChild(empty);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const cell = document.createElement("div");
    cell.className = "cal-day";
    cell.textContent = d;

    const cellDate = new Date(YEAR, calMonth, d);
    cellDate.setHours(0,0,0,0);

    if (cellDate < today) {
      cell.classList.add("past");
    } else {
      cell.addEventListener("click", () => selectDate(cellDate, cell));
    }

    const iso = isoOf(cellDate);
    if (selectedDate && selectedDate.iso === iso) {
      cell.classList.add("selected");
    }

    grid.appendChild(cell);
  }

  document.getElementById("cal-prev").disabled = calMonth === 0;
  document.getElementById("cal-next").disabled = calMonth === 11;
}

function isoOf(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

function selectDate(dateObj, cellEl) {
  document.querySelectorAll(".cal-day.selected").forEach(c => c.classList.remove("selected"));
  cellEl.classList.add("selected");

  const weekdayNames = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const monthNames = ["January","February","March","April","May","June",
                       "July","August","September","October","November","December"];
  const label = `${weekdayNames[dateObj.getDay()]}, ${monthNames[dateObj.getMonth()]} ${dateObj.getDate()}, ${YEAR}`;

  selectedDate = { iso: isoOf(dateObj), label };
  document.getElementById("selected-date-text").textContent = `💖 ${label}`;
  document.getElementById("btn-date-next").disabled = false;
}

function initCalendarScreen() {
  const today = new Date();
  calMonth = (today.getFullYear() === YEAR) ? today.getMonth() : 0;

  document.getElementById("cal-prev").addEventListener("click", () => {
    if (calMonth > 0) { calMonth--; renderCalendar(); }
  });
  document.getElementById("cal-next").addEventListener("click", () => {
    if (calMonth < 11) { calMonth++; renderCalendar(); }
  });
  document.getElementById("btn-date-next").addEventListener("click", () => {
    if (selectedDate) showScreen("screen-activity");
  });
}

// ---------- SCREEN 4: activity ----------
function renderActivities() {
  const grid = document.getElementById("activity-grid");
  grid.innerHTML = "";
  ACTIVITIES.forEach(act => {
    const card = document.createElement("div");
    card.className = "activity-card";
    card.innerHTML = `<span class="emoji">${act.emoji}</span><span class="label">${act.label}</span>`;
    card.addEventListener("click", () => selectActivity(act, card));
    grid.appendChild(card);
  });
}

function selectActivity(act, cardEl) {
  document.querySelectorAll(".activity-card.selected").forEach(c => c.classList.remove("selected"));
  cardEl.classList.add("selected");

  const otherInput = document.getElementById("activity-other-input");
  if (act.id === "other") {
    otherInput.classList.remove("hidden");
    otherInput.focus();
    selectedActivity = { id: "other", label: otherInput.value.trim() || "a surprise" };
    document.getElementById("btn-activity-next").disabled = !otherInput.value.trim();
  } else {
    otherInput.classList.add("hidden");
    selectedActivity = { id: act.id, label: act.label };
    document.getElementById("btn-activity-next").disabled = false;
  }
}

function initActivityScreen() {
  renderActivities();
  const otherInput = document.getElementById("activity-other-input");

  otherInput.addEventListener("input", () => {
    if (selectedActivity && selectedActivity.id === "other") {
      selectedActivity.label = otherInput.value.trim() || "a surprise";
      document.getElementById("btn-activity-next").disabled = !otherInput.value.trim();
    }
  });

  document.getElementById("btn-activity-next").addEventListener("click", async () => {
    if (!selectedActivity || !selectedDate) return;
    const btn = document.getElementById("btn-activity-next");
    btn.disabled = true;
    btn.textContent = "sealing the scroll...";

    const updatedState = await Storage.update(state => {
      state.proposals[myName] = {
        date: selectedDate.iso,
        dateLabel: selectedDate.label,
        activityId: selectedActivity.id,
        activityLabel: selectedActivity.label,
        submittedAt: Date.now()
      };
      return state;
    });

    btn.textContent = "make it official! 🪄";
    btn.disabled = false;
    goToResults(updatedState);
  });
}

// ---------- SCREEN 5: results / voting ----------
function goToResults(preloadedState) {
  showScreen("screen-results");
  if (preloadedState) {
    renderResults(preloadedState);
  } else {
    refreshResults();
  }
  if (resultsPollHandle) clearInterval(resultsPollHandle);
  resultsPollHandle = setInterval(refreshResults, CONFIG.POLL_INTERVAL_MS);
}

let lastLeaderName = null;

async function refreshResults() {
  const state = await Storage.getState();
  renderResults(state);
}

function renderResults(state) {
  const list = document.getElementById("proposals-list");
  const syncStatus = document.getElementById("sync-status");

  syncStatus.textContent = Storage.isOffline()
    ? "⚠️ couldn't reach the shared scroll — set up your bucket ID in config.js (see setup.html)"
    : "🔄 syncing live with your friends...";

  const names = Object.keys(state.proposals);
  if (names.length === 0) {
    list.innerHTML = `<p class="empty-state">no wishes yet... be the first! 🌙</p>`;
    document.getElementById("winner-banner").classList.add("hidden");
    return;
  }

  // tally votes
  const tally = {};
  names.forEach(n => tally[n] = 0);
  Object.values(state.votes).forEach(votedFor => {
    if (tally[votedFor] !== undefined) tally[votedFor]++;
  });

  const myVoteFor = state.votes[myName] || null;
  const maxVotes = Math.max(...names.map(n => tally[n]));
  const leaders = names.filter(n => tally[n] === maxVotes && maxVotes > 0);

  list.innerHTML = "";
  names
    .sort((a, b) => tally[b] - tally[a])
    .forEach(name => {
      const p = state.proposals[name];
      const card = document.createElement("div");
      card.className = "proposal-card";
      if (myVoteFor === name) card.classList.add("my-vote");
      if (leaders.includes(name) && maxVotes > 0) card.classList.add("leading");

      card.innerHTML = `
        <div class="proposal-info">
          <p class="proposal-name">${leaders.includes(name) && maxVotes > 0 ? "👑 " : "🌸 "}${escapeHtml(name)}</p>
          <p class="proposal-detail">${escapeHtml(p.dateLabel)}</p>
          <p class="proposal-detail">${getEmoji(p.activityId)} ${escapeHtml(p.activityLabel)}</p>
        </div>
        <div class="proposal-vote">
          <span class="vote-count">${tally[name]} 💗</span>
          <button class="btn-vote ${myVoteFor === name ? "active" : ""}" data-name="${escapeHtml(name)}">
            ${myVoteFor === name ? "voted!" : "vote"}
          </button>
        </div>
      `;
      list.appendChild(card);
    });

  list.querySelectorAll(".btn-vote").forEach(btn => {
    btn.addEventListener("click", () => castVote(btn.dataset.name));
  });

  const banner = document.getElementById("winner-banner");
  if (maxVotes > 0 && leaders.length === 1) {
    const leaderName = leaders[0];
    const p = state.proposals[leaderName];
    banner.classList.remove("hidden");
    document.getElementById("winner-text").textContent =
      `${leaderName}'s plan: ${p.dateLabel} — ${getEmoji(p.activityId)} ${p.activityLabel}`;
    if (lastLeaderName !== leaderName) {
      spawnConfetti();
      lastLeaderName = leaderName;
    }
  } else if (maxVotes > 0 && leaders.length > 1) {
    banner.classList.remove("hidden");
    document.getElementById("winner-text").textContent = "it's a tie! keep voting~ 🎀";
    lastLeaderName = null;
  } else {
    banner.classList.add("hidden");
    lastLeaderName = null;
  }
}

async function castVote(forName) {
  const updatedState = await Storage.update(state => {
    state.votes[myName] = forName;
    return state;
  });
  renderResults(updatedState);
}

function getEmoji(activityId) {
  const found = ACTIVITIES.find(a => a.id === activityId);
  return found ? found.emoji : "✨";
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function initResultsScreen() {
  const copyBtn = document.getElementById("btn-copy-link");
  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(window.location.origin + window.location.pathname);
        const old = copyBtn.textContent;
        copyBtn.textContent = "copied! 💌";
        setTimeout(() => copyBtn.textContent = old, 1800);
      } catch {
        alert("couldn't copy — just share the page URL manually!");
      }
    });
  } else {
    console.warn("btn-copy-link not found in HTML");
  }

  const resetBtn = document.getElementById("btn-reset-all");
  if (resetBtn) {
    resetBtn.addEventListener("click", async () => {
      const ok = confirm("this clears EVERYONE's picks and votes so you can start a new quest. continue?");
      if (!ok) return;
      resetBtn.disabled = true;
      resetBtn.textContent = "clearing...";
      await Storage.setState(Storage.defaultState());
      localStorage.removeItem("psd_name");
      location.reload();
    });
  } else {
    console.warn("btn-reset-all not found in HTML");
  }
}

// ---------- boot ----------
async function boot() {
  initSparkles();
  initNameScreen();
  initInviteScreen();
  initCalendarScreen();
  initActivityScreen();
  initResultsScreen();
  renderCalendar();

  if (myName) {
    document.getElementById("input-name").value = myName;
    const state = await Storage.getState();
    if (state.proposals[myName]) {
      goToResults();
      return;
    }
    document.getElementById("greet-name").textContent = myName;
    showScreen("screen-invite");
  }
}

document.addEventListener("DOMContentLoaded", boot);

})();