/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { Vehicle } from '../../../../build/yuka.module.js';

class CustomVehicle extends Vehicle {

	constructor() {

		super();

		this.name = 'vehicle';
		this.target = null;

	}

	update( delta ) {

		const seekBehavior = this.steering.behaviors[ 0 ];
		seekBehavior.target.copy( this.target.position );

		return super.update( delta );

	}

	toJSON() {

		const json = super.toJSON();

		json.target = this.target.uuid;

		return json;

	}

	fromJSON( json ) {

		super.fromJSON( json );

		this.target = json.target;

		return this;

	}

	resolveReferences( entities ) {

		super.resolveReferences( entities );

		this.target = entities.get( this.target );

		return this;

	}

}

export { CustomVehicle };
