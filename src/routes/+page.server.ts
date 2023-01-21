import index from "../index.json";

export function load(){
	let programs: Record<string, string[]> = {};

	index.sort().forEach((program) => {
		const key = program.slice(0, 5);
		const value = program.slice(5, program.length).replace('.json', '');
		programs[key] = [...(key in programs ? programs[key] : []), value];
	});

	return {
    programs
  };
}