/**
 * @author Mugen87 / https://github.com/Mugen87
 */

class Time {

	constructor() {

		this.startTime = 0;

		this.previousTime = 0;
		this.currentTime = 0;

	}

	getDelta() {

		return ( this.currentTime - this.previousTime ) / 1000;

	}

	getTime() {

		return ( this.currentTime - this.startTime ) / 1000;

	}

	update() {

		this.previousTime = this.currentTime;
		this.currentTime = this.now();

		return this;

	}

	now() {

		return ( typeof performance === 'undefined' ? Date : performance ).now();

	}

}

export { Time };
