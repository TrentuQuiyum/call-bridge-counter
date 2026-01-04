const DEFAULT_PLAYERS = ["Player 1", "Player 2", "Player 3", "Player 4"];

const state = {
  players: DEFAULT_PLAYERS.map(n => ({ name: n })),
  rounds: [],
  nextRoundNumber: 1
};

const elPlayers = document.getElementById("players");
const elRoundRows = document.getElementById("roundRows");
const elRoundLabel = document.getElementById("roundLabel");
const elBidFreeToggle = document.getElementById("bidFreeToggle");
const elTrickWarning = document.getElementById("trickWarning");
const elScoreboard = document.getElementById("scoreboard");
const elRoundsTableWrap = document.getElementById("roundsTableWrap");

const btnAddRound = document.getElementById("addRoundBtn");
const btnUndo = document.getElementById("undoBtn");
const btnReset = document.getElementById("resetBtn");
const btnResetNames = document.getElementById("resetNamesBtn");

function clampInt(value, min, max) {
  const n = Number.parseInt(value, 10);
  if (Number.isNaN(n)) return min;
  return Math.min(max, Math.max(min, n));
}

function computePoints(call, tricks, bidFree) {
  const t = clampInt(tricks, 0, 13);
  if (bidFree) return t;

  const c = clampInt(call, 2, 8);

  if (c === 8 && t >= 8) return 16;
  if (t >= 2 * c) return -c;
  if (t >= c) return c;
  return -c;
}

function formatPoints(p) {
  if (p > 0) return `+${p}`;
  return `${p}`;
}

function renderPlayers() {
  elPlayers.innerHTML = "";
  state.players.forEach((p, idx) => {
    const wrap = document.createElement("div");
    wrap.className = "field";

    const lab = document.createElement("label");
    lab.textContent = `Player ${idx + 1} name`;

    const input = document.createElement("input");
    input.type = "text";
    input.value = p.name;
    input.maxLength = 24;
    input.addEventListener("input", () => {
      state.players[idx].name = input.value.trim() || DEFAULT_PLAYERS[idx];
      renderRoundEntryRows();
      renderScoreboard();
      renderRoundsTable();
    });

    wrap.appendChild(lab);
    wrap.appendChild(input);
    elPlayers.appendChild(wrap);
  });
}

function getRoundEntryValues() {
  const rows = [...document.querySelectorAll("[data-row]")];
  return rows.map(row => {
    const callInput = row.querySelector("[data-call]");
    const trickInput = row.querySelector("[data-tricks]");
    return {
      call: callInput ? clampInt(callInput.value, 2, 8) : null,
      tricks: clampInt(trickInput.value, 0, 13)
    };
  });
}

function updateTrickWarning() {
  const bidFree = elBidFreeToggle.checked;
  const entries = getRoundEntryValues();
  const totalTricks = entries.reduce((sum, e) => sum + e.tricks, 0);

  if (totalTricks !== 13) {
    elTrickWarning.textContent = `Invalid round: total tricks = ${totalTricks}. Must be exactly 13.`;
    btnAddRound.disabled = true;
  } else {
    elTrickWarning.textContent = "";
    btnAddRound.disabled = false;
  }

  const points = entries.map(e => computePoints(e.call ?? 2, e.tricks, bidFree));
  const pointCells = [...document.querySelectorAll("[data-points]")];

  pointCells.forEach((cell, i) => {
    const p = points[i] ?? 0;
    cell.textContent = formatPoints(p);
    cell.classList.remove("pos", "neg", "zero");
    cell.classList.add(p > 0 ? "pos" : p < 0 ? "neg" : "zero");
  });
}

function renderRoundEntryRows() {
  const roundNumber = state.nextRoundNumber;
  elRoundLabel.textContent = `Round ${roundNumber}`;

  if (roundNumber === 1 && state.rounds.length === 0) {
    elBidFreeToggle.checked = true;
  } else if (roundNumber > 1 && state.rounds.length === roundNumber - 1) {
    elBidFreeToggle.checked = false;
  }

  elRoundRows.innerHTML = "";

  state.players.forEach((p, idx) => {
    const nameCell = document.createElement("div");
    nameCell.className = "nameCell";
    nameCell.textContent = p.name || DEFAULT_PLAYERS[idx];

    const callInput = document.createElement("input");
    callInput.type = "number";
    callInput.min = "2";
    callInput.max = "8";
    callInput.step = "1";
    callInput.value = "2";
    callInput.setAttribute("data-call", "1");

    const trickInput = document.createElement("input");
    trickInput.type = "number";
    trickInput.min = "0";
    trickInput.max = "13";
    trickInput.step = "1";
    trickInput.value = "0";
    trickInput.setAttribute("data-tricks", "1");

    const pointsCell = document.createElement("div");
    pointsCell.className = "pointsCell zero";
    pointsCell.textContent = "0";
    pointsCell.setAttribute("data-points", "1");

    const rowMarker = document.createElement("div");
    rowMarker.setAttribute("data-row", "1");
    rowMarker.style.display = "contents";

    rowMarker.appendChild(nameCell);
    rowMarker.appendChild(callInput);
    rowMarker.appendChild(trickInput);
    rowMarker.appendChild(pointsCell);

    elRoundRows.appendChild(rowMarker);

    function onAnyChange() {
      callInput.disabled = elBidFreeToggle.checked;
      updateTrickWarning();
    }

    callInput.addEventListener("input", onAnyChange);
    trickInput.addEventListener("input", onAnyChange);
  });

  elBidFreeToggle.onchange = () => {
    const bidFree = elBidFreeToggle.checked;
    [...document.querySelectorAll("[data-call]")].forEach(inp => inp.disabled = bidFree);
    updateTrickWarning();
  };

  const bidFreeNow = elBidFreeToggle.checked;
  [...document.querySelectorAll("[data-call]")].forEach(inp => inp.disabled = bidFreeNow);

  updateTrickWarning();
}

function computeTotals() {
  const totals = state.players.map(() => 0);
  state.rounds.forEach(r => {
    r.points.forEach((p, i) => totals[i] += p);
  });
  return totals;
}

function renderScoreboard() {
  const totals = computeTotals();
  elScoreboard.innerHTML = "";

  state.players.forEach((p, idx) => {
    const card = document.createElement("div");
    card.className = "scoreCard";

    const nm = document.createElement("div");
    nm.className = "scoreName";
    nm.textContent = p.name || DEFAULT_PLAYERS[idx];

    const tot = document.createElement("div");
    tot.className = "scoreTotal";
    tot.textContent = `${totals[idx]}`;

    card.appendChild(nm);
    card.appendChild(tot);
    elScoreboard.appendChild(card);
  });
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderRoundsTable() {
  if (state.rounds.length === 0) {
    elRoundsTableWrap.innerHTML = `<div class="muted smallText">No rounds added yet.</div>`;
    return;
  }

  const names = state.players.map((p, i) => p.name || DEFAULT_PLAYERS[i]);

  let html = `<table><thead><tr><th>Round</th>`;
  names.forEach(n => { html += `<th>${escapeHtml(n)}</th>`; });
  html += `</tr></thead><tbody>`;

  state.rounds.forEach(r => {
    html += `<tr>`;
    html += `<td>Round ${r.roundNumber}${r.bidFree ? " (bid free)" : ""}</td>`;
    r.points.forEach(p => {
      const cls = p > 0 ? "pos" : p < 0 ? "neg" : "zero";
      html += `<td class="${cls}">${escapeHtml(formatPoints(p))}</td>`;
    });
    html += `</tr>`;
  });

  html += `</tbody></table>`;
  elRoundsTableWrap.innerHTML = html;
}

function addRound() {
  const entries = getRoundEntryValues();
  const totalTricks = entries.reduce((s, e) => s + e.tricks, 0);
  if (totalTricks !== 13) return;

  const roundNumber = state.nextRoundNumber;
  const bidFree = elBidFreeToggle.checked;

  const points = entries.map(e => computePoints(e.call ?? 2, e.tricks, bidFree));

  state.rounds.push({
    roundNumber,
    bidFree,
    calls: entries.map(e => (bidFree ? null : e.call)),
    tricks: entries.map(e => e.tricks),
    points
  });

  state.nextRoundNumber += 1;

  renderScoreboard();
  renderRoundsTable();
  renderRoundEntryRows();
}

function undoLastRound() {
  if (state.rounds.length === 0) return;
  state.rounds.pop();
  state.nextRoundNumber = Math.max(1, state.nextRoundNumber - 1);

  renderScoreboard();
  renderRoundsTable();
  renderRoundEntryRows();
}

function resetMatch() {
  state.rounds = [];
  state.nextRoundNumber = 1;

  renderScoreboard();
  renderRoundsTable();
  renderRoundEntryRows();
}

function resetNames() {
  state.players = DEFAULT_PLAYERS.map(n => ({ name: n }));
  renderPlayers();
  renderRoundEntryRows();
  renderScoreboard();
  renderRoundsTable();
}

btnAddRound.addEventListener("click", addRound);
btnUndo.addEventListener("click", undoLastRound);
btnReset.addEventListener("click", resetMatch);
btnResetNames.addEventListener("click", resetNames);

renderPlayers();
renderRoundEntryRows();
renderScoreboard();
renderRoundsTable();
