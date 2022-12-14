import { Vector2D } from './Geometry';
import PathStyle from './PathStyle';
import SVGPathSection from './SVGPathSection';
import TransformMatrix from './TransformMatrix';

class SVGPath {
	private transform: TransformMatrix;
	private style: PathStyle;
	private sections: SVGPathSection[] = [];

	private static splitPathData = (pathData: string) => {
		const regex = /[a-zA-Z][0-9\-.\s]*/gm;
		const matches = pathData.match(regex);
		if (!matches) throw new Error('Invalid path data');
		return matches;
	};

	constructor(pathData: string, transform: TransformMatrix, style: PathStyle) {
		this.transform = transform;
		this.style = style;
		if (!pathData || !(pathData.startsWith('M') || pathData.startsWith('m')))
			throw new Error('Invalid path data');
		const pathDataSegments = SVGPath.splitPathData(pathData);
		let currentSegments: string[] = [];
		let origin = new Vector2D(0, 0);
		pathDataSegments.forEach((segment) => {
			if (segment.startsWith('M') || segment.startsWith('m')) {
				if (currentSegments.length > 0) {
					const sectionSegments = currentSegments;
					const section = new SVGPathSection(
						origin.clone(),
						sectionSegments,
						this.transform,
						this.style
					);
					origin = section.getEnd().position;
					this.sections.push(section);
					currentSegments = [];
				}
				currentSegments.push(segment);
			} else currentSegments.push(segment);
		});
		if (currentSegments.length > 0)
			this.sections.push(
				new SVGPathSection(
					origin.clone(),
					currentSegments,
					this.transform,
					this.style
				)
			);
	}

	getSections = () => {
		return this.sections;
	};
}

export default SVGPath;
