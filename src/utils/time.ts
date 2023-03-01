// Week function taken from https://stackoverflow.com/a/14127528
export function getCurrentWeek() {
	(Date.prototype as any).getWeek = function () {
		const date = new Date(this.getTime());
		date.setDate(date.getDate() + 4 - (date.getDay() || 7));
		const thursday = date.getTime();
		date.setMonth(0);
		date.setDate(1);
		const jan1st = date.getTime();
		const days = Math.round((thursday - jan1st) / 86400000);
		return Math.floor(days / 7) + 1;
	};
	return (new Date() as any).getWeek();
}

export function getNumberOfWeeks(start?: string, end?: string): number {
	const startWeek = Number(start?.split(" ")[2] || "0");
	let endWeek = Number(end?.split(" ")[2] || "0");
	if(startWeek > endWeek) endWeek += 52;
	return Math.max(startWeek, endWeek) - Math.min(startWeek, endWeek);
}

