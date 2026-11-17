/// <reference types="vite/client" />
import { loadContent, type Content } from '../src';
import insights from '../../../content/insights/insights.json';
import gear from '../../../content/loot/gear.json';
import drops from '../../../content/loot/drops.json';
import abilities from '../../../content/abilities/abilities.json';
import sealFamilies from '../../../content/abilities/seal-families.json';
import strikes from '../../../content/abilities/strikes.json';
import kataPowers from '../../../content/abilities/kata-powers.json';
import dojoRoom from '../../../content/dojo/home-dojo.json';
import decorations from '../../../content/dojo/decorations.json';
import twists from '../../../content/twists/twists.json';
import elites from '../../../content/elites/elites.json';
import named from '../../../content/named/named.json';
import guardianScale from '../../../content/settings/guardian-scale.json';
import floorSets from '../../../content/settings/floor-sets.json';

const rooms = import.meta.glob('../../../content/rooms/*.json', { eager: true, import: 'default' });
const enemies = import.meta.glob('../../../content/enemies/*.json', { eager: true, import: 'default' });

/** The content folder's files, before loading (for tests that add a bad file). */
export function testRawContent() {
  const sorted = (files: Record<string, unknown>) => Object.keys(files).sort().map((k) => files[k]);
  return { rooms: sorted(rooms), enemies: sorted(enemies), insights, gear, drops, abilities, sealFamilies, strikes, kataPowers, dojoRoom, decorations, twists, elites, named, guardianScale, floorSets };
}

/** All the game's content, read from the content folder. */
export function testContent(): Content {
  return loadContent(testRawContent());
}
