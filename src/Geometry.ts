class Vector2D {
	public x: number;
	public y: number;

	constructor(x: number | Vector2D, y?: number) {
		if (x instanceof Vector2D) {
			this.x = x.x;
			this.y = x.y;
		} else {
			this.x = x;
			this.y = y ? y : x;
		}
	}

	add = (x: number | Vector2D, y?: number): Vector2D => {
		if (x instanceof Vector2D) return new Vector2D(this.x + x.x, this.y + x.y);
		else return new Vector2D(this.x + x, this.y + (y ? y : x));
	};

	subtract = (x: number | Vector2D, y?: number): Vector2D => {
		if (x instanceof Vector2D) return new Vector2D(this.x - x.x, this.y - x.y);
		else return new Vector2D(this.x - x, this.y - (y ? y : x));
	};

	multiply = (scale: number): Vector2D => {
		return new Vector2D(this.x * scale, this.y * scale);
	};

	length = (): number => {
		return Math.sqrt(this.x * this.x + this.y * this.y);
	};

	normalize = (): Vector2D => {
		return this.multiply(1 / this.length());
	};

	dot = (x: number | Vector2D, y?: number): number => {
		if (x instanceof Vector2D) return this.x * x.x + this.y * x.y;
		else return this.x * x + this.y * (y ? y : x);
	};

	normalVector = (): Vector2D => {
		return new Vector2D(-this.y, this.x);
	};

	equals = (v: Vector2D): boolean => {
		return this.x === v.x && this.y === v.y;
	};
}

class Point {
	public position: Vector2D;
	public normal: Vector2D;

	constructor(position: Vector2D, normal: Vector2D) {
		this.position = position;
		this.normal = normal;
	}
}

class Rectangle {
	public position: Vector2D;
	public size: Vector2D;

	constructor(
		fromX: Vector2D | number,
		fromY: Vector2D | number,
		toX?: number,
		toY?: number
	) {
		if (fromX instanceof Vector2D && fromY instanceof Vector2D) {
			this.position = fromX;
			this.size = fromY.subtract(fromX);
		} else {
			this.position = new Vector2D(fromX as number, fromY as number);
			this.size = new Vector2D(toX as number, toY as number);
		}
	}
}

class BoundingBox {
	public min: Vector2D = new Vector2D(Infinity, Infinity);
	public max: Vector2D = new Vector2D(-Infinity, -Infinity);

	expand = (point: Vector2D): void => {
		this.min.x = Math.min(this.min.x, point.x);
		this.min.y = Math.min(this.min.y, point.y);
		this.max.x = Math.max(this.max.x, point.x);
		this.max.y = Math.max(this.max.y, point.y);
	};

	isInsideOf = (boundingBox: BoundingBox): boolean => {
		return (
			this.min.x >= boundingBox.min.x &&
			this.min.y >= boundingBox.min.y &&
			this.max.x <= boundingBox.max.x &&
			this.max.y <= boundingBox.max.y
		);
	};
}

// | a c e |
// | b d f |
class TransformMatrix {
	public a: number;
	public b: number;
	public c: number;
	public d: number;
	public e: number;
	public f: number;

	constructor(
		a: number | TransformMatrix | undefined = undefined,
		b: number | undefined = undefined,
		c: number | undefined = undefined,
		d: number | undefined = undefined,
		e: number | undefined = undefined,
		f: number | undefined = undefined
	) {
		if (a instanceof TransformMatrix) {
			this.a = a.a;
			this.b = a.b;
			this.c = a.c;
			this.d = a.d;
			this.e = a.e;
			this.f = a.f;
		} else if (a !== undefined) {
			this.a = a;
			this.b = b ? b : 0;
			this.c = c ? c : 0;
			this.d = d ? d : a;
			this.e = e ? e : 0;
			this.f = f ? f : 0;
		} else {
			this.a = 1;
			this.b = 0;
			this.c = 0;
			this.d = 1;
			this.e = 0;
			this.f = 0;
		}
	}

	apply = (x: number | Vector2D, y?: number): Vector2D => {
		if (x instanceof Vector2D)
			return new Vector2D(
				this.a * x.x + this.c * x.y + this.e,
				this.b * x.x + this.d * x.y + this.f
			);
		else
			return new Vector2D(
				this.a * x + this.c * (y ? y : x) + this.e,
				this.b * x + this.d * (y ? y : x) + this.f
			);
	};

	translate = (x: number | Vector2D, y?: number): TransformMatrix => {
		if (x instanceof Vector2D)
			return new TransformMatrix(
				this.a,
				this.b,
				this.c,
				this.d,
				this.e + x.x,
				this.f + x.y
			);
		else
			return new TransformMatrix(
				this.a,
				this.b,
				this.c,
				this.d,
				this.e + x,
				this.f + (y ? y : x)
			);
	};
}

export { Vector2D, Point, Rectangle, BoundingBox, TransformMatrix };
