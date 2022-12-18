import { Vector2D, Point, BoundingBox } from './Geometry.js';

const INITIAL_STEP_SIZE = 25;
class PathTracer {
	public points: Point[] = [];
	public boundingBox: BoundingBox = new BoundingBox();
	lastPos: Vector2D = new Vector2D(0, 0);
	lastControlPoint: Vector2D = new Vector2D(0, 0);
	resolution: number;
	origin: Vector2D;
	first: boolean;

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

	constructor(
		resolution: number,
		origin: Vector2D = new Vector2D(0, 0),
		first: boolean = false
	) {
		this.resolution = resolution;
		this.origin = origin;
		this.first = first;
	}

	trace = (segment: string) => {
		segment = segment.trim();
		const command = segment[0];
		if (command == 'm') this.tracem(PathTracer.getArgs(segment));
		else if (command == 'M') this.traceM(PathTracer.getArgs(segment));
		else if (command == 'l') this.tracel(PathTracer.getArgs(segment));
		else if (command == 'L') this.traceL(PathTracer.getArgs(segment));
		else if (command == 'h') this.traceh(PathTracer.getArgs(segment));
		else if (command == 'H') this.traceH(PathTracer.getArgs(segment));
		else if (command == 'v') this.tracev(PathTracer.getArgs(segment));
		else if (command == 'V') this.traceV(PathTracer.getArgs(segment));
		else if (command == 'c') this.tracec(PathTracer.getArgs(segment));
		else if (command == 'C') this.traceC(PathTracer.getArgs(segment));
		else if (command == 's') this.traces(PathTracer.getArgs(segment));
		else if (command == 'S') this.traceS(PathTracer.getArgs(segment));
		else if (command == 'q') this.traceq(PathTracer.getArgs(segment));
		else if (command == 'Q') this.traceQ(PathTracer.getArgs(segment));
		else if (command == 't') this.tracet(PathTracer.getArgs(segment));
		else if (command == 'T') this.traceT(PathTracer.getArgs(segment));
		else if (command == 'a') this.tracea(PathTracer.getArgs(segment));
		else if (command == 'A') this.traceA(PathTracer.getArgs(segment));
		else if (command == 'z' || command == 'Z') this.traceZ();
		else throw new Error(`Invalid command: ${command}`);
	};

	private addPoint(pos: Vector2D) {
		if (this.points.length == 0) {
			this.points.push(new Point(pos, new Vector2D(0, 0)));
			this.lastControlPoint = pos;
		} else {
			this.points.push(
				new Point(pos, pos.subtract(this.lastPos).normalize().normalVector())
			);
		}
		this.lastPos = pos;
		this.boundingBox.expand(pos);
	}

	private tracem(args: number[]) {
		if (args.length % 2 !== 0) throw new Error('[m] Invalid arguments');
		if (this.first && this.points.length == 0) {
			this.addPoint(this.origin);
			for (let i = 2; i < args.length; i += 2) {
				this.addPoint(this.lastPos.add(new Vector2D(args[i], args[i + 1])));
			}
		} else {
			for (let i = 0; i < args.length; i += 2) {
				this.addPoint(this.lastPos.add(new Vector2D(args[i], args[i + 1])));
			}
		}
	}

	private traceM(args: number[]) {
		if (args.length % 2 !== 0) throw new Error('[M] Invalid arguments');
		for (let i = 0; i < args.length; i += 2) {
			this.addPoint(new Vector2D(args[i], args[i + 1]));
		}
	}

	private tracel(args: number[]) {
		if (args.length % 2 !== 0) throw new Error('[l] Invalid arguments');
		for (let i = 0; i < args.length; i += 2) {
			this.addPoint(this.lastPos.add(new Vector2D(args[i], args[i + 1])));
		}
	}

	private traceL(args: number[]) {
		if (args.length % 2 !== 0) throw new Error('[L] Invalid arguments');
		for (let i = 0; i < args.length; i += 2) {
			this.addPoint(new Vector2D(args[i], args[i + 1]));
		}
	}

	private traceh(args: number[]) {
		for (let i = 0; i < args.length; i++) {
			this.addPoint(this.lastPos.add(new Vector2D(args[i], 0)));
		}
	}

	private traceH(args: number[]) {
		for (let i = 0; i < args.length; i++) {
			this.addPoint(new Vector2D(args[i], this.lastPos.y));
		}
	}

	private tracev(args: number[]) {
		for (let i = 0; i < args.length; i++) {
			this.addPoint(this.lastPos.add(new Vector2D(0, args[i])));
		}
	}

	private traceV(args: number[]) {
		for (let i = 0; i < args.length; i++) {
			this.addPoint(new Vector2D(this.lastPos.x, args[i]));
		}
	}

	private traceq(args: number[]) {
		if (args.length % 4 !== 0) throw new Error('[q] Invalid arguments');
		for (let i = 0; i < args.length; i += 4) {
			const p0 = this.lastPos;
			const p1 = p0.add(new Vector2D(args[i], args[i + 1]));
			const p2 = p0.add(new Vector2D(args[i + 2], args[i + 3]));
			const stepSize =
				INITIAL_STEP_SIZE / (p2.subtract(p0).length() * this.resolution);
			for (let t = stepSize; t <= 1 - stepSize; t += stepSize) {
				const p = p0
					.multiply(Math.pow(1 - t, 2))
					.add(p1.multiply(2 * t * (1 - t)))
					.add(p2.multiply(Math.pow(t, 2)));
				this.addPoint(p);
			}
			this.addPoint(p2);
			this.lastControlPoint = p1;
		}
	}

	private traceQ(args: number[]) {
		if (args.length % 4 !== 0) throw new Error('[Q] Invalid arguments');
		for (let i = 0; i < args.length; i += 4) {
			const p0 = this.lastPos;
			const p1 = new Vector2D(args[i], args[i + 1]);
			const p2 = new Vector2D(args[i + 2], args[i + 3]);
			const stepSize =
				INITIAL_STEP_SIZE / (p2.subtract(p0).length() * this.resolution);
			for (let t = stepSize; t <= 1 - stepSize; t += stepSize) {
				const p = p0
					.multiply(Math.pow(1 - t, 2))
					.add(p1.multiply(2 * t * (1 - t)))
					.add(p2.multiply(Math.pow(t, 2)));
				this.addPoint(p);
			}
			this.addPoint(p2);
			this.lastControlPoint = p1;
		}
	}

	private tracet(args: number[]) {
		if (args.length % 2 !== 0) throw new Error('[q] Invalid arguments');
		for (let i = 0; i < args.length; i += 2) {
			const p0 = this.lastPos;
			const p1 = p0.add(p0.subtract(this.lastControlPoint));
			const p2 = p0.add(new Vector2D(args[i], args[i + 1]));
			const stepSize =
				INITIAL_STEP_SIZE / (p2.subtract(p0).length() * this.resolution);
			for (let t = stepSize; t <= 1 - stepSize; t += stepSize) {
				const p = p0
					.multiply(Math.pow(1 - t, 2))
					.add(p1.multiply(2 * t * (1 - t)))
					.add(p2.multiply(Math.pow(t, 2)));
				this.addPoint(p);
			}
			this.addPoint(p2);
			this.lastControlPoint = p1;
		}
	}

	private traceT(args: number[]) {
		if (args.length % 2 !== 0) throw new Error('[T] Invalid arguments');
		for (let i = 0; i < args.length; i += 2) {
			const p0 = this.lastPos;
			const p1 = p0.add(p0.subtract(this.lastControlPoint));
			const p2 = new Vector2D(args[i], args[i + 1]);
			const stepSize =
				INITIAL_STEP_SIZE / (p2.subtract(p0).length() * this.resolution);
			for (let t = stepSize; t <= 1 - stepSize; t += stepSize) {
				const p = p0
					.multiply(Math.pow(1 - t, 2))
					.add(p1.multiply(2 * t * (1 - t)))
					.add(p2.multiply(Math.pow(t, 2)));
				this.addPoint(p);
			}
			this.addPoint(p2);
			this.lastControlPoint = p1;
		}
	}

	private tracec(args: number[]) {
		if (args.length % 6 !== 0) throw new Error('[c] Invalid arguments');
		for (let i = 0; i < args.length; i += 6) {
			const p0 = this.lastPos;
			const p1 = p0.add(new Vector2D(args[i], args[i + 1]));
			const p2 = p0.add(new Vector2D(args[i + 2], args[i + 3]));
			const p3 = p0.add(new Vector2D(args[i + 4], args[i + 5]));
			const stepSize =
				INITIAL_STEP_SIZE / (p3.subtract(p0).length() * this.resolution);
			for (let t = stepSize; t <= 1 - stepSize; t += stepSize) {
				const p = p0
					.multiply(Math.pow(1 - t, 3))
					.add(p1.multiply(3 * t * Math.pow(1 - t, 2)))
					.add(p2.multiply(3 * Math.pow(t, 2) * (1 - t)))
					.add(p3.multiply(Math.pow(t, 3)));
				this.addPoint(p);
			}
			this.addPoint(p3);
			this.lastControlPoint = p2;
		}
	}

	private traceC(args: number[]) {
		if (args.length % 6 !== 0) throw new Error('[C] Invalid arguments');
		for (let i = 0; i < args.length; i += 6) {
			const p0 = this.lastPos;
			const p1 = new Vector2D(args[i], args[i + 1]);
			const p2 = new Vector2D(args[i + 2], args[i + 3]);
			const p3 = new Vector2D(args[i + 4], args[i + 5]);
			const stepSize =
				INITIAL_STEP_SIZE / (p3.subtract(p0).length() * this.resolution);
			for (let t = stepSize; t <= 1 - stepSize; t += stepSize) {
				const p = p0
					.multiply(Math.pow(1 - t, 3))
					.add(p1.multiply(3 * t * Math.pow(1 - t, 2)))
					.add(p2.multiply(3 * Math.pow(t, 2) * (1 - t)))
					.add(p3.multiply(Math.pow(t, 3)));
				this.addPoint(p);
			}
			this.addPoint(p3);
			this.lastControlPoint = p2;
		}
	}

	private traces(args: number[]) {
		if (args.length % 4 !== 0) throw new Error('[s] Invalid arguments');
		for (let i = 0; i < args.length; i += 4) {
			const p0 = this.lastPos;
			const p1 = p0.add(p0.subtract(this.lastControlPoint));
			const p2 = p0.add(new Vector2D(args[i], args[i + 1]));
			const p3 = p0.add(new Vector2D(args[i + 2], args[i + 3]));
			const stepSize =
				INITIAL_STEP_SIZE / (p3.subtract(p0).length() * this.resolution);
			for (let t = stepSize; t <= 1 - stepSize; t += stepSize) {
				const p = p0
					.multiply(Math.pow(1 - t, 3))
					.add(p1.multiply(3 * t * Math.pow(1 - t, 2)))
					.add(p2.multiply(3 * Math.pow(t, 2) * (1 - t)))
					.add(p3.multiply(Math.pow(t, 3)));
				this.addPoint(p);
			}
			this.addPoint(p3);
			this.lastControlPoint = p2;
		}
	}

	private traceS(args: number[]) {
		if (args.length % 4 !== 0) throw new Error('[S] Invalid arguments');
		for (let i = 0; i < args.length; i += 4) {
			const p0 = this.lastPos;
			const p1 = p0.add(p0.subtract(this.lastControlPoint));
			const p2 = new Vector2D(args[i], args[i + 1]);
			const p3 = new Vector2D(args[i + 2], args[i + 3]);
			const stepSize =
				INITIAL_STEP_SIZE / (p3.subtract(p0).length() * this.resolution);
			for (let t = stepSize; t <= 1 - stepSize; t += stepSize) {
				const p = p0
					.multiply(Math.pow(1 - t, 3))
					.add(p1.multiply(3 * t * Math.pow(1 - t, 2)))
					.add(p2.multiply(3 * Math.pow(t, 2) * (1 - t)))
					.add(p3.multiply(Math.pow(t, 3)));
				this.addPoint(p);
			}
			this.addPoint(p3);
			this.lastControlPoint = p2;
		}
	}

	private tracea(args: number[]) {
		throw new Error('[a] Not implemented');
	}

	private traceA(args: number[]) {
		throw new Error('[A] Not implemented');
	}

	private traceZ() {
		if (this.lastPos.equals(this.points[0].position)) return;
		this.addPoint(this.points[0].position);
		this.points[0].normal = new Vector2D(
			this.points[this.points.length - 1].normal
		);
	}
}

export default PathTracer;
