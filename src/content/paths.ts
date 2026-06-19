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
      promo:{type:"powerplay",label:"The Succession Struggle",emoji:"♟️",baseOpp:52,oppTitle:"a Politburo rival"}},
     {n:3,title:"General Secretary",kicker:"The Standing Committee",goalTurns:8,emoji:"☭",
      promo:{type:"finale",label:"The Final Reckoning",emoji:"⚖️"}}
   ],
   oppNames:["Kron","Vasiliev","Marek","Dubrov","Stahl","Petrova","Oblast","Renko","Greb","Yusuf"]
 }
};
