/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { GameEntity, Vision, Obstacle, MemorySystem } from '../../../../build/yuka.module.js';

class CustomEntity extends GameEntity {

	constructor() {

		super();

		this.memorySystem = new MemorySystem();
		this.memorySystem.memorySpan = 3;
		this.vision = new Vision( this );
		this.visualRange = 5;
		this.fieldOfView = Math.PI * 0.5;

		this.maxTurnRate = Math.PI * 0.5;

		this.currentTime = 0;
		this.memoryRecords = new Array();

	}

	update( delta ) {

		this.currentTime += delta;

		 // In many scenarios it is not necessary to update the vision in each
		 // sumulation step. A regulator could be used to restrict the update rate.

		this.updateVision();

		// get a list of all recently sensed game entities

		this.memorySystem.getValidMemoryRecords( this.currentTime, this.memoryRecords );

		if ( this.memoryRecords.length > 0 ) {

			// Pick the first one. It's highly application specific what record is choosen
			// for further processing.

			const record = this.memoryRecords[ 0 ];
			const entity = record.entity;

			// if the game entity is visible, directly rotate towards it. Otherwise, focus
			// the last known position

			if ( record.visible === true ) {

				this.rotateTo( entity.position, delta );

				entity._renderComponent.material.color.set( 0x00ff00 ); // some visual feedback

			} else {

				// only rotate to the last sensed position if the entity was seen at least once

				if ( record.timeLastSensed !== - 1 ) {

					this.rotateTo( record.lastSensedPosition, delta );

					entity._renderComponent.material.color.set( 0xff0000 ); // some visual feedback

				}

			}

		} else {

			// rotate back to default

			this.rotateTo( this.forward, delta );

		}

	}

	updateVision() {

		const memorySystem = this.memorySystem;
		const vision = this.vision;
		const manager = this.manager;

		const entities = manager.entities;

		for ( let i = 0, l = entities.length; i < l; i ++ ) {

			const entity = entities[ i ];

			if ( entity === this || entity instanceof Obstacle ) continue;

			if ( memorySystem.hasRecord( entity ) === false ) {

				memorySystem.createRecord( entity );

			}

			const record = memorySystem.getRecord( entity );

			if ( vision.visible( entity.position ) === true ) {

				record.timeLastSensed = this.currentTime;
				record.lastSensedPosition.copy( entity.position );
				record.visible = true;

			} else {

				record.visible = false;

			}

		}

	}

}

export { CustomEntity };
