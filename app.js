const demoMatches = [
 {league:"Portugal",time:"20:15",home:"Sporting",away:"Braga",p:[54,25,21]},
 {league:"Inglaterra",time:"17:30",home:"Arsenal",away:"Liverpool",p:[42,28,30]},
 {league:"Espanha",time:"19:00",home:"Real Madrid",away:"Sevilla",p:[68,19,13]},
 {league:"Itália",time:"20:45",home:"Inter",away:"Roma",p:[57,25,18]},
 {league:"Alemanha",time:"18:30",home:"Bayern",away:"Dortmund",p:[61,20,19]},
 {league:"França",time:"21:00",home:"PSG",away:"Lyon",p:[70,17,13]},
 {league:"Liga dos Campeões",time:"20:00",home:"Equipa A",away:"Equipa B",p:[46,27,27]},
 {league:"Liga Europa",time:"20:00",home:"Equipa C",away:"Equipa D",p:[39,31,30]}
];
const host=document.querySelector("#matches"), league=document.querySelector("#league");
function render(){
 const list=demoMatches.filter(m=>league.value==="Todas"||m.league===league.value);
 document.querySelector("#matchCount").textContent=list.length;
 host.innerHTML=list.map(m=>`<article class="match"><div class="match-top"><span class="league-name">${m.league.toUpperCase()}</span><span>${m.time} · Exemplo</span></div><div class="teams"><span>${m.home}</span><span class="vs">VS</span><span>${m.away}</span></div><div class="prob"><div><small>Casa</small><b>${m.p[0]}%</b></div><div><small>Empate</small><b>${m.p[1]}%</b></div><div><small>Fora</small><b>${m.p[2]}%</b></div></div><div class="demo-tag">● PROBABILIDADES FICTÍCIAS — DEMONSTRAÇÃO</div></article>`).join("")||'<p class="muted">Sem jogos nesta competição de demonstração.</p>';
}
league.addEventListener("change",render);document.querySelector("#refresh").addEventListener("click",render);render();
if("serviceWorker" in navigator && location.protocol.startsWith("http")) navigator.serviceWorker.register("./sw.js").catch(()=>{});
