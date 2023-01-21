export const generateColor = (key: string, saturation = 100, lightness = 60): string => {
	let hash = 0;
	for (let i = 0; i < key.length; i++) {
		hash = key.charCodeAt(i) + ((hash << 5) - hash);
	}
	const h = Math.abs(hash) % 360;
	saturation = saturation <= 100 && saturation > 0 ? saturation : 100;
	lightness = lightness <= 100 && lightness > 0 ? lightness : 50;
	return `hsl(${h}, ${saturation}%, ${lightness}%)`;
};
