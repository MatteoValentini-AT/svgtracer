import SVG from './SVG.js';
import { BoundingBox, Point, Vector2D } from './Geometry.js';
import PathTracer from './PathTracer.js';

class SVGSubpath {
	public points: Point[] = [];
	public boundingBox: BoundingBox;
	public isEnclosed: boolean = false;
	root: SVG;

	constructor(
		root: SVG,
		segments: string[],
		origin: Vector2D = new Vector2D(0, 0),
		first: boolean = false
	) {
		this.root = root;
		const tracer = new PathTracer(root.traceOptions.resolution, origin);
		segments.forEach((segment) => {
			tracer.trace(segment);
		});
		this.points = tracer.points;
		this.boundingBox = tracer.boundingBox;
	}
}

export default SVGSubpath;
