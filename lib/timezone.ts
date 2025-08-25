/**
 * Timezone utilities for consistent EST date handling
 */

export function getESTDateString(date: Date = new Date()): string {
  const estDate = new Date(date.toLocaleString("en-US", {timeZone: "America/New_York"}));
  return estDate.getFullYear() + '-' + 
         String(estDate.getMonth() + 1).padStart(2, '0') + '-' + 
         String(estDate.getDate()).padStart(2, '0');
}

export function isTodayEST(dateString: string): boolean {
  const today = getESTDateString();
  return dateString === today;
}
