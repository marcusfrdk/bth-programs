import type { ICourse } from '../types/Program';
import { getNumberOfWeeks } from './time';

const removeDuplicates = (obj: Record<string, ICourse[]>): Record<string, ICourse[]> => {
	const keys = Object.keys(obj);
	for (let i = 0; i < keys.length; i++) {
		const key = keys[i];
		const unique = Array.from(new Set(obj[key].map((course) => course.code)));
		obj[key] = unique.map((code) => obj[key].find((course) => course.code === code) as ICourse);
	}
	return obj;
};

export const clusterWeeks = (
	obj: Record<string, ICourse[]>,
	maxDiff: number
): Record<string, ICourse[]> => {
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
	return removeDuplicates(obj);
};

export const groupSemesters = (arr: ICourse[]): Record<string, ICourse[]> => {
	const grouped: Record<string, ICourse[]> = {};
	const index = Array.from(
		new Set(
			arr.map((course) => {
				grouped[course.start] = [];
				return course.start;
			})
		)
	).sort();

	for (let i = 0; i < arr.length; i++) {
		const course = arr[i];
		const weeks = getNumberOfWeeks(course.start, course.end);
		let nextSemester = index[index.indexOf(course.start) + 1] || course.start;
		const currentWeek = Number(course.start.split(' ')[2]);
		const nextWeek = Number(nextSemester.split(' ')[2] || 0);

		// Add double courses to next semester
		if (nextWeek - currentWeek < 5)
			nextSemester = index[index.indexOf(course.start) + 2] || course.start;
		if (weeks > 10 && typeof nextSemester !== 'undefined')
			grouped[nextSemester].push(structuredClone(course));
		grouped[course.start].push(course);
	}

	return clusterWeeks(grouped, 5);
};
