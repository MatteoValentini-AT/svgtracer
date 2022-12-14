import { BoundingBox, Point, Vector2D } from './Geometry.js';
import PathStyle from './PathStyle.js';
import PathTracer from './PathTracer.js';
import TransformMatrix from './TransformMatrix.js';

class SVGPathSection {
	private transform: TransformMatrix;
	private style: PathStyle;
	private points: Point[] = [];
	private isFirst: boolean;
	private filled: boolean;
	fullyInside = false;

	constructor(
		origin: Vector2D,
		segments: string[],
		transform: TransformMatrix,
		style: PathStyle,
		isFirst: boolean = false
	) {
		this.transform = transform;
		this.style = style;
		this.trace(origin, segments);
		this.filled = segments[segments.length - 1].toLowerCase()[0] === 'z';
		this.isFirst = isFirst;
	}

	private trace = (origin: Vector2D, segments: string[]) => {
		const tracer = new PathTracer(origin);
		segments.forEach((segment) => {
			switch (segment[0]) {
				case 'M':
				case 'm':
					tracer.parseM(segment, this.isFirst);
					break;
				case 'L':
				case 'l':
					tracer.parseL(segment);
					break;
				case 'H':
				case 'h':
					tracer.parseH(segment);
					break;
				case 'V':
				case 'v':
					tracer.parseV(segment);
					break;
				case 'C':
				case 'c':
					tracer.parseC(segment);
					break;
				case 'S':
				case 's':
					tracer.parseS(segment);
					break;
				case 'Q':
				case 'q':
					tracer.parseQ(segment);
					break;
				case 'T':
				case 't':
					tracer.parseT(segment);
					break;
			}
		});
		this.points = tracer.getPoints();
	};

	getEnd = (): Vector2D => {
		return this.points[this.points.length - 1].position.clone();
	};

	getBoundingBox = (): BoundingBox => {
		const bb = new BoundingBox();
		this.points.forEach((point) => {
			bb.expand(point.position);
		});
		return bb;
	};

	getPoints = (): Point[] => {
		return this.points.map((point) =>
			point.clone().applyTransform(this.transform)
		);
	};

	getStrokeColor = (): string => {
		return this.style.stroke;
	};

	getFillColor = (): string => {
		return this.filled ? this.style.fill : 'none';
	};

	isFullyInside = (): boolean => {
		return this.fullyInside;
	};
}

export default SVGPathSection;
