import { Point, Vector2D } from './Geometry.js';

class PathTracer {
	private origin: Vector2D;
	private lastControlPoint: Vector2D;
	private points: Point[] = [];

	private static getArgs = (segment: string): number[] => {
		const input = segment.substring(1);
		const output: number[] = [];
		let startIndex = 0;
		let dot = false;
		for (let i = 0; i < input.length; i++) {
			if (input[i] === ' ' || input[i] === ',') {
				if (startIndex !== i) {
					output.push(parseFloat(input.substring(startIndex, i)));
					dot = false;
				}
				startIndex = i + 1;
			} else if (input[i] === '-') {
				if (startIndex !== i) {
					output.push(parseFloat(input.substring(startIndex, i)));
					dot = false;
				}
				startIndex = i;
			} else if (input[i] === '.') {
				if (dot) {
					output.push(parseFloat(input.substring(startIndex, i)));
					startIndex = i;
					dot = false;
				} else dot = true;
			}
		}
		if (startIndex !== input.length)
			output.push(parseFloat(input.substring(startIndex)));
		return output;
	};

	constructor(origin: Vector2D) {
		this.origin = origin;
		this.lastControlPoint = origin;
	}

	private lastPointPos = (): Vector2D => {
		return this.points[this.points.length - 1].position.clone();
	};

	parseM = (segment: string, isFirst: boolean = false) => {
		const isRelative = segment.startsWith('m');
		const args = PathTracer.getArgs(segment);
		if (args.length < 2) throw new Error('Invalid path data');
		if (isRelative && !(isFirst && this.points.length == 0))
			this.points.push(
				new Point(this.origin.clone().add(args[0], args[1]), new Vector2D(0, 0))
			);
		else
			this.points.push(
				new Point(new Vector2D(args[0], args[1]), new Vector2D(0, 0))
			);
		for (let i = 2; i < args.length; i += 2) {
			const point = new Vector2D(args[i], args[i + 1]);
			isRelative && point.addVector(this.lastPointPos());
			const normal = point
				.clone()
				.subVector(this.lastPointPos())
				.normalizedNormal();
			this.points.push(new Point(point, normal));
		}
	};

	parseL = (segment: string) => {
		const isRelative = segment.startsWith('l');
		const args = PathTracer.getArgs(segment);
		if (args.length < 2) throw new Error('Invalid path data');
		for (let i = 0; i < args.length; i += 2) {
			const point = new Vector2D(args[i], args[i + 1]);
			isRelative && point.addVector(this.lastPointPos());
			const normal = point
				.clone()
				.subVector(this.lastPointPos())
				.normalizedNormal();
			this.points.push(new Point(point, normal));
		}
		this.lastControlPoint = this.lastPointPos();
	};

	parseH = (segment: string) => {
		const isRelative = segment.startsWith('h');
		const args = PathTracer.getArgs(segment);
		if (args.length < 1) throw new Error('Invalid path data');
		for (let i = 0; i < args.length; i++) {
			const point = new Vector2D(args[i], 0);
			isRelative && point.addVector(this.lastPointPos());
			const normal = point
				.clone()
				.subVector(this.lastPointPos())
				.normalizedNormal();
			this.points.push(new Point(point, normal));
		}
		this.lastControlPoint = this.lastPointPos();
	};

	parseV = (segment: string) => {
		const isRelative = segment.startsWith('v');
		const args = PathTracer.getArgs(segment);
		if (args.length < 1) throw new Error('Invalid path data');
		for (let i = 0; i < args.length; i++) {
			const point = new Vector2D(0, args[i]);
			isRelative && point.addVector(this.lastPointPos());
			const normal = point
				.clone()
				.subVector(this.lastPointPos())
				.normalizedNormal();
			this.points.push(new Point(point, normal));
		}
		this.lastControlPoint = this.lastPointPos();
	};

	parseC = (segment: string) => {
		const isRelative = segment.startsWith('c');
		const args = PathTracer.getArgs(segment);
		if (args.length < 6) throw new Error('Invalid path data');
		for (let i = 0; i < args.length; i += 6) {
			const p0 = this.lastPointPos();
			const p1 = new Vector2D(args[i], args[i + 1]);
			const p2 = new Vector2D(args[i + 2], args[i + 3]);
			const p3 = new Vector2D(args[i + 4], args[i + 5]);
			if (isRelative) {
				p1.addVector(this.lastPointPos());
				p2.addVector(this.lastPointPos());
				p3.addVector(this.lastPointPos());
			}
			const stepSize = 0.1;
			for (let t = 0; t < 1 - stepSize; t += stepSize) {
				const point = p0
					.clone()
					.scale(-t * t * t + 3 * t * t - 3 * t + 1)
					.addVector(p1.clone().scale(3 * t * t * t - 6 * t * t + 3 * t))
					.addVector(p2.clone().scale(-3 * t * t * t + 3 * t * t))
					.addVector(p3.clone().scale(t * t * t));
				const normal = point
					.clone()
					.subVector(this.lastPointPos())
					.normalizedNormal();
				this.points.push(new Point(point, normal));
			}
			const point = p3.clone();
			const normal = point
				.clone()
				.subVector(this.lastPointPos())
				.normalizedNormal();
			this.points.push(new Point(point, normal));
			this.lastControlPoint = p2;
		}
	};

	parseS = (segment: string) => {
		const isRelative = segment.startsWith('s');
		const args = PathTracer.getArgs(segment);
		if (args.length < 4) throw new Error('Invalid path data');
		for (let i = 0; i < args.length; i += 4) {
			const p0 = this.lastPointPos();
			const p1 = this.lastControlPoint
				.clone()
				.scale(2)
				.subVector(this.lastPointPos());
			const p2 = new Vector2D(args[i], args[i + 1]);
			const p3 = new Vector2D(args[i + 2], args[i + 3]);
			if (isRelative) {
				p2.addVector(this.lastPointPos());
				p3.addVector(this.lastPointPos());
			}
			const stepSize = 0.1;
			for (let t = 0; t < 1 - stepSize; t += stepSize) {
				const point = p0
					.clone()
					.scale(-t * t * t + 3 * t * t - 3 * t + 1)
					.addVector(p1.clone().scale(3 * t * t * t - 6 * t * t + 3 * t))
					.addVector(p2.clone().scale(-3 * t * t * t + 3 * t * t))
					.addVector(p3.clone().scale(t * t * t));
				const normal = point
					.clone()
					.subVector(this.lastPointPos())
					.normalizedNormal();
				this.points.push(new Point(point, normal));
			}
			const point = p3.clone();
			const normal = point
				.clone()
				.subVector(this.lastPointPos())
				.normalizedNormal();
			this.points.push(new Point(point, normal));
			this.lastControlPoint = p2;
		}
	};

	parseQ = (segment: string) => {
		const isRelative = segment.startsWith('q');
		const args = PathTracer.getArgs(segment);
		if (args.length < 4) throw new Error('Invalid path data');
		for (let i = 0; i < args.length; i += 4) {
			const p0 = this.lastPointPos();
			const p1 = new Vector2D(args[i], args[i + 1]);
			const p2 = new Vector2D(args[i + 2], args[i + 3]);
			if (isRelative) {
				p1.addVector(this.lastPointPos());
				p2.addVector(this.lastPointPos());
			}
			const stepSize = 0.1666;
			for (let t = 0; t < 1 - stepSize; t += stepSize) {
				const point = p0
					.clone()
					.scale(t * t - 2 * t + 1)
					.addVector(p1.clone().scale(-2 * t * t + 2 * t))
					.addVector(p2.clone().scale(t * t));
				const normal = point
					.clone()
					.subVector(this.lastPointPos())
					.normalizedNormal();
				this.points.push(new Point(point, normal));
			}
			const point = p2.clone();
			const normal = point
				.clone()
				.subVector(this.lastPointPos())
				.normalizedNormal();
			this.points.push(new Point(point, normal));
			this.lastControlPoint = p1;
		}
	};

	parseT = (segment: string) => {
		const isRelative = segment.startsWith('t');
		const args = PathTracer.getArgs(segment);
		if (args.length < 2) throw new Error('Invalid path data');
		for (let i = 0; i < args.length; i += 2) {
			const p0 = this.lastPointPos();
			const p1 = this.lastControlPoint
				.clone()
				.scale(2)
				.subVector(this.lastPointPos());
			const p2 = new Vector2D(args[i], args[i + 1]);
			if (isRelative) {
				p2.addVector(this.lastPointPos());
			}
			const stepSize = 0.1666;
			for (let t = 0; t < 1 - stepSize; t += stepSize) {
				const point = p0
					.clone()
					.scale(t * t - 2 * t + 1)
					.addVector(p1.clone().scale(-2 * t * t + 2 * t))
					.addVector(p2.clone().scale(t * t));
				const normal = point
					.clone()
					.subVector(this.lastPointPos())
					.normalizedNormal();
				this.points.push(new Point(point, normal));
			}
			const point = p2.clone();
			const normal = point
				.clone()
				.subVector(this.lastPointPos())
				.normalizedNormal();
			this.points.push(new Point(point, normal));
			this.lastControlPoint = p1;
		}
	};

	parseZ = (segment: string) => {
		if (!this.points[0].position.equals(this.lastPointPos()))
			this.points.push(
				new Point(this.points[0].position.clone(), new Vector2D(0, 0))
			);
	};

	getPoints = () => {
		return this.points;
	};
}

export default PathTracer;
