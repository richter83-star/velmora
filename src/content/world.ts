import type { WorldTable } from '../engine/types';

export const WORLD: WorldTable = {
 economy:[{k:"boom",t:"a roaring boom",mood:+1},{k:"steady",t:"a steady economy",mood:0},{k:"slump",t:"a grinding slump",mood:-1},{k:"crisis",t:"a debt crisis",mood:-2}],
 mood:[{k:"hopeful",t:"hopeful"},{k:"restless",t:"restless"},{k:"angry",t:"angry"},{k:"sleepy",t:"distracted"}],
 tension:[{k:"calm",t:"calm borders",d:0},{k:"tense",t:"a tense rival across the sea",d:6},{k:"brink",t:"two nations on the brink of war",d:12}]
};
