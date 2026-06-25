import type { GameEvent } from '../engine/types';

export const EVENTS: GameEvent[] = [];


/* ---------------- BALLOT PATH ---------------- */
EVENTS.push(
{id:"b_first_donor",paths:["ballot"],phases:[1],weight:12,art:"scene",emoji:"💼",
 title:"Your First Big Bribe",
 body:`A property ghoul named Hollis Crane slides an envelope across the diner table like it's a love note. "Twenty grand," he says, "and we never call it a bribe. I just need you to stop pretending you give a single shit about the harbor rezoning."`,
 choices:[
  {label:"Take the cash. Be a good little puppet.",fx:{funds:18,heat:8,base:-2},set:{crane_owes:true},tone:"slick",
   result:"The war chest fattens up nice. Somewhere a reporter files the donation under 'smells like ass, revisit later.'"},
  {label:"Pocket it, promise the bastard nothing",fx:{funds:10,influence:4},tone:"good",
   result:"Crane scowls but pays anyway. Your hands stay technically clean — which in Velmora counts as a virgin."},
  {label:"Refuse it loud, on principle",fx:{funds:-2,support:6,media:5},set:{clean_streak:true},tone:"bold",
   result:"You storm out. By morning some columnist is jerking himself raw calling you 'the one who said no.' Halos are dirt cheap publicity."}
 ]},
{id:"b_signature_bill",paths:["ballot"],phases:[1],weight:11,art:"newspaper",emoji:"📜",
 title:"The Bill That Defines You",
 body:`Your staff dumps three draft bills on your desk. You get to ram exactly one through this session, and whichever you pick is the smell people associate with you forever.`,
 choices:[
  {label:"Free childcare for the working poor",fx:{support:10,base:8,funds:-8,media:4},set:{progressive:true},tone:"good",
   result:"Parents would die for you. The business pages clutch their pearls and shriek 'but who PAYS for it' into a wineglass."},
  {label:"Gut the small-business tax",fx:{support:4,funds:12,base:-2},set:{probusiness:true},tone:"slick",
   result:"Donors purr like fat cats over cream. The money line goes straight up; your approval ticks up like a polite little fart."},
  {label:"A snarling tough-on-crime crackdown",fx:{support:8,media:6,heat:4,base:-4},set:{hawk:true},tone:"bold",
   result:"Cameras get hard for a podium and flashing lights. The civil-liberties crowd does not love you back, not even a little."}
 ]},
{id:"b_oppo_file",paths:["ballot"],phases:[1,2],weight:9,art:"rival",emoji:"🗂️",
 kicker:"A quiet, sleazy meeting",
 title:"The Dirt File",
 speaker:(S)=>({name:S.opp,role:"your rival",avatar:S.oppAvatar}),
 body:(S)=>`A staffer drops a folder in your lap. Inside: a juicy, probably-true, definitely-humiliating story about ${S.opp}, your likely rival. "We could leak this," she says, "or we could take the high road and lose like a bunch of saints."`,
 choices:[
  {label:"Leak it to a friendly little rag",roll:{stat:"media",dc:50,
     success:{fx:{support:8,media:-2,heat:6},set:{went_negative:true},text:"It detonates beautifully. Your rival spends a week explaining themselves instead of kicking your ass."},
     fail:{fx:{support:-6,media:-8,heat:12},text:"The leak gets traced straight back to your office. Now YOU'RE the story, and not the flattering kind."}},tone:"slick"},
  {label:"Hold it as blackmail-shaped leverage",fx:{influence:8},set:{has_dirt:true},tone:"good",
   result:"You file it away nice and warm. Your rival has no clue you now own a small, throbbing piece of their future."},
  {label:"Shred it. Run clean, you noble idiot.",fx:{support:4,base:4,heat:-4},set:{clean_streak:true},tone:"bold",
   result:"You burn the file. It feels good. It might even be smart. Or you just flushed a loaded gun down the toilet. Time will tell."}
 ]},
{id:"b_townhall",paths:["ballot"],phases:[1,2],weight:10,recurring:true,art:"scene",emoji:"🎙️",
 title:"The Town Hall From Hell",
 body:`A red-faced constituent rips the mic away: "You PROMISED to fix our goddamn roads and you did JACK SHIT. Why should we trust one word out of your lying mouth?" The room goes graveyard quiet. The cameras zoom right up your nose.`,
 choices:[
  {label:"Grovel and own it",fx:{support:6,base:4,media:2},tone:"good",
   result:"Eating a little crow plays gorgeously on the evening news. 'Refreshingly honest,' they coo, as if honesty were a kink."},
  {label:"Deflect — blame the other bastards",fx:{support:-2,base:6,heat:3},tone:"slick",
   result:"Your base eats it up. The undecideds in the back row quietly scratch you off their list forever."},
  {label:"Fire back: 'Got a better plan, genius?'",roll:{stat:"support",dc:55,
     success:{fx:{support:8,media:6},text:"You filet the heckler like a fish. The clip goes viral as 'Senator OBLITERATES angry man.'"},
     fail:{fx:{support:-10,media:-6,heat:5},text:"You look like a bully kicking a voter in the teeth. The clip goes viral for all the wrong reasons."}},tone:"bold"}
 ]},
{id:"b_lobbyist",paths:["ballot"],phases:[1,2,3],weight:8,art:"scene",emoji:"🐍",
 title:"The Lobbyist's Sweet Nothing",
 body:`A pharma lobbyist dangles a "fact-finding trip" — first class, beachfront, exactly zero facts. All you gotta do is bend over on drug pricing and pretend you enjoyed it.`,
 choices:[
  {label:"Hit the beach, you slut",fx:{funds:12,heat:10,base:-4},set:{owes_pharma:true},tone:"slick",
   result:"The sand is lovely. The paper trail is a screaming red flag with your name stitched on it."},
  {label:"Pass on the trip, keep the buddy",fx:{influence:6,funds:4},tone:"good",
   result:"You stay friendly but unbought. The lobbyist respects a man who plays the long con."},
  {label:"Rat the offer out in public",roll:{stat:"media",dc:55,
     success:{fx:{support:12,media:10,heat:-6},set:{reformer:true},text:"You become 'the incorruptible one.' Editorial boards practically faint into their fainting couches."},
     fail:{fx:{support:-4,media:-4},text:"It reads as a cheap stunt. 'Grandstanding little prick,' the columnists yawn."}},tone:"bold"}
 ]},
{id:"b_scandal_photo",paths:["ballot"],phases:[1,2,3],weight:7,req:(S)=>S.stats.heat>=35,art:"newspaper",emoji:"📸",
 title:"The Photo You Forgot About",
 body:`A grainy shot of you at a "donor party" you absolutely should not have touched with a barge pole is about to splash across the front page. Your phone is buzzing itself off the desk.`,
 choices:[
  {label:"Get ahead of it — full nasty transparency",fx:{support:-4,heat:-18,media:4},tone:"good",
   result:"You dump everything yourself first. The story burns out in two days instead of slow-roasting you for two weeks."},
  {label:"Deny, deny, deny like a champ",roll:{stat:"media",dc:60,
     success:{fx:{heat:-10,support:2},text:"You stonewall it into a 'he-said-she-said' mush. The press loses the thread and wanders off."},
     fail:{fx:{support:-14,heat:8,media:-8},text:"A SECOND photo drops. Your denial just gift-wrapped the press another news cycle."}},tone:"slick"},
  {label:"Pay to make the photo evaporate",req:(S)=>S.stats.funds>=15,reqText:"Needs War Chest 15+",
   fx:{funds:-15,heat:-6},set:{buried_a_body:true},tone:"slick",
   result:"Poof. Gone. Someone now knows you'll cough up cash to make problems disappear. That someone will absolutely be back, hand out."}
 ]},
{id:"b_disaster",paths:["ballot"],phases:[2,3],weight:9,art:"crisis",emoji:"🌊",
 title:"The Flood",
 body:`A river says screw it and jumps its banks. Whole towns underwater, families clinging to rooftops. The nation tunes in to find out what kind of leader you actually are.`,
 choices:[
  {label:"Go to the scene, sleeves rolled up",fx:{support:12,media:10,funds:-6},tone:"good",
   result:"You haul sandbags on camera. It's part heartfelt, part shameless theater, and 100% effective."},
  {label:"Run it from the capital, ship aid fast",fx:{support:8,influence:6,funds:-8},tone:"good",
   result:"No glamour shot, but the aid lands early and saves people. The wonks notice. The cameras couldn't care less."},
  {label:"Promise billions you absolutely don't have",roll:{stat:"funds",dc:50,
     success:{fx:{support:14,base:6},text:"The crowd goes feral. You'll figure out where the money comes from later. Probably. Maybe."},
     fail:{fx:{support:-6,heat:8,funds:-10},text:"The check bounces in front of God and everyone. 'Empty promises,' reads the chyron, smugly."}},tone:"bold"}
 ]},
{id:"b_debate",paths:["ballot"],phases:[2,3],weight:8,art:"scene",emoji:"🎯",
 title:"The Debate Stage",
 body:(S)=>`You're up on stage with ${S.opp}, and they just landed a clean shot on your record, right in the soft bits. Ninety seconds to respond, millions of bored people watching.`,
 choices:[
  {label:"Pivot to a rehearsed zinger",roll:{stat:"media",dc:52,
     success:{fx:{support:10,media:8},text:"The zinger lands flush. It's the only clip anyone bothers to replay."},
     fail:{fx:{support:-6,media:-4},text:"It comes out canned and clammy. The fact-checkers throw a little party."}},tone:"slick"},
  {label:"Wonk out — drown them in detail",fx:{support:4,influence:6,base:-2},tone:"good",
   result:"You win on substance and lose on vibes. The transcript loves you; the audience reaches for the remote."},
  {label:"Get personal and start screaming",fx:{support:-4,base:8,heat:6,media:-2},tone:"bold",
   result:"Your base is foaming at the mouth with joy. Everyone else found it just a touch terrifying."}
 ]},
{id:"b_purity_test",paths:["ballot"],phases:[1,2,3],weight:7,art:"scene",emoji:"⚖️",
 title:"The Purity Test",
 body:`The zealots in your own coalition demand you sign a sweeping blood-oath — no compromise, EVER, on their pet issue. Refuse and they primary your ass. Sign and you lose every sane voter in the middle.`,
 choices:[
  {label:"Sign it. Feed the rabid base.",fx:{base:12,support:-4,media:-2},set:{pledged:true},then:[{id:"b_promise_kept",inTurns:3}],tone:"bold",
   result:"The faithful are creaming themselves. You've also handed your rival a perfect quote for every swing-voter attack ad ever."},
  {label:"Refuse — defend the big tent",fx:{base:-8,support:8,influence:4},tone:"good",
   result:"You take a beating from your own flank but look like the only adult in a room full of screaming toddlers."},
  {label:"Fudge it with weasel words",roll:{stat:"influence",dc:50,
     success:{fx:{base:6,support:4},text:"You thread the needle like a god. Both sides walk away certain you agreed with them."},
     fail:{fx:{base:-6,support:-6,heat:4},text:"Nobody buys it. Both sides feel betrayed. Truly a master of pissing off everyone at once."}},tone:"slick"}
 ]},
{id:"b_running_mate",paths:["ballot"],phases:[3],weight:14,queueOnly:false,art:"newspaper",emoji:"🤝",
 title:"Picking Your Number Two",
 body:`You're on the national ticket now, big shot. Your running mate could balance you out — or steal the whole damn spotlight and leave you holding the coats.`,
 choices:[
  {label:"A safe, dull-as-dishwater veteran",fx:{influence:8,base:2,media:-2},tone:"good",
   result:"Solid. Boring. Nobody will ever write one interesting headline about them, which is precisely the point."},
  {label:"A young firebrand who whips the base into a froth",fx:{base:12,support:4,heat:4},tone:"bold",
   result:"The rallies are electric. Your handlers are chewing antacids like candy and praying."},
  {label:"A rival you wouldn't trust with a houseplant — for unity",fx:{influence:6,support:8,base:-2},set:{frenemy_vp:true},tone:"slick",
   result:"You shake hands and smile for the cameras. Behind the smile, you both start quietly counting each other's knives."}
 ]},
{id:"b_promise_kept",paths:["ballot"],phases:[2,3],weight:6,queueOnly:true,art:"newspaper",emoji:"⏳",
 title:"The Bill Comes Due",
 body:`Months back you made a big, fat, expensive promise. The press built a "promise tracker," and yours is glowing the deep humiliating red of a man caught lying.`,
 choices:[
  {label:"Scrape the money together somehow",req:(S)=>S.stats.funds>=12,reqText:"Needs War Chest 12+",
   fx:{funds:-12,support:10,base:6},tone:"good",result:"You deliver, barely, sweating through your shirt. 'A politician who kept their word' is a headline rarer than an honest hooker."},
  {label:"Quietly water it down to nothing",fx:{support:-8,base:-6,heat:4},tone:"slick",
   result:"You pray nobody notices. Several extremely loud people notice immediately."},
  {label:"Blame the legislature and waltz off",fx:{base:4,support:-4},tone:"bold",
   result:"You point fingers like a toddler. It works on your base and on precisely no one else alive."}
 ]},
{id:"b_media_darling",paths:["ballot"],phases:[1,2,3],weight:6,recurring:true,art:"scene",emoji:"📺",
 title:"The Friendly Anchor",
 body:`A star anchor offers you a soft, gooey primetime interview — IF you slip them an exclusive "scoop" first. It's flattering, it's transactional, and it's just a little bit gross.`,
 choices:[
  {label:"Play ball — slip them the scoop",fx:{media:12,support:4,heat:2},set:{media_friend:true},tone:"slick",
   result:"The interview is a sloppy love-fest. Rival campaigns scream 'access journalism' into a pillow."},
  {label:"Decline; take a hostile interview instead",roll:{stat:"support",dc:55,
     success:{fx:{support:8,media:10},text:"You survive the grilling and look like an absolute stone-cold badass doing it."},
     fail:{fx:{support:-8,media:-6,heat:4},text:"They corner you on tape and you flop. The gotcha runs on a loop until your name is a punchline."}},tone:"bold"},
  {label:"Skip the press entirely this week",fx:{media:-6,base:4,heat:-2},tone:"good",
   result:"You go dark and let your rival overexpose themselves into the ground. Sometimes shutting up is the whole strategy."}
 ]}
);

/* ---------------- VANGUARD PATH ---------------- */
EVENTS.push(
{id:"v_first_patron",paths:["vanguard"],phases:[1],weight:12,art:"rival",emoji:"🕴️",
 kicker:"A quiet word in your ear",
 title:"The Patron",
 speaker:(S)=>({name:S.opp,role:"senior cadre",avatar:S.oppAvatar}),
 body:(S)=>`Comrade ${S.opp}, a senior cadre with dead eyes, corners you after the meeting. "I can make your file gleam," he murmurs, "or I can make it vanish along with you. Loyal men eat steak in this Party. So — are you loyal? To ME?"`,
 choices:[
  {label:"Swear yourself to his faction, body and soul",fx:{influence:16,base:8,heat:6,support:-2},set:{has_network:true,patron_owns:true},then:[{id:"v_secret_reform",inTurns:4}],tone:"slick",
   result:"You bow your head. His hand lands on your shoulder, heavy and warm and faintly threatening, like a butcher sizing up a ham. You are now Somebody's man."},
  {label:"Take the help, swear to jack shit",fx:{influence:8,base:2},then:[{id:"v_secret_reform",inTurns:4}],tone:"good",
   result:"You thank him warmly and pledge nothing at all. He smiles the smile of a man who keeps a very long, very patient list."},
  {label:"Rat his little overture to the Party",fx:{support:10,base:-6,heat:-4},set:{doctrinaire:true,zealot_rep:true},then:[{id:"v_secret_reform",inTurns:4}],tone:"bold",
   result:"You file a report on his 'factionalism.' The Party jots down your spotless purity. Every cadre in the building starts watching their goddamn mouth around you."}
 ]},
{id:"v_quota_report",paths:["vanguard"],phases:[1,2],weight:11,art:"bulletin",emoji:"🏭",
 kicker:"The numbers are due",
 title:"The Production Quota",
 body:`Your district missed its quota by a third. The report goes up tonight. The truth could get you shot. A lie could also get you shot — just later, and with more paperwork.`,
 choices:[
  {label:"Cook the figures. Promise to catch up. Sure.",fx:{support:8,influence:4,heat:12},set:{cooked_books:true},tone:"slick",
   result:"The numbers glow like a halo on paper. Somewhere a very real, very empty warehouse sits there waiting to rat you out."},
  {label:"Report honest, then blame 'sabotage'",fx:{support:-4,base:6,heat:4},set:{pragmatist:true},tone:"bold",
   result:"You tell a beautifully useful half-truth: the numbers stink, but 'wreckers' did it. The Party always respects a man with enemies."},
  {label:"Report honest, eat the failure whole",roll:{stat:"base",dc:50,
     success:{fx:{support:6,base:10,heat:-4},set:{pragmatist:true,honest_rep:true},text:"Your candor is so freakishly rare it reads as raw strength. A patron quietly tags you 'reliable.'"},
     fail:{fx:{support:-12,influence:-6,heat:6},text:"Honesty gets filed under 'incompetent.' You'll spend weeks proving you're not some sniveling defeatist."}},tone:"good"}
 ]},
{id:"v_denounce",paths:["vanguard"],phases:[1,2,3],weight:10,art:"scene",emoji:"📢",
 title:"The Comrade With a Big Mouth",
 body:`A colleague you genuinely like has been cracking jokes about the leadership. Somebody's going to report it. The only question is whether it's you — and whether YOU pocket the credit.`,
 choices:[
  {label:"Denounce them first, loud and proud",fx:{influence:10,base:6,support:6,heat:4},set:{denounced_ally:true},inc:{purge_count:1},tone:"slick",
   result:"You strike first. They get hauled off. Their chair sits empty at the next meeting and nobody breathes a word. You sleep like garbage, then fine."},
  {label:"Warn them quietly to shut the hell up",roll:{stat:"influence",dc:55,
     success:{fx:{base:10,support:4},set:{spared_rival:true,secret_decent:true},text:"You take a real risk and tip them off. They go silent just in time. You've made a true ally — a rare and dangerously precious thing in this snakepit."},
     fail:{fx:{heat:16,influence:-6},text:"Your little warning gets overheard. Now everyone's asking why exactly YOU were covering for a cynic."}},tone:"good"},
  {label:"Keep your mouth shut and pray it blows over",fx:{heat:8,base:-2},tone:"bold",
   result:"You say nothing. The silence costs you — someone else grabs the credit for the denunciation, and clocks that you hesitated like a coward."}
 ]},
{id:"v_purge_list",paths:["vanguard"],phases:[2,3],weight:9,art:"crisis",emoji:"🗒️",
 kicker:"Security organ request",
 title:"The List",
 body:`An officer from State Security drops a list of names on your desk. "We need a few more to make the enemy quota look thorough," he says, picking his teeth. "Add whoever you fancy. Or don't, and we'll start wondering why a loyal man has no enemies."`,
 choices:[
  {label:"Pile your rivals onto the list",fx:{influence:14,heat:14,support:-4},set:{security_ties:true,bloody_hands:true},inc:{purge_count:3},tone:"slick",
   result:"You hand the list back longer than you got it. Your rivals dissolve into paperwork. Power, it turns out, is mostly just subtraction."},
  {label:"Add only the genuine troublemakers",fx:{influence:6,base:4,heat:8},set:{security_ties:true},inc:{purge_count:1},tone:"bold",
   result:"You add a careful, defensible handful. The officer's satisfied; you've kept one thin little line you can point to later and swear you held."},
  {label:"Hand it back empty — 'my district is clean'",roll:{stat:"support",dc:60,
     success:{fx:{support:10,base:8,heat:-6},set:{secret_decent:true},text:"You vouch for your people and, miracle of miracles, it holds. They remember it. The real kind of loyalty compounds like interest."},
     fail:{fx:{heat:20,influence:-8},text:"An empty list is its own kind of confession. Now Security has a fat file on the suspicious man with zero enemies."}},tone:"good"}
 ]},
{id:"v_black_market",paths:["vanguard"],phases:[1,2],weight:8,art:"newspaper",emoji:"💵",
 title:"The Shortage",
 body:`The official shops are bare as a baby's ass; the black market is bursting. A trader offers to keep your district fed and quiet — for a fat cut and your two eyes pointed firmly at the ceiling.`,
 choices:[
  {label:"Take the cut, look the other way",fx:{funds:16,support:6,heat:8},set:{pragmatist:true,corrupt_streak:true},tone:"slick",
   result:"The shelves fill by 'miracle.' Your people eat, your pockets sag with coin, your file gets disturbingly thick."},
  {label:"Let it run, skim nothing",fx:{support:10,base:4,heat:4},set:{pragmatist:true},tone:"good",
   result:"You allow the market and keep your hands out of it. Full bellies, empty pockets. A rare trick that doesn't get you shot."},
  {label:"Smash it as bourgeois filth",fx:{support:-8,base:8,heat:-4},set:{doctrinaire:true},tone:"bold",
   result:"You make arrests and headlines. The Party glows with pride; the shelves stay empty and the hungry muttering gets louder."}
 ]},
{id:"v_loyalty_oath",paths:["vanguard"],phases:[1,2,3],weight:7,recurring:true,art:"scene",emoji:"✊",
 title:"The Devotion Rally",
 body:`A mass rally needs a face up on the stage to lead the chanting. It's pure theater — and around here, theater is half of power and most of survival.`,
 choices:[
  {label:"Pour your whole oily soul into it",fx:{media:12,base:8,support:4},set:{cult_building:true},tone:"slick",
   result:"Your voice cracks at exactly the right manipulative moment. The crowd screams your name. Cameras adore a true believer, real or faked."},
  {label:"Do it competently and bail",fx:{media:5,base:2},tone:"good",
   result:"You hit the marks and split. Adequate devotion, professionally delivered, zero passion. Like a man clocking out."},
  {label:"Push the cult — slap YOUR face on the banners",roll:{stat:"media",dc:58,
     success:{fx:{media:16,base:10,heat:6},set:{cult_building:true,own_cult:true},text:"Your mug goes up right beside the leadership's. A bold, useful, mildly suicidal move that pays off — for now."},
     fail:{fx:{heat:18,influence:-6},text:"Hanging your own face up reads as raw ambition. The leadership smells ambition the way sharks smell a gut wound."}},tone:"bold"}
 ]},
{id:"v_rival_dossier",paths:["vanguard"],phases:[2,3],weight:9,art:"rival",emoji:"📁",
 kicker:"Compromising material",
 title:"The Kompromat",
 speaker:(S)=>({name:S.opp,role:"your rival",avatar:S.oppAvatar}),
 body:(S)=>`Your people have built a fat file on ${S.opp} — affairs, foreign cousins, an old joke at the Party's expense. Enough to bury them six feet deep. Enough, fumbled, to bury you right beside them.`,
 choices:[
  {label:"Leak it to Security tonight",fx:{influence:12,support:4,heat:10},set:{has_dirt:true,struck_first:true},inc:{purge_count:1},tone:"slick",
   result:"The file does its quiet, ugly work. Your rival gets shipped to a cold, distant office in the middle of nowhere. You hold the pen now."},
  {label:"Keep it. Squeeze them with it.",fx:{influence:10,base:4,heat:4},set:{has_dirt:true,blackmailer:true},tone:"bold",
   result:"You drop by your rival, smile warmly, and casually mention a cousin abroad. They go pale and pliant as wet dough. A leashed enemy beats a dead one."},
  {label:"Burn it — buy yourself a real ally",roll:{stat:"influence",dc:55,
     success:{fx:{base:12,influence:6},set:{spared_rival:true,secret_decent:true},text:"You show them the file, then torch it right in their face. In a world full of knives, one act of mercy buys terrifying, fanatical loyalty."},
     fail:{fx:{influence:-10,heat:8},text:"They take your mercy for weakness and stab you anyway. Lesson learned, and the tuition was steep."}},tone:"good"}
 ]},
{id:"v_foreign_delegation",paths:["vanguard"],phases:[2,3],weight:7,art:"bulletin",emoji:"🌐",
 kicker:"Outside contact",
 title:"The Foreign Hand",
 body:`A delegation from a rival power wants a back-channel with somebody hungry. Talking to them is treason. NOT talking to them is a missed fortune. Either one could be a trap with your name on it.`,
 choices:[
  {label:"Meet them in the shadows",roll:{stat:"influence",dc:62,
     success:{fx:{funds:14,influence:10,heat:10},set:{foreign_ties:true},text:"The channel opens. Hard currency and juicy secrets pour in. You're now playing a game with a brutally short life expectancy if anyone catches a whiff."},
     fail:{fx:{heat:26,support:-8},set:{foreign_ties:true},text:"Somebody photographed the meeting. The word 'traitor' is now welded to your name in a file you will never, ever reach."}},tone:"slick"},
  {label:"Report the contact, hog the credit",fx:{support:12,base:6,heat:-6},set:{doctrinaire:true},tone:"bold",
   result:"You expose the approach and bask in the Party's warm approval. You also just slammed a door some rivals will happily sneak through later."},
  {label:"Pretend it never happened",fx:{heat:4},tone:"good",
   result:"You ghost the delegation completely. Safe, forgettable, and you'll never know what kind of fortune you just flushed."}
 ]},
{id:"v_show_trial",paths:["vanguard"],phases:[3],weight:8,art:"crisis",emoji:"⚖️",
 kicker:"You preside",
 title:"The Show Trial",
 body:`You've climbed high enough to run a trial of 'wreckers.' The verdict's already carved in stone; only the performance is left. The whole Union is watching to see how hard you sink your teeth in.`,
 choices:[
  {label:"Demand the maximum, with full theatrics",fx:{base:10,media:8,heat:10,support:-4},set:{cult_building:true,tyrant_rep:true},inc:{purge_count:2},tone:"slick",
   result:"You thunder; the accused blubber; the sentence is total annihilation. The leadership nods at your wonderfully useful viciousness."},
  {label:"Convict, but spare their families",fx:{support:6,base:4,heat:2},set:{secret_decent:true},tone:"good",
   result:"You give the Party its verdict but quietly keep the relatives off the kill lists. Small mercies, secretly banked for the soul."},
  {label:"Let one defendant actually open their mouth",roll:{stat:"support",dc:64,
     success:{fx:{support:14,media:6,heat:6},set:{secret_reformer:true},text:"You allow a real defense. It electrifies the whole room. People start whispering that you might be... different. A dangerous, magnetic reputation."},
     fail:{fx:{heat:22,base:-8},text:"Letting an enemy speak IS its own confession. Why, the leadership wonders aloud, would a loyal man ever do that?"}},tone:"bold"}
 ]},
{id:"v_succession_whisper",paths:["vanguard"],phases:[3],weight:9,art:"rival",emoji:"♟️",
 kicker:"The old leader rots away",
 title:"The Succession",
 speaker:(S)=>({name:S.opp,role:"Council rival",avatar:S.oppAvatar}),
 body:(S)=>`The General Secretary is finally croaking. Behind the curtains, the Standing Committee is choosing his replacement. ${S.opp} is ahead of you in line. Your next move decides every single thing.`,
 choices:[
  {label:"Build a bloc; promise everyone the moon",fx:{influence:14,base:10,heat:6},set:{has_network:true},tone:"slick",
   result:"You make a dozen flatly contradictory promises to a dozen greedy men. The coalition holds — barely, loudly, and held together with spit."},
  {label:"Play the humble servant; wait it out",fx:{support:8,base:6,heat:-4},set:{patient_play:true},tone:"good",
   result:"You do the meek continuity-candidate routine. Let the other vultures knife each other while you stand there looking statesmanlike."},
  {label:"Move on your rival RIGHT now",roll:{stat:"influence",dc:60,
     success:{fx:{influence:18,support:6,heat:10},set:{struck_first:true},inc:{purge_count:1},text:"You strike before the body's even cold. Your rival gets outmaneuvered straight into a 'health retirement.' The path clears beautifully."},
     fail:{fx:{heat:24,influence:-12,support:-6},text:"You moved too early and whiffed it. Now your rival knows, and every knife in the building swivels toward your back."}},tone:"bold"}
 ]},
{id:"v_secret_reform",paths:["vanguard"],phases:[2,3],weight:6,queueOnly:true,art:"scene",emoji:"🕯️",
 title:"The Thing You Actually Believe",
 body:`Late, alone, a trusted aide asks what you'd REALLY do with power. For one stupid, unguarded heartbeat, you could say the true thing — or the safe thing that keeps you breathing.`,
 choices:[
  {label:"Confess: you'd blow the whole thing wide open",fx:{support:8,base:-4,heat:8},set:{secret_reformer:true},tone:"bold",
   result:"You whisper of openness, of reform, of a softer Union. Your aide's eyes shine — or coldly calculate. You won't know which until it's far too late."},
  {label:"Recite the safe, doctrinaire crap",fx:{base:6,heat:-4},set:{doctrinaire:true},tone:"good",
   result:"You parrot the catechism word for word. Your aide nods, reassured. The real thought stays locked in the basement where it's survived this long."},
  {label:"Test the aide — feed them a lie",fx:{influence:8,heat:2},set:{blackmailer:true},tone:"slick",
   result:"You plant a fake confidence to see if it walks. Trust, around here, is a thing you build entirely out of traps."}
 ]},
{id:"v_propaganda_coup",paths:["vanguard"],phases:[1,2,3],weight:6,recurring:true,art:"newspaper",emoji:"📻",
 title:"The Open Front Page",
 body:`The Party paper has a gaping hole on the front page and an editor who owes somebody a very large favor. Whoever fills that slot decides what an entire nation thinks this week.`,
 choices:[
  {label:"Run a piece slobbering over your district",fx:{media:12,support:6,heat:2},set:{cult_building:true},tone:"slick",
   result:"Your achievements, lightly invented out of thin air, lead the news. Reality will be politely asked to catch up later."},
  {label:"Knife a rival in print",fx:{media:8,influence:6,heat:6},set:{went_negative:true},tone:"bold",
   result:"A coded editorial guts a rival without ever naming them. Everyone who matters understands exactly whose throat you just cut."},
  {label:"Trumpet a policy that actually worked",fx:{support:8,media:6,base:4},set:{pragmatist:true},tone:"good",
   result:"You publicize something that genuinely works. Rare as hen's teeth, and somehow more persuasive precisely because it's true."}
 ]}
);

/* ---------------- SHARED CRISES (both paths) ---------------- */
/* crisis:true → held out of the normal pool, injected by instability rolls */
EVENTS.push(
{id:"c_recession",paths:["ballot","vanguard"],phases:[1,2,3],weight:10,crisis:true,art:"crisis",emoji:"📉",
 kicker:"Breaking",title:"The Economy Eats Shit",
 body:(S)=>S.path==="ballot"
   ? `Markets faceplant. Factories slam shut. Voters want a head on a pike to blame, and your name is on a ballot real soon.`
   : `The glorious plan has been quietly failing for years and loudly failing today. Shortages spread like a rash. The people are starving and the Party desperately needs a story.`,
 choices:[
  {label:"Bold stimulus / emergency rationing",fx:{funds:-14,support:12,base:4},tone:"good",
   result:"You spend like a drunk sailor to soften the blow. It works just enough to matter, and bleeds your reserves bone-dry doing it."},
  {label:"Blame foreigners and saboteurs",fx:{support:6,base:8,media:4,heat:6},set:{went_negative:true},tone:"bold",
   result:"You point outward at the bogeyman. Rage needs a target, and you've kindly provided one. The actual problem just sits there, patient as a tumor."},
  {label:"Project calm; do sweet nothing",roll:{stat:"media",dc:55,
     success:{fx:{support:6,media:8},text:"You radiate unbothered swagger and the panic ebbs. Sometimes the performance IS the entire policy."},
     fail:{fx:{support:-14,base:-6,heat:6},text:"Your calm reads as totally clueless. The clip of you grinning during the crash will haunt you to the grave."}},tone:"slick"}
 ]},
{id:"c_scandal_leak",paths:["ballot","vanguard"],phases:[1,2,3],weight:9,crisis:true,art:"bulletin",emoji:"🚨",
 kicker:"Leaked tonight",title:"The Documents Drop",
 req:(S)=>S.stats.heat>=25,
 body:`A dump of documents lands on the press like a brick through a window. Some of it's about you. Some of it is even — gulp — true. The next 48 hours decide whether the stink sticks.`,
 choices:[
  {label:"Get ahead of it — confess the small sins",fx:{support:-6,media:6,heat:-12},tone:"good",
   result:"You loudly admit a tiny sin to quietly bury the giant one underneath it. An old, filthy trick, still working like a charm."},
  {label:"Deny everything, savage the leaker",fx:{support:4,media:-4,heat:8},set:{went_negative:true},tone:"bold",
   result:"You go to war with the messenger. Your base howls for blood; the documents just keep right on talking."},
  {label:"Hunt down the leaker and bury them",roll:{stat:"influence",dc:58,
     success:{fx:{influence:8,heat:-10},set:{has_dirt:true},text:"You trace the leak and quietly end the leaker's whole career. The story dies of thirst for lack of a second source."},
     fail:{fx:{heat:18,support:-8},text:"Your leak-hunt leaks. Now there are TWO scandals: the documents, and the cover-up you bungled."}},tone:"slick"}
 ]},
{id:"c_foreign_war",paths:["ballot","vanguard"],phases:[2,3],weight:9,crisis:true,art:"crisis",emoji:"⚔️",
 kicker:"Borders",title:"On the Brink of War",
 body:`Troops pile up at the border. The nation looks to its leaders for a spine. Glory and catastrophe are the same coin, and it's spinning in midair right now.`,
 choices:[
  {label:"Rattle the saber; wave the flag",fx:{support:14,base:8,media:6,heat:6},set:{hawk:true},tone:"bold",
   result:"Nothing glues a country together like a clear enemy to hate. Your numbers soar on a wave you may not be able to ride."},
  {label:"Negotiate a white-knuckle peace",roll:{stat:"influence",dc:56,
     success:{fx:{support:12,influence:8,media:6},set:{peacemaker:true},text:"You yank a deal out of the fire. The history books might call it statesmanship. Hawks call it gutless, just under their breath."},
     fail:{fx:{support:-12,base:-6},text:"The talks blow up on live camera. You look like you blinked, because, well, you absolutely blinked."}},tone:"good"},
  {label:"Cut a secret deal with the enemy",fx:{funds:12,influence:8,heat:14},set:{foreign_ties:true},tone:"slick",
   result:"You make a private little arrangement that serves you a hell of a lot more than the nation. Profitable. Treasonous if it ever crawls into the light."}
 ]},
{id:"c_assassination",paths:["ballot","vanguard"],phases:[2,3],weight:7,crisis:true,art:"bulletin",emoji:"🎯",
 kicker:"Attempt on your life",title:"The Shot in the Crowd",
 body:`A shot cracks over the rally. You're unhurt — by a whisker. A whole nation holds its breath, and a golden opportunity is born right out of the gunsmoke.`,
 choices:[
  {label:"Stand there bloodied and defiant for the cameras",fx:{support:18,media:12,base:8,heat:4},set:{survivor:true},tone:"bold",
   result:"The image of you, fist raised, jaw clenched, goes instantly iconic. Not getting shot is the best campaign ad ever made."},
  {label:"Use it to purge your enemies",fx:{influence:14,support:4,heat:16},set:{struck_first:true,bloody_hands:true},inc:{purge_count:2},tone:"slick",
   result:"You blame your rivals, evidence strictly optional. The crackdown is swift and oh-so-convenient. A little TOO convenient, some will whisper."},
  {label:"Show restraint; call for calm",roll:{stat:"support",dc:50,
     success:{fx:{support:14,influence:6,media:8},set:{peacemaker:true},text:"You refuse to milk it, and the dignity hits harder than any crackdown ever could. A leader, not just a lucky survivor."},
     fail:{fx:{support:-6,base:-4},text:"Your restraint reads as spineless to a terrified public that wanted to see you bare some teeth."}},tone:"good"}
 ]},
{id:"c_pandemic",paths:["ballot","vanguard"],phases:[1,2,3],weight:8,crisis:true,art:"crisis",emoji:"🦠",
 kicker:"Outbreak",title:"The Sickness Spreads",
 body:`A nasty fast-moving plague rips through the cities. Hospitals overflow. The people demand both total freedom AND total protection, and they want both at once, right now, screaming.`,
 choices:[
  {label:"Hard lockdown, screw the cost",fx:{support:-4,base:6,funds:-10,heat:-2},set:{technocrat_move:true},tone:"good",
   result:"You clamp down like a vice. Lives get saved; the economy and your popularity both eat the hit you chose to swallow."},
  {label:"Keep it open, downplay the bodies",fx:{funds:6,support:6,heat:10},tone:"slick",
   result:"You keep the lights on and the numbers nice and fuzzy. The markets kiss your feet; the morgues do not."},
  {label:"Follow the experts, brief them daily",roll:{stat:"media",dc:54,
     success:{fx:{support:14,media:10,base:4},text:"Calm, honest, daily briefings make you the steady hand in the storm. Plain old competence somehow turns into charisma."},
     fail:{fx:{support:-10,media:-6,heat:6},text:"Mixed messages and embarrassing reversals stack up. The public stops trusting the podium, and guess who's standing behind it."}},tone:"bold"}
 ]},
{id:"c_protest",paths:["ballot","vanguard"],phases:[1,2,3],weight:8,crisis:true,art:"crisis",emoji:"🪧",
 kicker:"The streets fill up",title:"Mass Unrest",
 body:(S)=>S.path==="ballot"
   ? `Hundreds of thousands flood the capital, pissed off and chanting. The cameras are live. How you handle a mob this size is going to define your whole sorry career.`
   : `The unthinkable: open protest in the square. The Party leans in close to see whether you've got the stomach to make it stop.`,
 choices:[
  {label:"Walk out to the crowd; offer concessions",fx:{support:12,base:-4,media:6},set:{peacemaker:true,secret_reformer:true},tone:"good",
   result:"You step out and actually listen. Some call it courage, some call it caving. The crowd, at least, goes home satisfied."},
  {label:"Hold firm; wait the bastards out",fx:{base:4,heat:4},tone:"bold",
   result:"You give them nothing and let pure exhaustion do the work. The square slowly drains. The grievance, however, does not."},
  {label:"Clear the square by force",roll:{stat:"base",dc:58,
     success:{fx:{base:10,influence:6,heat:14,support:-6},set:{bloody_hands:true,tyrant_rep:true},text:"Order is restored, brutally and efficiently. The leadership is impressed as hell. That footage will outlive you and your grandkids."},
     fail:{fx:{support:-18,heat:20,base:-8},text:"The crackdown goes sideways on camera. The images sprint around the world. Congratulations — you're now the villain of somebody's documentary."}},tone:"slick"}
 ]},
{id:"c_disaster_nat",paths:["ballot","vanguard"],phases:[1,2,3],weight:8,crisis:true,art:"bulletin",emoji:"🌊",
 kicker:"Catastrophe",title:"The Disaster",
 body:`An earthquake — or a flood, the rumors can't agree which — flattens an entire province. Thousands need help this second. Your response is being filmed from the very first minute.`,
 choices:[
  {label:"Show up in person, sleeves rolled",fx:{support:14,media:10,funds:-8,base:4},tone:"good",
   result:"You're on the ground hauling sandbags for the cameras and, every so often, for real. The optics are flawless."},
  {label:"Run relief tight from the capital",fx:{support:6,influence:6,funds:-6},set:{technocrat_move:true},tone:"bold",
   result:"You run a lean, competent operation. Fewer headlines, more lives, less credit. The thankless trade of the grown-up."},
  {label:"Quietly skim the relief funds",fx:{funds:14,heat:16,support:-4},set:{corrupt_streak:true,bloody_hands:true},tone:"slick",
   result:"A little of the relief money wanders into your accounts. The cynicism is breathtaking, and so is the size of the risk."}
 ]},
{id:"c_coup_plot",paths:["ballot","vanguard"],phases:[3],weight:8,crisis:true,art:"crisis",emoji:"🗡️",
 kicker:"Treason in the ranks",title:"The Plot",
 body:`Loyal whispers reach your ear: a faction is plotting to yank you out of your chair. You've got a narrow window and one impossible question — who the hell can you actually trust?`,
 choices:[
  {label:"Strike first; cuff the ringleaders",roll:{stat:"influence",dc:55,
     success:{fx:{influence:16,base:10,heat:10},set:{struck_first:true},inc:{purge_count:2},text:"You move at dawn and lop the head clean off the plot. Your grip tightens into a fist. Rivals quietly recalculate their odds."},
     fail:{fx:{support:-12,heat:20,influence:-10},text:"You moved against the wrong people, idiot. The real plotters are still out there — now warned, now furious."}},tone:"slick"},
  {label:"Buy the plotters off with promotions",fx:{influence:-6,base:8,funds:-10,heat:4},tone:"good",
   result:"You promote your enemies into shiny golden cages. Expensive, humiliating, and it works — right up until the next time."},
  {label:"Expose the plot publicly, rally the people",fx:{support:10,media:8,base:6,heat:6},set:{survivor:true},tone:"bold",
   result:"You reveal the treason to the whole nation and dare the plotters to call you a liar. Public sympathy becomes your armor."}
 ]}
);
