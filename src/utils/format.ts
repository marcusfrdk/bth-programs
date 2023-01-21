export function getSemester(value: string): string {
  const week = Number(value.split(" ")[2]);
  if (week < 10) return "Läsperiod 3";
  if (week < 30) return 'Läsperiod 4';
  if (week < 44) return "Läsperiod 1";
  if (week < 50) return 'Läsperiod 2';
  return "Läsperiod 3";
}