/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { GameEntity } from '../../../../build/yuka.module.js';

class CustomEntity extends GameEntity {

	constructor() {

		super();

		this.name = 'target';
		this.currentTime = 0;
		this.endTime = 0;

	}

	update( delta ) {

		this.currentTime += delta;

		if ( this.currentTime >= this.endTime ) {

			this.generatePosition();

		}

		return super.update( delta );

	}

	generatePosition() {

		const radius = 2;
		const phi = Math.acos( ( 2 * Math.random() ) - 1 );
		const theta = Math.random() * Math.PI * 2;

		this.position.fromSpherical( radius, phi, theta );

		this.endTime += 3; // 3s

	}

	toJSON() {

		const json = super.toJSON();

		json.currentTime = this.currentTime;
		json.endTime = this.endTime;

		return json;

	}

	fromJSON( json ) {

		super.fromJSON( json );

		this.currentTime = json.currentTime;
		this.endTime = json.endTime;

		return this;

	}

}

export { CustomEntity };
