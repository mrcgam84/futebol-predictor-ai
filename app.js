
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

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;",
    '"': "&quot;", "'": "&#39;"
  })[c]);
}

function todayInPortugal() {
  return new Date().toLocaleDateString("en-CA", {
    timeZone: "Europe/Lisbon"
  });
}

function statusText(status) {
  const labels = {
    NS: "Por começar",
    LIVE: "Em direto",
    FT: "Terminado",
    HT: "Intervalo",
    PST: "Adiado",
    CANC: "Cancelado",
    ABD: "Interrompido"
  };
  return labels[status] || status || "Agendado";
}

async function loadMatches() {
  refresh.disabled = true;
  host.innerHTML = '<p class="muted">A carregar jogos reais...</p>';

  try {
    const date = todayInPortugal();
    const response = await fetch(
      `${API_BASE}/fixtures?date=${date}`
    );

    if (!response.ok) {
      throw new Error("Erro na ligação: " + response.status);
    }

    const data = await response.json();

    if (data.errors && Object.keys(data.errors).length) {
      throw new Error("A API devolveu um erro. Verifica o limite ou a chave.");
    }

    let matches = (data.response || []).filter(match =>
      Object.prototype.hasOwnProperty.call(
        leagues, match.league.id
      )
    );

    if (league.value !== "Todas") {
      matches = matches.filter(match =>
        leagues[match.league.id] === league.value
      );
    }

    counter.textContent = matches.length;

    if (!matches.length) {
      host.innerHTML =
        '<p class="muted">Não foram encontrados jogos para hoje nesta seleção.</p>';
      return;
    }

    host.innerHTML = matches.map(match => {
      const time = new Date(match.fixture.date)
        .toLocaleTimeString("pt-PT", {
          timeZone: "Europe/Lisbon",
          hour: "2-digit",
          minute: "2-digit"
        });

      const home = escapeHTML(match.teams.home.name);
      const away = escapeHTML(match.teams.away.name);
      const competition = escapeHTML(leagues[match.league.id]);
      const status = escapeHTML(
        statusText(match.fixture.status.short)
      );

      return `
        <article class="match">
          <div class="match-top">
            <span class="league-name">${competition.toUpperCase()}</span>
            <span>${time} · ${status}</span>
          </div>
          <div class="teams">
            <span>${home}</span>
            <span class="vs">VS</span>
            <span>${away}</span>
          </div>
          <div class="demo-tag">
            DADOS DE JOGOS DA API-FOOTBALL
          </div>
        </article>
      `;
    }).join("");

  } catch (error) {
    counter.textContent = "—";
    host.innerHTML =
      `<p class="muted">${escapeHTML(error.message)}. Tenta novamente mais tarde.</p>`;
  } finally {
    refresh.disabled = false;
  }
}

league.addEventListener("change", loadMatches);
refresh.addEventListener("click", loadMatches);

loadMatches();

if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  navigator.serviceWorker.register("./sw.js").catch(() => {});
}
