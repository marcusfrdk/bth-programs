export function getSemester(value: string | number): string {
  let week = value;
  if(typeof value === "string") week = Number(value.split(' ')[2]);
  if (week < 13) return "Läsperiod 3";
  if (week < 34) return 'Läsperiod 4';
  if (week < 44) return "Läsperiod 1";
  if (week < 53) return 'Läsperiod 2';
  return "Läsperiod 3";
}