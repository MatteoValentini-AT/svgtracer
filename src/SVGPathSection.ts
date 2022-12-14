import { Point, Vector2D } from './Geometry';
import PathStyle from './PathStyle';
import PathTracer from './PathTracer';
import TransformMatrix from './TransformMatrix';

class SVGPathSection {
	private transform: TransformMatrix;
	private style: PathStyle;
	private points: Point[] = [];
	private filled: boolean;

	constructor(
		origin: Vector2D,
		segments: string[],
		transform: TransformMatrix,
		style: PathStyle
	) {
		this.transform = transform;
		this.style = style;
		this.trace(origin, segments);
		this.filled = segments[segments.length - 1].toLowerCase()[0] === 'z';
	}

	private trace = (origin: Vector2D, segments: string[]) => {
		const tracer = new PathTracer(origin);
		segments.forEach((segment) => {
			switch (segment[0]) {
				case 'M':
				case 'm':
					tracer.parseM(segment);
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

	getEnd = (): Point => {
		return this.points[this.points.length - 1].clone();
	};

	getPoints = (): Point[] => {
		return this.points.map((point) =>
			point.clone().applyTransform(this.transform)
		);
	};

	getStrokeColor = (): string => {
		return this.style.stroke;
	};

	getFillColor = (): string | null => {
		return this.filled ? this.style.fill : null;
	};
}

export default SVGPathSection;
