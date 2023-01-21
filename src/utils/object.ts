import type { ICourse, IProgram } from "../types/Program";

export const clusterWeeks = (obj: Record<string, any>, maxDiff: number): Record<string, ICourse[]> => {
	const entries = Object.entries(obj);
	for (let i = 0; i < entries.length - 1; i++) {
		for (let j = i + 1; j < entries.length; j++) {
			const key1 = entries[i][0];
			const key2 = entries[j][0];
			const year1 = Number(key1.split(' ')[0]);
			const week1 = Number(key1.split(' ')[2]);
			const year2 = Number(key2.split(' ')[0]);
			const week2 = Number(key2.split(' ')[2]);
			if (year1 === year2 && Math.abs(week1 - week2) <= maxDiff) {
				obj[key1] = obj[key1].concat(obj[key2]);
				delete obj[key2];
				return clusterWeeks(obj, maxDiff);
			}
		}
	}
	return obj;
};

export const groupSemesters = (arr: ICourse[]): Record<string, ICourse[]> => {
  const grouped = arr.reduce((acc: any, obj: any) => {
    if(!acc[obj.start]){
      acc[obj.start] = [];
    }
    acc[obj.start].push(obj);
    return acc
  }, {});

  return clusterWeeks(grouped, 5);
} 


