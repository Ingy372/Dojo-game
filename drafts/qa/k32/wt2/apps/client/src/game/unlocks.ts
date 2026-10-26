// The gradual unlock schedule and Welcome Week on the client (M7-P7).

import { introduceToday, loadUnlockSchedule, systemOpen, type Profile, type ScheduledSystem, type TrainingState } from '@dojo/sim';
import scheduleData from '../../../../content/settings/unlock-schedule.json';
import { LESSONS, localDay } from './lessons';

export const SCHEDULE = loadUnlockSchedule(scheduleData);

/** Is this dojo system's button shown? */
export function isOpen(profile: Profile, t: TrainingState, id: 'scroll' | 'journal' | 'street-smarts'): boolean {
  return systemOpen(SCHEDULE, profile.welcomeWeek, t, id);
}

/** Welcome Week's system for today, if any (saved on the profile; the caller writes the save). */
export function systemForToday(profile: Profile, t: TrainingState): ScheduledSystem | null {
  return introduceToday(SCHEDULE, profile.welcomeWeek, t, LESSONS, profile.lessons, localDay());
}
