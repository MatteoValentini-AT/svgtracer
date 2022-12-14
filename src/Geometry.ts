import TransformMatrix from './TransformMatrix';

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
			this.y * transform.getMatrix()[1][0] +
			transform.getMatrix()[2][0];
		const y =
			this.x * transform.getMatrix()[0][1] +
			this.y * transform.getMatrix()[1][1] +
			transform.getMatrix()[2][1];
		this.x = x;
		this.y = y;
		return this;
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

export { Vector2D, Point };
