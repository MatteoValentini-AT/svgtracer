import SVG from './SVG.js';
import { BoundingBox, Point, TransformMatrix, Vector2D } from './Geometry.js';
import PathStyle, { Color } from './PathStyle.js';
import SVGSubpath from './SVGSubpath.js';
import PathTracer from './PathTracer.js';

class SVGPath {
	public subpaths: SVGSubpath[] = [];
	public points: Point[] = [];
	public boundingBox?: BoundingBox;
	public style: PathStyle;
	public transform: TransformMatrix;
	root: SVG;

	private static splitPathData = (pathData: string) => {
		const regex = /[a-zA-Z][0-9\-.,\s]*/gm;
		const matches = pathData.match(regex);
		if (!matches) throw new Error('Invalid path data');
		return matches;
	};

	constructor(
		root: SVG,
		node: Node,
		style?: PathStyle,
		transform?: TransformMatrix
	) {
		this.root = root;
		this.style = new PathStyle(style);
		this.transform = new TransformMatrix(transform);
		if ((node as any).hasAttribute('fill'))
			this.style.fill = new Color((node as any).getAttribute('fill'));
		if ((node as any).hasAttribute('stroke'))
			this.style.stroke = new Color((node as any).getAttribute('stroke'));
		if ((node as any).hasAttribute('stroke-width'))
			this.style.strokeWidth = parseFloat(
				(node as any).getAttribute('stroke-width')
			);
		if (!(node as any).hasAttribute('d')) return;
		const pathData = SVGPath.splitPathData((node as any).getAttribute('d'));
		if (root.traceOptions.subpaths) this.splitSubpaths(pathData);
		else {
			const tracer = new PathTracer(
				root.traceOptions.resolution,
				new Vector2D(0, 0),
				true
			);
			pathData.forEach((segment) => {
				tracer.trace(segment);
			});
			this.points = tracer.points.map((point) => {
				return new Point(
					this.transform.apply(point.position),
					this.transform.apply(point.normal)
				);
			});
			this.boundingBox = tracer.boundingBox;
		}
	}

	private splitSubpaths = (segments: string[]) => {
		let currentSegments: string[] = [];
		let boundingBoxes: BoundingBox[] = [];
		segments.forEach((segment) => {
			if (segment[0].toLowerCase().startsWith('m')) {
				if (currentSegments.length > 0) {
					const subpath = new SVGSubpath(
						this.root,
						currentSegments,
						new Vector2D(0, 0),
						this.subpaths.length == 0
					);
					for (const boundingBox of boundingBoxes) {
						if (subpath.boundingBox.isInsideOf(boundingBox)) {
							subpath.isEnclosed = true;
							break;
						}
					}
					if (!subpath.isEnclosed) boundingBoxes.push(subpath.boundingBox);
					subpath.points = subpath.points.map((point) => {
						return new Point(
							this.transform.apply(point.position),
							this.transform.apply(point.normal)
						);
					});
					this.subpaths.push(subpath);
					currentSegments = [];
				}
			}
			currentSegments.push(segment);
		});
		if (currentSegments.length > 0) {
			const subpath = new SVGSubpath(
				this.root,
				currentSegments,
				new Vector2D(0, 0),
				this.subpaths.length == 0
			);
			for (const boundingBox of boundingBoxes) {
				if (subpath.boundingBox.isInsideOf(boundingBox)) {
					subpath.isEnclosed = true;
					break;
				}
			}
			subpath.points = subpath.points.map((point) => {
				return new Point(
					this.transform.apply(point.position),
					this.transform.apply(point.normal)
				);
			});
			this.subpaths.push(subpath);
		}
	};
}

export default SVGPath;
