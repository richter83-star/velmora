import './styles.css';
import { createRng, randomSeed, dailySeed } from './engine/rng';
import { PATHS } from './content/paths';
import { TRAITS } from './content/traits';
import { WORLD } from './content/world';
import { ALL_EVENTS as EVENTS } from './content/all-events';
import { FIRST, SUR } from './content/names';
import { evaluateEnding } from './engine/endings';
import { ARC_EVENTS } from './content/arcs';
import { antagonist, antagonistContestModifier, dispositionLabel } from './engine/npcs';
import { ANTAGONIST_ROLE, ANTAGONIST_START_RELATIONSHIP } from './content/npcs';
import { NPC_EVENTS } from './content/npc-events';
import { SCANDAL_EVENTS } from './content/scandals';
import { difficultyById, applyDifficultyStart, rollModifiers, applyModifier } from './engine/setup';
import { DIFFICULTIES, DEFAULT_DIFFICULTY, MODIFIERS } from './content/setup';
import { PACK_1 } from './content/events-pack-1';
import { chooseNext } from './engine/draw';
import { pickHeadlines } from './content/headlines';
import { buildEpilogue } from './engine/epilogue';
import { deriveIdeology } from './engine/ideology';
import { blocList } from './engine/factions';
import { advisorDef, advisorSlate, appointAdvisor, servingAdvisors } from './engine/cabinet';
import { applyFx } from './engine/mutate';
import { applyChoice } from './engine/resolve';
import { deathCause, advanceTurnState } from './engine/turn';
import { promoPlayerStrength, contestOppStrength, promoWinChance } from './engine/contest';
import { blankRun } from './engine/state';
// The full draw pool (base bank + packs) is assembled in content/all-events.ts.

/* ================================================================
   VELMORA · engine + content   (vanilla JS, no build, PWA-ready)
   All game state lives in S (plain data → serializable saves).
   ================================================================ */
(function(){
"use strict";
const VERSION="1.0.0", SAVE_KEY="velmora_save_v1";

/* ---------- tiny utils / RNG ---------- */
const clamp=(n,a=0,b=100)=>Math.max(a,Math.min(b,n));
// Seeded PRNG (engine/rng.ts). _rng is (re)seeded per run in startCareer and
// restored on resume, so runs are reproducible from a seed. Helper names are
// unchanged, so every call site (rint/pick/chance/shuffle/weightedPick…) is untouched.
let _rng = createRng(randomSeed());
const rng=()=>_rng.next();
const rint=(a,b)=>_rng.int(a,b);
const pick=a=>_rng.pick(a);
const chance=p=>_rng.chance(p);
const shuffle=a=>_rng.shuffle(a);
const cap=s=>s.charAt(0).toUpperCase()+s.slice(1);
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];

const STAT_KEYS=["support","funds","influence","media","base","heat"];

/* ---------- gauge icons (inline SVG) ---------- */
const ICON={
 support:`<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" fill="#E63B5B" stroke="#1A1726" stroke-width="1.8"/><path d="M5 21c0-4 3-6 7-6s7 2 7 6" fill="#E63B5B" stroke="#1A1726" stroke-width="1.8" stroke-linecap="round"/></svg>`,
 funds:`<svg viewBox="0 0 24 24"><ellipse cx="12" cy="7" rx="8" ry="3.2" fill="#F5C542" stroke="#1A1726" stroke-width="1.8"/><path d="M4 7v6c0 1.8 3.6 3.2 8 3.2s8-1.4 8-3.2V7" fill="#F5C542" stroke="#1A1726" stroke-width="1.8"/><path d="M4 13v4c0 1.8 3.6 3.2 8 3.2s8-1.4 8-3.2v-4" fill="#F5C542" stroke="#1A1726" stroke-width="1.8"/></svg>`,
 influence:`<svg viewBox="0 0 24 24"><path d="M7 13l-3 3 4 4 3-3" fill="#3B6FE6" stroke="#1A1726" stroke-width="1.8" stroke-linejoin="round"/><path d="M17 13l3 3-4 4-3-3" fill="#3B6FE6" stroke="#1A1726" stroke-width="1.8" stroke-linejoin="round"/><path d="M9 14l3-3 3 3" fill="none" stroke="#1A1726" stroke-width="1.8" stroke-linecap="round"/></svg>`,
 media:`<svg viewBox="0 0 24 24"><path d="M4 10v4h4l6 4V6l-6 4H4z" fill="#2FB67D" stroke="#1A1726" stroke-width="1.8" stroke-linejoin="round"/><path d="M17 9c1.5 1.5 1.5 4.5 0 6" fill="none" stroke="#1A1726" stroke-width="1.8" stroke-linecap="round"/></svg>`,
 base:`<svg viewBox="0 0 24 24"><circle cx="8" cy="9" r="3" fill="#A65BD6" stroke="#1A1726" stroke-width="1.6"/><circle cx="16" cy="9" r="3" fill="#A65BD6" stroke="#1A1726" stroke-width="1.6"/><path d="M3 20c0-3 2.2-4.5 5-4.5S13 17 13 20M11 20c0-3 2.2-4.5 5-4.5s5 1.5 5 4.5" fill="#A65BD6" stroke="#1A1726" stroke-width="1.6"/></svg>`,
 heat:`<svg viewBox="0 0 24 24"><path d="M12 3c1 4-3 5-3 9a3 3 0 006 0c0-2-1-3-1-3 2 1 3 3 3 5a5 5 0 11-10 0c0-5 5-7 5-11z" fill="#FF7A3C" stroke="#1A1726" stroke-width="1.6" stroke-linejoin="round"/></svg>`
};
const FILL={support:"#E63B5B",funds:"#F5C542",influence:"#3B6FE6",media:"#2FB67D",base:"#A65BD6",heat:"#FF7A3C"};




/* ================================================================
   CARTOON AVATAR GENERATOR  — parametric SVG, expression-driven.
   ================================================================ */
const SKIN=["#F2C39B","#E8B07E","#C98D5E","#9C6B43","#6E4A2E","#F6D2B8","#D69A6E"];
const HAIRC=["#2B2118","#3F2A1A","#6E4A2E","#B5772E","#C9C4BE","#E0C36A","#7A1F1F","#1A1726"];
const SUIT={ballot:["#2A4E9B","#1F3A6E","#7A1E2B","#3B3550","#2F6B57","#54407a"],
            vanguard:["#3A3A3A","#5C0D0a","#2E3B2E","#4A3A1F","#1A1726","#6b4f12"]};
const TIES=["#E63B5B","#F5C542","#3B6FE6","#2FB67D","#A65BD6","#FF7A3C"];

function randAvatar(side){
 return {skin:rint(0,SKIN.length-1),hair:rint(0,7),hairc:rint(0,HAIRC.length-1),
   suit:rint(0,5),tie:rint(0,TIES.length-1),acc:pick(["none","none","glasses","pin","cap"]),side:side||"ballot"};
}
const EXPR={
 happy:{brow:[-2,2],lid:0,mouth:"smile",pupil:0},
 smug:{brow:[3,-3],lid:5,mouth:"smirk",pupil:1.5},
 neutral:{brow:[0,0],lid:0,mouth:"flat",pupil:0},
 worried:{brow:[4,4],lid:-2,mouth:"oh",pupil:0},
 angry:{brow:[6,-6],lid:3,mouth:"frown",pupil:-1}
};

function buildAvatar(a,expr="neutral",sweat=false){
 const sk=SKIN[a.skin], hc=HAIRC[a.hairc], st=(SUIT[a.side]||SUIT.ballot)[a.suit], ti=TIES[a.tie];
 const e=EXPR[expr]||EXPR.neutral;
 const ink="#1A1726";
 // eyes
 const eyeY=46, exL=38, exR=62, pr=e.pupil;
 const lidH=Math.max(0,e.lid);
 const eye=(cx)=>`
   <ellipse cx="${cx}" cy="${eyeY}" rx="6" ry="${7-lidH*0.4}" fill="#fff" stroke="${ink}" stroke-width="2"/>
   <circle cx="${cx+pr}" cy="${eyeY+1}" r="3" fill="${ink}"/>
   ${lidH>2?`<path d="M${cx-6} ${eyeY-4} q6 -3 12 0" fill="${sk}" stroke="${ink}" stroke-width="2"/>`:""}`;
 // brows
 const brow=(cx,tilt)=>`<path d="M${cx-6} ${37+tilt*0.6} q6 ${-3-tilt*0.4} 12 0" fill="none" stroke="${ink}" stroke-width="2.6" stroke-linecap="round"/>`;
 // mouth
 let mouth="";
 if(e.mouth==="smile") mouth=`<path d="M40 64 q10 10 20 0" fill="none" stroke="${ink}" stroke-width="3" stroke-linecap="round"/>`;
 else if(e.mouth==="smirk") mouth=`<path d="M41 65 q12 6 19 -2" fill="none" stroke="${ink}" stroke-width="3" stroke-linecap="round"/>`;
 else if(e.mouth==="flat") mouth=`<path d="M42 65 h16" fill="none" stroke="${ink}" stroke-width="3" stroke-linecap="round"/>`;
 else if(e.mouth==="oh") mouth=`<ellipse cx="50" cy="66" rx="5" ry="6" fill="#8a2b2b" stroke="${ink}" stroke-width="2.4"/>`;
 else if(e.mouth==="frown") mouth=`<path d="M40 68 q10 -10 20 0" fill="none" stroke="${ink}" stroke-width="3" stroke-linecap="round"/>`;
 // hair styles
 let hair="";
 const H=a.hair;
 if(H===0) hair=`<path d="M26 38 q0 -22 24 -22 t24 22 q-6 -10 -24 -10 t-24 10z" fill="${hc}" stroke="${ink}" stroke-width="2.4"/>`;
 else if(H===1) hair=`<path d="M26 36 q2 -24 24 -24 q22 0 24 22 q-10 -14 -22 -10 q4 -4 -6 0 q-14 2 -20 12z" fill="${hc}" stroke="${ink}" stroke-width="2.4"/>`;
 else if(H===2) hair=`<path d="M28 40 q-2 -10 6 -16 M72 40 q2 -10 -6 -16" fill="none" stroke="${hc}" stroke-width="6" stroke-linecap="round"/><path d="M30 30 q20 -12 40 0" fill="none" stroke="${hc}" stroke-width="4"/>`;
 else if(H===3){hair=`<path d="M26 38 q0 -22 24 -22 t24 22 q-6 -10 -24 -10 t-24 10z" fill="${hc}" stroke="${ink}" stroke-width="2.4"/><circle cx="50" cy="13" r="8" fill="${hc}" stroke="${ink}" stroke-width="2.4"/>`;}
 else if(H===4) hair=`<path d="M28 36 q2 -20 22 -20 t22 20 q-8 -8 -22 -8 t-22 8z" fill="${hc}" stroke="${ink}" stroke-width="2.4" opacity="0.92"/>`;
 else if(H===5) hair=`<path d="M24 60 q-2 -44 26 -44 t26 44 q-4 -30 -26 -30 t-26 30z" fill="${hc}" stroke="${ink}" stroke-width="2.4"/>`;
 else if(H===6) hair=`<path d="M26 38 q0 -24 24 -24 t24 24 q-6 -12 -24 -12 t-24 12z" fill="${hc}" stroke="${ink}" stroke-width="2.4"/><path d="M70 20 q12 6 8 24" fill="none" stroke="${hc}" stroke-width="5" stroke-linecap="round"/>`;
 else hair=`<path d="M27 37 q1 -23 23 -23 t23 23 q-7 -11 -23 -11 t-23 11z" fill="${hc}" stroke="${ink}" stroke-width="2.4"/>`;
 // accessory
 let acc="";
 if(a.acc==="glasses") acc=`<g fill="none" stroke="${ink}" stroke-width="2.4"><rect x="31" y="40" width="14" height="11" rx="3" fill="#bfe6ff" fill-opacity="0.5"/><rect x="55" y="40" width="14" height="11" rx="3" fill="#bfe6ff" fill-opacity="0.5"/><path d="M45 45 h10"/></g>`;
 if(a.acc==="pin") acc=`<circle cx="36" cy="84" r="3.6" fill="${ti}" stroke="${ink}" stroke-width="1.8"/>`;
 if(a.acc==="cap"){const capc=a.side==="vanguard"?"#3a3a3a":"#1f3a6e";acc=`<path d="M24 30 q26 -16 52 0 q2 -14 -26 -14 t-26 14z" fill="${capc}" stroke="${ink}" stroke-width="2.4"/><rect x="30" y="29" width="40" height="6" rx="3" fill="${capc}" stroke="${ink}" stroke-width="2.4"/><path d="M44 25 l6 -6 6 6z" fill="${a.side==='vanguard'?'#E5332A':'#F5C542'}" stroke="${ink}" stroke-width="1.6"/>`;}
 const sweatEl=sweat?`<path d="M74 44 q5 8 0 12 q-5 -4 0 -12z" fill="#5cc6ff" stroke="${ink}" stroke-width="1.6"/>`:"";
 return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
   <path d="M30 78 q20 -10 40 0 v22 h-40z" fill="${st}" stroke="${ink}" stroke-width="2.6"/>
   <path d="M44 74 h12 v8 q-6 5 -12 0z" fill="${sk}" stroke="${ink}" stroke-width="2.4"/>
   ${a.side==="vanguard"
     ? `<path d="M50 80 l-8 4 v14 h16 v-14z" fill="${st}" stroke="${ink}" stroke-width="2.2"/><path d="M50 82 l-6 4 6 4 6 -4z" fill="${ti}" stroke="${ink}" stroke-width="1.6"/>`
     : `<path d="M50 80 l-5 4 5 16 5 -16z" fill="${ti}" stroke="${ink}" stroke-width="2.2" stroke-linejoin="round"/><path d="M50 80 l-5 4 5 3 5 -3z" fill="${ti}" stroke="${ink}" stroke-width="1.6"/>`}
   <ellipse cx="50" cy="50" rx="25" ry="27" fill="${sk}" stroke="${ink}" stroke-width="2.8"/>
   <ellipse cx="25" cy="52" rx="4" ry="6" fill="${sk}" stroke="${ink}" stroke-width="2.4"/>
   <ellipse cx="75" cy="52" rx="4" ry="6" fill="${sk}" stroke="${ink}" stroke-width="2.4"/>
   ${eye(exL)}${eye(exR)}
   ${brow(exL,e.brow[0])}${brow(exR,e.brow[1])}
   <path d="M48 54 q2 4 4 0" fill="none" stroke="${ink}" stroke-width="1.8" stroke-linecap="round"/>
   ${mouth}${sweatEl}${hair}${acc}
 </svg>`;
}

/* ================================================================
   CONTENT BANK
   EVENTS.push(...) is used so the bank can be assembled in pieces.
   Schema (see README): {id,paths,phases,weight,recurring,queueOnly,
     req(S),art,emoji,kicker,title,body,speaker,choices:[
       {label,hint,fx,req,reqText,set,inc,roll,result,then,ending,tone}]}
   ================================================================ */


/* ================================================================
   ENGINE — all game state lives in S (a plain, serializable object).
   ================================================================ */
let S=null;
const DRAFT={path:"ballot",name:"",avatar:null,faction:null,trait:null,difficulty:DEFAULT_DIFFICULTY,seed:null,daily:false};

const curPhase=()=>PATHS[S.path].phases[S.phase-1];

/* ---- Mutation helpers (applyFx/setFlags/incFlags/queueThen/markSeen), the dice
   roll, and full choice resolution now live in the shared pure engine modules
   engine/mutate.ts + engine/resolve.ts, used by BOTH this live engine and the
   headless simulator (engine/sim.ts) so the two can never diverge. applyFx is
   imported at the top of this file for the trait bonus in startCareer. ---- */

/* ---- world + rivals ---- */
function rollWorld(){
  S.world={economy:pick(WORLD.economy),mood:pick(WORLD.mood),tension:pick(WORLD.tension)};
}
function maybeRerollWorld(){
  if(chance(.55)){
    const axis=pick(["economy","mood","tension"]);
    S.world[axis]=pick(WORLD[axis]);
  }
}
function createAntagonist(){
  const P=PATHS[S.path];
  const free=P.oppNames.filter(n=>!S.usedOpp.includes(n));
  const name=free.length?pick(free):pick(P.oppNames);
  S.usedOpp.push(name);
  S.npcs.antagonist={ id:"antagonist", name, role:ANTAGONIST_ROLE[S.path], kind:"antagonist",
    avatar:buildAvatar(randAvatar(S.path),"smug"), relationship:ANTAGONIST_START_RELATIONSHIP,
    loyalty:0, met:false, firstPhase:S.phase };
  S.antagonistId="antagonist";
}
function assignOpponent(){
  // The recurring antagonist is your opponent at every office — they rise with you.
  const a=(S.npcs&&S.antagonistId)?S.npcs[S.antagonistId]:null;
  if(a){ S.opp=a.name; S.oppAvatar=a.avatar; return; }
  // Fallback for old saves that predate the antagonist roster.
  const P=PATHS[S.path];
  const free=P.oppNames.filter(n=>!S.usedOpp.includes(n));
  const name=free.length?pick(free):pick(P.oppNames);
  S.usedOpp.push(name);
  S.opp=name;
  S.oppAvatar=buildAvatar(randAvatar(S.path),pick(["smug","neutral","angry","smug"]));
}
function generateRivals(){
  const P=PATHS[S.path];
  const roles=S.path==="ballot"
    ? ["the incumbent","a media darling","a self-funded outsider","a party boss"]
    : ["a doctrinaire hardliner","a security-organ chief","a provincial strongman","a rising technocrat"];
  const names=shuffle(P.oppNames).slice(0,3);
  S.rivals=names.map((n,i)=>({
    name:n, role:roles[i%roles.length],
    avatar:buildAvatar(randAvatar(S.path),pick(["neutral","smug","angry"])),
    strength:rint(38,62)
  }));
}

/* ---- crisis probability scales with instability ---- */
function curDifficulty(){ return difficultyById(DIFFICULTIES, (S&&S.difficulty)||DEFAULT_DIFFICULTY); }
/* ---- the core turn driver (selection logic lives in engine/draw.ts) ---- */
function nextEvent(){
  const d=chooseNext(S, EVENTS, _rng, { crisisMult: curDifficulty().crisisMult, scandalMult: curDifficulty().scandalMult });
  if(d.type==="promotion"){ startPromotion(); return; }
  showEvent(d.event);
}
function showEvent(ev){
  S.current=ev.id; S.mode="event"; S.lastResult=null;
  renderHUD(); renderEvent(ev);
}

/* ---- resolving a choice ---- */
function resolveChoice(ci){
  const ev=EVENTS.find(e=>e.id===S.current);
  if(!ev) return;
  const ch=ev.choices[ci];
  if(!ch) return;
  if(ch.req && !ch.req(S)) return; // locked

  // All state mutation (fx/flags/arcs/npcs/scandals, the roll, queued `then`s,
  // stat deltas and markSeen) happens in the shared pure resolver. This wrapper
  // only translates the outcome into UI state and renders it.
  const out=applyChoice(S, ev, ci, _rng);
  if(!out) return;
  S.lastDeltas=out.deltas;

  const rollLine=out.rollLine
    ? {win:out.rollLine.win, stat:statLabel(out.rollLine.stat), chance:out.rollLine.chance}
    : null;

  pushLog(ev,ch.label,out.text);

  // death check (show the consequence first, resolve on continue)
  S.pendingDeath=deathCause(S);
  S.pendingEndingCause=out.endingCause;

  S.lastResult={title:ev.title,text:out.text,rollLine,tone:ch.tone||"good"};
  S.mode="result";
  renderHUD(); renderResult();
  save();
}
function statLabel(k){ return PATHS[S.path].statNames[k]||cap(k); }

/* ---- pressing Continue after a result ---- */
function afterResult(){
  if(S.pendingEndingCause){ endGame(S.pendingEndingCause); return; }
  if(S.pendingDeath){ endGame(S.pendingDeath); return; }
  advanceTurn();
}
function advanceTurn(){
  const before=(S.cabinet||[]).map(c=>c.id);
  advanceTurnState(S);
  const left=before.filter(id=>!(S.cabinet||[]).some(c=>c.id===id));
  if(left.length){ const d=advisorDef(S.path,left[0]); toast((d?d.emoji+" "+d.name:"An advisor")+" resigns in disloyalty — and leaks on the way out"); }
  const dc=deathCause(S); if(dc){ endGame(dc); return; }
  if(S.phaseTurn>=curPhase().goalTurns){ startPromotion(); return; }
  nextEvent(); save();
}

/* ================================================================
   PROMOTIONS — election / powerplay / finale
   ================================================================ */
function promoBoosts(ph){
  if(ph.promo.type==="election"){
    return [
      {id:"war",label:"💸 Empty the War Chest",cost:{funds:16},gain:9,need:"funds",reqText:"War Chest 16+"},
      {id:"air",label:"📺 Flood the Airwaves",cost:{media:0,funds:10},gain:7,need:"funds",reqText:"War Chest 10+"},
      {id:"gotv",label:"🚪 Massive Turnout Push",cost:{base:14},gain:8,need:"base",reqText:"Base 14+"}
    ];
  }
  return [
    {id:"fav",label:"🤝 Call In Every Favor",cost:{influence:16},gain:9,need:"influence",reqText:"Standing 16+"},
    {id:"loy",label:"✊ Rally Your Loyalists",cost:{base:14},gain:8,need:"base",reqText:"Loyalty 14+"},
    {id:"smear",label:"🗞️ Smear the Rival",cost:{media:12},gain:7,need:"media",reqText:"Propaganda 12+",heat:5}
  ];
}
function startPromotion(){
  const ph=curPhase();
  S.mode="promo";
  if(ph.promo.type==="finale"){
    S.promo={type:"finale",ph,resolved:false};
    renderHUD(); renderPromotion(); save(); return;
  }
  const _antag=antagonist(S);
  const _hostility=_antag?antagonistContestModifier(_antag.relationship):0;
  const oppStrength=contestOppStrength(S,_rng,ph.promo.baseOpp,_hostility,curDifficulty().oppBonus);
  S.promo={
    type:ph.promo.type, ph,
    opp:{name:S.opp,avatar:S.oppAvatar,strength:oppStrength,disposition:_antag?dispositionLabel(_antag.relationship):""},
    player:promoPlayerStrength(S, ph.promo.type),
    boosts:promoBoosts(ph), used:[], resolved:false, result:null
  };
  renderHUD(); renderPromotion(); save();
}
function applyBoost(id){
  const b=S.promo.boosts.find(x=>x.id===id);
  if(!b || S.promo.used.includes(id)) return;
  // affordability
  for(const k in b.cost){ if((S.stats[k]||0)<b.cost[k]) { toast("Not enough "+statLabel(k)); return; } }
  for(const k in b.cost) S.stats[k]=clamp(S.stats[k]-b.cost[k]);
  if(b.heat) S.stats.heat=clamp(S.stats.heat+b.heat);
  S.promo.player=clamp(S.promo.player+b.gain,0,100);
  S.promo.used.push(id);
  renderHUD(); renderPromotion(); save();
}
function resolvePromotion(){
  if(S.promo.resolved) return;
  const wc=promoWinChance(S.promo.player,S.promo.opp.strength);
  const win=rng()*100<wc;
  let pShare=clamp(40+(S.promo.player-S.promo.opp.strength)*0.7+rint(-5,5),18,82);
  if(win && pShare<=50) pShare=50+rint(1,7);
  if(!win && pShare>50) pShare=50-rint(1,7);
  S.promo.result={win,pShare:Math.round(pShare),oShare:Math.round(100-pShare),chance:Math.round(wc)};
  S.promo.resolved=true;
  renderPromotionResult();
  save();
}
function afterPromotion(){
  if(S.promo.type==="finale"){ endGame("finale"); return; }
  if(S.promo.result && S.promo.result.win){ advancePhase(); }
  else { endGame(S.promo.type==="election"?"lost_election":"lost_powerplay"); }
}
function advancePhase(){
  S.phase++;
  S.phaseTurn=0;
  S.promo=null;
  S.player.title=curPhase().title;
  assignOpponent();
  maybeRerollWorld();
  toast("Promoted to "+S.player.title+"!");
  renderHUD();
  offerCabinet();
}

/* ---- cabinet: appoint an advisor at each promotion ---- */
function offerCabinet(){
  const slate=advisorSlate(S,_rng,2);
  S.cabinetOffer=slate.map(a=>a.id);
  if(!S.cabinetOffer.length){ S.mode="event"; nextEvent(); save(); return; }
  S.mode="cabinet";
  renderCabinet();
  save();
}
function renderCabinet(){
  const defs=(S.cabinetOffer||[]).map(id=>advisorDef(S.path,id)).filter(Boolean);
  const cards=defs.map(d=>`<button class="choice advisor-card" data-adv="${d.id}">
      <span class="adv-emoji">${d.emoji}</span>
      <span class="adv-body">
        <span class="adv-title">${esc(d.title)}</span>
        <span class="adv-name">${esc(d.name)}</span>
        <span class="adv-desc">${esc(d.desc)}</span>
      </span>
    </button>`).join("");
  $("#stage").innerHTML=`<div class="cabinet-pick">
    <div class="cab-eyebrow">A Higher Office</div>
    <h3 class="cab-h">Appoint an Advisor</h3>
    <p class="cab-sub">Choose who joins your inner circle. They serve you — and keep serving only as long as you keep them loyal.</p>
    ${cards}
    <button class="choice adv-decline" data-adv="">Appoint no one — keep your own counsel</button>
  </div>`;
  $$("#stage .choice").forEach(el=>el.addEventListener("click",()=>chooseAdvisor(el.dataset.adv)));
}
function chooseAdvisor(id){
  if(S.mode!=="cabinet") return;
  if(id){ appointAdvisor(S,id); const d=advisorDef(S.path,id); if(d) toast(d.emoji+" "+d.name+" joins your cabinet"); }
  S.cabinetOffer=null;
  S.mode="event";
  renderHUD();
  nextEvent();
  save();
}

/* ---- ending ---- */
function endGame(cause){
  S.over=true; S.mode="over";
  S.ending=evaluateEnding(S,cause);
  clearSave();
  renderEnding();
}

/* ---- career log ---- */
function pushLog(ev,choice,result){
  S.log.push({tag:ev.title, choice, result, office:S.player.title, yr:S.totalTurns+1});
  if(S.log.length>60) S.log.shift();
}

/* ================================================================
   RENDERING
   ================================================================ */
function esc(s){return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");}
function fmt(s){return esc(s);}
function go(name){ $$(".screen").forEach(s=>s.classList.remove("active")); const t=$("#screen-"+name); if(t)t.classList.add("active"); try{window.scrollTo(0,0);}catch(e){} }
function setTheme(cls){ document.body.className=cls||"theme-neutral"; }
function worldShort(){ return cap(S.world.economy.k)+" · "+cap(S.world.mood.k); }

function moodExpr(){
  const s=S.stats;
  if(s.heat>=78||s.support<=20) return {expr:"worried",sweat:true};
  if(s.support>=68 && s.heat<46) return {expr:"smug",sweat:false};
  if(s.support>=52) return {expr:"happy",sweat:false};
  if(s.support<=34) return {expr:"angry",sweat:s.heat>56};
  if(s.heat>=62) return {expr:"worried",sweat:true};
  return {expr:"neutral",sweat:false};
}

function gaugeHtml(k){
  const v=S.stats[k];
  return `<div class="gauge" data-k="${k}">
    <div class="gi">${ICON[k]}</div>
    <div class="gbody">
      <div class="grow"><span class="glabel">${esc(statLabel(k))}</span><span class="gnum">${v}</span></div>
      <div class="gbar"><div class="gfill" style="width:${v}%;background:${FILL[k]}"></div></div>
    </div>
  </div>`;
}
function factionName(id){ const fs=(PATHS[S.path]&&PATHS[S.path].factions)||[]; const f=fs.find(x=>x.id===id); return f?f.name:id; }
function blocStance(v){ return v>=62?"good":(v<=38?"bad":"mid"); }
function loyaltyStance(v){ return v>=55?"good":(v<=30?"bad":"mid"); }
function cabinetChipsHtml(){
  const adv=servingAdvisors(S);
  if(!adv.length) return "";
  const chips=adv.map(a=>`<span class="cab-chip ${loyaltyStance(a.loyalty)}" title="${esc(a.name)} · ${esc(a.title)} · Loyalty ${a.loyalty}/100">${a.emoji}<b>${a.loyalty}</b></span>`).join("");
  return `<div class="cabinet-chips" aria-label="Cabinet">${chips}</div>`;
}
function blocStripHtml(){
  return blocList(S).map(b=>`<div class="bloc" title="${esc(factionName(b.id))} · ${b.value}/100">
    <span class="bloc-lbl">${esc(b.short)}</span>
    <span class="bloc-bar"><span class="bloc-fill ${blocStance(b.value)}" style="width:${b.value}%"></span></span>
  </div>`).join("");
}
function renderHUD(){
  if(!S) return;
  const P=PATHS[S.path], ph=curPhase(), m=moodExpr();
  const ava=buildAvatar(S.player.avatar,m.expr,m.sweat);
  $("#hud").innerHTML=`
    <div class="hud-top">
      <div class="hud-ava">${ava}</div>
      <div class="hud-id">
        <div class="hud-name">${esc(S.player.name)}</div>
        <span class="hud-badge">${ph.emoji} ${esc(S.player.title)}</span>
      </div>
      <div class="hud-meta">
        <div>${esc(P.land)}</div>
        <div><b>Yr ${S.totalTurns+1}</b> · ${esc(ph.kicker)}</div>
        <div>${esc(worldShort())}</div>
      </div>
    </div>
    <div class="gauges">${STAT_KEYS.map(gaugeHtml).join("")}</div>
    <div class="blocs" aria-label="Faction standings">${blocStripHtml()}</div>
    ${cabinetChipsHtml()}`;
  // stat-change floaties
  if(S.lastDeltas){
    for(const k in S.lastDeltas){
      const d=S.lastDeltas[k]; const g=$(`#hud .gauge[data-k="${k}"]`); if(!g)continue;
      const r=g.getBoundingClientRect();
      spawnDelta(r.right-34, r.top-2, d, (k==="heat"? d<0 : d>0));
      g.classList.add("flash");
    }
    S.lastDeltas=null;
  }
  renderTicker();
}
function renderTicker(){
  const el=$("#ticker"); if(!el) return;
  const items=pickHeadlines(S);
  if(!items.length){ el.innerHTML=""; return; }
  // Two copies of the sequence so the CSS marquee can loop seamlessly.
  const seq=items.map(h=>`<span class="tk-item">${esc(h)}</span>`).join('<span class="tk-dot">•</span>');
  el.innerHTML=`<div class="tk-track"><span class="tk-tag">VELMORA WIRE</span>${seq}<span class="tk-dot">•</span><span class="tk-tag">VELMORA WIRE</span>${seq}</div>`;
}
function spawnDelta(x,y,d,good){
  const el=document.createElement("div");
  el.className="delta "+(good?"up":"down");
  el.textContent=(d>0?"+":"")+d;
  el.style.left=x+"px"; el.style.top=y+"px";
  document.body.appendChild(el);
  setTimeout(()=>el.remove(),1250);
}

function fxChips(c){
  const chips=[];
  if(c.req && !c.req(S)) chips.push(`<span class="fxchip lock">🔒 ${esc(c.reqText||"Locked")}</span>`);
  if(c.roll) chips.push(`<span class="fxchip risk">🎲 ${esc(statLabel(c.roll.stat))} gamble</span>`);
  if(c.hint) chips.push(`<span class="fxchip">${esc(c.hint)}</span>`);
  if(c.fx){
    for(const k of STAT_KEYS){
      if(!(k in c.fx)) continue;
      const d=c.fx[k]; if(!d) continue;
      const good=(k==="heat")? d<0 : d>0;
      const arrow=d>0?"▲":"▼";
      chips.push(`<span class="fxchip ${good?'up':'down'}">${arrow} ${esc(statLabel(k))} ${d>0?'+':''}${d}</span>`);
    }
  }
  return chips.join("");
}
function choiceHtml(c,i){
  const locked=c.req && !c.req(S);
  return `<button class="choice${locked?' locked':''}" data-i="${i}" ${locked?'aria-disabled="true"':''}>
    <span class="c-label">${esc(c.label)}</span>
    <span class="c-fx">${fxChips(c)}</span>
  </button>`;
}
function defaultKicker(art){
  return ({newspaper:"Front Page",bulletin:"Breaking",crisis:"Crisis",rival:"A Rival Moves",scene:"A Decision"})[art]||"A Decision";
}
function renderEvent(ev){
  const art=ev.art||"scene";
  const body=typeof ev.body==="function"? ev.body(S): ev.body;
  let head;
  if(art==="newspaper"){
    head=`<div class="ev-head">
        <div class="masthead">THE VELMORA HERALD</div>
        <div class="dateline"><span>Year ${S.totalTurns+1}</span><span>${esc((ev.kicker||"FRONT PAGE").toUpperCase())}</span></div>
      </div>`;
  } else {
    head=`<div class="ev-head"><span class="ev-emoji">${ev.emoji||"❓"}</span><span class="ev-kicker">${esc(ev.kicker||defaultKicker(art))}</span></div>`;
  }
  let sp="";
  if(ev.speaker){ const s=ev.speaker(S); sp=`<div class="ev-speaker"><div class="sp-ava">${s.avatar||""}</div><div><div class="sp-name">${esc(s.name)}</div><div class="sp-role">${esc(s.role||"")}</div></div></div>`; }
  const choices=ev.choices.map((c,i)=>choiceHtml(c,i)).join("");
  $("#stage").innerHTML=`<div class="ev ${art}">
    ${head}
    <div class="ev-body">
      <h3 class="ev-title">${esc(ev.title)}</h3>
      ${sp}
      <p class="ev-text">${fmt(body)}</p>
    </div>
    <div class="choices">${choices}</div>
  </div>`;
  $$("#stage .choice").forEach(el=>{
    el.addEventListener("click",()=>{ if(el.classList.contains("locked"))return; resolveChoice(+el.dataset.i); });
  });
}
function renderResult(){
  const r=S.lastResult; if(!r)return;
  const rl=r.rollLine
    ? `<div class="roll-line ${r.rollLine.win?'win':'lose'}"><span>${r.rollLine.win?'✓ IT WORKED':'✗ IT BACKFIRED'} · ${esc(r.rollLine.stat)} check</span><span>${r.rollLine.chance}% odds</span></div>`
    : "";
  const head=r.rollLine?(r.rollLine.win?"Fortune favors you.":"That did not go to plan."):"The dust settles.";
  $("#stage").innerHTML=`<div class="result">
    <h4>${head}</h4>
    ${rl}
    <p>${fmt(r.text)}</p>
    <button class="btn primary block lg" id="btn-continue-turn">Continue →</button>
  </div>`;
  $("#btn-continue-turn").addEventListener("click",afterResult);
}

/* ---- promotions ---- */
function costChips(b){
  let out=Object.keys(b.cost).map(k=>`<span class="fxchip down">−${b.cost[k]} ${esc(statLabel(k))}</span>`).join("");
  if(b.heat) out+=`<span class="fxchip down">▲ ${esc(statLabel("heat"))} +${b.heat}</span>`;
  return out;
}
function renderPromotion(){
  const pr=S.promo, ph=pr.ph;
  if(pr.type==="finale"){
    $("#stage").innerHTML=`<div class="promo">
      <div class="promo-head"><div class="pe">${ph.promo.emoji}</div><h3>${esc(ph.promo.label)}</h3><div class="ps">The Summit of Power</div></div>
      <div class="promo-body">
        <p style="font-size:1.04rem;line-height:1.5;margin:0 0 16px">You stand at the very top of ${esc(PATHS[S.path].land)}. There is no rival left to defeat — only the verdict of history, weighing every choice that carried you here.</p>
        <button class="btn gold block lg" id="btn-finale">Face the Verdict ⚖️</button>
      </div></div>`;
    $("#btn-finale").addEventListener("click",afterPromotion);
    return;
  }
  const wc=promoWinChance(S.promo.player,S.promo.opp.strength);
  const boosts=pr.boosts.map(b=>{
    const used=pr.used.includes(b.id);
    const afford=Object.keys(b.cost).every(k=>(S.stats[k]||0)>=b.cost[k]);
    const dis=used||!afford;
    return `<button class="choice${dis?' locked':''}" data-b="${b.id}" ${dis?'aria-disabled="true"':''}>
      <span class="c-label">${esc(b.label)}</span>
      <span class="c-fx"><span class="fxchip ${used?'lock':'up'}">${used?'✓ used':'+'+b.gain+'% odds'}</span>${used?'':costChips(b)}</span>
    </button>`;
  }).join("");
  $("#stage").innerHTML=`<div class="promo">
    <div class="promo-head"><div class="pe">${ph.promo.emoji}</div><h3>${esc(ph.promo.label)}</h3><div class="ps">vs ${esc(pr.opp.name)} · ${esc(pr.opp.disposition||ph.promo.oppTitle)}</div></div>
    <div class="promo-body">
      <div class="odds"><div class="meter"><div class="me" style="width:${wc}%"></div></div><div class="pct">${wc}%</div></div>
      <p style="font-family:var(--font-m);font-size:.7rem;color:var(--ink-soft);margin:0 0 12px;line-height:1.5">Spend resources to swing the odds — each move works once. Then commit to the contest.</p>
      <div class="choices" style="padding:0 0 12px">${boosts}</div>
      <button class="btn primary block lg" id="btn-run">${S.path==="ballot"?"🗳️ Hold the Vote":"♟️ Make Your Move"}</button>
    </div></div>`;
  $$("#stage .choice").forEach(el=>{ el.addEventListener("click",()=>{ if(el.classList.contains("locked"))return; applyBoost(el.dataset.b); }); });
  $("#btn-run").addEventListener("click",resolvePromotion);
}
function animateNum(el,target){
  if(!el)return; const t0=performance.now(), dur=1100;
  function step(t){ const k=Math.min(1,(t-t0)/dur); el.textContent=Math.round(target*k)+"%"; if(k<1)requestAnimationFrame(step); }
  requestAnimationFrame(step);
}
function renderPromotionResult(){
  const res=S.promo.result, opp=S.promo.opp;
  const pAva=buildAvatar(S.player.avatar,res.win?"smug":"worried",!res.win);
  const winTitle=res.win?(S.path==="ballot"?"Projected Winner":"You Prevail"):(S.path==="ballot"?"Projected Defeat":"You Are Outmaneuvered");
  $("#stage").innerHTML=`<div class="promo">
    <div class="promo-head" style="background:${res.win?'var(--pop)':'var(--danger)'};color:#fff"><div class="pe">${res.win?'🎉':'💔'}</div><h3>${winTitle}</h3><div class="ps">${S.path==="ballot"?'the results are in':'the committee has decided'}</div></div>
    <div class="promo-body">
      <div class="tally">
        <div class="cand"><div class="cava">${pAva}</div><div class="cbarwrap"><div class="cname"><span>${esc(S.player.name)} (You)</span><span class="pp">0%</span></div><div class="cbar"><div class="cf" data-fill="${res.pShare}" style="background:${res.win?'var(--pop)':'var(--accent)'}"></div></div></div></div>
        <div class="cand"><div class="cava">${opp.avatar}</div><div class="cbarwrap"><div class="cname"><span>${esc(opp.name)}</span><span class="oo">0%</span></div><div class="cbar"><div class="cf" data-fill="${res.oShare}" style="background:#9c93b0"></div></div></div></div>
      </div>
      <button class="btn ${res.win?'gold':'primary'} block lg" id="btn-promo-next" style="margin-top:18px">${res.win?'Take Power →':'See Your Fate →'}</button>
    </div></div>`;
  requestAnimationFrame(()=>requestAnimationFrame(()=>{ $$("#stage .cf").forEach(el=>{ el.style.width=el.dataset.fill+"%"; }); }));
  animateNum($("#stage .pp"),res.pShare); animateNum($("#stage .oo"),res.oShare);
  if(res.win) setTimeout(confetti,500);
  $("#btn-promo-next").addEventListener("click",afterPromotion);
}

/* ---- ending ---- */
function renderEnding(){
  const e=S.ending;
  const ava=buildAvatar(S.player.avatar,e.win?"smug":"worried",!e.win);
  const legacy=e.legacy.map(l=>`<div class="lc"><div class="ll">${esc(l.l)}</div><div class="lv">${esc(l.v)}</div></div>`).join("");
  const epilogue=buildEpilogue(S).map(b=>`<div class="epi-beat">${esc(b)}</div>`).join("");
  const ideo=deriveIdeology(S).map(a=>`<div class="ideo-row">
      <span class="ideo-end l">${esc(a.left)}</span>
      <span class="ideo-track"><span class="ideo-mark" style="left:${a.value}%"></span></span>
      <span class="ideo-end r">${esc(a.right)}</span>
      <span class="ideo-read">${esc(a.read)}</span>
    </div>`).join("");
  const coalition=blocList(S).map(b=>{
    const v=b.value, st=blocStance(v), word=v>=62?"stands with you":(v<=38?"has turned on you":"keeps its distance");
    return `<div class="coal-row"><span class="coal-name">${esc(factionName(b.id))}</span><span class="coal-tag ${st}">${word}</span></div>`;
  }).join("");
  const advisors=servingAdvisors(S);
  const cabinet=advisors.length?advisors.map(a=>{
    const st=loyaltyStance(a.loyalty), word=a.loyalty>=55?"stayed loyal":(a.loyalty<=30?"turned on you":"served warily");
    return `<div class="coal-row"><span class="coal-name">${a.emoji} ${esc(a.name)}</span><span class="coal-tag ${st}">${word}</span></div>`;
  }).join(""):"";
  $("#over-mount").innerHTML=`<div class="over-card">
    <div class="over-banner"${e.win?'':' style="background:linear-gradient(135deg,#7a1410,#1A1726)"'}>
      <div class="oe">${e.emoji}</div>
      <h2>${esc(e.title)}</h2>
      <div class="orank">${esc(e.rank)}</div>
    </div>
    <div class="over-body">
      <div class="avatar-stage" style="margin:0 auto 14px;width:104px;height:104px">${ava}</div>
      <p>${fmt(e.text)}</p>
      <div class="ideo"><div class="ideo-head">Political Profile</div>${ideo}</div>
      <div class="coalition"><div class="coal-head">The Coalition</div>${coalition}</div>
      ${cabinet?`<div class="coalition"><div class="coal-head">Your Cabinet</div>${cabinet}</div>`:""}
      <div class="epilogue"><div class="epi-head">Years Later…</div>${epilogue}</div>
      <div class="legacy">${legacy}</div>
    </div>
  </div>`;
  go("over");
  if(e.win) setTimeout(confetti,350);
}

/* ================================================================
   CHARACTER CREATION
   ================================================================ */
function pickName(){ return pick(FIRST)+" "+pick(SUR); }

function openCreate(path){
  const P=PATHS[path];
  DRAFT.path=path; DRAFT.faction=null; DRAFT.trait=null; DRAFT.name="";
  setTheme(P.theme);
  $("#create-eyebrow").textContent = path==="ballot"?"The Ballot Path · Democracy":"The Vanguard Path · One-Party State";
  $("#create-title").textContent = path==="ballot"?"Build Your Politician":"Build Your Cadre";
  $("#lbl-name").textContent = path==="ballot"?"Candidate name":"Comrade name";
  $("#lbl-faction").textContent = path==="ballot"?"Party allegiance":"Party faction";
  $("#lbl-trait").textContent = "Signature strength";
  $("#inp-name").value=""; $("#inp-name").placeholder = path==="ballot"?"e.g. Dana Marlowe":"e.g. Comrade Sokol";

  $("#faction-chips").innerHTML = P.factions.map((f,i)=>`<button class="chip" data-f="${f.id}" aria-pressed="${i===0}">${esc(f.name)}</button>`).join("");
  DRAFT.faction=P.factions[0].id;
  $$("#faction-chips .chip").forEach(ch=>ch.addEventListener("click",()=>{
    $$("#faction-chips .chip").forEach(x=>x.setAttribute("aria-pressed","false"));
    ch.setAttribute("aria-pressed","true"); DRAFT.faction=ch.dataset.f;
    const f=P.factions.find(x=>x.id===ch.dataset.f); if(f) toast(f.desc);
  }));

  $("#trait-chips").innerHTML = TRAITS.map((t,i)=>`<button class="chip" data-t="${t.id}" aria-pressed="${i===0}">${t.emoji} ${esc(t.name)}</button>`).join("");
  DRAFT.trait=TRAITS[0].id; $("#trait-desc").textContent=TRAITS[0].desc;
  $$("#trait-chips .chip").forEach(ch=>ch.addEventListener("click",()=>{
    $$("#trait-chips .chip").forEach(x=>x.setAttribute("aria-pressed","false"));
    ch.setAttribute("aria-pressed","true"); DRAFT.trait=ch.dataset.t;
    const t=TRAITS.find(x=>x.id===ch.dataset.t); if(t)$("#trait-desc").textContent=t.desc;
  }));

  $("#difficulty-chips").innerHTML = DIFFICULTIES.map(dd=>`<button class="chip" data-d="${dd.id}" aria-pressed="${dd.id===DEFAULT_DIFFICULTY}">${esc(dd.name)}</button>`).join("");
  DRAFT.difficulty=DEFAULT_DIFFICULTY;
  const _dd0=DIFFICULTIES.find(x=>x.id===DEFAULT_DIFFICULTY); if(_dd0)$("#difficulty-desc").textContent=_dd0.desc;
  $$("#difficulty-chips .chip").forEach(ch=>ch.addEventListener("click",()=>{
    $$("#difficulty-chips .chip").forEach(x=>x.setAttribute("aria-pressed","false"));
    ch.setAttribute("aria-pressed","true"); DRAFT.difficulty=ch.dataset.d;
    const dd=DIFFICULTIES.find(x=>x.id===ch.dataset.d); if(dd)$("#difficulty-desc").textContent=dd.desc;
  }));

  DRAFT.avatar=randAvatar(path);
  $("#create-ava").innerHTML=buildAvatar(DRAFT.avatar,"happy");
  go("create");
}
function beginCareer(){
  if(!DRAFT.faction) DRAFT.faction=PATHS[DRAFT.path].factions[0].id;
  if(!DRAFT.trait) DRAFT.trait=TRAITS[0].id;
  if(!DRAFT.avatar) DRAFT.avatar=randAvatar(DRAFT.path);
  if(!DRAFT.name || !DRAFT.name.trim()) DRAFT.name=pickName();
  // Test/seed hook: ?seed= or window.__VELMORA_SEED makes a run reproducible (no-op otherwise).
  if(DRAFT.seed==null){
    try{ const u=new URLSearchParams(location.search); if(u.has("seed")) DRAFT.seed=u.get("seed"); }catch(e){}
    if(DRAFT.seed==null && typeof window!=="undefined" && window.__VELMORA_SEED!=null) DRAFT.seed=window.__VELMORA_SEED;
  }
  startCareer(DRAFT);
}
function startCareer(d){
  const P=PATHS[d.path];
  // Seed this run from an explicit DRAFT.seed (shared/daily scenario) or a fresh one.
  _rng = createRng(d.seed!=null ? d.seed : randomSeed());
  S=blankRun({
    version:VERSION, seed:_rng.seed, rngState:_rng.getState(), path:d.path,
    stats:Object.assign({},P.start),
    player:{name:d.name.trim(), title:P.phases[0].title, avatar:d.avatar, faction:d.faction, trait:d.trait},
    difficulty:d.difficulty||DEFAULT_DIFFICULTY, daily:!!d.daily
  });
  const tr=TRAITS.find(t=>t.id===d.trait); if(tr) applyFx(S,tr.fx);
  rollWorld(); createAntagonist(); assignOpponent(); generateRivals();
  applyDifficultyStart(S, difficultyById(DIFFICULTIES, S.difficulty));
  const _mods=rollModifiers(_rng, MODIFIERS, 1); S.modifiers=_mods.map(m=>m.id);
  _mods.forEach(m=>applyModifier(S,m));
  if(_mods.length) toast("This run — "+_mods.map(m=>m.name).join(" · "));
  setTheme(P.theme);
  go("game"); renderHUD();
  S.lastDeltas=null;
  nextEvent(); save();
}

/* ================================================================
   DRAWER (career log + how-to)
   ================================================================ */
function openDrawer(title,html){
  const dr=$("#drawer"); dr.querySelector("h3").textContent=title;
  $("#log-mount").innerHTML=html; dr.classList.add("open");
}
function showLog(){
  if(!S || !S.log.length){ openDrawer("Career Log",`<p style="color:rgba(255,255,255,.7);font-family:var(--font-m);font-size:.8rem;line-height:1.6">No decisions yet. Your story begins with your first choice.</p>`); return; }
  const items=S.log.slice().reverse().map(l=>`<div class="log-item">
    <div class="lt">${esc(l.office)} · Yr ${l.yr} — ${esc(l.tag)}</div>
    <div class="lq">${esc(l.choice)}</div>
    <div class="la">${esc(l.result)}</div></div>`).join("");
  openDrawer("Career Log",items);
}
function showHow(){
  const html=`
  <div style="color:var(--paper);font-family:var(--font-b);line-height:1.55">
    <p style="margin:0 0 14px">Climb from a nobody to the most powerful person in the fictional nation of <b>Velmora</b> — across three rungs of power. Two roads, one prize.</p>
    <div class="log-item"><div class="lt">The Two Paths</div><div class="la" style="color:#241f30">
      <b>The Ballot Path</b> — win elections through Approval, money, and the press. Lose a race and your career is over.<br><br>
      <b>The Vanguard Path</b> — climb a one-party state through Loyalty, Standing, and fear. Let Suspicion run wild and you are purged.</div></div>
    <div class="log-item"><div class="lt">Your Six Stats</div><div class="la" style="color:#241f30">
      Each choice nudges your stats. Most you want <b>high</b> — but <b>Scrutiny / Suspicion</b> is danger: let it hit 100 and you fall. Let your core support hit 0 and you collapse.</div></div>
    <div class="log-item"><div class="lt">Promotions</div><div class="la" style="color:#241f30">
      Survive enough turns and you face a contest — an election or a power-play. Spend resources to swing the odds, then roll the dice. Win to rise; lose and your story ends.</div></div>
    <div class="log-item"><div class="lt">No Two Careers Alike</div><div class="la" style="color:#241f30">
      The country's mood, your rivals, the crises, and which dilemmas you face are all drawn fresh every run. 🎲 choices are real gambles. Play to find your legacy.</div></div>
  </div>`;
  openDrawer("How to Rule",html);
}

/* ================================================================
   CONFETTI / FX CANVAS + TOAST
   ================================================================ */
let fxCanvas=null, fxCtx=null;
function sizeCanvas(){ fxCanvas=$("#fx-canvas"); if(!fxCanvas)return; fxCtx=fxCanvas.getContext("2d"); fxCanvas.width=window.innerWidth; fxCanvas.height=window.innerHeight; }
function reduced(){ try{return window.matchMedia("(prefers-reduced-motion:reduce)").matches;}catch(e){return false;} }
function confetti(){
  if(reduced()||!fxCtx) return;
  const cols=["#F2B705","#E63B5B","#3B6FE6","#2FB67D","#A65BD6","#FF7A3C","#ffffff"];
  const parts=[];
  for(let i=0;i<130;i++) parts.push({x:window.innerWidth/2+rint(-70,70),y:window.innerHeight*0.32,vx:rng()*8-4,vy:rng()*-11-3,g:0.28+rng()*0.22,r:rint(5,10),c:pick(cols),rot:rng()*6,vr:rng()*0.3-0.15});
  let t0=performance.now();
  function frame(t){
    const dt=Math.min(40,t-t0); t0=t;
    fxCtx.clearRect(0,0,fxCanvas.width,fxCanvas.height);
    let alive=false;
    for(const p of parts){ p.vy+=p.g; p.x+=p.vx; p.y+=p.vy; p.rot+=p.vr; if(p.y<fxCanvas.height+24)alive=true;
      fxCtx.save(); fxCtx.translate(p.x,p.y); fxCtx.rotate(p.rot); fxCtx.fillStyle=p.c; fxCtx.fillRect(-p.r/2,-p.r/2,p.r,p.r*0.62); fxCtx.restore(); }
    if(alive) requestAnimationFrame(frame); else fxCtx.clearRect(0,0,fxCanvas.width,fxCanvas.height);
  }
  requestAnimationFrame(frame);
}
let toastT=null;
function toast(msg){
  const old=$("#toast-mount .toast"); if(old)old.remove();
  const el=document.createElement("div"); el.className="toast"; el.textContent=msg;
  $("#toast-mount").appendChild(el);
  clearTimeout(toastT); toastT=setTimeout(()=>el.remove(),2400);
}

/* ================================================================
   SAVE / LOAD  (localStorage with in-memory fallback for sandboxes)
   ================================================================ */
function save(){
  if(!S) return;
  S.rngState=_rng.getState();
  let data; try{ data=JSON.stringify(S); }catch(e){ return; }
  try{ localStorage.setItem(SAVE_KEY,data); }catch(e){ window._velmoraMem=data; }
}
function loadRaw(){
  let data=null;
  try{ data=localStorage.getItem(SAVE_KEY); }catch(e){}
  if(!data && window._velmoraMem) data=window._velmoraMem;
  if(!data) return null;
  try{ return JSON.parse(data); }catch(e){ return null; }
}
function hasSave(){ const o=loadRaw(); return !!(o && o.path && !o.over); }
function clearSave(){ try{ localStorage.removeItem(SAVE_KEY); }catch(e){} window._velmoraMem=null; }

function resumeGame(){
  const o=loadRaw();
  if(!o || !o.path){ toast("No saved career found"); return; }
  S=o;
  if(!S.arcs) S.arcs={}; // migrate older saves (pre-arc-system)
  if(!S.npcs){ S.npcs={}; S.antagonistId=S.antagonistId||""; } // migrate (pre-NPC-roster)
  if(!S.scandals){ S.scandals=[]; S.activeScandal=S.activeScandal||null; } // migrate (pre-scandals)
  if(!S.difficulty){ S.difficulty=DEFAULT_DIFFICULTY; S.modifiers=S.modifiers||[]; S.daily=!!S.daily; } // migrate (pre-setup)
  if(!S.cabinet){ S.cabinet=[]; S.cabinetOffer=S.cabinetOffer||null; } // migrate (pre-cabinet)
  // Restore the generator so post-resume draws continue the same sequence.
  _rng = createRng(S.seed!=null ? S.seed : randomSeed());
  if(typeof S.rngState==="number") _rng.setState(S.rngState);
  setTheme(PATHS[S.path].theme);
  go("game"); S.lastDeltas=null; renderHUD();
  if(S.mode==="over"){ renderEnding(); return; }
  if(S.mode==="cabinet" && S.cabinetOffer && S.cabinetOffer.length){ renderCabinet(); return; }
  if(S.mode==="promo" && S.promo){ S.promo.resolved? renderPromotionResult(): renderPromotion(); return; }
  if(S.mode==="result" && S.lastResult){ renderResult(); return; }
  const ev=S.current && EVENTS.find(e=>e.id===S.current);
  if(ev) renderEvent(ev); else nextEvent();
}

/* ================================================================
   SERVICE WORKER
   ================================================================ */
function registerSW(){
  if("serviceWorker" in navigator){
    try{ navigator.serviceWorker.register("sw.js").catch(()=>{}); }catch(e){}
  }
}

/* ================================================================
   WIRING + BOOT
   ================================================================ */
function boot(){
  sizeCanvas();
  window.addEventListener("resize",sizeCanvas);

  $("#btn-new").addEventListener("click",()=>{ DRAFT.seed=null; DRAFT.daily=false; setTheme("theme-neutral"); go("path"); });
  $("#btn-continue").addEventListener("click",resumeGame);
  $("#btn-how").addEventListener("click",showHow);
  $("#btn-daily").addEventListener("click",()=>{ DRAFT.seed=dailySeed(); DRAFT.daily=true; setTheme("theme-neutral"); toast("Scenario of the Day — everyone plays the same run today"); go("path"); });
  $("#btn-path-back").addEventListener("click",()=>{ setTheme("theme-neutral"); go("title"); });

  $$(".path-card").forEach(c=>{
    const p=c.dataset.path;
    c.addEventListener("click",()=>openCreate(p));
    c.addEventListener("keydown",e=>{ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); openCreate(p); } });
  });

  $("#btn-create-back").addEventListener("click",()=>{ setTheme("theme-neutral"); go("path"); });
  $("#btn-reroll").addEventListener("click",()=>{ DRAFT.avatar=randAvatar(DRAFT.path); $("#create-ava").innerHTML=buildAvatar(DRAFT.avatar,"happy"); });
  $("#inp-name").addEventListener("input",e=>{ DRAFT.name=e.target.value; });
  $("#btn-begin-career").addEventListener("click",beginCareer);

  $("#tb-codex").addEventListener("click",showLog);
  $("#tb-save").addEventListener("click",()=>{ save(); toast("Career saved"); });
  $("#tb-quit").addEventListener("click",()=>{ if(S && !S.over) endGame("resign"); });

  $("#btn-again").addEventListener("click",()=>{ DRAFT.seed=null; DRAFT.daily=false; setTheme("theme-neutral"); go("path"); });

  $("#drawer-close").addEventListener("click",()=>$("#drawer").classList.remove("open"));
  $("#drawer").addEventListener("click",e=>{ if(e.target.id==="drawer") $("#drawer").classList.remove("open"); });

  if(hasSave()) $("#btn-continue").classList.remove("hidden");

  // Debug/test hook: expose the live run state (used by E2E arc assertions).
  window.__VELMORA_STATE = () => S;

  registerSW();
}

if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",boot);
else boot();

})();
