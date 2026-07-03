export function getMonthDays(date: Date): Date[] {
  const year = date.getFullYear();
  const month = date.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: Date[] = [];
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i));
  }
  return days;
}

// 0 = Monday, 1 = Tuesday, ..., 6 = Sunday
export function getFirstDayOfMonth(date: Date): number {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  // JS getDay(): 0 = Sunday, 1 = Monday. We want 0 = Monday, 6 = Sunday
  return firstDay === 0 ? 6 : firstDay - 1;
}

export function formatDateVN(date: Date): string {
  return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
}

export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

// Format: 'YYYY-MM-DD'
export function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

// Format: Date -> 'YYYY-MM-DD'
export function formatDateISO(date: Date): string {
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
}
