import PathStyle from './PathStyle.js';
import SVGPath from './SVGPath.js';
import TransformMatrix from './TransformMatrix.js';
import { DOMParser } from 'xmldom';

class SVG {
	private paths: SVGPath[] = [];

	/**
	 * @param {string} svg - A string containing the svg or a data uri
	 **/
	constructor(
		svg: string,
		initialTransform: TransformMatrix = new TransformMatrix(),
		initialStyle: PathStyle = new PathStyle()
	) {
		let content: string;
		if (svg.startsWith('data:image/svg+xml'))
			content = Buffer.from(
				svg.substring(svg.indexOf(',') + 1),
				'base64url'
			).toString();
		else content = svg;
		const parser = new DOMParser();
		const doc = parser.parseFromString(content, 'image/svg+xml');
		if (doc.documentElement.nodeName === 'parsererror')
			throw new Error('Invalid SVG: ' + doc.documentElement.textContent);
		const svgRoot = doc.getElementsByTagName('svg')[0];
		if (!svgRoot) throw new Error('Invalid SVG: No svg element found');
		this.walkTree(svgRoot, this.paths, initialTransform, initialStyle);
	}

	private walkTree = (
		rootElement: ChildNode,
		paths: SVGPath[],
		transform: TransformMatrix,
		style: PathStyle
	) => {
		const baseTransform = transform.clone();
		const baseStyle = style.clone();

		if ((rootElement as any).hasAttribute('transform'))
			baseTransform.multiply(
				TransformMatrix.fromTransformString(
					(rootElement as any).getAttribute('transform') || ''
				)
			);
		if ((rootElement as any).hasAttribute('fill'))
			baseStyle.fill = (rootElement as any).getAttribute('fill') || 'none';
		if ((rootElement as any).hasAttribute('stroke'))
			baseStyle.stroke = (rootElement as any).getAttribute('stroke') || 'none';
		if ((rootElement as any).hasAttribute('style')) {
			const styleString = (rootElement as any).getAttribute('style') || '';
			const styleParts = styleString.split(';');
			styleParts.forEach((part: string) => {
				const [key, value] = part.split(':');
				if (key === 'fill') baseStyle.fill = value || 'none';
				if (key === 'stroke') baseStyle.stroke = value || 'none';
			});
		}

		Array.from(rootElement.childNodes).forEach((node) => {
			if ((node as any).tagName === 'path' && (node as any).hasAttribute('d')) {
				const pathTransform = baseTransform.clone();
				const pathStyle = baseStyle.clone();
				if ((node as any).hasAttribute('transform'))
					pathTransform.multiply(
						TransformMatrix.fromTransformString(
							(node as any).getAttribute('transform') || ''
						)
					);
				if ((node as any).hasAttribute('fill'))
					pathStyle.fill = (node as any).getAttribute('fill') || 'none';
				if ((node as any).hasAttribute('stroke'))
					pathStyle.stroke = (node as any).getAttribute('stroke') || 'none';
				if ((node as any).hasAttribute('style')) {
					const styleString = (node as any).getAttribute('style') || '';
					const styleParts = styleString.split(';');
					styleParts.forEach((part: string) => {
						const [key, value] = part.split(':');
						if (key === 'fill') pathStyle.fill = value || 'none';
						if (key === 'stroke') pathStyle.stroke = value || 'none';
					});
				}
				const path = new SVGPath(
					(node as any).getAttribute('d') || '',
					baseTransform,
					pathStyle
				);
				paths.push(path);
			} else if ((node as any).tagName === 'g') {
				this.walkTree(node, paths, baseTransform, style);
			}
		});
	};

	getPaths = () => {
		return this.paths;
	};
}

export default SVG;
