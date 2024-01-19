class Vector {
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
			this.x *= scaler,
			this.y *= scaler,
			this.z *= scaler
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

module.exports = { Vector };