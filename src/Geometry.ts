import TransformMatrix from './TransformMatrix.js';

class Vector2D {
	constructor(public x: number, public y: number) {}

	add = (x: number, y: number): Vector2D => {
		this.x += x;
		this.y += y;
		return this;
	};

	addVector = (vector: Vector2D): Vector2D => {
		this.x += vector.x;
		this.y += vector.y;
		return this;
	};

	sub = (x: number, y: number): Vector2D => {
		this.x -= x;
		this.y -= y;
		return this;
	};

	subVector = (vector: Vector2D): Vector2D => {
		this.x -= vector.x;
		this.y -= vector.y;
		return this;
	};

	set = (x: number, y: number): Vector2D => {
		this.x = x;
		this.y = y;
		return this;
	};

	scale = (scale: number): Vector2D => {
		this.x *= scale;
		this.y *= scale;
		return this;
	};

	normalize = (): Vector2D => {
		const length = Math.sqrt(this.x * this.x + this.y * this.y);
		this.x /= length;
		this.y /= length;
		return this;
	};

	normalizedNormal = (): Vector2D => {
		const length = Math.sqrt(this.x * this.x + this.y * this.y);
		return new Vector2D(-this.y / length, this.x / length);
	};

	applyTransform = (transform: TransformMatrix): Vector2D => {
		const x =
			this.x * transform.getMatrix()[0][0] +
			this.y * transform.getMatrix()[0][1] +
			transform.getMatrix()[0][2];
		const y =
			this.x * transform.getMatrix()[1][0] +
			this.y * transform.getMatrix()[1][1] +
			transform.getMatrix()[1][2];
		this.x = x;
		this.y = y;
		return this;
	};

	equals = (vector: Vector2D): boolean => {
		return this.x === vector.x && this.y === vector.y;
	};

	clone = (): Vector2D => new Vector2D(this.x, this.y);
}

class Point {
	constructor(public position: Vector2D, public normal: Vector2D) {}

	applyTransform = (transform: TransformMatrix): Point => {
		this.position.applyTransform(transform);
		this.normal.applyTransform(transform).normalize();
		return this;
	};

	clone = (): Point => new Point(this.position.clone(), this.normal.clone());
}

class BoundingBox {
	constructor(
		public min: Vector2D = new Vector2D(Infinity, Infinity),
		public max: Vector2D = new Vector2D(-Infinity, -Infinity)
	) {}

	expand = (point: Vector2D): BoundingBox => {
		this.min.x = Math.min(this.min.x, point.x);
		this.min.y = Math.min(this.min.y, point.y);
		this.max.x = Math.max(this.max.x, point.x);
		this.max.y = Math.max(this.max.y, point.y);
		return this;
	};

	isInsideOf = (bb: BoundingBox): boolean => {
		return (
			this.min.x >= bb.min.x &&
			this.min.y >= bb.min.y &&
			this.max.x <= bb.max.x &&
			this.max.y <= bb.max.y
		);
	};
}

export { Vector2D, Point, BoundingBox };
