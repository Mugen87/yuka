/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { Vehicle, Vector3 } from '../../../../../build/yuka.module.js';

const startPosition = new Vector3();
const endPosition = new Vector3();

class CustomVehicle extends Vehicle {

	constructor() {

		super();

		this.navMesh = null;
		this.currentRegion = null;

	}

	update( delta ) {

		startPosition.copy( this.position );

		super.update( delta );

		endPosition.copy( this.position );

		// ensure the entity stays inside its navmesh

		this.currentRegion = this.navMesh.clampMovement(
			this.currentRegion,
			startPosition,
			endPosition,
			this.position
		);

	}

}

export { CustomVehicle };
