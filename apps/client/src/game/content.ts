// All game content (rooms, enemies, Insights, loot), loaded from the content folder
// and checked once when the game starts.

import { loadContent } from '@dojo/sim';
import insights from '../../../../content/insights/insights.json';
import gear from '../../../../content/loot/gear.json';
import drops from '../../../../content/loot/drops.json';
import abilities from '../../../../content/abilities/abilities.json';
import dojoRoom from '../../../../content/dojo/home-dojo.json';
import decorations from '../../../../content/dojo/decorations.json';

const rooms = import.meta.glob('../../../../content/rooms/*.json', { eager: true, import: 'default' });
const enemies = import.meta.glob('../../../../content/enemies/*.json', { eager: true, import: 'default' });

const sorted = (files: Record<string, unknown>) => Object.keys(files).sort().map((k) => files[k]);

export const CONTENT = loadContent({ rooms: sorted(rooms), enemies: sorted(enemies), insights, gear, drops, abilities, dojoRoom, decorations });
