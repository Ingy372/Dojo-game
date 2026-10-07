/// <reference types="vite/client" />
import { loadContent, type Content } from '../src';
import insights from '../../../content/insights/insights.json';
import gear from '../../../content/loot/gear.json';
import drops from '../../../content/loot/drops.json';
import abilities from '../../../content/abilities/abilities.json';
import dojoRoom from '../../../content/dojo/home-dojo.json';
import decorations from '../../../content/dojo/decorations.json';

const rooms = import.meta.glob('../../../content/rooms/*.json', { eager: true, import: 'default' });
const enemies = import.meta.glob('../../../content/enemies/*.json', { eager: true, import: 'default' });

/** All the game's content, read from the content folder. */
export function testContent(): Content {
  const sorted = (files: Record<string, unknown>) => Object.keys(files).sort().map((k) => files[k]);
  return loadContent({ rooms: sorted(rooms), enemies: sorted(enemies), insights, gear, drops, abilities, dojoRoom, decorations });
}
