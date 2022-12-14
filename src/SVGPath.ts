import { BoundingBox, Vector2D } from './Geometry.js';
import PathStyle from './PathStyle.js';
import SVGPathSection from './SVGPathSection.js';
import TransformMatrix from './TransformMatrix.js';

class SVGPath {
	private transform: TransformMatrix;
	private style: PathStyle;
	private pathData: string;
	private sections: SVGPathSection[] | null = null;

	private static splitPathData = (pathData: string) => {
		const regex = /[a-zA-Z][0-9\-.,\s]*/gm;
		const matches = pathData.match(regex);
		if (!matches) throw new Error('Invalid path data');
		return matches;
	};

	constructor(pathData: string, transform: TransformMatrix, style: PathStyle) {
		this.transform = transform;
		this.style = style;
		this.pathData = pathData;
		if (!pathData || !(pathData.startsWith('M') || pathData.startsWith('m')))
			throw new Error('Invalid path data');
	}

	getSections = (): SVGPathSection[] => {
		if (this.sections) return this.sections;
		this.sections = [];
		const pathData = this.pathData.replace(/[\n\r\t]/gm, '');
		const pathDataSegments = SVGPath.splitPathData(pathData);
		const boundingBoxes: BoundingBox[] = [];
		let currentSegments: string[] = [];
		let origin = new Vector2D(0, 0);
		let first = true;
		pathDataSegments.forEach((segment) => {
			if (segment.startsWith('M') || segment.startsWith('m')) {
				if (currentSegments.length > 0) {
					const sectionSegments = currentSegments;
					const isFirst = first;
					const section = new SVGPathSection(
						origin.clone(),
						sectionSegments,
						this.transform,
						this.style,
						isFirst
					);
					first = false;
					origin = section.getEnd();
					let isInside = false;
					const bb = section.getBoundingBox();
					boundingBoxes.forEach((b) => {
						if (bb.isInsideOf(b)) isInside = true;
					});
					if (!isInside) boundingBoxes.push(bb);
					else section.fullyInside = true;
					(this.sections as SVGPathSection[]).push(section);
					currentSegments = [];
				}
				currentSegments.push(segment);
			} else currentSegments.push(segment);
		});
		if (currentSegments.length > 0) {
			const section = new SVGPathSection(
				origin.clone(),
				currentSegments,
				this.transform,
				this.style
			);
			let isInside = false;
			const bb = section.getBoundingBox();
			boundingBoxes.forEach((b) => {
				if (bb.isInsideOf(b)) isInside = true;
			});
			if (isInside) section.fullyInside = true;
			this.sections.push(section);
		}
		return this.sections;
	};

	getStrokeColor = (): string => {
		return this.style.stroke;
	};

	getFillColor = (): string | null => {
		return this.style.fill;
	};
}

export default SVGPath;
