/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { Vehicle } from '../../../../build/yuka.module.js';

class CustomVehicle extends Vehicle {

	constructor() {

		super();

		this.navMesh = null;

		this.currentRegion = null;
		this.fromRegion = null;
		this.toRegion = null;

	}

	update( delta ) {

		super.update( delta );

		// this code is used to adjust the height of the entity according to its current region

		const currentRegion = this.navMesh.getRegionForPoint( this.position, 1 );

		if ( currentRegion !== null ) {

			this.currentRegion = currentRegion;

			const distance = this.currentRegion.distanceToPoint( this.position );

			this.position.y -= distance * 0.2;

		}

		return this;

	}


}

export { CustomVehicle };
