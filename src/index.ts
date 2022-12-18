import SVG from './SVG.js';
import SVGGroup from './SVGGroup.js';
import SVGPath from './SVGPath.js';
import { PathStyle, Color } from './PathStyle.js';
import { DOMParser } from 'xmldom';
import { TransformMatrix } from './Geometry.js';

class TraceOptions {
	public resolution: number = 1;
	public colors: boolean = true;
	public subpaths: boolean = false;
	public transform: TransformMatrix = new TransformMatrix();
}

const traceSVG = (
	svg: string,
	options: TraceOptions = new TraceOptions()
): SVG => {
	if (!svg) throw new Error('No SVG provided');
	const parser = new DOMParser();
	if (svg.startsWith('<?xml') || svg.startsWith('<svg')) {
		const dom = parser.parseFromString(svg, 'image/svg+xml');
		if (dom.documentElement.nodeName === 'parsererror')
			throw new Error('Invalid SVG');
		return new SVG(dom, options);
	} else if (svg.startsWith('data:image/svg+xml;base64,')) {
		const dom = parser.parseFromString(
			Buffer.from(svg.substring(26), 'base64').toString(),
			'image/svg+xml'
		);
		if (dom.documentElement.nodeName === 'parsererror')
			throw new Error('Invalid SVG');
		return new SVG(dom, options);
	} else throw new Error('Invalid SVG');
};

export default traceSVG;
export { traceSVG, TraceOptions, SVG, SVGGroup, SVGPath, PathStyle, Color };
