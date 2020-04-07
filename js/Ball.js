class Ball {
	constructor(x, y, options) {
		this.type = {
			core: options.core,
			attacker: options.attacker,
			healer: options.healer,
		};

		this.position = createVector(x, y);
		this.radius = options.radius || 20;
		this.color = options.color || this.selectColor(this.type);
		this.velocity = options.velocity || createVector(0, 0);
		this.acceleration = options.acceleration || createVector(0, 0);
		this.particlesArray = options.particlesArray;
		this.endLocation = options.endLocation || null;
		this.destroyed = false;
		this.powerUps = {
			shield: false,
		};

		if (this.type.attacker) {
			this.totalLife = options.attackerLife || 5;
			this.strength = options.strength || 5;
		}
		if (this.type.healer) {
			this.totalLife = 10;
			this.strength = 10;
		}
		if (this.type.core) this.totalLife = 100;
	}

	show() {
		noStroke();
		fill(this.color);
		ellipse(this.position.x, this.position.y, this.radius);

		if (this.type.core) {
			noFill();
			stroke(this.color);
			strokeWeight(2);
			if (this.powerUps.shield) ellipse(this.position.x, this.position.y, this.radius + 10);
			if (this.destroyed) {
				this.radius = 0;
			}
		}
	}

	update() {
		let v = p5.Vector.sub(this.position, this.endLocation);

		if (!(this.velocity.equals(0, 0) || this.acceleration.equals(0, 0))) {
			this.position.add(this.velocity);
			this.velocity.sub(v);
			this.velocity.setMag(3);
		}

		if (this.type.core == true && this.destroyed == false) {
			if (this.totalLife > 100) this.totalLife = 100;
			this.breakIfLifeCompletes();
		}

		this.timer++;
	}

	collisionDetection(CORE, attackersArray) {
		for (let i = 0; i < attackersArray.length; i++) {
			let distBetweenPoints =
				dist(
					attackersArray[i].position.x,
					attackersArray[i].position.y,
					CORE.position.x,
					CORE.position.y
				) -
				this.radius * (this.powerUps.shield ? 2.32 : 2);
			if (distBetweenPoints < 0) {
				this.changeLifeValue(CORE);
				if (playSound) explosionSound.play();
				attackersArray[i].radius = 0;
				attackersArray.splice(i, 1);
				this.breakIntoParticles(this.particlesArray, this.position, {
					minRadius: 1,
					maxRadius: 3,
					maxVelocity: 8,
					maxParticles: 15,
					colorsArray: [this.color, CORE.color],
				});
				return true;
			}
		}
	}

	changeLifeValue() {
		if (core.totalLife > 0) {
			if (this.type.attacker && core.powerUps.shield == false) {
				core.totalLife -= this.strength;
			} else if (this.type.healer) {
				core.totalLife += this.strength;
			}
		}
	}

	breakIfLifeCompletes() {
		if (this.totalLife <= 0) {
			this.breakIntoParticles(this.particlesArray, this.position, {
				minRadius: 1,
				maxRadius: 4,
				maxVelocity: 20,
				colorsArray: totalCoins != 0 ? [this.color, "#ffff00"] : [this.color],
				maxParticles: 20,
				blast: false,
			});
			this.destroyed = true;
		}
	}

	breakIntoParticles(particlesArray, location, options) {
		for (let i = 0; i < options.maxParticles; i++) {
			let randomRadius = random(options.minRadius, options.maxRadius);
			let randColor =
				options.colorsArray != undefined
					? options.colorsArray[floor(random(options.colorsArray.length))]
					: options.color;
			particlesArray.push(
				new Particle(location.x, location.y, {
					color: randColor,
					radius: randomRadius,
					maxVelocity: options.maxVelocity,
					blast: options.blast,
					gravity: options.gravity,
					timeToLive: options.timeToLive,
				})
			);
		}
	}

	selectColor(object) {
		if (object.core == true) return "#fff";
		else if (object.attacker == true) return "#ff0000";
		else if (object.healer == true) return "#00ff00";
	}
}

// ---------------------- //
// ---------------------- //
// ---- Bullet Class ---- //
// ---------------------- //
// ---------------------- //

class Bullet extends Ball {
	constructor(x, y, options) {
		super(x, y, options);
		this.strength = options.strength || 5;
		this.bulletVelocity = 10;
		this.endLocationVector = options.endLocationVector;
	}

	show() {
		push();
		translate(this.position.x, this.position.y);
		rotate(this.endLocationVector.heading() - PI / 2);
		stroke(this.color);
		strokeWeight(this.radius);
		line(0, 0, 0, this.radius);
		pop();
	}

	update() {
		this.position.add(this.velocity);
		this.velocity.add(this.acceleration);
		this.velocity.limit(this.bulletVelocity);
	}

	collisionDetection(bulletsArray, attackersArray) {
		for (let i = 0; i < attackersArray.length; i++) {
			for (let j = 0; j < bulletsArray.length; j++) {
				let destroyed = false;
				let attackPower = attackersArray[i].strength;
				let distBetweenPoints =
					dist(
						attackersArray[i].position.x,
						attackersArray[i].position.y,
						bulletsArray[j].position.x,
						bulletsArray[j].position.y
					) -
					attackersArray[i].radius * 0.85;

				if (distBetweenPoints < 0) {
					this.changeLifeValue(attackersArray[i]);
					if (playSound) hitSound.play();
					bulletsArray[j].radius = 0;
					bulletsArray.splice(j, 1);
					super.breakIntoParticles(this.particlesArray, this.position, {
						minRadius: 1,
						maxRadius: 2,
						maxVelocity: 5,
						maxParticles: 10,
						blast: false,
						timeToLive: 180,
						colorsArray: [this.color, attackersArray[i].color],
						gravity: p5.Vector.sub(attackersArray[i].position, core.position).setMag(0.65),
					});

					if (attackersArray[i].destroyed == false) {
						attackersArray[i].strength -= this.strength;
						if (attackersArray[i].strength == 0) attackersArray[i].destroyed = true;
					}

					if (attackersArray[i].destroyed == true) {
						if (playSound) explosionSound.play();
						destroyed = true;
						super.breakIntoParticles(this.particlesArray, attackersArray[i].position, {
							minRadius: 1,
							maxRadius: 3,
							maxVelocity: 8,
							maxParticles: 15,
							blast: true,
							timeToLive: 100,
							colorsArray: [attackersArray[i].color],
							gravity: createVector(0, 0),
						});

						if (attackersArray[i].type.attacker) {
							let randomTotalCoins = floor(random(4, 8));
							for (let j = 0; j < randomTotalCoins; j++) {
								coinsArray.push(
									new Coin(attackersArray[i].position.x, attackersArray[i].position.y, {
										coinValue: isDoubleCoin
											? 2 * floor(random(2, 6))
											: floor(random(1, 3)),
										velocity: p5.Vector.random2D().setMag(attackersArray[i].radius / 2),
										acceleration: p5.Vector.random2D(),
										endLocation: core.position,
										color: "#ffff00",
										radius: random(2, 5),
									})
								);
							}
						}

						attackersArray.splice(i, 1);
					}
					return {
						destroyed: destroyed,
						attackPower: attackPower,
					};
				}
			}
		}
		return false;
	}

	changeLifeValue(attacker) {
		if (attacker.totalLife > 0) {
			attacker.totalLife -= this.strength;
		}
		if (attacker.totalLife <= 0) {
			attacker.destroyed = true;
		}
	}

	removeIfOutOfBounds(array, index) {
		if (
			this.position.x + this.radius > width ||
			this.position.x - this.radius < 0 ||
			this.position.y + this.radius > height ||
			this.position.y - this.radius < 0
		) {
			array.splice(index, 1);
		}
	}
}

// ---------------------- //
// ---------------------- //
// ---- Coins Class ---- //
// ---------------------- //
// ---------------------- //

class Coin extends Ball {
	constructor(x, y, options) {
		super(x, y, options);
		this.coinValue = options.coinValue || 1;
	}

	changeTotalCoinsValue() {
		totalCoins += this.coinValue;
	}

	collisionDetection() {
		for (let i = 0; i < coinsArray.length; i++) {
			let distBetweenPoints =
				dist(coinsArray[i].position.x, coinsArray[i].position.y, core.position.x, core.position.y) -
				this.radius;
			if (distBetweenPoints < 0) {
				coinsArray[i].radius = 0;
				this.changeTotalCoinsValue();

				if (playSound) coinPickupSound.play();

				coinsArray.splice(i, 1);
			}
		}
	}
}
