class PathStyle {
	constructor(public fill: string = 'none', public stroke: string = 'none') {}

	clone = () => {
		return new PathStyle(this.fill, this.stroke);
	};

	static toRGB = (color: string) => {
		if (color.startsWith('rgb')) {
			const rgb = color
				.substring(color.indexOf('(') + 1, color.indexOf(')'))
				.split(',')
				.map((x) => parseInt(x));
			return rgb;
		} else if (color.startsWith('#')) {
			const hex = color.substring(1);
			if (hex.length === 3) {
				return [
					parseInt(hex.substring(0, 1), 16) * 16,
					parseInt(hex.substring(1, 2), 16) * 16,
					parseInt(hex.substring(2, 3), 16) * 16,
				];
			} else if (hex.length === 6) {
				return [
					parseInt(hex.substring(0, 2), 16),
					parseInt(hex.substring(2, 4), 16),
					parseInt(hex.substring(4, 6), 16),
				];
			}
		}
		return [0, 0, 0];
	};
}

export default PathStyle;
