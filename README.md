# Description

svgtracer is a package to trace SVG paths into a list of points. It is intended to be used with typescript and is compatible with node.js and the browser.

# Installation

```bash
npm install svgtracer
```

or

```bash
yarn add svgtracer
```

# Usage

```typescript
import traceSVG from 'svgtracer';

const svg = traceSVG('<file content or data uri>');
svg.forEach((path) => {
	path.forEach((point) => {
		console.log(point.position.x, point.position.y);
	});
});
```

# Functions and classes

## traceSVG

```typescript
traceSVG(svg: string, options?: TraceOptions): SVG;
```

Returns an SVG object containing the traced paths and groups in the original hierarchy.
| **Parameter** | **Description** |
|---------------|---------------------------------------------------|
| svg | contents of the svg in text form or data uri form |
| options? | options for the svg tracer, see below |

## TraceOptions

```typescript
class TraceOptions {
	resolution: number;
	colors: boolean;
	subpaths: boolean;
	transform: TransformMatrix;
}
```

| **Field**  | **Default value** | **Description**                                                                  |
| ---------- | ----------------- | -------------------------------------------------------------------------------- |
| resolution | 1                 | resolution of curves, higher is more accurate.                                   |
| colors     | true              | whether to include colors.                                                       |
| subpaths   | true              | whether to split paths into subpaths (a new subpath starts with a move command). |
| transform  | identity          | transformation matrix to apply to the svg.                                       |

## SVG

```typescript
class SVG {
	public children: (SVGPath | SVGGroup)[];
	public getAllPaths(): SVGPath[];
}
```

| **Field / Function** | **Description**                                           |
| -------------------- | --------------------------------------------------------- |
| children             | Array containing all direct children of the root element. |
| getAllPaths()        | Returns an array of all paths in the svg.                 |

## SVGGroup

```typescript
class SVGGroup {
	public children: (SVGPath | SVGGroup)[];
}
```

| **Field** | **Description**                                       |
| --------- | ----------------------------------------------------- |
| children  | Array containing all direct children of this element. |

## SVGPath

```typescript
class SVGPath {
	public points: Point[];
	public boundingBox?: BoundingBox;
	public style: PathStyle;
	public subpaths: SVGSubpath[];
}
```

| **Field**   | **Description**                                                             |
| ----------- | --------------------------------------------------------------------------- |
| points      | Array containing all points of the path. Empty, if subpaths are enabled.    |
| boundingBox | Bounding box of the path. undefined if subpaths are enabled.                |
| style       | Style element of the path.                                                  |
| subpaths    | Array containing all subpaths of the path. Empty, if subpaths are disabled. |

## SVGSubpath

```typescript
class SVGSubpath {
	public points: Point[];
	public boundingBox: BoundingBox;
}
```

| **Field**   | **Description**                         |
| ----------- | --------------------------------------- |
| points      | Array containing all points of the path |
| boundingBox | Bounding box of the path.               |

## Point

```typescript
class Point {
	public position: Vector2D;
	public normal: Vector2D;
}
```

| **Field** | **Description**             |
| --------- | --------------------------- |
| position  | Position of the point.      |
| normal    | Normal vector of the point. |

## PathStyle

```typescript
class PathStyle {
	public fill?: Color;
	public stroke?: Color;
	public strokeWidth?: number;
}
```

| **Field**    | **Description**                                            |
| ------------ | ---------------------------------------------------------- |
| fill?        | Fill color of the path. White if the path is not filled.   |
| stroke?      | Stroke color of the path. White if the path is not filled. |
| strokeWidth? | Stroke width of the path. Defaults to 1 if not specified.  |

## Color

```typescript
class Color {
	public r: number;
	public g: number;
	public b: number;
	public a: number;
}
```

| **Field** | **Description**       |
| --------- | --------------------- |
| r         | Red channel (0-255)   |
| g         | Green channel (0-255) |
| b         | Blue channel (0-255)  |
| a         | Alpha channel (0-255) |
