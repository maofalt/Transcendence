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

	// scale vector by a factor
	scale(scaler) {
		return new Vector(
			this.x *= scaler,
			this.y *= scaler,
			this.z *= scaler
		);
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