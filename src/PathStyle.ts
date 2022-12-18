class Color {
	public r: number = 255;
	public g: number = 255;
	public b: number = 255;
	public a: number = 255;

	public constructor(r: number | string, g?: number, b?: number, a?: number) {
		if (typeof r === 'string') {
			if (r.startsWith('rgb')) {
				const rgb = r.substring(4, r.length - 5).split(',');
				this.r = parseInt(rgb[0]);
				this.g = parseInt(rgb[1]);
				this.b = parseInt(rgb[2]);
				this.a = 255;
			} else if (r.startsWith('rgba')) {
				const rgba = r.substring(5, r.length - 6).split(',');
				this.r = parseInt(rgba[0]);
				this.g = parseInt(rgba[1]);
				this.b = parseInt(rgba[2]);
				this.a = parseInt(rgba[3]);
			} else if (r.startsWith('#')) {
				const hex = r;
				this.r = parseInt(hex.substring(1, 3), 16);
				this.g = parseInt(hex.substring(3, 5), 16);
				this.b = parseInt(hex.substring(5, 7), 16);
				this.a = hex.length === 9 ? parseInt(hex.substring(7, 9), 16) : 255;
			}
		} else {
			this.r = r;
			if (g !== undefined) this.g = g;
			if (b !== undefined) this.b = b;
			if (a !== undefined) this.a = a;
		}
	}

	toHexString = () => {
		return (
			'#' +
			this.r.toString(16).padStart(2, '0') +
			this.g.toString(16).padStart(2, '0') +
			this.b.toString(16).padStart(2, '0') +
			this.a.toString(16).padStart(2, '0')
		);
	};
}

class PathStyle {
	public fill: Color = new Color(0, 0, 0);
	public stroke: Color = new Color(0, 0, 0);
	public strokeWidth: number = 1;

	public constructor(style?: PathStyle) {
		if (style) {
			this.fill = style.fill;
			this.stroke = style.stroke;
			this.strokeWidth = style.strokeWidth;
		}
	}
}

export default PathStyle;
export { PathStyle, Color };
