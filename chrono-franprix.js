(()=>{'use strict'; const $=id=>document.getElementById(id),host=$('fpclock');
host.innerHTML="<section id=\"clock\" aria-label=\"Chronomètre de séquence\"><b id=\"clockLabel\"></b><span>Écoulé <strong id=\"elapsed\">00:00</strong></span><span>Restant <strong id=\"remaining\">00:00</strong></span><button id=\"clockPlay\" onclick=\"clockCommand('toggle')\">Démarrer</button><details><summary>Régler</summary><div><label>Durée (min) <input id=\"clockDuration\" type=\"number\" min=\"1\" max=\"120\" onchange=\"clockCommand('duration')\"></label><button onclick=\"clockCommand('reset')\">Remettre à zéro</button><button id=\"clockSound\" onclick=\"clockCommand('sound')\">Son activé</button></div></details><span role=\"status\" id=\"clockAlarm\"></span></section>";
const names=["Prise de poste", "Acheminer les produits", "Choisir le mobilier", "Présenter le rayon", "Inspecter le rayon", "Bilan", "Lexique Game", "Google Forms", "Entraînement"];
function sequenceIndex(){if(typeof formsOpen!=='undefined')return formsOpen?7:6;if(typeof page==='undefined')return 0;if(page==='step')return steps[current][0];return page==='exam'?7:page==='home'?0:8;}
const style=document.createElement('style');style.textContent='#fpclock #clock{background:#fff0de;padding:6px max(3vw,12px);display:flex;align-items:center;gap:5px 14px;flex-wrap:wrap;font:15px/1.35 Arial,sans-serif;font-variant-numeric:tabular-nums}#fpclock #clock strong{font-size:1.2em}#fpclock button,#fpclock summary{min-height:0;padding:.3em .6em;font:inherit;cursor:pointer}#fpclock details{background:white;padding:3px 7px;border-radius:8px;margin:0}#fpclock input{width:60px}#fpclock .elapsed{outline:2px solid #bc4d15}';document.head.appendChild(style);
const minutes=[4,10,8,12,12,6,12,8,6];
const clockKey='2epc-franprix-chrono-v1';
let clocks={},audioCtx=null,sound=true,clockIndex=null;
try{const old=JSON.parse(sessionStorage.getItem(clockKey));if(old){clocks=old.clocks||{};sound=old.sound!==false;clockIndex=old.index;}}catch{}
const clockBox=$('clock');
function storeClock(){try{sessionStorage.setItem(clockKey,JSON.stringify({clocks,sound,index:clockIndex}));}catch{}}
function timer(i){return clocks[i]||(clocks[i]={limit:minutes[i]*60,spent:0,since:0,rang:false});}
function spent(t){return t.spent+(t.since?Math.max(0,Date.now()-t.since)/1000:0);}
function pauseTimer(t){t.spent=spent(t);t.since=0;}
function clockFormat(sec){const n=Math.max(0,Math.floor(sec));return String(Math.floor(n/60)).padStart(2,'0')+':'+String(n%60).padStart(2,'0');}
function allowSound(){try{const C=window.AudioContext||window.webkitAudioContext;if(C){audioCtx=audioCtx||new C();audioCtx.resume().catch(()=>{});}}catch{}}
function chime(){if(!audioCtx||audioCtx.state!=='running'||!sound)return;for(const [offset,hz] of [[0,660],[0.23,850]]){const o=audioCtx.createOscillator(),g=audioCtx.createGain(),start=audioCtx.currentTime+offset;o.frequency.value=hz;g.gain.setValueAtTime(.0001,start);g.gain.exponentialRampToValueAtTime(.12,start+.02);g.gain.exponentialRampToValueAtTime(.0001,start+.19);o.connect(g);g.connect(audioCtx.destination);o.start(start);o.stop(start+.20);}}
function switchClock(i){
 if(clockIndex===i)return;const was=clockIndex!=null&&timer(clockIndex).since;
 if(was)pauseTimer(timer(clockIndex));clockIndex=i;
 const t=timer(i);if(was&&spent(t)<t.limit)t.since=Date.now();storeClock();
}
function clockCommand(action){
 const t=timer(clockIndex);allowSound();
 if(action==='toggle'){if(t.since)pauseTimer(t);else if(spent(t)<t.limit)t.since=Date.now();}
 if(action==='reset'){t.since=0;t.spent=0;t.rang=false;}
 if(action==='sound')sound=!sound;
 if(action==='duration'){const val=Number($('clockDuration').value);if(Number.isInteger(val)&&val>=1&&val<=120){t.limit=val*60;t.rang=false;}}
 storeClock();tickClock();
}
function tickClock(){
 const i=sequenceIndex(),changed=clockIndex!==i;switchClock(i);
 const t=timer(i);
 if(changed||document.activeElement!==$('clockDuration'))$('clockDuration').value=t.limit/60;
 const elapsed=spent(t);
 if(elapsed>=t.limit&&!t.rang){t.spent=t.limit;t.since=0;t.rang=true;chime();storeClock();}
 $('clockLabel').textContent=names[i];$('elapsed').textContent=clockFormat(Math.min(elapsed,t.limit));$('remaining').textContent=clockFormat(t.limit-Math.floor(elapsed));
 $('clockPlay').textContent=t.since?'Pause':t.spent?'Reprendre':'Démarrer';$('clockPlay').disabled=t.rang;
 $('clockSound').textContent=sound?'Son activé':'Son coupé';$('clockSound').setAttribute('aria-pressed',String(sound));
 $('clockAlarm').textContent=t.rang?'Temps écoulé · passez à la suite.':'';clockBox.classList.toggle('elapsed',t.rang);
}
tickClock();setInterval(tickClock,350);

window.clockCommand=clockCommand;})();