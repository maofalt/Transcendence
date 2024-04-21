export class Vector {
	constructor(x, y, z) {
		this.x = x || 0;
		this.y = y || 0;
		this.z = z || 0;

		// calculate mag at construction bc its better en fait
		this.mag = Math.sqrt(this.x ** 2 + this.y ** 2 + this.z ** 2);
	}

	// return a copy of the vector
	copy() {
		return new Vector(this.x, this.y, this.z);
	}

	// magnitude of vector
	magnitude() {
		return Math.sqrt(this.x ** 2 + this.y ** 2 + this.z ** 2);
	}

	// add a vector to another
	add(otherVector) {
		return new Vector(
			this.x + otherVector.x,
			this.y + otherVector.y,
			this.z + otherVector.z
		);
	}

	// subtract a vector from another
	// (I thought I was smart by first implementing this as "add the vector scaled by -1"
	// and saving lines, but this would require a lot more calculations compared to
	// just writing this - other for each component.
	// This comment was useless but I'm having fun)
	sub(otherVector) {
		return new Vector(
			this.x - otherVector.x,
			this.y - otherVector.y,
			this.z - otherVector.z
		);
	}

	// scales vector by a factor
	scale(scaler) {
		return new Vector(
			this.x * scaler,
			this.y * scaler,
			this.z * scaler
		);
	}

	// rotate around the Z axis (since all the game logic is in 2D and 3D is only a
	// design choice, vectors rotations are probably only ever going to be around the Z axis)
	rotateAroundZ(angle) {
		return new Vector(
			this.x * Math.cos(angle) - this.y * Math.sin(angle),
			this.x * Math.sin(angle) + this.y * Math.cos(angle),
			0
		);
	}

	// get the direction from a point to this vector/point 
	// (this is trash af yes but my way of making it the other way around was less
	// efficient and I'm lazy I'll think about it later)
	getDirFrom(point) {
		return this.sub(point).normalize();
	}

	// calculate distance from a point to this vec/point
	getDistFrom(point) {
		return this.sub(point).magnitude();
	}

	// dot product of this vector and another one
	dotProduct(vector) {
		return (this.x * vector.x + this.y * vector.y);
	}

	// normalize vector
	normalize() {
		const mag = this.magnitude();
		// Avoid division by zero
		if (mag !== 0) {
			return new Vector(
				this.x / mag,
				this.y / mag,
				this.z / mag
			);
		}
		return new Vector();
	}
}

export function segmentsIntersect(p1, p2, p3, p4) {
	let a, b, c;

	// // console.log(`${p1.x} ${p1.y},
	// ${p2.x} ${p2.y},
	// ${p3.x} ${p3.y},
	// ${p4.x} ${p4.y}
	// `);

	a = (p4.x - p3.x) * (p2.y - p1.y) - (p4.y - p3.y) * (p2.x - p1.x);
	b = (p4.x - p3.x) * (p3.y - p1.y) - (p4.y - p3.y) * (p3.x - p1.x);
	a = (a < 0.000001 && a > -0.000001) ? 0 : a;
	b = (b < 0.000001 && b > -0.000001) ? 0 : b;

	c = Math.fround((p2.x - p1.x) * (p3.y - p1.y) - (p2.y - p1.y) * (p3.x - p1.x));
	c = (c < 0.000001 && c > -0.000001) ? 0 : c;
	
	// // console.log(`a = ${a}, b = ${b}, c = ${c}\n`);

	if (a == 0 || b == 0) {
		return (-1);
	}


	let alpha = Math.fround(b / a);
	let beta = Math.fround(c / a);

	// // console.log(`alpha = ${alpha}, beta = ${beta}\n`);

	if (alpha <= 1 && alpha >= 0 && beta <= 1 && beta >= 0) {
		return (alpha);
	}
	return (-1);
}

// module.exports = { Vector, segmentsIntersect };
// export default { Vector, 
				// segmentsIntersect };