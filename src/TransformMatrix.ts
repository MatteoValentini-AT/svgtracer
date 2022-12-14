class TransformMatrix {
	private matrix: number[][];

	constructor(
		matrix: number[][] = [
			[1, 0, 0],
			[0, 1, 0],
			[0, 0, 1],
		]
	) {
		this.matrix = matrix;
	}

	getMatrix = () => {
		return this.matrix;
	};

	multiply = (matrix: TransformMatrix) => {
		this.matrix = this.matrix.map((row, i) =>
			row.map((_, j) =>
				row.reduce(
					(sum, _, k) => sum + this.matrix[i][k] * matrix.getMatrix()[k][j],
					0
				)
			)
		);
		return this;
	};

	translate = (x: number, y: number) => {
		this.multiply(
			new TransformMatrix([
				[1, 0, x],
				[0, 1, y],
				[0, 0, 1],
			])
		);
		return this;
	};

	scale = (x: number, y: number) => {
		this.multiply(
			new TransformMatrix([
				[x, 0, 0],
				[0, y, 0],
				[0, 0, 1],
			])
		);
		return this;
	};

	rotate = (angle: number) => {
		this.multiply(
			new TransformMatrix([
				[Math.cos(angle), -Math.sin(angle), 0],
				[Math.sin(angle), Math.cos(angle), 0],
				[0, 0, 1],
			])
		);
		return this;
	};

	rotateAround = (angle: number, x: number, y: number) => {
		this.translate(x, y);
		this.rotate(angle);
		this.translate(-x, -y);
		return this;
	};

	skewX = (angle: number) => {
		this.multiply(
			new TransformMatrix([
				[1, Math.tan(angle), 0],
				[0, 1, 0],
				[0, 0, 1],
			])
		);
		return this;
	};

	skewY = (angle: number) => {
		this.multiply(
			new TransformMatrix([
				[1, 0, 0],
				[Math.tan(angle), 1, 0],
				[0, 0, 1],
			])
		);
		return this;
	};

	clone = () => {
		return new TransformMatrix(this.matrix);
	};

	static fromTransformString = (transformString: string): TransformMatrix => {
		const matrix = new TransformMatrix();
		const transformRegex = /(\w+)\(([^)]+)\)/g;
		let match: RegExpExecArray | null;
		while ((match = transformRegex.exec(transformString))) {
			const [_, transform, args] = match;
			const [arg1, arg2, arg3, arg4, arg5, arg6] = args
				.split(',')
				.map((arg) => parseFloat(arg));
			switch (transform) {
				case 'translate':
					if (arg2 === undefined) matrix.translate(arg1, 0);
					else matrix.translate(arg1, arg2);
					break;
				case 'scale':
					if (arg2 === undefined) matrix.scale(arg1, arg1);
					else matrix.scale(arg1, arg2);
					break;
				case 'rotate':
					if (arg2 != undefined && arg3 != undefined)
						matrix.rotateAround(arg1, arg2, arg3);
					else matrix.rotate(arg1);
					break;
				case 'skewX':
					matrix.skewX(arg1);
					break;
				case 'skewY':
					matrix.skewY(arg1);
					break;
				case 'matrix':
					matrix.multiply(
						new TransformMatrix([
							[arg1, arg2, arg3],
							[arg4, arg5, arg6],
							[0, 0, 1],
						])
					);
				default:
					throw new Error('Invalid transform: ' + transform);
			}
		}
		return matrix;
	};
}

export default TransformMatrix;
