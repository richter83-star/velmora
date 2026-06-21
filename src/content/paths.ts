import type { PathKey, PathConfig } from '../engine/types';

export const PATHS: Record<PathKey, PathConfig> = {
 ballot:{
   key:"ballot", land:"The Republic of Velmora", theme:"theme-ballot",
   statNames:{support:"Approval",funds:"War Chest",influence:"Capital",media:"Press",base:"Base",heat:"Scrutiny"},
   start:{support:48,funds:35,influence:30,media:40,base:45,heat:10},
   factions:[
     {id:"federalist",name:"Federalist Bloc",desc:"Institutions, business, steady hands. Loves order, fears the mob."},
     {id:"populist",name:"Populist Front",desc:"The forgotten towns, big rallies, burn-it-down energy."},
     {id:"reform",name:"Reform Independents",desc:"No party machine. Clean image, thin wallet, fragile coalition."}
   ],
   phases:[
     {n:1,title:"Senator",kicker:"The Statehouse",goalTurns:7,emoji:"🏛️",
      promo:{type:"election",label:"Re-election Night",emoji:"🗳️",baseOpp:46,oppTitle:"the challenger"}},
     {n:2,title:"Governor",kicker:"The Governor's Mansion",goalTurns:7,emoji:"🏞️",
      promo:{type:"election",label:"The Governor's Race",emoji:"🗳️",baseOpp:51,oppTitle:"the opponent"}},
     {n:3,title:"President",kicker:"The Velmoran White House",goalTurns:8,emoji:"🦅",
      promo:{type:"finale",label:"The Final Reckoning",emoji:"⚖️"}}
   ],
   oppNames:["Carrow","Vance","Delgado","Mire","Ashby","Okonkwo","Reyna","Holt","Brandt","Sable"]
 },
 vanguard:{
   key:"vanguard", land:"The People's Union of Velmora", theme:"theme-vanguard",
   statNames:{support:"Legitimacy",funds:"State Funds",influence:"Standing",media:"Propaganda",base:"Loyalty",heat:"Suspicion"},
   start:{support:42,funds:30,influence:34,media:38,base:40,heat:14},
   factions:[
     {id:"hardliner",name:"The Hardliners",desc:"Doctrine above all. Purity is power; doubt is treason."},
     {id:"technocrat",name:"The Technocrats",desc:"Make the quotas, fix the grid. Results buy protection."},
     {id:"networker",name:"The Networkers",desc:"Favors, blackmail, friends in the security organs."}
   ],
   phases:[
     {n:1,title:"District Cadre",kicker:"The Local Cell",goalTurns:7,emoji:"⭐",
      promo:{type:"powerplay",label:"The Patronage Test",emoji:"🤝",baseOpp:46,oppTitle:"a rival cadre"}},
     {n:2,title:"Regional Secretary",kicker:"The Provincial Bureau",goalTurns:7,emoji:"🏭",
      promo:{type:"powerplay",label:"The Succession Struggle",emoji:"♟️",baseOpp:52,oppTitle:"a Council rival"}},
     {n:3,title:"General Secretary",kicker:"The Standing Committee",goalTurns:8,emoji:"🎖️",
      promo:{type:"finale",label:"The Final Reckoning",emoji:"⚖️"}}
   ],
   oppNames:["Kron","Vasiliev","Marek","Dubrov","Stahl","Petrova","Oblast","Renko","Greb","Yusuf"]
 },
 iron:{
   key:"iron", land:"The Iron State of Velmora", theme:"theme-iron",
   statNames:{support:"Fervor",funds:"War Chest",influence:"Cohesion",media:"Propaganda",base:"Vanguard",heat:"Exposure"},
   start:{support:44,funds:28,influence:36,media:32,base:50,heat:18},
   factions:[
     {id:"ultras",name:"The Ultras",desc:"True believers. Total commitment, zero compromise. They want the whole thing, now."},
     {id:"officers",name:"The Officer Corps",desc:"Disciplined pragmatists. They want order, not ideology. Will follow a winner."},
     {id:"industrialists",name:"The Industrialists",desc:"Money and manufacturing. Backed you because the unions frightened them. Expect returns."}
   ],
   phases:[
     {n:1,title:"Movement Leader",kicker:"The Streets",goalTurns:7,emoji:"🪧",
      promo:{type:"purge",label:"The Loyalty Test",emoji:"🗡️",baseOpp:44,oppTitle:"a rival faction leader"}},
     {n:2,title:"Chief of State",kicker:"The Ministries",goalTurns:7,emoji:"🏛️",
      promo:{type:"purge",label:"The Night of Reckoning",emoji:"🗡️",baseOpp:52,oppTitle:"the last rival"}},
     {n:3,title:"Supreme Leader",kicker:"The Iron Palace",goalTurns:8,emoji:"🎖️",
      promo:{type:"finale",label:"The Final Reckoning",emoji:"⚖️"}}
   ],
   oppNames:["Dresner","Halvik","Motte","Cern","Ault","Braun","Veck","Ostler","Faul","Sieg"]
 },
 gilded:{
   key:"gilded", land:"The Free Territories of Velmora", theme:"theme-gilded",
   statNames:{support:"Approval",funds:"Capital",influence:"Leverage",media:"Narrative",base:"Network",heat:"Scrutiny"},
   start:{support:38,funds:70,influence:40,media:35,base:30,heat:12},
   factions:[
     {id:"old_money",name:"The Old Families",desc:"Dynasties who have owned Velmora for generations. Suspicious of new entrants; invaluable once won."},
     {id:"tech_barons",name:"The Tech Barons",desc:"New money, global reach, asymmetric influence. Impatient, data-driven, amoral."},
     {id:"finance_bloc",name:"The Finance Bloc",desc:"Banks, funds, and instruments you don't need to understand to use. They understand you perfectly."}
   ],
   phases:[
     {n:1,title:"Board Member",kicker:"The Boardroom",goalTurns:7,emoji:"💼",
      promo:{type:"acquisition",label:"The Hostile Bid",emoji:"💰",baseOpp:44,oppTitle:"a rival bidder"}},
     {n:2,title:"Chairman",kicker:"The Tower",goalTurns:7,emoji:"🏙️",
      promo:{type:"acquisition",label:"The Consolidation",emoji:"💰",baseOpp:53,oppTitle:"the last holdout"}},
     {n:3,title:"The Architect",kicker:"The Summit",goalTurns:8,emoji:"💎",
      promo:{type:"finale",label:"The Final Reckoning",emoji:"⚖️"}}
   ],
   oppNames:["Voss","Hartley","Maren","Strix","Calloway","Dunne","Feld","Quint","Ashmore","Lorne"]
 },
 anointed:{
   key:"anointed", land:"The Sacred Covenant of Velmora", theme:"theme-anointed",
   statNames:{support:"Devotion",funds:"Treasury",influence:"Authority",media:"Doctrine",base:"Congregation",heat:"Heresy"},
   start:{support:52,funds:32,influence:30,media:38,base:48,heat:8},
   factions:[
     {id:"orthodox",name:"The Orthodox",desc:"Guardians of tradition. Ancient texts, unchanged doctrine, zero tolerance for innovation."},
     {id:"reformists",name:"The Reformists",desc:"Believers in a living faith. Accessible, modern in form if not in content, politically useful."},
     {id:"mystics",name:"The Mystics",desc:"Charismatic, visionary, unpredictable. The people love them. The Council fears them. So do you."}
   ],
   phases:[
     {n:1,title:"Parish Elder",kicker:"The Temple",goalTurns:7,emoji:"🕯️",
      promo:{type:"council",label:"The Elevation",emoji:"🙏",baseOpp:43,oppTitle:"a rival cleric"}},
     {n:2,title:"High Prelate",kicker:"The Council Chamber",goalTurns:7,emoji:"📜",
      promo:{type:"council",label:"The Convocation",emoji:"🙏",baseOpp:51,oppTitle:"a rival prelate"}},
     {n:3,title:"Supreme Shepherd",kicker:"The Sacred Seat",goalTurns:8,emoji:"👁️",
      promo:{type:"finale",label:"The Final Reckoning",emoji:"⚖️"}}
   ],
   oppNames:["Brother Cael","Sister Maro","Elder Voss","Father Dren","Prior Ishe","Deacon Alm","Canon Rett","Abbess Sura","Prelate Nim","Brother Fael"]
 }
};
