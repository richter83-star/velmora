import type { GameEvent } from '../engine/types';

export const EVENTS: GameEvent[] = [];


/* ---------------- BALLOT PATH ---------------- */
EVENTS.push(
{id:"b_first_donor",paths:["ballot"],phases:[1],weight:12,art:"scene",emoji:"💼",
 title:"Your First Big Donor",
 body:`A developer named Hollis Crane slides an envelope across the diner table. "Twenty thousand," he says, "and I never have to call it a bribe. I just need you to be... reasonable about the harbor rezoning."`,
 choices:[
  {label:"Take the money. Be reasonable.",fx:{funds:18,heat:8,base:-2},set:{crane_owes:true},tone:"slick",
   result:"The war chest swells. Somewhere, a reporter files the donation under 'worth checking later.'"},
  {label:"Take it, but promise nothing",fx:{funds:10,influence:4},tone:"good",
   result:"Crane frowns but pays. You keep your hands technically clean — for now."},
  {label:"Refuse on principle",fx:{funds:-2,support:6,media:5},set:{clean_streak:true},tone:"bold",
   result:"You walk out. By morning, a columnist is calling you 'the one who said no.' Halos are cheap publicity."}
 ]},
{id:"b_signature_bill",paths:["ballot"],phases:[1],weight:11,art:"newspaper",emoji:"📜",
 title:"The Signature Bill",
 body:`Your staff hands you three draft bills. You can only push one this session, and it will define your brand.`,
 choices:[
  {label:"Free childcare for working families",fx:{support:10,base:8,funds:-8,media:4},set:{progressive:true},tone:"good",
   result:"Parents love you. The business pages mutter about 'who pays for it.'"},
  {label:"Slash the small-business tax",fx:{support:4,funds:12,base:-2},set:{probusiness:true},tone:"slick",
   result:"Donors purr. The donations line goes vertical; your approval ticks up politely."},
  {label:"A tough-on-crime crackdown",fx:{support:8,media:6,heat:4,base:-4},set:{hawk:true},tone:"bold",
   result:"The cameras love a podium and flashing lights. Civil-liberty groups do not love you back."}
 ]},
{id:"b_oppo_file",paths:["ballot"],phases:[1,2],weight:9,art:"rival",emoji:"🗂️",
 kicker:"A quiet meeting",
 title:"The Oppo File",
 speaker:(S)=>({name:S.opp,role:"your rival",avatar:S.oppAvatar}),
 body:(S)=>`A staffer brings you a folder. Inside: an unflattering, possibly-true story about ${S.opp}, your likely rival. "We could leak this," she says. "Or we could be the bigger person and lose."`,
 choices:[
  {label:"Leak it to a friendly outlet",roll:{stat:"media",dc:50,
     success:{fx:{support:8,media:-2,heat:6},set:{went_negative:true},text:"It lands. Your rival spends a week explaining themselves instead of attacking you."},
     fail:{fx:{support:-6,media:-8,heat:12},text:"The leak is traced back to your office. Now YOU'RE the story, and not in a good way."}},tone:"slick"},
  {label:"Hold it as leverage",fx:{influence:8},set:{has_dirt:true},tone:"good",
   result:"You file it away. Your rival doesn't know it yet, but you own a small piece of their future."},
  {label:"Shred it. Run clean.",fx:{support:4,base:4,heat:-4},set:{clean_streak:true},tone:"bold",
   result:"You burn the file. It feels good. It might even be smart. Time will tell."}
 ]},
{id:"b_townhall",paths:["ballot"],phases:[1,2],weight:10,recurring:true,art:"scene",emoji:"🎙️",
 title:"The Town Hall From Hell",
 body:`A furious constituent grabs the mic: "You promised to fix our roads and DID NOTHING. Why should we trust a word you say?" The room goes quiet. The cameras zoom in.`,
 choices:[
  {label:"Apologize and own it",fx:{support:6,base:4,media:2},tone:"good",
   result:"Vulnerability plays well on the evening news. 'Refreshingly honest,' they say."},
  {label:"Deflect — blame the other party",fx:{support:-2,base:6,heat:3},tone:"slick",
   result:"Your base cheers. The undecideds in the back row quietly cross you off."},
  {label:"Fire back: 'Do YOU have a plan?'",roll:{stat:"support",dc:55,
     success:{fx:{support:8,media:6},text:"You filet the heckler. The clip goes viral as 'Senator DESTROYS angry man.'"},
     fail:{fx:{support:-10,media:-6,heat:5},text:"You look like a bully picking on a voter. The clip goes viral for the wrong reasons."}},tone:"bold"}
 ]},
{id:"b_lobbyist",paths:["ballot"],phases:[1,2,3],weight:8,art:"scene",emoji:"🐍",
 title:"The Lobbyist's Offer",
 body:`A pharma lobbyist offers a "fact-finding trip" — first class, beachfront, zero facts. All you have to do is soften your stance on drug pricing.`,
 choices:[
  {label:"Enjoy the beach",fx:{funds:12,heat:10,base:-4},set:{owes_pharma:true},tone:"slick",
   result:"The sand is lovely. The paper trail is not."},
  {label:"Decline the trip, keep the relationship",fx:{influence:6,funds:4},tone:"good",
   result:"You stay friendly but unbought. The lobbyist respects a long game."},
  {label:"Expose the offer publicly",roll:{stat:"media",dc:55,
     success:{fx:{support:12,media:10,heat:-6},set:{reformer:true},text:"You become 'the incorruptible one.' Editorial boards swoon."},
     fail:{fx:{support:-4,media:-4},text:"It reads as a stunt. 'Grandstanding,' the columnists yawn."}},tone:"bold"}
 ]},
{id:"b_scandal_photo",paths:["ballot"],phases:[1,2,3],weight:7,req:(S)=>S.stats.heat>=35,art:"newspaper",emoji:"📸",
 title:"The Photo Surfaces",
 body:`A blurry photo of you at a "donor party" you definitely shouldn't have attended is about to run on the front page. Your phone won't stop buzzing.`,
 choices:[
  {label:"Get ahead of it — full transparency",fx:{support:-4,heat:-18,media:4},tone:"good",
   result:"You release everything first. The story burns out in two days instead of two weeks."},
  {label:"Deny, deny, deny",roll:{stat:"media",dc:60,
     success:{fx:{heat:-10,support:2},text:"You stonewall it into a 'he-said-she-said.' The press loses the thread."},
     fail:{fx:{support:-14,heat:8,media:-8},text:"A second photo drops. Denial just doubled the news cycle."}},tone:"slick"},
  {label:"Pay for the photo to disappear",req:(S)=>S.stats.funds>=15,reqText:"Needs War Chest 15+",
   fx:{funds:-15,heat:-6},set:{buried_a_body:true},tone:"slick",
   result:"It vanishes. Someone now knows you'll pay to make problems vanish. That someone will be back."}
 ]},
{id:"b_disaster",paths:["ballot"],phases:[2,3],weight:9,art:"crisis",emoji:"🌊",
 title:"The Flood",
 body:`A river breaks its banks. Towns are underwater, families on rooftops. The nation watches to see what kind of leader you are.`,
 choices:[
  {label:"Go to the scene, sleeves rolled up",fx:{support:12,media:10,funds:-6},tone:"good",
   result:"You haul sandbags on camera. It's part genuine, part theater, and entirely effective."},
  {label:"Coordinate from the capital, fast aid",fx:{support:8,influence:6,funds:-8},tone:"good",
   result:"No photo-op, but the aid arrives early. The wonks notice. The cameras don't."},
  {label:"Promise billions you don't have",roll:{stat:"funds",dc:50,
     success:{fx:{support:14,base:6},text:"The crowd roars. You'll figure out the budget later. Probably."},
     fail:{fx:{support:-6,heat:8,funds:-10},text:"The check bounces publicly. 'Empty promises,' the chyron reads."}},tone:"bold"}
 ]},
{id:"b_debate",paths:["ballot"],phases:[2,3],weight:8,art:"scene",emoji:"🎯",
 title:"The Debate Stage",
 body:(S)=>`You're on stage with ${S.opp}. They just landed a clean hit on your record. Ninety seconds to respond, millions watching.`,
 choices:[
  {label:"Pivot to a rehearsed zinger",roll:{stat:"media",dc:52,
     success:{fx:{support:10,media:8},text:"The zinger lands. It's the only clip anyone replays."},
     fail:{fx:{support:-6,media:-4},text:"It comes off canned. The fact-checkers have a field day."}},tone:"slick"},
  {label:"Wonk out — bury them in detail",fx:{support:4,influence:6,base:-2},tone:"good",
   result:"You win on substance and lose on vibes. The transcript loves you; the audience drifts."},
  {label:"Get personal and angry",fx:{support:-4,base:8,heat:6,media:-2},tone:"bold",
   result:"Your base is fired up. Everyone else found it a little frightening."}
 ]},
{id:"b_purity_test",paths:["ballot"],phases:[1,2,3],weight:7,art:"scene",emoji:"⚖️",
 title:"The Purity Test",
 body:`Activists in your own coalition demand you sign a sweeping pledge — no compromise, ever, on their issue. Refuse and they primary you. Sign and you lose the middle.`,
 choices:[
  {label:"Sign it. Feed the base.",fx:{base:12,support:-4,media:-2},set:{pledged:true},then:[{id:"b_promise_kept",inTurns:3}],tone:"bold",
   result:"The faithful are ecstatic. You've also just handed your rival a quote for every swing-voter ad."},
  {label:"Refuse — defend the big tent",fx:{base:-8,support:8,influence:4},tone:"good",
   result:"You take the heat from your flank but look like a grown-up to everyone else."},
  {label:"Fudge it with vague language",roll:{stat:"influence",dc:50,
     success:{fx:{base:6,support:4},text:"You thread the needle. Both sides think you agreed with them."},
     fail:{fx:{base:-6,support:-6,heat:4},text:"Nobody's fooled. Both sides feel betrayed. Impressive, really."}},tone:"slick"}
 ]},
{id:"b_running_mate",paths:["ballot"],phases:[3],weight:14,queueOnly:false,art:"newspaper",emoji:"🤝",
 title:"Choosing a Running Mate",
 body:`You're on the national ticket now. Your running mate could balance you out — or upstage you.`,
 choices:[
  {label:"A safe, boring veteran",fx:{influence:8,base:2,media:-2},tone:"good",
   result:"Solid. Unexciting. Nobody will write a single interesting headline about them, which is the point."},
  {label:"A young firebrand who thrills the base",fx:{base:12,support:4,heat:4},tone:"bold",
   result:"The rallies are electric. Your handlers are popping antacids."},
  {label:"A rival you don't trust — for unity",fx:{influence:6,support:8,base:-2},set:{frenemy_vp:true},tone:"slick",
   result:"You shake hands and smile. Behind the smile, you both start counting knives."}
 ]},
{id:"b_promise_kept",paths:["ballot"],phases:[2,3],weight:6,queueOnly:true,art:"newspaper",emoji:"⏳",
 title:"The Bill Comes Due",
 body:`Months ago you made a big, expensive promise. The press has compiled a "promise tracker," and yours is glowing red.`,
 choices:[
  {label:"Find the money somehow",req:(S)=>S.stats.funds>=12,reqText:"Needs War Chest 12+",
   fx:{funds:-12,support:10,base:6},tone:"good",result:"You deliver, barely. 'A politician who kept their word' is a rare and valuable headline."},
  {label:"Quietly water it down",fx:{support:-8,base:-6,heat:4},tone:"slick",
   result:"You hope nobody notices. Several people notice."},
  {label:"Blame the legislature and move on",fx:{base:4,support:-4},tone:"bold",
   result:"You point fingers. It works on your base and on no one else."}
 ]},
{id:"b_media_darling",paths:["ballot"],phases:[1,2,3],weight:6,recurring:true,art:"scene",emoji:"📺",
 title:"The Friendly Anchor",
 body:`A star anchor offers you a softball primetime interview — IF you give them an exclusive "scoop" first. It's flattering and slightly gross.`,
 choices:[
  {label:"Play ball — feed the scoop",fx:{media:12,support:4,heat:2},set:{media_friend:true},tone:"slick",
   result:"The interview is a love-fest. Rival campaigns scream 'access journalism' into the void."},
  {label:"Decline; do a hostile interview instead",roll:{stat:"support",dc:55,
     success:{fx:{support:8,media:10},text:"You survive the grilling and look fearless doing it."},
     fail:{fx:{support:-8,media:-6,heat:4},text:"They corner you on tape. The gotcha runs on a loop."}},tone:"bold"},
  {label:"Skip the press entirely this week",fx:{media:-6,base:4,heat:-2},tone:"good",
   result:"You go quiet and let your rival overexpose. Sometimes silence is a strategy."}
 ]}
);

/* ---------------- VANGUARD PATH ---------------- */
EVENTS.push(
{id:"v_first_patron",paths:["vanguard"],phases:[1],weight:12,art:"rival",emoji:"🕴️",
 kicker:"A quiet word",
 title:"The Patron",
 speaker:(S)=>({name:S.opp,role:"senior cadre",avatar:S.oppAvatar}),
 body:(S)=>`Comrade ${S.opp}, a senior cadre, finds you after the meeting. "I can make your file shine," he murmurs. "Or I can make it disappear. Loyal men eat well in this Party. Are you loyal — to me?"`,
 choices:[
  {label:"Swear yourself to his faction",fx:{influence:16,base:8,heat:6,support:-2},set:{has_network:true,patron_owns:true},then:[{id:"v_secret_reform",inTurns:4}],tone:"slick",
   result:"You bow your head. His hand on your shoulder is heavy and warm and faintly threatening. You are now Somebody's man."},
  {label:"Accept help, commit to nothing",fx:{influence:8,base:2},then:[{id:"v_secret_reform",inTurns:4}],tone:"good",
   result:"You thank him warmly and pledge nothing. He smiles the smile of a man who will remember this."},
  {label:"Report his overture to the Party",fx:{support:10,base:-6,heat:-4},set:{doctrinaire:true,zealot_rep:true},then:[{id:"v_secret_reform",inTurns:4}],tone:"bold",
   result:"You file a report on his 'factionalism.' The Party notes your purity. Cadres start watching their words around you."}
 ]},
{id:"v_quota_report",paths:["vanguard"],phases:[1,2],weight:11,art:"bulletin",emoji:"🏭",
 kicker:"The numbers are due",
 title:"The Production Quota",
 body:`Your district missed its quota by a third. The report goes up tonight. The truth is dangerous. A lie is also dangerous, but later.`,
 choices:[
  {label:"Inflate the figures. Promise to catch up.",fx:{support:8,influence:4,heat:12},set:{cooked_books:true},tone:"slick",
   result:"The figures glow on paper. Somewhere a real warehouse stays empty, waiting to betray you."},
  {label:"Report honestly and blame sabotage",fx:{support:-4,base:6,heat:4},set:{pragmatist:true},tone:"bold",
   result:"You tell a useful half-truth: the numbers are bad, but 'wreckers' did it. The Party respects a man with enemies."},
  {label:"Report honestly, accept the failure",roll:{stat:"base",dc:50,
     success:{fx:{support:6,base:10,heat:-4},set:{pragmatist:true,honest_rep:true},text:"Your candor is so rare it reads as strength. A patron quietly marks you as 'reliable.'"},
     fail:{fx:{support:-12,influence:-6,heat:6},text:"Honesty is logged as incompetence. You spend weeks proving you are not a defeatist."}},tone:"good"}
 ]},
{id:"v_denounce",paths:["vanguard"],phases:[1,2,3],weight:10,art:"scene",emoji:"📢",
 title:"The Wavering Comrade",
 body:`A colleague you actually like has been making jokes about the leadership. Someone will report it. The only question is whether it's you — and whether you get the credit.`,
 choices:[
  {label:"Denounce them first, loudly",fx:{influence:10,base:6,support:6,heat:4},set:{denounced_ally:true},inc:{purge_count:1},tone:"slick",
   result:"You strike first. They are taken away. Their chair sits empty at the next meeting and no one mentions it. You sleep poorly, then fine."},
  {label:"Warn them quietly to stop",roll:{stat:"influence",dc:55,
     success:{fx:{base:10,support:4},set:{spared_rival:true,secret_decent:true},text:"You take a risk and tip them off. They go silent in time. You have made a true ally — a dangerous, priceless thing here."},
     fail:{fx:{heat:16,influence:-6},text:"Your warning is overheard. Now there are questions about why YOU protected a cynic."}},tone:"good"},
  {label:"Stay silent and hope it passes",fx:{heat:8,base:-2},tone:"bold",
   result:"You say nothing. The silence costs you — someone else gets the credit for the denunciation, and notices you hesitated."}
 ]},
{id:"v_purge_list",paths:["vanguard"],phases:[2,3],weight:9,art:"crisis",emoji:"🗒️",
 kicker:"Security organ request",
 title:"The List",
 body:`An officer from State Security sets a list of names on your desk. "We need a few more to make the quota of enemies look thorough," he says. "Add whoever you like. Or don't add, and we'll wonder why."`,
 choices:[
  {label:"Add your rivals to the list",fx:{influence:14,heat:14,support:-4},set:{security_ties:true,bloody_hands:true},inc:{purge_count:3},tone:"slick",
   result:"You hand back the list, longer. Your rivals vanish into paperwork. Power, it turns out, is mostly subtraction."},
  {label:"Add only true troublemakers",fx:{influence:6,base:4,heat:8},set:{security_ties:true},inc:{purge_count:1},tone:"bold",
   result:"You add a careful, defensible few. The officer is satisfied; you've kept some shred of a line you can point to later."},
  {label:"Return it empty — 'my district is clean'",roll:{stat:"support",dc:60,
     success:{fx:{support:10,base:8,heat:-6},set:{secret_decent:true},text:"You vouch for your people and somehow it holds. They remember it. Loyalty, the real kind, compounds."},
     fail:{fx:{heat:20,influence:-8},text:"An empty list is itself suspicious. Now Security has a file on the man with no enemies."}},tone:"good"}
 ]},
{id:"v_black_market",paths:["vanguard"],phases:[1,2],weight:8,art:"newspaper",emoji:"💵",
 title:"The Shortage",
 body:`The official shops are empty; the black market is full. A trader offers to keep your district fed and quiet — for a cut and a blind eye.`,
 choices:[
  {label:"Take the cut, look away",fx:{funds:16,support:6,heat:8},set:{pragmatist:true,corrupt_streak:true},tone:"slick",
   result:"The shelves fill by 'miracle.' Your people are fed, your pockets heavier, your file thicker."},
  {label:"Let it run, take nothing",fx:{support:10,base:4,heat:4},set:{pragmatist:true},tone:"good",
   result:"You permit the market and stay clean of it. Bellies full, hands empty. A rare, sustainable trick."},
  {label:"Crush it as bourgeois corruption",fx:{support:-8,base:8,heat:-4},set:{doctrinaire:true},tone:"bold",
   result:"You make arrests and headlines. The Party glows; the shelves stay empty and the muttering grows."}
 ]},
{id:"v_loyalty_oath",paths:["vanguard"],phases:[1,2,3],weight:7,recurring:true,art:"scene",emoji:"✊",
 title:"The Devotion Rally",
 body:`A mass rally needs a face on the stage to lead the chants. It is pure theater — and theater is half of power here.`,
 choices:[
  {label:"Pour your soul into the performance",fx:{media:12,base:8,support:4},set:{cult_building:true},tone:"slick",
   result:"Your voice cracks at exactly the right moment. The crowd roars your name. Cameras love a true believer, real or not."},
  {label:"Do it competently, no more",fx:{media:5,base:2},tone:"good",
   result:"You hit the marks and leave. Adequate devotion, professionally delivered."},
  {label:"Push the cult — banners with YOUR face",roll:{stat:"media",dc:58,
     success:{fx:{media:16,base:10,heat:6},set:{cult_building:true,own_cult:true},text:"Your portrait goes up beside the leadership's. A bold, useful, slightly suicidal move that pays — for now."},
     fail:{fx:{heat:18,influence:-6},text:"Putting your own face up reads as ambition. The leadership notices ambition the way sharks notice blood."}},tone:"bold"}
 ]},
{id:"v_rival_dossier",paths:["vanguard"],phases:[2,3],weight:9,art:"rival",emoji:"📁",
 kicker:"Compromising material",
 title:"Kompromat",
 speaker:(S)=>({name:S.opp,role:"your rival",avatar:S.oppAvatar}),
 body:(S)=>`Your people have assembled a file on ${S.opp} — affairs, foreign cousins, an old anti-Party joke. Enough to end them. Enough, if mishandled, to end you.`,
 choices:[
  {label:"Leak it to Security now",fx:{influence:12,support:4,heat:10},set:{has_dirt:true,struck_first:true},inc:{purge_count:1},tone:"slick",
   result:"The file does its quiet work. Your rival is reassigned to a cold and distant office. You hold the pen now."},
  {label:"Keep it. Use it as leverage.",fx:{influence:10,base:4,heat:4},set:{has_dirt:true,blackmailer:true},tone:"bold",
   result:"You visit your rival, smile, and mention a cousin abroad. They go pale and pliant. A leashed enemy is better than a dead one."},
  {label:"Burn it — make a genuine ally",roll:{stat:"influence",dc:55,
     success:{fx:{base:12,influence:6},set:{spared_rival:true,secret_decent:true},text:"You show them the file, then burn it in front of them. In a world of knives, an act of mercy buys terrifying loyalty."},
     fail:{fx:{influence:-10,heat:8},text:"They take your mercy as weakness and move against you anyway. Lesson learned, expensively."}},tone:"good"}
 ]},
{id:"v_foreign_delegation",paths:["vanguard"],phases:[2,3],weight:7,art:"bulletin",emoji:"🌐",
 kicker:"Outside contact",
 title:"The Foreign Hand",
 body:`A delegation from a rival power wants a back-channel with someone ambitious. Talking to them is treason. Not talking to them is a missed fortune. Either could be a trap.`,
 choices:[
  {label:"Meet them in secret",roll:{stat:"influence",dc:62,
     success:{fx:{funds:14,influence:10,heat:10},set:{foreign_ties:true},text:"The channel opens. Hard currency and useful secrets flow. You are now playing a game with a very short life expectancy if discovered."},
     fail:{fx:{heat:26,support:-8},set:{foreign_ties:true},text:"Someone photographed the meeting. The word 'treason' is now attached to your name in a file you cannot reach."}},tone:"slick"},
  {label:"Report the contact, claim the credit",fx:{support:12,base:6,heat:-6},set:{doctrinaire:true},tone:"bold",
   result:"You expose the approach and bask in the Party's approval. You also just closed a door some rivals will sneak through later."},
  {label:"Pretend it never happened",fx:{heat:4},tone:"good",
   result:"You ghost the delegation entirely. Safe, forgettable, and you'll never know what it might have been."}
 ]},
{id:"v_show_trial",paths:["vanguard"],phases:[3],weight:8,art:"crisis",emoji:"⚖️",
 kicker:"You preside",
 title:"The Show Trial",
 body:`You've risen high enough to run a trial of 'wreckers.' The verdict is decided; only the performance remains. The whole Union is watching how hard you bite.`,
 choices:[
  {label:"Demand the maximum, theatrically",fx:{base:10,media:8,heat:10,support:-4},set:{cult_building:true,tyrant_rep:true},inc:{purge_count:2},tone:"slick",
   result:"You thunder; the accused weep; the sentence is total. The leadership nods at your useful ferocity."},
  {label:"Convict, but spare their families",fx:{support:6,base:4,heat:2},set:{secret_decent:true},tone:"good",
   result:"You give the Party its verdict but quietly keep the relatives off the lists. Small mercies, secretly banked."},
  {label:"Let one defendant actually speak",roll:{stat:"support",dc:64,
     success:{fx:{support:14,media:6,heat:6},set:{secret_reformer:true},text:"You allow a real defense. It electrifies the room. People whisper that you might be... different. A dangerous, magnetic reputation."},
     fail:{fx:{heat:22,base:-8},text:"Letting an enemy speak is its own confession. Why, the leadership wonders, would a loyal man do that?"}},tone:"bold"}
 ]},
{id:"v_succession_whisper",paths:["vanguard"],phases:[3],weight:9,art:"rival",emoji:"♟️",
 kicker:"The old leader fades",
 title:"The Succession",
 speaker:(S)=>({name:S.opp,role:"Council rival",avatar:S.oppAvatar}),
 body:(S)=>`The General Secretary is dying. Behind the curtains, the Standing Committee is choosing. ${S.opp} is ahead of you. The next move decides everything.`,
 choices:[
  {label:"Build a bloc; promise everyone everything",fx:{influence:14,base:10,heat:6},set:{has_network:true},tone:"slick",
   result:"You make a dozen incompatible promises to a dozen ambitious men. The coalition holds — barely, loudly, dangerously."},
  {label:"Take the loyal-servant pose; wait",fx:{support:8,base:6,heat:-4},set:{patient_play:true},tone:"good",
   result:"You play the humble continuity candidate. Let the others knife each other while you look statesmanlike."},
  {label:"Move against your rival now",roll:{stat:"influence",dc:60,
     success:{fx:{influence:18,support:6,heat:10},set:{struck_first:true},inc:{purge_count:1},text:"You strike before the body is cold. Your rival is outmaneuvered into a 'health retirement.' The path clears."},
     fail:{fx:{heat:24,influence:-12,support:-6},text:"You moved too early and missed. Now your rival knows, and the knives turn toward you."}},tone:"bold"}
 ]},
{id:"v_secret_reform",paths:["vanguard"],phases:[2,3],weight:6,queueOnly:true,art:"scene",emoji:"🕯️",
 title:"The Thing You Believe",
 body:`Late, alone, a trusted aide asks what you'd really do with power. For one unguarded moment, you could say the true thing — or the safe thing.`,
 choices:[
  {label:"Confess: you'd open it all up",fx:{support:8,base:-4,heat:8},set:{secret_reformer:true},tone:"bold",
   result:"You whisper of openness, of reform, of a softer Union. Your aide's eyes shine — or calculate. You won't know which until it matters."},
  {label:"Say the safe, doctrinaire thing",fx:{base:6,heat:-4},set:{doctrinaire:true},tone:"good",
   result:"You recite the catechism. Your aide nods, reassured. The true thought stays locked where it's survived this long."},
  {label:"Test the aide — feed them a lie",fx:{influence:8,heat:2},set:{blackmailer:true},tone:"slick",
   result:"You plant a false confidence to see if it travels. Trust, here, is a thing you build out of traps."}
 ]},
{id:"v_propaganda_coup",paths:["vanguard"],phases:[1,2,3],weight:6,recurring:true,art:"newspaper",emoji:"📻",
 title:"The Editorial Slot",
 body:`The Party paper has an open front page and an editor who owes someone a favor. Whoever fills it shapes what a nation thinks this week.`,
 choices:[
  {label:"Run a piece glorifying your district",fx:{media:12,support:6,heat:2},set:{cult_building:true},tone:"slick",
   result:"Your achievements, lightly invented, lead the news. Reality will be asked to catch up later."},
  {label:"Attack a rival in print",fx:{media:8,influence:6,heat:6},set:{went_negative:true},tone:"bold",
   result:"A coded editorial guts a rival without naming them. Everyone who matters understands exactly who."},
  {label:"Promote a genuine policy win",fx:{support:8,media:6,base:4},set:{pragmatist:true},tone:"good",
   result:"You publicize something that actually works. Rare, and oddly more persuasive for being true."}
 ]}
);

/* ---------------- SHARED CRISES (both paths) ---------------- */
/* crisis:true → held out of the normal pool, injected by instability rolls */
EVENTS.push(
{id:"c_recession",paths:["ballot","vanguard"],phases:[1,2,3],weight:10,crisis:true,art:"crisis",emoji:"📉",
 kicker:"Breaking",title:"The Economy Cracks",
 body:(S)=>S.path==="ballot"
   ? `Markets tumble. Factories shutter. Voters want someone to blame, and your name is on a ballot soon.`
   : `The plan has failed quietly for years and loudly today. Shortages spread. The people are hungry and the Party needs a story.`,
 choices:[
  {label:"Bold stimulus / emergency rationing",fx:{funds:-14,support:12,base:4},tone:"good",
   result:"You spend big to soften the blow. It works enough to matter, and drains your reserves to do it."},
  {label:"Blame outsiders and saboteurs",fx:{support:6,base:8,media:4,heat:6},set:{went_negative:true},tone:"bold",
   result:"You point outward. Anger needs a target, and you've provided one. The underlying problem waits, patient."},
  {label:"Project calm; do little",roll:{stat:"media",dc:55,
     success:{fx:{support:6,media:8},text:"You radiate unbothered confidence and the panic ebbs. Sometimes the performance IS the policy."},
     fail:{fx:{support:-14,base:-6,heat:6},text:"Your calm reads as out-of-touch. The clip of you smiling during the crash will haunt you."}},tone:"slick"}
 ]},
{id:"c_scandal_leak",paths:["ballot","vanguard"],phases:[1,2,3],weight:9,crisis:true,art:"bulletin",emoji:"🚨",
 kicker:"Leaked tonight",title:"The Documents Surface",
 req:(S)=>S.stats.heat>=25,
 body:`A cache of documents hits the press. Some of it is about you. Some of it is even true. The next 48 hours decide whether it sticks.`,
 choices:[
  {label:"Get ahead of it — confess the small stuff",fx:{support:-6,media:6,heat:-12},tone:"good",
   result:"You admit a minor sin loudly to bury the major one quietly. An old trick, still effective."},
  {label:"Deny everything, attack the leaker",fx:{support:4,media:-4,heat:8},set:{went_negative:true},tone:"bold",
   result:"You go to war with the messenger. Your base cheers; the documents keep talking."},
  {label:"Find who leaked it and bury them",roll:{stat:"influence",dc:58,
     success:{fx:{influence:8,heat:-10},set:{has_dirt:true},text:"You trace the leak and quietly end the leaker's career. The story dies for lack of a second source."},
     fail:{fx:{heat:18,support:-8},text:"Your hunt for the leaker leaks. Now there are two scandals: the documents, and the cover-up."}},tone:"slick"}
 ]},
{id:"c_foreign_war",paths:["ballot","vanguard"],phases:[2,3],weight:9,crisis:true,art:"crisis",emoji:"⚔️",
 kicker:"Borders",title:"On the Brink of War",
 body:`Troops mass at the border. The nation looks to its leaders for nerve. Glory and catastrophe are the same coin, mid-flip.`,
 choices:[
  {label:"Rattle the saber; rally the flag",fx:{support:14,base:8,media:6,heat:6},set:{hawk:true},tone:"bold",
   result:"Nothing unites a country like a clear enemy. Your numbers soar on a wave you may not control."},
  {label:"Negotiate a tense peace",roll:{stat:"influence",dc:56,
     success:{fx:{support:12,influence:8,media:6},set:{peacemaker:true},text:"You pull a deal from the fire. History books may call it statesmanship. Hawks call it weakness, quietly."},
     fail:{fx:{support:-12,base:-6},text:"The talks collapse on camera. You look like you blinked, because you did."}},tone:"good"},
  {label:"Secret deal with the other side",fx:{funds:12,influence:8,heat:14},set:{foreign_ties:true},tone:"slick",
   result:"You cut a private arrangement that serves you more than the nation. Profitable. Treasonous if it ever surfaces."}
 ]},
{id:"c_assassination",paths:["ballot","vanguard"],phases:[2,3],weight:7,crisis:true,art:"bulletin",emoji:"🎯",
 kicker:"Attempt on your life",title:"The Shot in the Crowd",
 body:`A shot cracks over the rally. You're unhurt — barely. A nation holds its breath, and an opportunity is born from the gunsmoke.`,
 choices:[
  {label:"Stand bloodied and defiant for the cameras",fx:{support:18,media:12,base:8,heat:4},set:{survivor:true},tone:"bold",
   result:"The image of you, fist raised, jaw set, becomes instantly iconic. Survival is the best campaign ad ever made."},
  {label:"Use it to purge your enemies",fx:{influence:14,support:4,heat:16},set:{struck_first:true,bloody_hands:true},inc:{purge_count:2},tone:"slick",
   result:"You blame your rivals, evidence optional. The crackdown is swift and convenient. Too convenient, some will whisper."},
  {label:"Show restraint; call for calm",roll:{stat:"support",dc:50,
     success:{fx:{support:14,influence:6,media:8},set:{peacemaker:true},text:"You refuse to exploit it, and the dignity lands harder than any crackdown. A leader, not just a survivor."},
     fail:{fx:{support:-6,base:-4},text:"Your restraint reads as weakness to a frightened public that wanted to see strength."}},tone:"good"}
 ]},
{id:"c_pandemic",paths:["ballot","vanguard"],phases:[1,2,3],weight:8,crisis:true,art:"crisis",emoji:"🦠",
 kicker:"Outbreak",title:"The Sickness Spreads",
 body:`A fast illness sweeps the cities. Hospitals fill. The people want both freedom and protection, and they want them simultaneously and immediately.`,
 choices:[
  {label:"Hard lockdown, whatever the cost",fx:{support:-4,base:6,funds:-10,heat:-2},set:{technocrat_move:true},tone:"good",
   result:"You clamp down hard. Lives are saved; the economy and your popularity both take the hit you chose to take."},
  {label:"Keep things open, downplay it",fx:{funds:6,support:6,heat:10},tone:"slick",
   result:"You keep the lights on and the numbers vague. The markets thank you; the morgues do not."},
  {label:"Follow the experts, communicate daily",roll:{stat:"media",dc:54,
     success:{fx:{support:14,media:10,base:4},text:"Calm, honest, daily briefings make you the steady hand in the storm. Competence becomes charisma."},
     fail:{fx:{support:-10,media:-6,heat:6},text:"Mixed messages and reversals pile up. The public stops trusting the podium, and you're behind it."}},tone:"bold"}
 ]},
{id:"c_protest",paths:["ballot","vanguard"],phases:[1,2,3],weight:8,crisis:true,art:"crisis",emoji:"🪧",
 kicker:"The streets fill",title:"Mass Unrest",
 body:(S)=>S.path==="ballot"
   ? `Hundreds of thousands flood the capital. The cameras are live. How you handle a crowd this size defines you.`
   : `The unthinkable: open protest in the square. The Party watches to see if you have the stomach to make it stop.`,
 choices:[
  {label:"Meet the crowd; offer concessions",fx:{support:12,base:-4,media:6},set:{peacemaker:true,secret_reformer:true},tone:"good",
   result:"You walk out and listen. Some call it courage, some capitulation. The crowd, at least, goes home."},
  {label:"Hold firm; wait them out",fx:{base:4,heat:4},tone:"bold",
   result:"You give nothing and let exhaustion do the work. The square slowly empties. The grievance does not."},
  {label:"Clear the square by force",roll:{stat:"base",dc:58,
     success:{fx:{base:10,influence:6,heat:14,support:-6},set:{bloody_hands:true,tyrant_rep:true},text:"Order is restored, brutally and efficiently. The leadership is impressed. The footage will outlive you."},
     fail:{fx:{support:-18,heat:20,base:-8},text:"The crackdown goes wrong on camera. The images go around the world. You have become the villain of someone's documentary."}},tone:"slick"}
 ]},
{id:"c_disaster_nat",paths:["ballot","vanguard"],phases:[1,2,3],weight:8,crisis:true,art:"bulletin",emoji:"🌊",
 kicker:"Catastrophe",title:"The Disaster",
 body:`An earthquake — or a flood, the rumors disagree — flattens a province. Thousands need help now. Your response is being filmed from the first minute.`,
 choices:[
  {label:"Show up in person, sleeves rolled",fx:{support:14,media:10,funds:-8,base:4},tone:"good",
   result:"You're on the ground, hauling sandbags for the cameras and, occasionally, for real. The optics are flawless."},
  {label:"Direct relief efficiently from the capital",fx:{support:6,influence:6,funds:-6},set:{technocrat_move:true},tone:"bold",
   result:"You run a tight, competent operation. Fewer headlines, more lives, less credit. The trade of the unglamorous."},
  {label:"Quietly divert relief funds",fx:{funds:14,heat:16,support:-4},set:{corrupt_streak:true,bloody_hands:true},tone:"slick",
   result:"A little of the relief money finds your accounts. The cynicism is breathtaking, and so is the risk."}
 ]},
{id:"c_coup_plot",paths:["ballot","vanguard"],phases:[3],weight:8,crisis:true,art:"crisis",emoji:"🗡️",
 kicker:"Treason in the ranks",title:"The Plot",
 body:`Loyal whispers reach you: a faction is planning to remove you. You have a narrow window and an impossible question — who can you actually trust?`,
 choices:[
  {label:"Strike first; arrest the ringleaders",roll:{stat:"influence",dc:55,
     success:{fx:{influence:16,base:10,heat:10},set:{struck_first:true},inc:{purge_count:2},text:"You move at dawn and decapitate the plot. Your grip tightens into a fist. Rivals recalculate."},
     fail:{fx:{support:-12,heat:20,influence:-10},text:"You moved against the wrong people. The real plotters are still out there, now warned and furious."}},tone:"slick"},
  {label:"Buy off the plotters with promotions",fx:{influence:-6,base:8,funds:-10,heat:4},tone:"good",
   result:"You promote your enemies into golden cages. Expensive, humiliating, and it works — until the next time."},
  {label:"Expose the plot publicly, rally support",fx:{support:10,media:8,base:6,heat:6},set:{survivor:true},tone:"bold",
   result:"You reveal the treason to the nation and dare the plotters to deny it. Public sympathy becomes your armor."}
 ]}
);
