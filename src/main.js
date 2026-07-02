import './styles.css';
/* Self-hosted, subset fonts (offline-safe; replaces the Google Fonts CDN <link>).
   Anton = display, Hanken Grotesk = body, Stardos Stencil = stencil/stamp accent,
   Space Mono = data/dossier. Latin subset only; just the weights actually used. */
import '@fontsource/anton/latin-400.css';
import '@fontsource/hanken-grotesk/latin-400.css';
import '@fontsource/hanken-grotesk/latin-600.css';
import '@fontsource/hanken-grotesk/latin-700.css';
import '@fontsource/stardos-stencil/latin-400.css';
import '@fontsource/stardos-stencil/latin-700.css';
import '@fontsource/space-mono/latin-400.css';
import '@fontsource/space-mono/latin-700.css';
import { createRng, randomSeed, dailySeed } from './engine/rng';
import { PATHS } from './content/paths';
import { TRAITS } from './content/traits';
import { WORLD } from './content/world';
import { FIRST, SUR } from './content/names';
import { antagonist, antagonistContestModifier, dispositionLabel } from './engine/npcs';
import { makeDirector, nemesisContestEdge } from './engine/director';
import { WEAVE_CHANCE, isWovenId } from './engine/grammar/weave';
import { avatarHtml, loadArtManifest } from './render/portrait';
import { speakerExpr } from './render/expr';
import { deriveHints } from './render/hints';
import { ANTAGONIST_ROLE, ANTAGONIST_START_RELATIONSHIP } from './content/npcs';
import { difficultyById, applyDifficultyStart, rollModifiers, applyModifier } from './engine/setup';
import { generateWorld } from './engine/world';
import { DIFFICULTIES, DEFAULT_DIFFICULTY, MODIFIERS } from './content/setup';
import { chooseNext } from './engine/draw';
import { pickHeadlines } from './content/headlines';
import { buildEpilogue } from './engine/epilogue';
import { deriveIdeology } from './engine/ideology';
import { blocList } from './engine/factions';
import { advisorDef, advisorSlate, appointAdvisor, servingAdvisors, ADVISORS } from './engine/cabinet';
import { applyFx } from './engine/mutate';
import { applyChoice } from './engine/resolve';
import { deathCause, advanceTurnState } from './engine/turn';
import { promoPlayerStrength, contestOppStrength, promoWinChance } from './engine/contest';
import { blankRun } from './engine/state';
import { defaultMeta, mergeMeta, recordRun as metaRecordRun, recordStart as metaRecordStart, unlockAchievements, refreshUnlockables, isExpansionUnlocked, ACHIEVEMENTS, UNLOCKABLES, SLOT_COUNT } from './engine/meta';

/* The 251-event draw pool (content/all-events.ts) is the bulk of the bundle but
   isn't needed for the title/menu. It's code-split into its own chunk and loaded
   lazily at career start via loadBank(); the chunk is precached by the service
   worker (injectManifest globs include js) so offline start still works. The
   pool is prefetched once the title is idle so "Begin Your Ascent" is instant. */
let EVENTS = null, TEMPLATES = null;
async function loadBank(){
  if(!EVENTS){ const m = await import('./content/all-events'); EVENTS = m.ALL_EVENTS; TEMPLATES = m.TEMPLATES; }
  return EVENTS;
}
/* Live Storyteller is an opt-in online layer kept in its own chunk (src/live);
   it is loaded ONLY when the user has turned it on, so the default offline game
   never ships it on the hot path. */
let _live = null;
function loadLive(){ return _live || (_live = import('./live')); }
/* Voice narration (opt-in, Overhaul P6) is its own dynamic chunk — loaded only
   when the user turns it on, so the default game never ships the engine. The
   say()/hush() wrappers live INSIDE the IIFE below (they read SETTINGS + S). */
let _voice = null;
function loadVoice(){ return _voice || (_voice = import('./voice')); }
// Civ P2: the province-map render chunk (canvas + geometry + d3-delaunay) loads
// only when the civMap flag is on, so it never touches the 70 kB entry budget.
let _mapModule=null;
function loadMap(){ return _mapModule || (_mapModule = import('./render/map')); }
function prefetchBank(){
  const go = () => { import('./content/all-events').catch(()=>{}); import('./engine/endings').catch(()=>{}); };
  try{ if(typeof requestIdleCallback==="function") requestIdleCallback(go); else setTimeout(go,1200); }catch(e){ setTimeout(go,1200); }
}

/* ================================================================
   VELMORA · engine + content   (vanilla JS, no build, PWA-ready)
   All game state lives in S (plain data → serializable saves).
   ================================================================ */
(function(){
"use strict";
const VERSION="1.0.0", SAVE_KEY="velmora_save_v1", SETTINGS_KEY="velmora_settings_v1", META_KEY="velmora_meta_v1", AGE_KEY="velmora_age_v1";

/* ---------- cross-run meta-progression store (Phase 8) ----------
   Mirrors the save/settings localStorage+in-memory pattern, but uses its OWN
   dedicated fallback global (window._velmoraMeta) so it never collides with the
   save (_velmoraMem) or settings (_velmoraSet) fallbacks. Pure logic lives in
   engine/meta.ts; this layer only does I/O. */
let META=defaultMeta();
function loadMeta(){
  let raw=null;
  try{ raw=localStorage.getItem(META_KEY); }catch(e){}
  if(!raw && window._velmoraMeta) raw=window._velmoraMeta;
  let stored=null; if(raw){ try{ stored=JSON.parse(raw); }catch(e){} }
  META=mergeMeta(stored);
}
function saveMeta(){
  let data; try{ data=JSON.stringify(META); }catch(e){ return; }
  try{ localStorage.setItem(META_KEY,data); }catch(e){ window._velmoraMeta=data; }
}

/* ---------- player settings (persisted, with in-memory fallback) ---------- */
const SETTINGS={ reduceMotion:false, highContrast:false, sound:false, voice:false, errorReports:false, tutorialSeen:false, aiDirector:true, weaveDensity:"low", liveStoryteller:false, liveModel:"claude-haiku-4-5", civMap:false };

/* Opt-in error reporting (flagged, Phase 10). Default OFF. When enabled, runtime
   errors are recorded to a capped on-device ring buffer (no network — there is no
   backend; this is the collection scaffold a future endpoint would drain). */
const ERROR_LOG=[]; const ERROR_LOG_CAP=20;
function recordError(kind,message){
  if(!SETTINGS.errorReports) return;
  ERROR_LOG.push({ kind, message:String(message==null?"":message).slice(0,300) });
  if(ERROR_LOG.length>ERROR_LOG_CAP) ERROR_LOG.shift();
}
function installErrorReporting(){
  try{
    window.addEventListener("error",e=>recordError("error", e&&e.message));
    window.addEventListener("unhandledrejection",e=>recordError("promise", e&&e.reason&&(e.reason.message||e.reason)));
    window.__VELMORA_ERRORS=()=>ERROR_LOG.slice();
  }catch(e){}
}
function loadSettings(){
  let raw=null;
  try{ raw=localStorage.getItem(SETTINGS_KEY); }catch(e){}
  if(!raw && window._velmoraSet) raw=window._velmoraSet;
  if(raw){ try{ const o=JSON.parse(raw); if(o&&typeof o==="object") Object.assign(SETTINGS,o); }catch(e){} }
}
function saveSettings(){
  let data; try{ data=JSON.stringify(SETTINGS); }catch(e){ return; }
  try{ localStorage.setItem(SETTINGS_KEY,data); }catch(e){ window._velmoraSet=data; }
}
function applySettings(){
  document.body.classList.toggle("force-reduce-motion",!!SETTINGS.reduceMotion);
  document.body.classList.toggle("high-contrast",!!SETTINGS.highContrast);
}

/* ---------- Mature (17+) age gate — self-attested, on-device only (Overhaul P3).
   Its own dedicated localStorage key + in-memory fallback (sandbox-safe), like the
   save/settings/meta stores. This is a legal-disclaimer surface, not a security
   control: clearing storage re-prompts — the accepted ceiling for a no-backend PWA. */
function ageVerified(){
  let raw=null;
  try{ raw=localStorage.getItem(AGE_KEY); }catch(e){}
  if(!raw && window._velmoraAge) raw=window._velmoraAge;
  return raw==="1";
}
function setAgeVerified(){
  try{ localStorage.setItem(AGE_KEY,"1"); }catch(e){ window._velmoraAge="1"; }
}

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
const HAIRC=["#2B2118","#3F2A1A","#6E4A2E","#B5772E","#C9C4BE","#E0C36A","#7A1F1F","#1A1726","#4A2C12","#8A8A8A"];
const SUIT={ballot:["#2A4E9B","#1F3A6E","#7A1E2B","#3B3550","#2F6B57","#54407a"],
            vanguard:["#3A3A3A","#5C0D0a","#2E3B2E","#4A3A1F","#1A1726","#6b4f12"]};
const TIES=["#E63B5B","#F5C542","#3B6FE6","#2FB67D","#A65BD6","#FF7A3C"];

function randAvatar(side){
 return {skin:rint(0,SKIN.length-1),hair:rint(0,7),hairc:rint(0,HAIRC.length-1),
   suit:rint(0,5),tie:rint(0,TIES.length-1),acc:pick(["none","none","none","glasses","pin","cap","beard","earring"]),side:side||"ballot"};
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
 if(a.acc==="earring") acc=`<circle cx="25" cy="59" r="2.6" fill="${ti}" stroke="${ink}" stroke-width="1.4"/>`;
 const beardEl=a.acc==="beard"?`<path d="M27 50 q3 28 23 28 t23 -28 q-5 16 -23 16 t-23 -16z" fill="${hc}" stroke="${ink}" stroke-width="2" stroke-linejoin="round"/>`:"";
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
   ${beardEl}${mouth}${sweatEl}${hair}${acc}
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
const DRAFT={path:"ballot",name:"",avatar:null,faction:null,trait:null,difficulty:DEFAULT_DIFFICULTY,seed:null,daily:false,ngPlus:0};
/* New Game+ tier of the live run (0 = a normal first climb). Scales opponent
   strength, crisis/scandal frequency, and starting modifier rolls — all
   deterministic functions of the tier, so seeded/daily runs stay reproducible. */
function ngP(){ return (S && typeof S.ngPlus==="number" && S.ngPlus>0) ? S.ngPlus : 0; }

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
  // Store the recurring antagonist as a DESCRIPTOR (not a baked SVG): randAvatar is
  // still drawn so RNG consumption is byte-identical, but we tag it with a path-specific
  // resolver id. The portrait seam then shows the drawn cartoon when a pack exists
  // (iron_antagonist has one, P2), and falls back to the legacy SVG everywhere else.
  const look=randAvatar(S.path);
  look.id=S.path+"_antagonist";
  S.npcs.antagonist={ id:"antagonist", name, role:ANTAGONIST_ROLE[S.path], kind:"antagonist",
    avatar:look, relationship:ANTAGONIST_START_RELATIONSHIP,
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
/* The on-device draw (Director + Loom). This is the DEFAULT path and is
   byte-identical to before when both features are off. */
function nextEventLocal(){
  const ngm=1+0.1*ngP();
  // The AI Director (on-device, pure, seeded) reads your playstyle this turn and
  // re-weights/paces the existing bank; off => pre-director behavior.
  const dir=SETTINGS.aiDirector?makeDirector(S):undefined;
  // Loom: the generative grammar weaves state-bound events (off/low/high).
  const wd=SETTINGS.weaveDensity||"low";
  const d=chooseNext(S, EVENTS, _rng, {
    crisisMult: curDifficulty().crisisMult*ngm, scandalMult: curDifficulty().scandalMult*ngm,
    director: dir,
    templates: (wd!=="off"&&TEMPLATES)?TEMPLATES:undefined, weaveChance: WEAVE_CHANCE[wd]||0,
  });
  if(d.type==="promotion"){ startPromotion(); return; }
  if(isWovenId(d.event.id)) registerWoven(d.event);
  showEvent(d.event);
}
/* The turn driver. When Live Storyteller is OFF (default) this is a synchronous
   on-device draw — identical to before. When the user has opted in, lazy-load the
   quarantined src/live module and try one validated live event, falling back to
   the on-device draw on ANY miss (offline / no key / over budget / rejected). */
function nextEvent(){
  if(!SETTINGS.liveStoryteller){ nextEventLocal(); return; }
  // Show a non-interactive placeholder synchronously so the just-resolved screen's
  // buttons can't be re-clicked while the async live attempt is in flight.
  showLiveLoading();
  loadLive().then(L=>{
    if(!L.liveEnabled(SETTINGS)){ nextEventLocal(); save(); return; }
    return L.maybeLiveEvent(S, SETTINGS, _rng).then(ev=>{
      if(ev){ registerLive(ev); showEvent(ev); } else { nextEventLocal(); }
      save();
    });
  }).catch(()=>{ nextEventLocal(); save(); });
}
function showLiveLoading(){
  const st=$("#stage");
  if(st) st.innerHTML=`<div class="ev scene"><div class="ev-body"><span class="eyebrow">The Storyteller</span><h3 class="ev-title">Composing…</h3><p class="ev-text">A fresh dilemma is being written for your situation.</p></div></div>`;
  announce("The Storyteller is composing a dilemma.");
}
/* A woven event isn't in the static bank — register it so resolveChoice/resume's
   EVENTS.find resolve it, and persist it in S.wovenCache so a mid-event reload
   rehydrates the exact event (closes the woven-event soft-lock). */
function registerWoven(ev){
  if(!EVENTS.some(e=>e.id===ev.id)) EVENTS.push(ev);
  if(!Array.isArray(S.wovenCache)) S.wovenCache=[];
  if(!S.wovenCache.some(e=>e.id===ev.id)){ S.wovenCache.push(ev); if(S.wovenCache.length>40) S.wovenCache.shift(); }
}
/* Same rehydration contract for a validated live event. */
function registerLive(ev){
  if(!EVENTS.some(e=>e.id===ev.id)) EVENTS.push(ev);
  if(!Array.isArray(S.liveCache)) S.liveCache=[];
  if(!S.liveCache.some(e=>e.id===ev.id)){ S.liveCache.push(ev); if(S.liveCache.length>40) S.liveCache.shift(); }
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
  hush(); // stop narrating the dilemma the moment a choice is committed

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
  S.pendingSub=out.sub||null;

  S.lastResult={title:ev.title,text:out.text,rollLine,tone:ch.tone||"good"};
  S.mode="result";
  renderHUD(); renderResult();
  const ds=STAT_KEYS.filter(k=>out.deltas[k]).map(k=>statLabel(k)+" "+(out.deltas[k]>0?"+":"")+out.deltas[k]).join(", ");
  announce((rollLine?(rollLine.win?"Roll succeeded. ":"Roll failed. "):"")+"Outcome — "+(ds||"no stat change")+".");
  save();
}
function statLabel(k){ return PATHS[S.path].statNames[k]||cap(k); }

/* ---- pressing Continue after a result ---- */
function afterResult(){
  if(S.pendingEndingCause){ endGame(S.pendingEndingCause); return; }
  if(S.pendingDeath){ endGame(S.pendingDeath); return; }
  if(S.pendingSub){ const sub=EVENTS.find(e=>e.id===S.pendingSub); S.pendingSub=null; if(sub){ showEvent(sub); save(); return; } }
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
  const t=ph.promo.type;
  if(t==="election"){
    return [
      {id:"war",label:"💸 Empty the War Chest",cost:{funds:16},gain:9,need:"funds",reqText:"War Chest 16+"},
      {id:"air",label:"📺 Flood the Airwaves",cost:{media:0,funds:10},gain:7,need:"funds",reqText:"War Chest 10+"},
      {id:"gotv",label:"🚪 Massive Turnout Push",cost:{base:14},gain:8,need:"base",reqText:"Base 14+"}
    ];
  }
  if(t==="purge"){
    return [
      {id:"vanguard",label:"🪖 Deploy the Vanguard",cost:{base:16},gain:9,need:"base",reqText:"Vanguard 16+"},
      {id:"air",label:"📢 Blanket the Airwaves",cost:{media:12},gain:7,need:"media",reqText:"Propaganda 12+"},
      {id:"dirt",label:"🗡️ Find the Dirt",cost:{influence:10},gain:6,need:"influence",reqText:"Cohesion 10+",heat:8}
    ];
  }
  if(t==="acquisition"){
    return [
      {id:"outbid",label:"💰 Outbid Everyone",cost:{funds:20},gain:10,need:"funds",reqText:"Capital 20+"},
      {id:"favors",label:"🤝 Call In the Favors",cost:{influence:16},gain:8,need:"influence",reqText:"Leverage 16+"},
      {id:"coverage",label:"📰 Buy the Coverage",cost:{media:12},gain:6,need:"media",reqText:"Narrative 12+",heat:5}
    ];
  }
  if(t==="council"){
    return [
      {id:"prayer",label:"🙏 Call for Prayer",cost:{base:14},gain:8,need:"base",reqText:"Congregation 14+"},
      {id:"doctrine",label:"📜 Issue a Doctrine",cost:{media:12},gain:7,need:"media",reqText:"Doctrine 12+"},
      {id:"silence",label:"🤐 Silence a Rival",cost:{influence:10},gain:6,need:"influence",reqText:"Authority 10+",heat:6}
    ];
  }
  return [
    {id:"fav",label:"🤝 Call In Every Favor",cost:{influence:16},gain:9,need:"influence",reqText:"Standing 16+"},
    {id:"loy",label:"✊ Rally Your Loyalists",cost:{base:14},gain:8,need:"base",reqText:"Loyalty 14+"},
    {id:"smear",label:"🗞️ Smear the Rival",cost:{media:12},gain:7,need:"media",reqText:"Propaganda 12+",heat:5}
  ];
}
/* Per-promo-type loss cause — keep in lockstep with sim.ts runContest. */
function promoLossCause(){
  const t=S.promo.type;
  if(t==="election") return "lost_election";
  if(t==="acquisition") return "hostile_takeover";
  if(t==="council") return "schism";
  if(t==="purge") return S.stats.heat>=S.stats.support?"arrested":"dissolved";
  return "lost_powerplay";
}
/* Run-button label + result copy per promo type (path-flavored). */
const PROMO_RUN_LABEL={election:"🗳️ Hold the Vote",purge:"🗡️ Execute the Purge",acquisition:"💰 Close the Deal",council:"🙏 Receive the Blessing",powerplay:"♟️ Make Your Move",finale:"⚖️ Face the Verdict"};
const PROMO_RESULT_COPY={
  election:{w:"Projected Winner",l:"Projected Defeat",ps:"the results are in"},
  purge:{w:"The Rival Is Removed",l:"You Are Exposed",ps:"the loyalty test is settled"},
  acquisition:{w:"The Deal Closes",l:"You Are Outbid",ps:"the offer is final"},
  council:{w:"You Are Anointed",l:"Another Is Chosen",ps:"the Council has decided"},
  powerplay:{w:"You Prevail",l:"You Are Outmaneuvered",ps:"the committee has decided"}
};
function startPromotion(){
  const ph=curPhase();
  S.mode="promo";
  if(ph.promo.type==="finale"){
    S.promo={type:"finale",ph,resolved:false};
    renderHUD(); renderPromotion(); save(); return;
  }
  const _antag=antagonist(S);
  const _hostility=SETTINGS.aiDirector?nemesisContestEdge(S):(_antag?antagonistContestModifier(_antag.relationship):0);
  const oppStrength=contestOppStrength(S,_rng,ph.promo.baseOpp,_hostility,curDifficulty().oppBonus+4*ngP());
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
  else { endGame(promoLossCause()); }
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
  focusHeading(".cab-h");
  announce("Promotion. Appoint an advisor to your cabinet.");
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
  // The endings bank (long TV-MA verdict prose) is code-split out of the entry and
  // loaded only here, at game-over (Overhaul P6 budget reclaim). Switch to the over
  // screen SYNCHRONOUSLY with a brief placeholder so the triggering button is gone at
  // once (no double-trigger gap), then fill the real verdict once the chunk resolves.
  // The chunk is SW-precached + idle-prefetched, so this is near-instant + offline-safe.
  const st=$("#stage"); if(st) st.innerHTML=""; // drop the now-defunct game-screen controls (e.g. the finale button)
  const m=$("#over-mount"); if(m) m.innerHTML='<div class="over-loading"><p>Composing your fate…</p></div>';
  go("over");
  import('./engine/endings').then(({evaluateEnding})=>{
    S.ending=evaluateEnding(S,cause);
    finishEnding();
  }).catch(()=>{
    // Endings chunk failed to load (rare: a first-ever game-over while offline,
    // before the chunk idle-prefetched). NEVER strand the player on the
    // "Composing your fate…" placeholder: synthesize a minimal verdict and finish
    // the run normally so meta is recorded and the save is cleared. legacy:[] is
    // required — renderEnding maps over it.
    S.ending={ endingId:"unknown", emoji:"🏛️", rank:"THE RECORD BREAKS OFF", win:false,
      verdict:"your reign simply ends", title:"The Record Breaks Off",
      text:"The full account of your reign could not be summoned from the archive — but your time in power is over all the same, and the doors have already shut behind you.",
      legacy:[] };
    finishEnding();
  });
}
/* Record meta, clear the save, and render — shared by both the normal and the
   chunk-load-failure endgame paths. Each step is guarded so a late failure can
   never re-strand the over-screen on its loading placeholder. */
function finishEnding(){
  recordRunOutcome();   // meta: history + lifetime stats + achievements + unlockables (before clearSave); internally guarded
  try{ clearSave(); }catch(e){}
  try{ renderEnding(); }
  catch(e){
    const m=$("#over-mount");
    if(m) m.innerHTML='<div class="over-card"><div class="over-body"><p>Your time in power is over.</p></div></div>';
    go("over");
  }
}
/* Roll the finished run into the cross-run META. Order matters: this MUST run
   before clearSave() (it reads the complete S). Wrapped so a meta failure can
   never block the ending from rendering. */
function recordRunOutcome(){
  try{
    const ts=Date.now();
    META=metaRecordRun(META,S,ts);
    if(S.ending && S.ending.win){
      META={...META, ngPlus:{...META.ngPlus, maxCleared:Math.max(META.ngPlus.maxCleared, (S.ngPlus||0)+1)}};
    }
    const res=unlockAchievements(META,S,ts);
    META=refreshUnlockables(res.meta);
    saveMeta();
    if(res.newly.length){
      const names=res.newly.map(id=>{ const a=ACHIEVEMENTS.find(x=>x.id===id); return a?a.name:id; });
      toast("🏅 "+(res.newly.length>1?names.length+" achievements":"Achievement: "+names[0]));
      announce("Achievement unlocked: "+names.join(", "));
    }
  }catch(e){}
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
/* Avatars are trusted SVG from buildAvatar(), but they ride inside the saved
   game state — so on the render path treat a save-sourced avatar as untrusted:
   only emit it if it looks like a clean generated <svg> (no scripts/handlers). */
function safeAvatar(s){
  if(typeof s!=="string") return "";
  if(!/^\s*<svg[\s>]/i.test(s)) return "";
  if(/<script|\son\w+\s*=|javascript:/i.test(s)) return "";
  return s;
}
/* The single portrait seam (Overhaul P1). A legacy persisted SVG string renders
   via safeAvatar (untrusted-guarded); a descriptor goes through the resolver,
   which returns drawn art when the manifest has it (P2+) or the legacy
   buildAvatar SVG otherwise. With no art today, output is visually identical. */
function portrait(av,mood="neutral",sweat=false,alt=""){
  if(typeof av==="string") return safeAvatar(av);
  return avatarHtml(av,mood,{sweat,alt,fallback:buildAvatar});
}
function go(name){ $$(".screen").forEach(s=>s.classList.remove("active")); const t=$("#screen-"+name); if(t)t.classList.add("active"); try{window.scrollTo(0,0);}catch(e){} }
/* ---- accessibility: live announcements + focus management (Phase 5) ---- */
function announce(msg){ const el=document.getElementById("a11y-live"); if(el){ el.textContent=""; el.textContent=String(msg==null?"":msg); } }
function focusHeading(sel){ const el=$(sel); if(el){ el.setAttribute("tabindex","-1"); try{ el.focus({preventScroll:true}); }catch(e){} } }
function setTheme(cls){
  const keep=[];
  if(SETTINGS.reduceMotion) keep.push("force-reduce-motion");
  if(SETTINGS.highContrast) keep.push("high-contrast");
  document.body.className=[cls||"theme-neutral",...keep].join(" ");
}
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
  // Press-strip "ink level" column: screened glyph cap, an ink reservoir, the numeral.
  return `<div class="gauge" data-k="${k}" aria-label="${esc(statLabel(k))} ${v} of 100">
    <span class="gi" aria-hidden="true">${ICON[k]}</span>
    <span class="gtrack"><span class="gfill" style="height:${v}%"></span></span>
    <span class="gnum">${v}</span>
    <span class="glabel">${esc(statLabel(k))}</span>
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
let _lastHudMood=null; // last rendered HUD-avatar expression; gates the expr-change pulse
function renderHUD(){
  if(!S) return;
  try{ document.body.dataset.phase = String(S.phase||1); }catch(e){} // print-fidelity ramp (Overprint)
  const P=PATHS[S.path], ph=curPhase(), m=moodExpr();
  const ava=portrait(S.player.avatar,m.expr,m.sweat,"Your character");
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
  // portrait expression transition: pulse the avatar only when the mood actually
  // shifts (not on every turn re-render). The class self-clears on the next HUD paint.
  if(_lastHudMood!==null && _lastHudMood!==m.expr){ const a=$("#hud .hud-ava"); if(a) a.classList.add("expr-in"); }
  _lastHudMood=m.expr;
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
  renderMap();
}
// Civ P2: draw the province map on every HUD render (state-change moments), behind
// the civMap flag. Hidden container + early return keep it a no-op when off; the
// lazy chunk only loads once civMap is on. Read-only for P2 (interaction is P3).
function renderMap(){
  const box=$("#civ-map");
  if(!box) return;
  if(!SETTINGS.civMap || !S || !S.realm){ box.hidden=true; return; }
  box.hidden=false;
  loadMap().then(M=>{ try{ M.render(S,{canvas:$("#civ-canvas"), listEl:$("#civ-provinces")}); }catch(e){} }).catch(()=>{});
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
  // Civ P0: vague directional hints instead of exact stat deltas — you read the
  // room (a gamble, your grip tightens) and learn the real cost in the aftermath.
  const locked=!!(c.req && !c.req(S));
  return deriveHints(c,{locked}).map(h=>`<span class="fxchip ${h.cls}">${esc(h.text)}</span>`).join("");
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
  let sp="", voiceKey=ev.id;
  if(ev.speaker){ const s=ev.speaker(S); voiceKey=s.name||ev.id; const se=speakerExpr(ev.art,s.expr); sp=`<div class="ev-speaker"><div class="sp-ava">${portrait(s.avatar,se.expr,se.sweat,s.name||"")}</div><div><div class="sp-name">${esc(s.name)}</div><div class="sp-role">${esc(s.role||"")}</div></div></div>`; }
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
    el.addEventListener("click",()=>{ if(el.classList.contains("locked"))return; sfx("click"); resolveChoice(+el.dataset.i); });
  });
  focusHeading(".ev-title");
  announce("New decision: "+ev.title+".");
  say(body, voiceKey);
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
  focusHeading(".result h4");
  say(r.text, S.path);
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
    focusHeading(".promo-head h3"); announce("The final reckoning. Face the verdict of history.");
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
      <button class="btn primary block lg" id="btn-run">${PROMO_RUN_LABEL[pr.type]||PROMO_RUN_LABEL.powerplay}</button>
    </div></div>`;
  $$("#stage .choice").forEach(el=>{ el.addEventListener("click",()=>{ if(el.classList.contains("locked"))return; applyBoost(el.dataset.b); }); });
  $("#btn-run").addEventListener("click",resolvePromotion);
  focusHeading(".promo-head h3"); announce("Contest: "+ph.promo.label+" against "+pr.opp.name+". "+wc+" percent odds. Spend resources, then commit.");
}
function animateNum(el,target){
  if(!el)return; const t0=performance.now(), dur=1100;
  function step(t){ const k=Math.min(1,(t-t0)/dur); el.textContent=Math.round(target*k)+"%"; if(k<1)requestAnimationFrame(step); }
  requestAnimationFrame(step);
}
function renderPromotionResult(){
  const res=S.promo.result, opp=S.promo.opp;
  const pAva=portrait(S.player.avatar,res.win?"smug":"worried",!res.win,"Your character");
  const rc=PROMO_RESULT_COPY[S.promo.type]||PROMO_RESULT_COPY.powerplay;
  const winTitle=res.win?rc.w:rc.l;
  $("#stage").innerHTML=`<div class="promo">
    <div class="promo-head ${res.win?'win':'lose'}"><div class="pe">${res.win?'🎉':'💔'}</div><h3 id="promo-result-title">${winTitle}</h3><div class="ps">${rc.ps}</div></div>
    <div class="promo-body">
      <div class="tally">
        <div class="cand"><div class="cava">${pAva}</div><div class="cbarwrap"><div class="cname"><span>${esc(S.player.name)} (You)</span><span class="pp">0%</span></div><div class="cbar"><div class="cf" data-fill="${res.pShare}" style="background:${res.win?'var(--pop)':'var(--accent)'}"></div></div></div></div>
        <div class="cand"><div class="cava">${portrait(opp.avatar,"neutral",false,opp.name||"")}</div><div class="cbarwrap"><div class="cname"><span>${esc(opp.name)}</span><span class="oo">0%</span></div><div class="cbar"><div class="cf" data-fill="${res.oShare}" style="background:#9c93b0"></div></div></div></div>
      </div>
      <button class="btn ${res.win?'gold':'primary'} block lg" id="btn-promo-next" style="margin-top:18px">${res.win?'Take Power →':'See Your Fate →'}</button>
    </div></div>`;
  requestAnimationFrame(()=>requestAnimationFrame(()=>{ $$("#stage .cf").forEach(el=>{ el.style.width=el.dataset.fill+"%"; }); }));
  animateNum($("#stage .pp"),res.pShare); animateNum($("#stage .oo"),res.oShare);
  sfx(res.win?"promote":"fail");
  if(res.win) setTimeout(confetti,500);
  $("#btn-promo-next").addEventListener("click",afterPromotion);
  focusHeading("#promo-result-title");
  announce((res.win?"You won. ":"You lost. ")+winTitle+". "+esc(S.player.name)+" "+res.pShare+" percent, "+esc(opp.name)+" "+res.oShare+" percent.");
}

/* ---- ending ---- */
function runSummaryRows(){
  const rows=[];
  rows.push({l:"Highest office",v:S.player.title});
  rows.push({l:"Years served",v:String(S.totalTurns)});
  rows.push({l:"Decisions made",v:String(S.log.length)});
  const d=curDifficulty(); if(d) rows.push({l:"Difficulty",v:d.name});
  const sc=(S.scandals||[]).length; if(sc) rows.push({l:"Scandals",v:String(sc)});
  const pc=(S.flags&&S.flags.purge_count)||0; if(pc) rows.push({l:"Purges ordered",v:String(pc)});
  return rows;
}
function renderEnding(){
  const e=S.ending;
  const ava=portrait(S.player.avatar,e.win?"smug":"worried",!e.win,"Your character");
  const summary=runSummaryRows().map(r=>`<div class="lc"><div class="ll">${esc(r.l)}</div><div class="lv">${esc(r.v)}</div></div>`).join("");
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
      <div class="runsum"><div class="rs-head">By the Numbers</div><div class="legacy">${summary}</div></div>
      <div class="epilogue"><div class="epi-head">Years Later…</div>${epilogue}</div>
      <div class="legacy">${legacy}</div>
    </div>
  </div>`;
  go("over");
  focusHeading(".over-card h2");
  announce("Career over. "+e.rank+". "+e.verdict+".");
  say(e.text, S.path);
  sfx(e.win?"win":"lose");
  if(e.win) setTimeout(confetti,350);
}

/* ================================================================
   CHARACTER CREATION
   ================================================================ */
function pickName(){ return pick(FIRST)+" "+pick(SUR); }

const CREATE_COPY={
  ballot:{eyebrow:"The Ballot Path · Democracy",title:"Build Your Politician",nameLabel:"Candidate name",factionLabel:"Party allegiance",placeholder:"e.g. Dana Marlowe"},
  vanguard:{eyebrow:"The Vanguard Path · One-Party State",title:"Build Your Cadre",nameLabel:"Comrade name",factionLabel:"Party faction",placeholder:"e.g. Comrade Sokol"},
  iron:{eyebrow:"The Iron Order · Strongman",title:"Build Your Commander",nameLabel:"Leader's name",factionLabel:"Faction of the Order",placeholder:"e.g. Marshal Kord"},
  gilded:{eyebrow:"The Gilded Republic · Plutocracy",title:"Build Your Magnate",nameLabel:"Magnate's name",factionLabel:"Elite bloc",placeholder:"e.g. Adrienne Vale"},
  anointed:{eyebrow:"The Anointed Path · Theocracy",title:"Build Your Cleric",nameLabel:"Cleric's name",factionLabel:"Theological bloc",placeholder:"e.g. Brother Ansel"}
};
function openCreate(path){
  const P=PATHS[path];
  const CC=CREATE_COPY[path]||CREATE_COPY.ballot;
  DRAFT.path=path; DRAFT.faction=null; DRAFT.trait=null; DRAFT.name="";
  setTheme(P.theme);
  $("#create-eyebrow").textContent = CC.eyebrow;
  $("#create-title").textContent = CC.title;
  $("#lbl-name").textContent = CC.nameLabel;
  $("#lbl-faction").textContent = CC.factionLabel;
  $("#lbl-trait").textContent = "Signature strength";
  $("#inp-name").value=""; $("#inp-name").placeholder = CC.placeholder;

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

  // New Game+ tier selector — only when unlocked (a prior win) and not a daily run.
  DRAFT.ngPlus=0;
  const ngWrap=$("#ngplus-field"), maxTier=META.ngPlus.maxCleared;
  if(ngWrap){
    if(maxTier>0 && !DRAFT.daily){
      ngWrap.classList.remove("hidden");
      const tiers=[]; for(let t=0;t<=maxTier;t++) tiers.push(t);
      $("#ngplus-chips").innerHTML = tiers.map((t,i)=>`<button class="chip" data-ng="${t}" aria-pressed="${i===0}">${t===0?"Standard":"NG+"+t}</button>`).join("");
      $$("#ngplus-chips .chip").forEach(ch=>ch.addEventListener("click",()=>{
        $$("#ngplus-chips .chip").forEach(x=>x.setAttribute("aria-pressed","false"));
        ch.setAttribute("aria-pressed","true"); DRAFT.ngPlus=+ch.dataset.ng;
        $("#ngplus-desc").textContent=DRAFT.ngPlus?("Tougher rivals, more crises and scandals, extra opening twists."):"A standard climb.";
      }));
      $("#ngplus-desc").textContent="A standard climb.";
    } else {
      ngWrap.classList.add("hidden");
    }
  }

  DRAFT.avatar=randAvatar(path);
  $("#create-ava").innerHTML=portrait(DRAFT.avatar,"happy",false,"Your character");
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
async function startCareer(d){
  await loadBank(); // the draw pool is code-split; ensure it's loaded before the first event
  const P=PATHS[d.path];
  // Seed this run from an explicit DRAFT.seed (shared/daily scenario) or a fresh one.
  _rng = createRng(d.seed!=null ? d.seed : randomSeed());
  const ngTier=d.daily?0:(d.ngPlus||0); // New Game+ never applies to the daily scenario
  S=blankRun({
    version:VERSION, seed:_rng.seed, rngState:_rng.getState(), path:d.path,
    stats:Object.assign({},P.start),
    player:{name:d.name.trim(), title:P.phases[0].title, avatar:d.avatar, faction:d.faction, trait:d.trait},
    difficulty:d.difficulty||DEFAULT_DIFFICULTY, daily:!!d.daily, ngPlus:ngTier
  });
  const tr=TRAITS.find(t=>t.id===d.trait); if(tr) applyFx(S,tr.fx);
  rollWorld(); createAntagonist(); assignOpponent(); generateRivals();
  // Civ P1: generate the province board on its OWN seeded stream (never touches
  // the event RNG, so the seeded sweep stays byte-identical). Not yet wired to
  // stats/events — present in state, ready for the P2 map render.
  S.realm=generateWorld(S.seed, S.path, {factions:(P.factions||[]).map(f=>f.id)});
  applyDifficultyStart(S, difficultyById(DIFFICULTIES, S.difficulty));
  const _mods=rollModifiers(_rng, MODIFIERS, 1+Math.min(ngTier,2)); S.modifiers=_mods.map(m=>m.id);
  _mods.forEach(m=>applyModifier(S,m));
  if(_mods.length) toast("This run — "+_mods.map(m=>m.name).join(" · "));
  setTheme(P.theme);
  _lastHudMood=null; // fresh run: don't pulse the avatar against the prior run's mood
  go("game"); renderHUD();
  S.lastDeltas=null;
  nextEvent(); save();
  META=metaRecordStart(META); saveMeta();
  maybeTutorial();
}

/* ================================================================
   DRAWER (career log + how-to)
   ================================================================ */
let drawerReturnFocus=null;
function openDrawer(title,html){
  const dr=$("#drawer"); dr.querySelector("h3").textContent=title;
  $("#log-mount").innerHTML=html; dr.classList.add("open");
  drawerReturnFocus=document.activeElement;
  focusHeading("#drawer-title"); announce(title+" opened. Press Escape to close.");
}
function closeDrawer(){
  const dr=$("#drawer"); if(!dr.classList.contains("open")) return;
  dr.classList.remove("open");
  try{ if(drawerReturnFocus && drawerReturnFocus.focus) drawerReturnFocus.focus(); }catch(e){}
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
   CODEX / ALMANAC — an in-game reference for the systems
   ================================================================ */
function codexSection(title,inner){ return `<section class="cdx-sec"><h3 class="cdx-h">${esc(title)}</h3>${inner}</section>`; }
function codexCard(emoji,name,sub,desc){
  return `<div class="cdx-card">
    <span class="cdx-emoji" aria-hidden="true">${emoji||"•"}</span>
    <div class="cdx-card-body">
      <div class="cdx-name">${esc(name)}</div>
      ${sub?`<div class="cdx-sub">${esc(sub)}</div>`:""}
      <div class="cdx-desc">${esc(desc)}</div>
    </div>
  </div>`;
}
function factionCards(path){ return (PATHS[path].factions||[]).map(f=>codexCard("🏛️",f.name,"",f.desc)).join(""); }
function advisorCards(path){ return (ADVISORS[path]||[]).map(a=>codexCard(a.emoji,a.title,a.name,a.desc)).join(""); }
function renderCodex(){
  const B=PATHS.ballot, V=PATHS.vanguard;
  const html=
    codexSection("How to Rule",
      `<p class="cdx-p">Climb from a nobody to the most powerful person in the fictional nation of <b>Velmora</b>, across three offices. Two roads, one prize. Survive enough turns in each office to face a contest — an election or a power-play — then win it to rise. Lose the contest, or let your vitals fail, and your story ends.</p>`)
    + codexSection("The Six Stats",
      `<div class="cdx-grid">`
      + STAT_KEYS.map(k=>`<div class="cdx-stat"><b>${esc(B.statNames[k])}</b><span>${esc(V.statNames[k])}</span></div>`).join("")
      + `</div><p class="cdx-p">Keep most of them high. <b>${esc(B.statNames.heat)} / ${esc(V.statNames.heat)}</b> is the danger gauge — let it reach 100 and you fall; let your core support reach 0 and you collapse.</p>`)
    + codexSection("The Systems",
      codexCard("🏛️","Factions","Three blocs per path","Every choice quietly warms or cools the three factions. Keep your coalition happy and they lift you at contest time; alienate them and they drag you down.")
      + codexCard("👔","Cabinet","Advisors with loyalty","At each promotion you appoint an advisor who lends a passive edge each turn — but keep them loyal, or they resign and leak on the way out.")
      + codexCard("⚖️","Ideology","Velvet ↔ Iron · Clean ↔ Dirty","How you wield power is tracked on two axes and read back to you in the ending.")
      + codexCard("⏳","Term Dynamics","The cost of power","Riding high erodes your support each turn, and scandal or a sour economy speed it up — you cannot simply coast at the top."))
    + codexSection("The Ballot Path — "+B.land,
      `<p class="cdx-lead">${esc("Win elections through Approval, money, and the press. Lose a race and your career is over.")}</p>`
      + `<h4 class="cdx-h4">Factions</h4>`+factionCards("ballot")
      + `<h4 class="cdx-h4">Advisors</h4>`+advisorCards("ballot"))
    + codexSection("The Vanguard Path — "+V.land,
      `<p class="cdx-lead">${esc("Climb a one-party state through Loyalty, Standing, and fear. Let Suspicion run wild and you are purged.")}</p>`
      + `<h4 class="cdx-h4">Factions</h4>`+factionCards("vanguard")
      + `<h4 class="cdx-h4">Advisors</h4>`+advisorCards("vanguard"))
    + codexSection("Starting Traits", TRAITS.map(t=>codexCard(t.emoji,t.name,"",t.desc)).join(""));
  $("#codex-mount").innerHTML=html;
}
function openCodex(){ renderCodex(); go("codex"); focusHeading("#codex-title"); announce("The Almanac — a reference for the paths, factions, advisors, and traits."); }
function closeCodex(){ go("title"); const b=$("#btn-codex"); if(b) b.focus(); }

/* ================================================================
   RECORDS — cross-run progress: lifetime stats, achievements, history
   ================================================================ */
function recCard(emoji,name,desc,locked){
  return `<div class="cdx-card${locked?" rec-locked":""}">
    <span class="cdx-emoji" aria-hidden="true">${locked?"🔒":(emoji||"•")}</span>
    <div class="cdx-card-body">
      <div class="cdx-name">${esc(name)}</div>
      <div class="cdx-desc">${esc(desc)}</div>
    </div>
  </div>`;
}
function recRunRow(r){
  const pathName=r.path==="ballot"?"Ballot":(r.path==="vanguard"?"Vanguard":esc(r.path));
  const tag=r.win?`<span class="coal-tag good">WON</span>`:`<span class="coal-tag bad">FELL</span>`;
  const extra=[r.daily?"🗓️ Daily":"", r.ngPlus?("NG+"+r.ngPlus):""].filter(Boolean).join(" · ");
  return `<div class="rec-run">
    <div class="rec-run-top"><span class="rec-rank">${esc(r.rank||r.endingId)}</span>${tag}</div>
    <div class="rec-run-sub">${esc(pathName)} · ${esc(r.title)} · ${r.totalTurns} yrs · ${esc(cap(r.difficulty||""))}${extra?" · "+esc(extra):""}</div>
  </div>`;
}
function renderRecords(){
  const s=META.stats;
  const winRate=s.runsFinished?Math.round(100*s.wins/s.runsFinished):0;
  const statRows=[
    {l:"Careers finished",v:String(s.runsFinished)},
    {l:"Wins / Losses",v:s.wins+" / "+s.losses},
    {l:"Win rate",v:winRate+"%"},
    {l:"Best composite",v:String(s.bestComposite)},
    {l:"Years in the arena",v:String(s.totalYears)},
    {l:"Ballot / Vanguard",v:s.byPath.ballot+" / "+s.byPath.vanguard}
  ];
  const achUnlocked=ACHIEVEMENTS.filter(a=>META.achievements[a.id]).length;
  const achHtml=ACHIEVEMENTS.map(a=>recCard(a.emoji,a.name,a.desc,!META.achievements[a.id])).join("");
  const unlUnlocked=UNLOCKABLES.filter(u=>META.unlockables[u.id]).length;
  const unlHtml=UNLOCKABLES.map(u=>recCard(u.emoji,u.name,u.desc,!META.unlockables[u.id])).join("");
  const histHtml=META.history.length
    ? META.history.slice().reverse().map(recRunRow).join("")
    : `<p class="cdx-p">No careers yet — your history will appear here once you finish a run.</p>`;
  $("#records-mount").innerHTML=
    codexSection("Lifetime",
      `<div class="legacy">`+statRows.map(r=>`<div class="lc"><div class="ll">${esc(r.l)}</div><div class="lv">${esc(r.v)}</div></div>`).join("")+`</div>`)
    + codexSection("Achievements — "+achUnlocked+"/"+ACHIEVEMENTS.length, achHtml)
    + codexSection("Unlocks — "+unlUnlocked+"/"+UNLOCKABLES.length, unlHtml)
    + codexSection("Past Lives", histHtml);
}
function openRecords(){ renderRecords(); go("records"); focusHeading("#records-title"); announce("Records — your lifetime stats, achievements, and past careers."); }
function closeRecords(){ go("title"); const b=$("#btn-records"); if(b) b.focus(); }

/* ================================================================
   CAREER SLOTS (Phase 8) — resume / switch / delete / start-in-slot
   ================================================================ */
let pendingStart={seed:null,daily:false};
function slotInfo(i){
  const o=loadRaw(i);
  if(!o || !o.path) return {used:false};
  return {used:true, over:!!o.over, path:o.path,
    pathName:(o.path==="ballot"?"Ballot":(o.path==="vanguard"?"Vanguard":o.path)),
    title:(o.player&&o.player.title)||"", phase:o.phase||1, totalTurns:o.totalTurns||0,
    daily:!!o.daily, ngPlus:o.ngPlus||0};
}
function renderSlots(){
  const cards=[];
  for(let i=0;i<SLOT_COUNT;i++){
    const info=slotInfo(i), n="Slot "+(i+1);
    if(info.used && !info.over){
      const sub=esc(info.pathName+" · "+info.title+" · Yr "+info.totalTurns
        +(info.daily?" · 🗓️ Daily":"")+(info.ngPlus?" · NG+"+info.ngPlus:""));
      cards.push(`<div class="slot-card${i===activeSlot?" active":""}">
        <div class="slot-h">${n}</div><div class="slot-sub">${sub}</div>
        <div class="slot-actions">
          <button class="btn primary" data-act="resume" data-slot="${i}">Resume</button>
          <button class="btn" data-act="del" data-slot="${i}">Delete</button>
        </div></div>`);
    } else {
      cards.push(`<div class="slot-card empty">
        <div class="slot-h">${n}</div><div class="slot-sub">Empty career slot</div>
        <div class="slot-actions"><button class="btn gold" data-act="start" data-slot="${i}">Start a career</button></div>
      </div>`);
    }
  }
  $("#slots-mount").innerHTML=cards.join("");
  $$("#slots-mount [data-act]").forEach(b=>b.addEventListener("click",()=>slotAction(b.dataset.act,+b.dataset.slot)));
}
function slotAction(act,i){
  if(act==="resume"){ setActiveSlot(i); resumeGame(); return; }
  if(act==="del"){ clearSave(i); toast("Slot "+(i+1)+" cleared"); renderSlots(); refreshContinueBtn(); return; }
  if(act==="start"){
    setActiveSlot(i);
    DRAFT.seed=pendingStart.seed; DRAFT.daily=pendingStart.daily;
    setTheme("theme-neutral");
    if(pendingStart.daily) toast("Scenario of the Day — everyone plays the same run today");
    go("path");
  }
}
function openSlots(intent){ pendingStart=intent||{seed:null,daily:false}; renderSlots(); go("slots"); focusHeading("#slots-title"); announce("Career slots. Resume, delete, or start a new career in a slot."); }
function closeSlots(){ go("title"); const b=$("#btn-continue"); if(b) b.focus(); }
/* Quick-start a brand-new career: straight to path-select when the active slot is
   free, otherwise open the slot picker so an in-progress career isn't clobbered. */
function quickStart(intent){
  if(hasSave(activeSlot)){ openSlots(intent); return; }
  pendingStart=intent;
  DRAFT.seed=intent.seed; DRAFT.daily=intent.daily;
  setTheme("theme-neutral");
  if(intent.daily) toast("Scenario of the Day — everyone plays the same run today");
  go("path");
}

/* ================================================================
   SETTINGS — accessibility + device preferences (persisted)
   ================================================================ */
function renderSettings(){
  const r=$("#set-reduce"); if(r) r.setAttribute("aria-checked",SETTINGS.reduceMotion?"true":"false");
  const h=$("#set-high"); if(h) h.setAttribute("aria-checked",SETTINGS.highContrast?"true":"false");
  const s=$("#set-sound"); if(s) s.setAttribute("aria-checked",SETTINGS.sound?"true":"false");
  const vo=$("#set-voice"); if(vo) vo.setAttribute("aria-checked",SETTINGS.voice?"true":"false");
  const er=$("#set-errors"); if(er) er.setAttribute("aria-checked",SETTINGS.errorReports?"true":"false");
  const ad=$("#set-director"); if(ad) ad.setAttribute("aria-checked",SETTINGS.aiDirector?"true":"false");
  const wv=$("#set-weave"); if(wv) wv.setAttribute("aria-checked",(SETTINGS.weaveDensity&&SETTINGS.weaveDensity!=="off")?"true":"false");
  const lv=$("#set-live"); if(lv) lv.setAttribute("aria-checked",SETTINGS.liveStoryteller?"true":"false");
  const cfg=$("#live-config"); if(cfg) cfg.hidden=!SETTINGS.liveStoryteller;
  const mdl=$("#live-model"); if(mdl) mdl.value=SETTINGS.liveModel||"claude-haiku-4-5";
  if(SETTINGS.liveStoryteller){ loadLive().then(L=>{ const kf=$("#live-key"); if(kf && !kf.value) kf.value=L.getLiveKey(); }).catch(()=>{}); }
}
function openSettings(){ renderSettings(); go("settings"); focusHeading("#settings-title"); announce("Settings."); }
function closeSettings(){ go("title"); const b=$("#btn-settings"); if(b) b.focus(); }
function toggleSetting(key,label){
  SETTINGS[key]=!SETTINGS[key];
  applySettings(); saveSettings(); renderSettings();
  announce(label+" "+(SETTINGS[key]?"on":"off"));
}

/* ================================================================
   FIRST-RUN TUTORIAL — skippable, replayable from Settings
   ================================================================ */
const TUTORIAL=[
  {t:"Welcome to Velmora",b:"You begin as a nobody. Across three offices, claw your way to the most powerful seat in a fictional nation. Two roads, one prize — and no two careers play the same."},
  {t:"Your six stats",b:"Every choice nudges the six stats at the top of the screen. Keep most of them high — but the danger gauge (Scrutiny or Suspicion) is the opposite: let it reach 100 and you fall. Let your core support reach 0 and you collapse."},
  {t:"Choices & promotions",b:"Pick a response to each dilemma — 🎲 options are real gambles. Survive enough turns and you face a contest: an election or a power-play. Spend resources to swing the odds, then win it to rise."},
  {t:"How you rule",b:"Appoint advisors, manage factions, and weather crises and scandals. Save any time and resume later. There is no single right way to rule — only the legacy you leave behind. Good luck."}
];
let tutIx=0, tutReturnFocus=null;
function renderTut(){
  const s=TUTORIAL[tutIx];
  $("#tut-step").textContent="Step "+(tutIx+1)+" of "+TUTORIAL.length;
  $("#tut-title").textContent=s.t;
  $("#tut-body").textContent=s.b;
  $("#tut-dots").innerHTML=TUTORIAL.map((_,i)=>`<span class="tut-dot${i===tutIx?" on":""}"></span>`).join("");
  $("#tut-next").textContent= tutIx===TUTORIAL.length-1 ? "Got it" : "Next";
}
function openTutorial(){
  tutIx=0; tutReturnFocus=document.activeElement; renderTut();
  $("#tutorial").hidden=false;
  const main=$("#main"); if(main) main.inert=true; // background is inert under the aria-modal dialog
  focusHeading("#tut-title"); announce("Tutorial, "+TUTORIAL.length+" steps. Press Escape to skip.");
}
function closeTutorial(){
  SETTINGS.tutorialSeen=true; saveSettings();
  $("#tutorial").hidden=true;
  const main=$("#main"); if(main) main.inert=false;
  try{ if(tutReturnFocus && tutReturnFocus.focus) tutReturnFocus.focus(); }catch(e){}
}
function tutNext(){
  if(tutIx>=TUTORIAL.length-1){ closeTutorial(); return; }
  tutIx++; renderTut(); focusHeading("#tut-title");
}
function maybeTutorial(){ if(!SETTINGS.tutorialSeen) openTutorial(); }

/* First-run Mature 17+ gate (Overhaul P3). Resolves once per device: accepting
   persists + reveals the app; "under 17" shows a soft denial with a way back.
   Focus-trapped, Esc-inert (it must be answered), background inert — mirroring the
   tutorial's aria-modal handling. Pure client + localStorage → fully offline. */
function ageButtons(){
  const denied=$("#age-denied");
  if(denied && !denied.hidden) return [$("#age-back")].filter(Boolean);
  return [$("#age-no"),$("#age-yes")].filter(Boolean);
}
function showAgeGate(){
  const gate=$("#age-gate"); if(!gate) return;
  const main=$("#main"); if(main) main.inert=true;
  $("#age-ask").hidden=false; $("#age-denied").hidden=true;
  gate.hidden=false;
  const yes=$("#age-yes"); if(yes) try{ yes.focus(); }catch(e){}
  announce("Mature content. You must be 17 or older to play. Confirm your age to enter.");
}
function acceptAge(){
  setAgeVerified();
  const gate=$("#age-gate"); if(gate) gate.hidden=true;
  const main=$("#main"); if(main) main.inert=false;
  const cta=$("#btn-new"); if(cta) try{ cta.focus(); }catch(e){}
  announce("Welcome to Velmora.");
}
function denyAge(){
  $("#age-ask").hidden=true; $("#age-denied").hidden=false;
  const back=$("#age-back"); if(back) try{ back.focus(); }catch(e){}
  announce("You must be 17 or older to play Velmora.");
}
function backToAge(){
  $("#age-denied").hidden=true; $("#age-ask").hidden=false;
  const yes=$("#age-yes"); if(yes) try{ yes.focus(); }catch(e){}
}
function ageTrap(e){
  if(e.key==="Escape"){ e.preventDefault(); return; } // the gate must be answered
  if(e.key!=="Tab") return;
  const b=ageButtons(); if(!b.length) return;
  e.preventDefault();
  const i=b.indexOf(document.activeElement);
  const next = e.shiftKey ? (i<=0?b.length-1:i-1) : (i>=b.length-1?0:i+1);
  try{ b[next].focus(); }catch(e2){}
}
function gateAge(){ if(!ageVerified()) showAgeGate(); }

/* ================================================================
   CONFETTI / FX CANVAS + TOAST
   ================================================================ */
let fxCanvas=null, fxCtx=null;
function sizeCanvas(){ fxCanvas=$("#fx-canvas"); if(!fxCanvas)return; fxCtx=fxCanvas.getContext("2d"); fxCanvas.width=window.innerWidth; fxCanvas.height=window.innerHeight; }
function reduced(){ if(SETTINGS.reduceMotion) return true; try{return window.matchMedia("(prefers-reduced-motion:reduce)").matches;}catch(e){return false;} }

/* ---------- audio: synth SFX, opt-in (Settings → Sound), lazily created ---------- */
let _actx=null;
function actx(){
  if(_actx) return _actx;
  try{ const AC=window.AudioContext||window.webkitAudioContext; _actx=AC?new AC():null; }catch(e){ _actx=null; }
  return _actx;
}
function blip(freq,start,dur,type,gain){
  const ac=actx(); if(!ac) return;
  const t0=ac.currentTime+start;
  const o=ac.createOscillator(), g=ac.createGain();
  o.type=type||"triangle"; o.frequency.setValueAtTime(freq,t0);
  g.gain.setValueAtTime(0.0001,t0);
  g.gain.linearRampToValueAtTime(gain||0.12,t0+0.012);
  g.gain.exponentialRampToValueAtTime(0.0001,t0+dur);
  o.connect(g).connect(ac.destination);
  o.start(t0); o.stop(t0+dur+0.03);
}
/* Opt-in narration (Overhaul P6). say() speaks a line in a character's
   deterministic voice; hush() stops mid-line. Best-effort no-ops when narration
   is off or unsupported — the on-screen text is always the caption of record. */
function say(text,key){
  if(!SETTINGS.voice || !text) return;
  loadVoice().then(V=>{ if(V.isSupported()) V.speak(text, V.profileFor(key, S&&S.path)); }).catch(()=>{});
}
function hush(){ if(_voice) _voice.then(V=>V.stop()).catch(()=>{}); }
function sfx(name){
  if(!SETTINGS.sound) return;
  const ac=actx(); if(!ac) return;
  try{ if(ac.state==="suspended") ac.resume(); }catch(e){}
  switch(name){
    case "click":   blip(330,0,0.09,"triangle",0.09); break;
    case "promote": [523.25,659.25,783.99].forEach((f,i)=>blip(f,i*0.07,0.18,"triangle",0.11)); break;
    case "fail":    [330,247,196].forEach((f,i)=>blip(f,i*0.12,0.30,"sawtooth",0.10)); break;
    case "win":     [523.25,659.25,783.99,1046.5].forEach((f,i)=>blip(f,i*0.09,0.24,"triangle",0.12)); break;
    case "lose":    [392,329.63,261.63].forEach((f,i)=>blip(f,i*0.13,0.32,"sawtooth",0.10)); break;
    default: break;
  }
}
function confetti(){
  if(reduced()||!fxCtx) return;
  // "ink flecks / torn poster scraps" in the active theme's inks (Overprint)
  let cols=["#F2B705","#E63B5B","#3B6FE6","#2FB67D","#A65BD6","#FF7A3C","#ffffff"];
  try{
    const cs=getComputedStyle(document.body);
    const rp=k=>cs.getPropertyValue(k).trim();
    const themed=[rp("--rp-ink-spot"),rp("--rp-ink-b"),rp("--rp-foil"),rp("--rp-ink-key"),rp("--rp-paper")].filter(Boolean);
    if(themed.length>=4) cols=themed;
  }catch(e){}
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
/* ---- save slots (Phase 8) ----
   Runs persist per slot at SAVE_KEY+"__"+i (e.g. velmora_save_v1__0). The legacy
   bare SAVE_KEY (pre-Phase-8) is adopted as slot 0. The in-memory fallback for
   save data is a per-slot map on window._velmoraMem (tolerating a legacy string
   as the slot-0 value). activeSlot is the slot the live run reads/writes. */
let activeSlot=0;
function slotKey(i){ return SAVE_KEY+"__"+i; }
function memGet(i){ const m=window._velmoraMem; if(m&&typeof m==="object") return m[i]||null; if(typeof m==="string"&&i===0) return m; return null; }
function memSet(i,data){ let m=window._velmoraMem; if(!m||typeof m!=="object") m={}; m[i]=data; window._velmoraMem=m; }
function memDel(i){ const m=window._velmoraMem; if(m&&typeof m==="object"){ delete m[i]; } else if(typeof m==="string"&&i===0){ window._velmoraMem=null; } }
function setActiveSlot(i){ activeSlot=i; META.activeSlot=i; saveMeta(); }

function save(){
  if(!S) return;
  S.rngState=_rng.getState();
  let data; try{ data=JSON.stringify(S); }catch(e){ return; }
  try{ localStorage.setItem(slotKey(activeSlot),data); }catch(e){ memSet(activeSlot,data); }
}
function loadRaw(i){
  if(i===undefined) i=activeSlot;
  let data=null;
  try{ data=localStorage.getItem(slotKey(i)); }catch(e){}
  if(!data && i===0){ try{ data=localStorage.getItem(SAVE_KEY); }catch(e){} } // legacy bare key → slot 0
  if(!data) data=memGet(i);
  if(!data) return null;
  try{ return JSON.parse(data); }catch(e){ return null; }
}
function hasSave(i){ const o=loadRaw(i===undefined?activeSlot:i); return !!(o && o.path && !o.over); }
function clearSave(i){
  if(i===undefined) i=activeSlot;
  try{ localStorage.removeItem(slotKey(i)); }catch(e){}
  if(i===0){ try{ localStorage.removeItem(SAVE_KEY); }catch(e){} } // also drop adopted legacy key
  memDel(i);
}
function anySave(){ for(let i=0;i<SLOT_COUNT;i++){ if(hasSave(i)) return true; } return false; }
function refreshContinueBtn(){ const c=$("#btn-continue"); if(c) c.classList.toggle("hidden", !anySave()); }

async function resumeGame(){
  const o=loadRaw();
  if(!o || !o.path){ toast("No saved career found"); return; }
  await loadBank(); // the draw pool is code-split; needed for nextEvent/EVENTS.find below
  S=o;
  if(!S.arcs) S.arcs={}; // migrate older saves (pre-arc-system)
  if(!S.npcs){ S.npcs={}; S.antagonistId=S.antagonistId||""; } // migrate (pre-NPC-roster)
  if(!S.scandals){ S.scandals=[]; S.activeScandal=S.activeScandal||null; } // migrate (pre-scandals)
  if(!S.difficulty){ S.difficulty=DEFAULT_DIFFICULTY; S.modifiers=S.modifiers||[]; S.daily=!!S.daily; } // migrate (pre-setup)
  if(!S.cabinet){ S.cabinet=[]; S.cabinetOffer=S.cabinetOffer||null; } // migrate (pre-cabinet)
  if(S.pendingSub===undefined){ S.pendingSub=null; } // migrate (pre-sub-decisions)
  if(typeof S.ngPlus!=="number"){ S.ngPlus=0; } // migrate (pre-New-Game+)
  if(!S.realm){ S.realm=generateWorld(S.seed, S.path, {factions:((PATHS[S.path]||{}).factions||[]).map(f=>f.id)}); } // migrate (pre-Civ-world)
  // Loom + Live: re-add any in-flight generated events so EVENTS.find resolves them post-reload.
  if(!Array.isArray(S.wovenCache)) S.wovenCache=[];
  else for(const w of S.wovenCache){ if(!EVENTS.some(e=>e.id===w.id)) EVENTS.push(w); }
  if(!Array.isArray(S.liveCache)) S.liveCache=[];
  else for(const w of S.liveCache){ if(!EVENTS.some(e=>e.id===w.id)) EVENTS.push(w); }
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
  loadSettings(); applySettings();
  // Civ P2 flag (D6): OFF in production so players never see the half-built map;
  // auto-on in dev; ?civ=1 forces on anywhere (?civ=0 forces off) for preview/e2e.
  // Not persisted/user-toggleable yet — resolved fresh each boot, ignoring any stored value.
  SETTINGS.civMap=false;
  try{ if(import.meta.env && import.meta.env.DEV) SETTINGS.civMap=true; }catch(e){}
  try{ const u=new URLSearchParams(location.search); if(u.has("civ")) SETTINGS.civMap=(u.get("civ")!=="0"); }catch(e){}
  installErrorReporting();
  loadMeta(); activeSlot=META.activeSlot;
  sizeCanvas();
  window.addEventListener("resize",sizeCanvas);

  $("#btn-new").addEventListener("click",()=>quickStart({seed:null,daily:false}));
  $("#btn-continue").addEventListener("click",()=>openSlots({seed:null,daily:false}));
  $("#btn-slots-back").addEventListener("click",closeSlots);
  $("#btn-how").addEventListener("click",showHow);
  $("#btn-codex").addEventListener("click",openCodex);
  $("#btn-codex-back").addEventListener("click",closeCodex);
  $("#btn-settings").addEventListener("click",openSettings);
  $("#btn-settings-back").addEventListener("click",closeSettings);
  $("#btn-records").addEventListener("click",openRecords);
  $("#btn-records-back").addEventListener("click",closeRecords);
  $("#set-reduce").addEventListener("click",()=>toggleSetting("reduceMotion","Reduce motion"));
  $("#set-high").addEventListener("click",()=>toggleSetting("highContrast","High contrast"));
  $("#set-sound").addEventListener("click",()=>{ toggleSetting("sound","Sound"); if(SETTINGS.sound) sfx("click"); });
  $("#set-voice").addEventListener("click",()=>{ toggleSetting("voice","Narration"); if(SETTINGS.voice) say("Narration on. Velmora will speak.","ballot"); else hush(); });
  $("#set-errors").addEventListener("click",()=>toggleSetting("errorReports","Error reporting"));
  $("#set-director").addEventListener("click",()=>toggleSetting("aiDirector","AI Director"));
  $("#set-weave").addEventListener("click",()=>{
    SETTINGS.weaveDensity = (SETTINGS.weaveDensity&&SETTINGS.weaveDensity!=="off") ? "off" : "low";
    saveSettings(); renderSettings();
    announce("Story Weaver "+(SETTINGS.weaveDensity!=="off"?"on":"off"));
  });
  $("#set-live").addEventListener("click",()=>toggleSetting("liveStoryteller","Live Storyteller"));
  const lk=$("#live-key"); if(lk) lk.addEventListener("change",e=>{ const v=(e.target.value||"").trim(); loadLive().then(L=>L.setLiveKey(v)).catch(()=>{}); });
  const lm=$("#live-model"); if(lm) lm.addEventListener("change",e=>{ SETTINGS.liveModel=e.target.value; saveSettings(); });
  $("#set-replay-tut").addEventListener("click",()=>{ closeSettings(); openTutorial(); });
  $("#set-clear").addEventListener("click",()=>{ clearSave(); refreshContinueBtn(); toast("Active career slot cleared"); });
  $("#tut-next").addEventListener("click",tutNext);
  $("#tut-skip").addEventListener("click",closeTutorial);
  $("#tutorial").addEventListener("keydown",e=>{
    if(e.key==="Escape"){ closeTutorial(); return; }
    if(e.key==="Tab"){ // trap focus between the two dialog buttons (belt-and-braces alongside inert)
      e.preventDefault();
      const skip=$("#tut-skip"), next=$("#tut-next");
      (document.activeElement===next ? skip : next).focus();
    }
  });
  $("#btn-daily").addEventListener("click",()=>quickStart({seed:dailySeed(),daily:true}));
  $("#btn-path-back").addEventListener("click",()=>{ setTheme("theme-neutral"); go("title"); });

  $$(".path-card").forEach(c=>{
    const p=c.dataset.path;
    const locked=(p==="iron"||p==="gilded"||p==="anointed") && !isExpansionUnlocked(META);
    const open=()=>{ if(locked){ toast("The Dark Mirrors expansion is locked."); return; } openCreate(p); };
    c.addEventListener("click",open);
    c.addEventListener("keydown",e=>{ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); open(); } });
  });

  $("#btn-create-back").addEventListener("click",()=>{ setTheme("theme-neutral"); go("path"); });
  $("#btn-reroll").addEventListener("click",()=>{ DRAFT.avatar=randAvatar(DRAFT.path); $("#create-ava").innerHTML=portrait(DRAFT.avatar,"happy",false,"Your character"); });
  $("#inp-name").addEventListener("input",e=>{ DRAFT.name=e.target.value; });
  $("#btn-begin-career").addEventListener("click",beginCareer);

  $("#tb-codex").addEventListener("click",showLog);
  $("#tb-save").addEventListener("click",()=>{ save(); toast("Career saved"); });
  $("#tb-quit").addEventListener("click",()=>{ if(S && !S.over) endGame("resign"); });

  $("#btn-again").addEventListener("click",()=>{ DRAFT.seed=null; DRAFT.daily=false; setTheme("theme-neutral"); go("path"); });

  $("#drawer-close").addEventListener("click",closeDrawer);
  $("#drawer").addEventListener("click",e=>{ if(e.target.id==="drawer") closeDrawer(); });
  $("#drawer").addEventListener("keydown",e=>{ if(e.key==="Escape") closeDrawer(); });

  $("#age-yes").addEventListener("click",acceptAge);
  $("#age-no").addEventListener("click",denyAge);
  $("#age-back").addEventListener("click",backToAge);
  $("#age-gate").addEventListener("keydown",ageTrap);

  refreshContinueBtn();

  // Debug/test hook: expose the live run state (used by E2E arc assertions).
  window.__VELMORA_STATE = () => S;

  gateAge(); // first-run Mature 17+ gate (over everything until answered)

  registerSW();
  prefetchBank(); // warm the code-split event-bank chunk so career start is instant
  loadArtManifest(); // non-blocking: load the art registry so portraits upgrade to drawn art when packs exist (P2+)
}

if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",boot);
else boot();

})();
