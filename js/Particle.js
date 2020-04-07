class Particle {
	constructor(x, y, options) {
		this.position = createVector(x, y);
		this.velocity = createVector(
			random(-options.maxVelocity, options.maxVelocity),
			random(-options.maxVelocity, options.maxVelocity)
		);

		this.blast = options.blast || false;

		this.normalisedVelocity = p5.Vector.random2D().setMag(options.maxVelocity);
		this.anotherPosition = this.position.copy();

		this.radius = options.radius;
		this.color = options.color;
		this.timeToLive = options.timeToLive || 255;

		this.gravity = options.gravity || createVector(0, 0.25);
	}

	show() {
		noStroke();
		let c = color(this.color);
		c.setAlpha(this.timeToLive);
		fill(c);

		if (this.blast) {
			ellipse(this.anotherPosition.x, this.anotherPosition.y, this.radius);
		}
		ellipse(this.position.x, this.position.y, this.radius);
	}

	update() {
		this.position.add(this.velocity);
		this.velocity.add(this.gravity);

		this.anotherPosition.add(this.normalisedVelocity);

		this.timeToLive -= 1;
	}

	removeAfterLifeCompletes(array, index) {
		if (this.timeToLive == 0) {
			array.splice(index, 1);
		}
	}
}
