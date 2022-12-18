import SVGPath from './SVGPath.js';
import SVGGroup from './SVGGroup.js';
import PathStyle from './PathStyle.js';
import { TraceOptions } from './index.js';
import { Rectangle } from './Geometry.js';

class SVG {
	public children: (SVGPath | SVGGroup)[] = [];
	public styles: Map<string, PathStyle> = new Map();
	public viewBox: Rectangle = new Rectangle(0, 0, 0, 0);
	traceOptions: TraceOptions;

	constructor(dom: Document, traceOptions: TraceOptions) {
		this.traceOptions = traceOptions;
		this.traceOptions.resolution = Math.pow(2, this.traceOptions.resolution);
		const svg = dom.getElementsByTagName('svg')[0];
		if (!svg) throw new Error('Invalid SVG');
		const viewBox = svg.getAttribute('viewBox');
		if (viewBox) {
			const [x, y, width, height] = viewBox
				.split(' ')
				.map((v) => parseFloat(v));
			this.viewBox = new Rectangle(x, y, width, height);
		}
		Array.from(svg.childNodes).forEach((node) => {
			if (node.nodeName === 'g') {
				this.children.push(
					new SVGGroup(this, node, new PathStyle(), traceOptions.transform)
				);
			} else if (node.nodeName === 'path') {
				this.children.push(
					new SVGPath(this, node, new PathStyle(), traceOptions.transform)
				);
			}
		});
	}

	private walkTree(
		node: SVG | SVGPath | SVGGroup,
		callback: (node: SVG | SVGPath | SVGGroup) => void
	) {
		if (node instanceof SVGGroup || node instanceof SVG) {
			node.children.forEach((child) => {
				this.walkTree(child, callback);
			});
		}
		if (node instanceof SVGPath) {
			callback(node);
		}
	}

	getAllPaths(): SVGPath[] {
		const paths: SVGPath[] = [];
		this.walkTree(this, (node) => {
			paths.push(node as SVGPath);
		});
		return paths;
	}
}

export default SVG;
