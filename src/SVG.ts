import PathStyle from './PathStyle';
import SVGPath from './SVGPath';
import TransformMatrix from './TransformMatrix';

class SVG {
	private paths: SVGPath[] = [];

	/**
	 * @param {string} svg - A string containing the svg or a data uri
	 **/
	constructor(svg: string) {
		let content: string;
		if (svg.startsWith('data:image/svg+xml'))
			content = atob(svg.substring(svg.indexOf(',') + 1));
		else if (svg.startsWith('<xml')) content = svg;
		else
			throw new Error(
				'Invalid SVG: SVG must be a data uri or a string containing the svg'
			);
		const parser = new DOMParser();
		const doc = parser.parseFromString(content, 'image/svg+xml');
		if (doc.documentElement.nodeName === 'parsererror')
			throw new Error('Invalid SVG: ' + doc.documentElement.textContent);
		const svgRoot = doc.getElementsByTagName('svg')[0];
		if (!svgRoot) throw new Error('Invalid SVG: No svg element found');
		this.paths = this.walkTree(
			svgRoot,
			[],
			new TransformMatrix(),
			new PathStyle()
		);
	}

	private walkTree = (
		rootElement: SVGGElement | SVGSVGElement,
		paths: SVGPath[],
		transform: TransformMatrix,
		style: PathStyle
	): SVGPath[] => {
		const baseTransform = transform.clone();
		if (rootElement.hasAttribute('transform'))
			baseTransform.multiply(
				TransformMatrix.fromTransformString(
					rootElement.getAttribute('transform') || ''
				)
			);
		rootElement.childNodes.forEach((node) => {
			if (node instanceof SVGPathElement && node.hasAttribute('d')) {
				const pathTransform = baseTransform.clone();
				if (node.hasAttribute('transform'))
					pathTransform.multiply(
						TransformMatrix.fromTransformString(
							node.getAttribute('transform') || ''
						)
					);
				const path = new SVGPath(
					node.getAttribute('d') || '',
					baseTransform,
					style
				);
				paths.push(path);
			} else if (node instanceof SVGGElement) {
				paths.push(...this.walkTree(node, paths, baseTransform, style));
			}
		});
		return paths;
	};

	getPaths = () => {
		return this.paths;
	};
}

export default SVG;
