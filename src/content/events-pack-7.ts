import type { GameEvent } from '../engine/types';

/**
 * Content pack 7 — seventh volume expansion. Running-mate vetting, tax returns,
 * and union demands (ballot); rewriting the anthem, purging a mentor, the secret
 * archive of crimes (vanguard); doctored footage, whistleblowers, and charity
 * fronts (shared); and five new crises (nuclear plant, an ally assassinated, a
 * winter energy crunch, a mutiny, a rail disaster). Fictional and non-partisan.
 */
export const PACK_7: GameEvent[] = [
  // ---------------- BALLOT ----------------
  {
    id: 'p7_b_vp_vetting',
    paths: ['ballot'],
    phases: [3],
    weight: 7,
    art: 'scene',
    emoji: '🔍',
    title: 'The Vetting',
    body: `Your dream running mate gets the base wet — and the vetters just dug up a corpse with their name on it. Swallow the landmine, or dump your golden boy at the absolute worst possible second.`,
    choices: [
      {
        label: 'Keep them and pray the corpse stays buried',
        fx: { base: 8, support: 4, heat: 10 },
        scandal: { id: 'vp_skeleton', label: 'your running mate’s buried problem', severity: 2 },
        tone: 'bold',
        result:
          'You keep the shiny one and the ticking bomb strapped to their chest. The base goes feral; the vetters sweat through their suits.',
      },
      {
        label: 'Ditch them for a boring safe pick',
        fx: { influence: 6, support: 2, base: -4 },
        set: { clean_streak: true },
        tone: 'good',
        result:
          'You trade fireworks for a damp cardboard nobody. Tedious, bulletproof, and nobody ever wrote a hit piece about beige.',
      },
    ],
  },
  {
    id: 'p7_b_tax_returns',
    paths: ['ballot'],
    phases: [2, 3],
    weight: 6,
    art: 'newspaper',
    emoji: '🧾',
    title: 'The Tax Returns',
    body: `Tradition and a pack of slavering rivals want you to cough up your tax returns. They're legal — they also show a fortune fatter, and a generosity skinnier, than your weepy stump speeches ever let on.`,
    choices: [
      {
        label: 'Dump it all, eat the headlines',
        fx: { support: 8, media: 4, heat: -4 },
        set: { honest_rep: true },
        tone: 'good',
        result:
          'You publish every embarrassing line and take your beating like a grown-up. One ugly news cycle buys years of nobody asking.',
      },
      {
        label: 'Hide behind a fake "ongoing audit"',
        fx: { influence: 4, heat: 8, support: -4 },
        set: { stonewaller: true },
        tone: 'slick',
        result: `You crawl under a mountain of paperwork forever. "What's he hiding?" becomes the permanent background hum of your whole life.`,
      },
    ],
  },
  {
    id: 'p7_b_union',
    paths: ['ballot'],
    phases: [1, 2],
    weight: 7,
    art: 'scene',
    emoji: '🔧',
    title: 'The Union’s Terms',
    body: `A beefy union dangles an army of door-knockers and a tidal wave of votes — if you back one wildly expensive demand your fat-cat backers will absolutely loathe. You cannot blow both these groups, so pick a mouth.`,
    choices: [
      {
        label: 'Ride with the working stiffs',
        fx: { base: 10, support: 6, funds: -6 },
        set: { grassroots: true },
        tone: 'bold',
        result:
          'You pick the picket line over the boardroom. The volunteers swarm in; the donor dinners turn arctic and quiet.',
      },
      {
        label: 'Keep the rich men’s money',
        fx: { funds: 12, base: -6, heat: 2 },
        tone: 'slick',
        result:
          'You keep the fat checks and wave goodbye to the foot soldiers. A richer, lonelier, much sadder campaign.',
      },
    ],
  },
  {
    id: 'p7_b_caught_lie',
    paths: ['ballot'],
    phases: [1, 2, 3],
    weight: 7,
    art: 'newspaper',
    emoji: '🤥',
    title: 'The Small Lie',
    body: `A tiny embellishment in your sob-story stump speech — a job you never really had, a hardship you puffed up like a blowfish — just got caught, screenshotted, and notarized. Small, true, and breeding fast.`,
    choices: [
      {
        label: 'Cop to it fast and grovel a little',
        fx: { support: 4, media: 2, heat: -2 },
        set: { honest_rep: true },
        tone: 'good',
        result:
          'You admit you fudged it, quick and plain, before it can fester. A humble, instant correction starves the little gremlin to death.',
      },
      {
        label: 'Double down and scream "out of context"',
        roll: {
          stat: 'media',
          dc: 54,
          success: {
            fx: { base: 6, media: 4 },
            text: 'You brazen through it and kick up enough mud that the record goes blurry. Sheer balls, every so often, actually works.',
          },
          fail: {
            fx: { support: -10, heat: 6 },
            text: `They debunk your denial line by humiliating line. Now it's not the dinky lie that sticks — it's the flailing, sweaty cover-up.`,
          },
        },
        tone: 'bold',
      },
    ],
  },
  {
    id: 'p7_b_climate',
    paths: ['ballot'],
    phases: [2, 3],
    weight: 7,
    art: 'bulletin',
    emoji: '🏭',
    title: 'Jobs or the River',
    body: `A big employer will set up shop in your district — and quietly pump enough poison into a beloved river to choke it dead. Hundreds of paychecks against the water and woods your voters skinny-dipped in as kids.`,
    choices: [
      {
        label: 'Save the river, tell the plant to pound sand',
        fx: { support: 8, base: -4, funds: -4 },
        set: { honest_rep: true },
        tone: 'good',
        result:
          'You pick the water over the warehouses. The tree-huggers weep with joy; the suddenly-jobless do not, and they vote too, you genius.',
      },
      {
        label: 'Grab the jobs, regulate "eventually"',
        fx: { funds: 8, base: 8, heat: 6, support: -2 },
        scandal: { id: 'river_deal', label: 'the river you traded for jobs', severity: 1 },
        tone: 'slick',
        result:
          'You snip the ribbon on the shiny new plant. The paychecks start; the fish, give it a few years, float up belly-first.',
      },
    ],
  },
  {
    id: 'p7_b_rally_violence',
    paths: ['ballot'],
    phases: [2, 3],
    weight: 7,
    art: 'crisis',
    emoji: '🪧',
    title: 'The Rally Turns',
    body: `A shoving match at your rally bloomed into a full brawl, then a viral clip of your fans and the protesters knuckle-trading on loop. The cameras want to know if you'll bring the water bucket or the gas can.`,
    choices: [
      {
        label: 'Call hard for calm and basic decency',
        fx: { support: 8, base: -2, media: 4 },
        set: { peacemaker: true },
        tone: 'good',
        result:
          'You condemn the brawling on every side and actually mean it. Acting like a grown-up in an ugly moment reads as raw strength.',
      },
      {
        label: 'Wink at your crowd’s "passion"',
        fx: { base: 10, heat: 10, support: -8 },
        set: { tyrant_rep: true },
        tone: 'bold',
        result:
          'You excuse your goons and blame the other guys. The base creams over the fire; the fire, predictably, does not stay in the pit.',
      },
    ],
  },
  {
    id: 'p7_b_celebrity_implodes',
    paths: ['ballot'],
    phases: [2, 3],
    weight: 6,
    art: 'rival',
    emoji: '💥',
    title: 'The Backer Implodes',
    body: `The famous mouth you proudly trotted out last month just detonated in a scandal of their very own. Every grinning photo of you two is now being lovingly recirculated by every rival you've got.`,
    choices: [
      {
        label: 'Disown them instantly and brutally',
        fx: { media: 6, support: 4, base: -2 },
        tone: 'slick',
        result:
          'You cut them loose inside the hour and salt the ground where they stood. Cold, fast, and the only move that stops the bleeding.',
      },
      {
        label: 'Stand by them like a loyal idiot',
        fx: { base: 6, heat: 10, support: -8 },
        set: { loyal_to_old_friends: true },
        tone: 'bold',
        result:
          'You refuse to ditch a pal in the storm. Noble, expensive, and now their dumpster fire is renting a room inside yours.',
      },
    ],
  },

  // ---------------- VANGUARD ----------------
  {
    id: 'p7_v_anthem',
    paths: ['vanguard'],
    phases: [3],
    weight: 7,
    art: 'bulletin',
    emoji: '🎵',
    title: 'The New Anthem',
    body: `A committee of bootlickers wants to rewrite a verse of the national anthem to name-drop your glorious deeds. Immortality in song — or an ego so nakedly swollen even your own toadies might flinch.`,
    choices: [
      {
        label: 'Approve the verse, you magnificent legend',
        fx: { base: 8, media: 6, support: -4, heat: 4 },
        set: { own_cult: true },
        tone: 'bold',
        result: `Schoolkids now chant your name before they've eaten breakfast. Getting stitched into the anthem is a kind of forever — and a kind of warning.`,
      },
      {
        label: 'Decline; "the anthem belongs to the people"',
        fx: { support: 10, base: -2 },
        set: { ascetic_rep: true },
        tone: 'good',
        result:
          'You wave off the verse with a humble line that — of course — becomes famous all on its own. Modesty, performed just right, out-shines any medal.',
      },
    ],
  },
  {
    id: 'p7_v_purge_mentor',
    paths: ['vanguard'],
    phases: [2, 3],
    weight: 8,
    art: 'rival',
    emoji: '⚰️',
    title: 'Purge Your Mentor',
    body: `The Centre has decided your old mentor — the one who taught you every dirty trick you know — is now a liability, and they want you, by name, to be the one who knifes him in front of everyone. A loyalty test with actual teeth.`,
    choices: [
      {
        label: 'Sell him out to save your own skin',
        fx: { influence: 8, base: 6, support: -8, heat: 6 },
        inc: { purge_count: 1 },
        set: { bloody_hands: true },
        tone: 'bold',
        result:
          'You read out the charges against the man who built you from nothing. You pass the test and quietly flunk something a lot harder to name.',
      },
      {
        label: 'Refuse, and share the noose with him',
        fx: { support: 10, influence: -10, heat: 10 },
        set: { honest_rep: true, martyr_rep: true },
        tone: 'good',
        result:
          'You will not raise a hand against him, whatever it costs your sorry neck. Loyalty like that is rare around here, and almost never free.',
      },
    ],
  },
  {
    id: 'p7_v_foreign_loan',
    paths: ['vanguard'],
    phases: [2, 3],
    weight: 7,
    art: 'scene',
    emoji: '💱',
    title: 'The Foreign Loan',
    body: `A bloated foreign power dangles a loan fat enough to paper over your region's holes — secured against a strategic harbor and a whole lot of future grovelling on your part.`,
    choices: [
      {
        label: 'Take the cash, pawn the harbor',
        fx: { funds: 14, influence: 6, base: -4, heat: 6 },
        set: { foreign_friends: true },
        tone: 'slick',
        result:
          'The money fixes today and sells off tomorrow. The harbor still flies your flag — but it answers, more and more, to theirs.',
      },
      {
        label: 'Refuse; cinch the belts at home',
        fx: { base: 6, support: 4, funds: -6 },
        tone: 'bold',
        result:
          'You pick lean, proud independence over comfy chains. The winter is colder, hungrier, and entirely, gloriously your own.',
      },
    ],
  },
  {
    id: 'p7_v_youth_brigade',
    paths: ['vanguard'],
    phases: [1, 2],
    weight: 7,
    art: 'bulletin',
    emoji: '🔺',
    title: 'The Youth Brigade',
    body: `A pack of foaming young volunteers want to form a "vanguard brigade" to sniff out backsliders — eager, useful, and exactly one bad order away from a mob you will never, ever call back.`,
    choices: [
      {
        label: 'Arm the little fanatics and let them loose',
        fx: { base: 12, influence: 4, heat: 10, support: -6 },
        inc: { purge_count: 1 },
        set: { tyrant_rep: true, bloody_hands: true },
        tone: 'bold',
        result: `You hand pure zeal a mandate and a hit list. They're horrifyingly good at it and, very shortly, not even slightly yours anymore.`,
      },
      {
        label: 'Point their energy at something harmless',
        fx: { base: 6, support: 6, heat: -2 },
        tone: 'good',
        result:
          'You aim them at litter and harvests instead of the neighbors. The frothing zeal simmers down into something almost wholesome.',
      },
    ],
  },
  {
    id: 'p7_v_model_village',
    paths: ['vanguard'],
    phases: [1, 2],
    weight: 7,
    art: 'scene',
    emoji: '🏘️',
    title: 'The Inspection',
    body: `A fancy delegation is poking around your region. You can show them a real, struggling village — or the gleaming fake one your staff slapped together specifically to be gawked at.`,
    choices: [
      {
        label: 'Parade the painted fake village',
        fx: { influence: 8, media: 6, heat: 6, support: -4 },
        set: { potemkin: true },
        tone: 'slick',
        result:
          'The delegation oohs and aahs at the spray-painted prosperity. Your stock climbs on a glorious foundation of wet paint and lies.',
      },
      {
        label: 'Show them the actual misery',
        roll: {
          stat: 'support',
          dc: 52,
          success: {
            fx: { support: 12, influence: 4 },
            text: 'You lay the hardship bare and flat-out ask for help. The raw honesty stuns them so hard they actually send some.',
          },
          fail: {
            fx: { influence: -6, heat: 6 },
            text: 'The honesty lands as incompetence, not guts. "Why the hell is your region this poor?" is the only thing they take home.',
          },
        },
        set: { honest_rep: true },
        tone: 'good',
      },
    ],
  },
  {
    id: 'p7_v_archive',
    paths: ['vanguard'],
    phases: [3],
    weight: 8,
    art: 'bulletin',
    emoji: '🗃️',
    title: 'The Secret Archive',
    body: `The archive just fell into your lap — decades of the regime's filthiest crimes: names, orders, the locations of the graves. Torch it to protect everyone, or hoard it as the ultimate "be nice to me" machine.`,
    choices: [
      {
        label: 'Hoard it as leverage over every last one of them',
        fx: { influence: 12, base: 6, heat: 10 },
        set: { has_network: true, blackmailer: true },
        tone: 'slick',
        result: `You lock the archive in a vault and let it leak, vaguely, that you've got it. Funny how suddenly everyone is so very polite to you.`,
      },
      {
        label: 'Quietly stash it for history',
        fx: { support: 8, heat: 8, base: -2 },
        set: { secret_reformer: true },
        tone: 'good',
        result:
          'You smuggle copies somewhere the truth can claw its way up someday. A long-shot bet on a reckoning you may not be alive to enjoy.',
      },
      {
        label: 'Burn it; save your own present',
        fx: { base: 6, influence: 4, heat: -6 },
        tone: 'bold',
        result:
          'You feed the crimes straight into the furnace. The names go safe, the graves stay shut, and history loses the whole damn argument.',
      },
    ],
  },
  {
    id: 'p7_v_amnesty',
    paths: ['vanguard'],
    phases: [2, 3],
    weight: 7,
    art: 'bulletin',
    emoji: '🕊️',
    title: 'The Amnesty',
    body: `You could spring a batch of small-time political prisoners — a genuine mercy, a tidy bit of theater, and a coin-flip on whether the freed come out grateful or come out swinging.`,
    choices: [
      {
        label: 'Throw the gates wide and mean it',
        fx: { support: 12, base: -4, heat: 4 },
        set: { secret_reformer: true, peacemaker: true },
        tone: 'good',
        result:
          'You open the gates wider than anyone dared guess. Most stumble out weeping with thanks; a few walk out hungrier and meaner than they went in.',
      },
      {
        label: 'A tiny, well-photographed gesture',
        fx: { media: 8, support: 4, base: 2 },
        tone: 'slick',
        result:
          'You spring a careful handful right in front of the cameras. The mercy is real, modest, and tuned to the exact pitch of applause.',
      },
    ],
  },

  // ---------------- SHARED ----------------
  {
    id: 'p7_s_doctored_footage',
    paths: ['ballot', 'vanguard'],
    phases: [2, 3],
    weight: 7,
    art: 'newspaper',
    emoji: '🎞️',
    title: 'The Doctored Footage',
    body: `A scarily convincing fake video of you saying something truly monstrous is screaming across the country. By the time the nerds debunk it, a few million idiots will already have believed their own lying eyes.`,
    choices: [
      {
        label: 'Carpet-bomb the country with the debunk',
        roll: {
          stat: 'media',
          dc: 53,
          success: {
            fx: { media: 8, support: 8, heat: -4 },
            text: `You prove it fake, fast and loud, and spin it into a story about your enemies' filthy little tricks. Whole thing flipped.`,
          },
          fail: {
            fx: { support: -10, heat: 8 },
            text: `The truth limps out after the lie's already sprinted three laps round the nation. "I never said that" almost never catches up.`,
          },
        },
        tone: 'bold',
      },
      {
        label: 'Use it to call ALL bad footage fake',
        fx: { base: 6, heat: 8, media: -2 },
        set: { stonewaller: true },
        tone: 'slick',
        result: `You declare every inconvenient clip a "fake" from this day forward. Handy, corrosive, and it'll come around to bite your ass forever.`,
      },
    ],
  },
  {
    id: 'p7_s_old_photo',
    paths: ['ballot', 'vanguard'],
    phases: [1, 2, 3],
    weight: 6,
    art: 'newspaper',
    emoji: '📸',
    title: 'The Old Photograph',
    body: `A photo from your dumbass youth has surfaced — nothing illegal, just deeply mortifying and tailor-made for memes. It's climbing fast, captioned by people who absolutely were not there.`,
    choices: [
      {
        label: 'Laugh it off and tell the real story',
        fx: { support: 8, media: 4, base: 2 },
        set: { honest_rep: true },
        tone: 'good',
        result:
          'You serve up the embarrassing backstory yourself, warts and belly-laughs included. Made human, the photo loses every drop of its venom.',
      },
      {
        label: 'Sic the lawyers and scrub it everywhere',
        fx: { heat: 8, support: -4 },
        tone: 'slick',
        result:
          'You unleash the legal hounds on every repost. The takedown notices become the actual story, and the photo breeds out of pure spite.',
      },
    ],
  },
  {
    id: 'p7_s_charity_front',
    paths: ['ballot', 'vanguard'],
    phases: [2, 3],
    weight: 6,
    art: 'scene',
    emoji: '🎗️',
    title: 'The Foundation',
    body: `A charity wearing your name does real good — and, oh so conveniently, also doubles as a slush fund and a polite way for the eager to buy your ear. The books are getting downright spicy.`,
    choices: [
      {
        label: 'Scrub it clean and firewall the giving',
        fx: { support: 8, funds: -4, heat: -4 },
        set: { clean_streak: true },
        tone: 'good',
        result:
          'You wall the access racket off from the actual charity. Way less useful as a weapon, way safer as a legacy.',
      },
      {
        label: 'Keep the access machine purring',
        fx: { funds: 10, influence: 6, heat: 8 },
        set: { corrupt_streak: true },
        scandal: {
          id: 'foundation_slush',
          label: 'the foundation’s convenient books',
          severity: 2,
        },
        tone: 'slick',
        result:
          'You let the donations and the favors keep happily commingling. Efficient, lucrative, and precisely the kind of thing auditors get hard for.',
      },
    ],
  },
  {
    id: 'p7_s_whistleblower',
    paths: ['ballot', 'vanguard'],
    phases: [2, 3],
    weight: 7,
    art: 'scene',
    emoji: '📣',
    title: 'The Whistleblower',
    body: `Someone inside your own shop is gearing up to expose a genuine, no-spin wrong you actually did. You can fix the wrong — or you can fix the whistleblower.`,
    choices: [
      {
        label: 'Fix the wrong before they can wave it around',
        fx: { support: 8, influence: -2, heat: -6 },
        set: { honest_rep: true },
        tone: 'good',
        result:
          'You quietly fix the mess and even thank the conscience that flagged it. The story dies because the thing it was about up and died first.',
      },
      {
        label: 'Smear and bury the whistleblower',
        fx: { base: 4, heat: 10, support: -6 },
        inc: { purge_count: 1 },
        set: { bloody_hands: true },
        scandal: { id: 'whistleblower_smear', label: 'the whistleblower you buried', severity: 3 },
        tone: 'bold',
        result:
          'You destroy the messenger and leave the message sitting there untouched. Works like a charm — right up until the next poor sap with a conscience.',
      },
    ],
  },
  {
    id: 'p7_s_translator',
    paths: ['ballot', 'vanguard'],
    phases: [1, 2, 3],
    weight: 6,
    art: 'scene',
    emoji: '🗣️',
    title: 'Lost in Translation',
    body: `In a tense foreign sit-down, your translator butchers a phrase and your hosts go rigid, insulted by something you never said. The whole room drops ten degrees in a single heartbeat.`,
    choices: [
      {
        label: 'Stop, apologize warm, and fix it yourself',
        fx: { influence: 8, support: 4 },
        set: { peacemaker: true },
        tone: 'good',
        result:
          'You catch it, laugh at the screwup, and make the apology personal. Grace patches the room and quietly impresses the hell out of your hosts.',
      },
      {
        label: 'Bluff past it and act oblivious',
        roll: {
          stat: 'influence',
          dc: 50,
          success: {
            fx: { influence: 6, base: 2 },
            text: 'You steer the talk onward so smooth the insult just evaporates. Now and then, sheer nerve beats a grovelling correction.',
          },
          fail: {
            fx: { influence: -6, heat: 4 },
            text: 'The insult sits there rotting and the meeting curdles like old milk. The frosty silence becomes the story your hosts dine out on for years.',
          },
        },
        tone: 'slick',
      },
    ],
  },
  {
    id: 'p7_s_exhaustion',
    paths: ['ballot', 'vanguard'],
    phases: [2, 3],
    weight: 6,
    art: 'scene',
    emoji: '🌙',
    title: 'Running on Empty',
    body: `Months of eighteen-hour days have finally caught up with your sorry carcass, and the decisions are smearing together. Power through on sheer stubbornness, or finally trust your team with real authority.`,
    choices: [
      {
        label: 'Hand your team genuine authority',
        fx: { influence: 8, support: 4, base: 2 },
        set: { has_network: true },
        tone: 'good',
        result:
          'You give real power to people you trust and — shock of shocks — the machine runs smoother. Sometimes strength looks a whole lot like letting go.',
      },
      {
        label: 'Grind through alone on pure spite',
        roll: {
          stat: 'base',
          dc: 52,
          success: {
            fx: { base: 6, support: 4 },
            text: 'You headbutt clean through the wall and out the far side. The legend of your inhuman stamina grows another smug inch.',
          },
          fail: {
            fx: { support: -6, heat: 4 },
            text: 'A bleary, half-conscious decision goes catastrophically sideways. The screwup was dodgeable — and dodgeable screwups are the worst kind there is.',
          },
        },
        tone: 'bold',
      },
    ],
  },

  // ---------------- CRISES ----------------
  {
    id: 'p7_c_nuclear',
    paths: ['ballot', 'vanguard'],
    phases: [2, 3],
    weight: 9,
    crisis: true,
    art: 'crisis',
    emoji: '☢️',
    title: 'The Reactor Alarm',
    body: `A reactor is venting and the readings are crawling skyward. Evacuate a million people on a "maybe," or trust the engineers swearing up and down they can cork it before the wind turns.`,
    choices: [
      {
        label: 'Evacuate now, grovel about it later',
        roll: {
          stat: 'support',
          dc: 50,
          success: {
            fx: { support: 12, influence: 6, funds: -8 },
            text: 'You move a million bodies on a hunch. The reactor holds; your "hysterical overreaction" just saved an entire region from a maybe.',
          },
          fail: {
            fx: { support: -4, heat: 4 },
            text: 'You empty whole cities and the reactor purrs along fine. The panic and the bill land on you; the disaster that never happened buys you exactly zero thanks.',
          },
        },
        tone: 'good',
      },
      {
        label: 'Trust the engineers, keep your mouth shut',
        fx: { influence: 4, heat: 12, support: -6 },
        scandal: { id: 'reactor_silence', label: 'the reactor scare you sat on', severity: 3 },
        tone: 'slick',
        result: `You bet the whole region on the engineers and say nothing. If they're right, nobody ever knows. If they're wrong, everybody glows in the dark.`,
      },
    ],
  },
  {
    id: 'p7_c_ally_killed',
    paths: ['ballot', 'vanguard'],
    phases: [2, 3],
    weight: 8,
    crisis: true,
    art: 'crisis',
    emoji: '🕯️',
    title: 'The Ally Is Killed',
    body: `Your closest political ally just got assassinated, and the whole nation is staggering and frothing for blood. The pressure to name a villain and start swinging is enormous, immediate, and intoxicating.`,
    choices: [
      {
        label: 'Grieve, investigate, hold back the mob',
        roll: {
          stat: 'support',
          dc: 53,
          success: {
            fx: { support: 12, base: 6, influence: 4 },
            text: 'You honor your friend with patience instead of a torch-and-pitchfork mob. The real killers get found properly; the country holds together.',
          },
          fail: {
            fx: { support: -6, heat: 6 },
            text: 'Your restraint enrages a public that came for blood. Mourning, they sneer, is not the same damn thing as leading.',
          },
        },
        set: { peacemaker: true },
        tone: 'good',
      },
      {
        label: 'Avenge them; sweep up the "guilty"',
        fx: { base: 10, heat: 14, support: -4 },
        inc: { purge_count: 2 },
        set: { bloody_hands: true, tyrant_rep: true },
        tone: 'bold',
        result:
          'You answer one murder with a dragnet of arrests, evidence strictly optional. Grief becomes a warrant, and the warrant is hilariously, horrifyingly wide.',
      },
    ],
  },
  {
    id: 'p7_c_winter',
    paths: ['ballot', 'vanguard'],
    phases: [1, 2, 3],
    weight: 8,
    crisis: true,
    art: 'crisis',
    emoji: '❄️',
    title: 'The Cold Snap',
    body: `A vicious winter has outrun the fuel supply and people are starting to freeze solid in their own living rooms. There's enough heat for the cities or the countryside — not both. Pick who shivers.`,
    choices: [
      {
        label: 'Split the pain, ask everyone to suck it up',
        fx: { support: 10, base: 4, influence: -2 },
        set: { honest_rep: true },
        tone: 'good',
        result: `You ration the heat evenly, kill the capital's pretty lights first, and lead by freezing your own ass off too. Shared cold, shared respect.`,
      },
      {
        label: 'Heat the cities, let the sticks freeze',
        fx: { base: 6, influence: 6, support: -10, heat: 8 },
        scandal: { id: 'cold_margins', label: 'the villages you left to freeze', severity: 2 },
        tone: 'slick',
        result:
          'You keep the important people toasty and the forgotten ones blue. The math checks out; the map of exactly who froze does not get forgotten.',
      },
    ],
  },
  {
    id: 'p7_c_mutiny',
    paths: ['ballot', 'vanguard'],
    phases: [2, 3],
    weight: 8,
    crisis: true,
    art: 'crisis',
    emoji: '⚓',
    title: 'The Mutiny',
    body: `A garrison has told you to shove your orders and barricaded itself in, airing grievances that are — annoyingly — about half right. Talk the mutineers down, or make a bloody example before the rot spreads.`,
    choices: [
      {
        label: 'Hear them out; fix the real gripes',
        roll: {
          stat: 'support',
          dc: 52,
          success: {
            fx: { support: 12, base: 6, influence: 4 },
            text: `You meet the mutineers, give them what's actually fair, and fold them back in with their dignity intact. The contagion never even sparks.`,
          },
          fail: {
            fx: { support: -6, heat: 8 },
            text: 'Your softness gives a second garrison the bright idea to pull the same stunt. Mercy, read wrong, looks an awful lot like an open door.',
          },
        },
        tone: 'good',
      },
      {
        label: 'Crush the mutiny hard and fast',
        fx: { base: 10, heat: 14, support: -8 },
        inc: { purge_count: 1 },
        set: { bloody_hands: true, tyrant_rep: true },
        tone: 'bold',
        result:
          'You retake the garrison by force and make a public spectacle of the survivors. The fleet goes silent — out of fear, which is not even close to the same thing as loyalty.',
      },
    ],
  },
  {
    id: 'p7_c_rail',
    paths: ['ballot', 'vanguard'],
    phases: [1, 2, 3],
    weight: 8,
    crisis: true,
    art: 'crisis',
    emoji: '🚆',
    title: 'The Rail Disaster',
    body: `A packed train just derailed with a horrifying body count, and the early signs point straight at the deferred maintenance your own budget axed. The grief is right now; the paper trail is patient and damning.`,
    choices: [
      {
        label: 'Own it and gut-rebuild the safety system',
        fx: { support: 10, funds: -10, heat: -2 },
        set: { honest_rep: true },
        tone: 'good',
        result:
          'You eat the failure, fund the fix, and look every grieving family in the eye. Accountability costs a fortune and, this once, is exactly the right call.',
      },
      {
        label: 'Pin it on the operators and bury the memo',
        roll: {
          stat: 'media',
          dc: 53,
          success: {
            fx: { media: 6, base: 4, heat: 4 },
            text: 'You hang it on a tired driver and the damning memo stays locked in its drawer. The story shuffles on — for now, anyway.',
          },
          fail: {
            fx: { support: -12, heat: 12 },
            text: 'The budget memo leaks with your signature smeared all over the cuts. The cover-up makes the original screwup look like a parking ticket.',
          },
        },
        scandal: { id: 'rail_memo', label: 'the maintenance cuts you hid', severity: 3 },
        tone: 'slick',
      },
    ],
  },
];
