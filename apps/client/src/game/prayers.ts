// The prayer menu's words for this school (Jay, Nov 25), checked when the game loads.
import { loadPrayerBook } from '@dojo/sim';
import prayersJson from '../../../../content/faith/action-zone-prayers.json';

export const PRAYERS = loadPrayerBook(prayersJson);
