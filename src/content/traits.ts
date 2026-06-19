import type { Trait } from '../engine/types';

export const TRAITS: Trait[] = [
 {id:"orator",name:"Orator",emoji:"🎤",desc:"Crowds melt. Start with stronger Approval/Legitimacy and a passive lift when you go public.",fx:{support:8,media:4}},
 {id:"operator",name:"Backroom Operator",emoji:"🕴️",desc:"You count votes and collect debts. Start with more Capital/Standing; schemes land more often.",fx:{influence:10,base:4}},
 {id:"rainmaker",name:"Rainmaker",emoji:"💰",desc:"Money finds you. Start flush with funds; donors and patrons forgive a lot.",fx:{funds:14}},
 {id:"clean",name:"Squeaky Clean",emoji:"🧼",desc:"A spotless record. Start with rock-bottom Scrutiny/Suspicion; scandals stick to you less.",fx:{heat:-8,support:4}}
];
