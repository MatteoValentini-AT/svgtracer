import { TransformMatrix } from './Geometry.js';
import PathStyle, { Color } from './PathStyle.js';
import SVG from './SVG.js';
import SVGPath from './SVGPath.js';

class SVGGroup {
	public children: (SVGPath | SVGGroup)[] = [];
	public style: PathStyle;
	public transform: TransformMatrix;
	root: SVG;

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
		Array.from(node.childNodes).forEach((node) => {
			if (node.nodeName === 'g') {
				this.children.push(new SVGGroup(this.root, node, style, transform));
			} else if (node.nodeName === 'path') {
				this.children.push(new SVGPath(this.root, node, style, transform));
			}
		});
	}
}

export default SVGGroup;
