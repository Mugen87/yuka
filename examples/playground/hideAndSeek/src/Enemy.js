/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { Vehicle, Obstacle } from '../../../../build/yuka.module.js';

import { HideBehavior } from './HideBehavior.js';
import world from './World.js';

const obstacle = new Obstacle();

class Enemy extends Vehicle {

	constructor() {

		super();

		this.geometry = null;
		this.maxSpeed = 5;
		this.deathAnimDuration = 0.5;
		this.currentTime = 0;
		this.dead = false;
		this.notifiedWorld = false;
		this.spawningPoint = null;

	}

	start() {

		const player = this.manager.getEntityByName( 'player' );

		const hideBehavior = new HideBehavior( this.manager, player );
		this.steering.add( hideBehavior );

	}

	update( delta ) {

		super.update( delta );

		if ( this.dead ) {

			if ( this.notifiedWorld === false ) {

				this.notifiedWorld = true;
				world.hits ++;
				world.refreshUI();

				//

				const audio = world.audios.get( 'dead' );
				if ( audio.isPlaying === true ) audio.stop();
				audio.play();

				this._renderComponent.add( audio );

			}

			this.currentTime += delta;

			if ( this.currentTime <= this.deathAnimDuration ) {

				const value = this.currentTime / this.deathAnimDuration;

				const shader = this._renderComponent.material.userData.shader;

				shader.uniforms.alpha.value = ( value <= 1 ) ? value : 1;
				this._renderComponent.material.opacity = 1 - shader.uniforms.alpha.value;

			} else {

				world.remove( this );

			}

		}

	}

	intersectRay( ray, intersectionPoint, normal = null ) {

		obstacle.geometry = this.geometry;
		obstacle.worldMatrix = this.worldMatrix;

		return obstacle.intersectRay( ray, intersectionPoint, normal );

	}

	handleMessage() {

		this.dead = true;

		this._renderComponent.castShadow = false;

		return true;

	}

}

export { Enemy };
