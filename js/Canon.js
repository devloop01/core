class Canon {
	constructor(x, y, options) {
		this.position = createVector(x, y);
		this.radius = options.radius;
		this.color = options.color;
		this.particlesArray = options.particlesArray;
		this.scaleY = 1;
		this.state = {
			shooting: true,
			reloading: false,
		};
		this.powerUps = {
			machineGun: false,
			doubleCanon: false,
		};
		this.canonWidth = 10;
		this.canonHeight = this.radius;
		this.angleToLook = createVector(0, 0);
	}

	show() {
		push();

		translate(this.position.x, this.position.y);
		rotate(this.angleToLook);
		scale(1, this.scaleY);

		noStroke();

		fill(this.color);
		rect(-this.canonWidth / 2, this.radius / 8, this.canonWidth, this.canonHeight);
		if (this.state.shooting) fill("#67f3da");
		if (this.state.reloading) fill("#ff0000");
		rect(-this.canonWidth / 2, this.radius, this.canonWidth, this.canonHeight / 8);

		if (this.powerUps.doubleCanon) {
			fill(this.color);
			rect(-this.canonWidth / 2, -this.radius / 8, this.canonWidth, -this.canonHeight);
			if (this.state.shooting) fill("#da46ff");
			if (this.state.reloading) fill("#ff0000");
			rect(-this.canonWidth / 2, -this.radius, this.canonWidth, -this.canonHeight / 8);
		}

		pop();
	}

	lookAt(x, y) {
		let location, vector, angle;
		location = createVector(x, y);
		vector = p5.Vector.sub(location, this.position);
		vector.setMag(this.radius);
		angle = vector.heading() - PI / 2;
		this.angleToLook = angle;
	}

	shoot(startPos, endPos, bulletsArray, options) {
		let v1 = p5.Vector.sub(endPos, this.position);
		let a1 = v1.heading() - PI / 2;
		bulletsArray.push(
			new Bullet(startPos.x + sin(-a1) * this.canonHeight, startPos.y + cos(a1) * this.canonHeight, {
				acceleration: v1,
				color: options.color,
				radius: options.radius,
				particlesArray: this.particlesArray,
				strength: this.powerUps.doubleCanon ? 100 : options.bulletStrength,
				endLocationVector: v1,
			})
		);
		if (this.powerUps.doubleCanon) {
			let v2 = p5.Vector.sub(this.position, endPos);
			let a2 = v2.heading() - PI / 2;
			bulletsArray.push(
				new Bullet(
					startPos.x + sin(-a2) * this.canonHeight,
					startPos.y + cos(a2) * this.canonHeight,
					{
						acceleration: v2,
						color: "#da46ff",
						radius: options.radius,
						particlesArray: this.particlesArray,
						strength: 100,
						endLocationVector: v2,
					}
				)
			);
		}
		this.showRecoil();
	}

	showRecoil() {
		let tl = gsap.timeline();
		let duration = 0.05;
		tl.to(this, duration, { scaleY: 1.05 });
		tl.to(this, duration, { scaleY: 1 });
	}
}
