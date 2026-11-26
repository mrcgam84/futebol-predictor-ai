
const API_BASE = "https://futebol-predictor-api.mrcgam84.workers.dev";

const leagues = {
  94: "Portugal",
  39: "Inglaterra",
  140: "Espanha",
  135: "Itália",
  78: "Alemanha",
  61: "França",
  2: "Liga dos Campeões",
  3: "Liga Europa"
};

const host = document.querySelector("#matches");
const league = document.querySelector("#league");
const counter = document.querySelector("#matchCount");
const refresh = document.querySelector("#refresh");

let allMatches = [];

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;",
    '"': "&quot;", "'": "&#39;"
  })[c]);
}

function localDate(date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Lisbon",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(date);

  const get = type => parts.find(p => p.type === type).value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}

function statusGroup(status) {
  if (["1H", "HT", "2H", "ET", "BT", "P", "LIVE", "SUSP", "INT"].includes(status)) {
    return "Em direto";
  }

  if (["FT", "AET", "PEN", "AWD", "WO"].includes(status)) {
    return "Terminados";
  }

  return "Por começar";
}

function renderGroup(title, matches) {
  if (!matches.length) return "";

  return `
    <h3>${title} (${matches.length})</h3>
    ${matches.map(match => {
      const time = new Date(match.fixture.date).toLocaleString("pt-PT", {
        timeZone: "Europe/Lisbon",
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
      });

      const home = escapeHTML(match.teams.home.name);
      const away = escapeHTML(match.teams.away.name);
      const competition = escapeHTML(match.league.name);
      const status = escapeHTML(match.fixture.status.long);
      const score = match.goals.home === null
        ? "VS"
        : `${match.goals.home} - ${match.goals.away}`;

      return `
        <article class="match">
          <div class="match-top">
            <span>${competition}</span>
            <span>${time}</span>
          </div>
          <div class="teams">
            <span>${home}</span>
            <strong>${score}</strong>
            <span>${away}</span>
          </div>
          <div class="demo-tag">${status}</div>
        </article>
      `;
    }).join("")}
  `;
}

function showMatches() {
  let matches = allMatches.filter(match =>
    Object.prototype.hasOwnProperty.call(leagues, match.league.id)
  );

  if (league && league.value !== "Todas") {
    matches = matches.filter(match =>
      leagues[match.league.id] === league.value
    );
  }

  matches.sort((a, b) =>
    new Date(a.fixture.date) - new Date(b.fixture.date)
  );

  counter.textContent = matches.length;

  const live = matches.filter(m =>
    statusGroup(m.fixture.status.short) === "Em direto"
  );

  const upcoming = matches.filter(m =>
    statusGroup(m.fixture.status.short) === "Por começar"
  );

  const finished = matches.filter(m =>
    statusGroup(m.fixture.status.short) === "Terminados"
  );

  host.innerHTML =
    renderGroup("🔴 Em direto", live) +
    renderGroup("⚽ Por começar", upcoming) +
    renderGroup("🏁 Terminados", finished);

  if (!matches.length) {
    host.innerHTML = '<p class="muted">Não há jogos encontrados nos próximos 7 dias.</p>';
  }
}

async function loadMatches() {
  refresh.disabled = true;
  host.innerHTML = '<p class="muted">A carregar jogos...</p>';

  try {
    const from = localDate(new Date());
    const end = new Date();
    end.setDate(end.getDate() + 6);
    const to = localDate(end);

    const response = await fetch(
      `${API_BASE}/fixtures?from=${from}&to=${to}&timezone=Europe/Lisbon`
    );

    if (!response.ok) {
      throw new Error("Erro na ligação: " + response.status);
    }

    const data = await response.json();

    if (data.errors && Object.keys(data.errors).length) {
      throw new Error(JSON.stringify(data.errors));
    }

    allMatches = data.response || [];
    showMatches();

  } catch (error) {
    host.innerHTML =
      `<p class="muted">Não foi possível carregar os jogos: ${escapeHTML(error.message)}</p>`;
  } finally {
    refresh.disabled = false;
  }
}

if (league) league.addEventListener("change", showMatches);
if (refresh) refresh.addEventListener("click", loadMatches);

loadMatches();
