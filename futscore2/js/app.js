const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const menuToggle = $("#menu-toggle");
const mainNav = $("#main-nav");
if (menuToggle && mainNav) {
  menuToggle.addEventListener("click", () => {
    const open = mainNav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
  });
}

const loginDialog = $("#login-dialog");
$("#open-login")?.addEventListener("click", () => loginDialog?.showModal());
$("#login-form")?.addEventListener("submit", (event) => {
  event.preventDefault();
  const message = $("#login-message");
  if (message) message.textContent = "Demonstração: autenticação ainda não foi implementada.";
});

const data = window.BRAZILIANO_DATA;
const params = new URLSearchParams(window.location.search);
const initialSeries = params.get("serie") === "B" ? "B" : "A";
const seriesName = (series) => series === "A" ? "Série A" : "Série B";
const safeText = (value) => String(value).replace(/[&<>"']/g, (char) => ({
  "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
}[char]));
const logo = (code) => `<span class="team-logo" aria-hidden="true">${safeText(code)}</span>`;

function makeStandings(series) {
  return data[series].map(([name,code,points,wins,draws,losses,gf,ga]) => ({
    name,code,points,wins,draws,losses,gf,ga,played:wins+draws+losses,gd:gf-ga
  })).sort((a,b) => b.points-a.points || b.wins-a.wins || b.gd-a.gd || b.gf-a.gf);
}
function renderStandings() {
  const body = $("#standings-body");
  if (!body) return;
  const series = $("#series-select")?.value || initialSeries;
  const standings = makeStandings(series);
  body.innerHTML = standings.map((team,index) => {
    const zone = index < 4 ? "zone-libertadores" : index < 6 ? "zone-sulamericana" : index >= 16 ? "zone-relegation" : "";
    return `<tr class="${zone}">
      <td class="position">${index+1}</td>
      <td><div class="team-cell">${logo(team.code)}<span>${safeText(team.name)}</span></div></td>
      <td class="points">${team.points}</td><td>${team.played}</td><td>${team.wins}</td><td>${team.draws}</td><td>${team.losses}</td><td>${team.gf}</td><td>${team.ga}</td><td>${team.gd>0?"+":""}${team.gd}</td>
    </tr>`;
  }).join("");
  const heading = $("#competition-title");
  if (heading) heading.textContent = `Brasileirão ${seriesName(series)}`;
}
const seriesSelect = $("#series-select");
if (seriesSelect) {
  seriesSelect.value = initialSeries;
  seriesSelect.addEventListener("change", renderStandings);
  renderStandings();
}

function renderMatches() {
  const target = $("#match-list");
  if (!target) return;
  const series = $("#match-series")?.value || "Todas";
  const search = ($("#match-search")?.value || "").trim().toLocaleLowerCase("pt-BR");
  const matches = data.matches.filter(match =>
    (series === "Todas" || match.series === series) &&
    `${match.home} ${match.away}`.toLocaleLowerCase("pt-BR").includes(search)
  );
  target.innerHTML = matches.length ? matches.map(match => `
    <article class="match-card">
      <div class="match-meta"><span>BRASILEIRÃO ${seriesName(match.series).toUpperCase()} · ${match.round}ª RODADA</span><span>${safeText(match.date)}</span></div>
      <div class="match-teams">
        <div class="match-side">${logo(match.homeCode)}<span>${safeText(match.home)}</span></div>
        <div class="match-score">${match.homeScore === null ? "—" : `${match.homeScore} : ${match.awayScore}`}</div>
        <div class="match-side">${logo(match.awayCode)}<span>${safeText(match.away)}</span></div>
      </div>
      <div class="match-status-label">${safeText(match.status)}</div>
    </article>`).join("") : `<div class="empty-state">Nenhuma partida encontrada com esses filtros.</div>`;
}
$("#match-series")?.addEventListener("change", renderMatches);
$("#match-search")?.addEventListener("input", renderMatches);
renderMatches();

function renderScorers() {
  const body = $("#scorers-body");
  if (!body) return;
  const series = $("#scorer-series")?.value || "Todas";
  const search = ($("#scorer-search")?.value || "").trim().toLocaleLowerCase("pt-BR");
  const scorers = data.scorers.filter(player =>
    (series === "Todas" || player.series === series) &&
    `${player.name} ${player.club}`.toLocaleLowerCase("pt-BR").includes(search)
  ).sort((a,b) => b.goals-a.goals || a.name.localeCompare(b.name,"pt-BR"));
  body.innerHTML = scorers.length ? scorers.map((player,index) => `
    <tr><td class="rank-num">${index+1}</td>
      <td><div class="team-cell">${logo(player.name.split(" ").map(part=>part[0]).join("").slice(0,3).toUpperCase())}<div><div class="player-name">${safeText(player.name)}</div><div class="player-club">${safeText(player.club)} · Série ${player.series}</div></div></div></td>
      <td><span class="goal-count">${player.goals}</span></td></tr>`).join("")
    : `<tr><td colspan="3" class="empty-state">Nenhum jogador encontrado.</td></tr>`;
}
$("#scorer-series")?.addEventListener("change", renderScorers);
$("#scorer-search")?.addEventListener("input", renderScorers);
renderScorers();
