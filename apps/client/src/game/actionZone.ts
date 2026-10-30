// The Action Zone dojo's inside room, read once from content/dojo/action-zone/inside-room.json.
import { loadInsideRoom } from '@dojo/sim';
import insideJson from '../../../../content/dojo/action-zone/inside-room.json';

export const INSIDE = loadInsideRoom(insideJson);
export const INSIDE_PACK = 'dojo-az-inside';
