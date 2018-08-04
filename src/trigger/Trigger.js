/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { TriggerRegion } from './TriggerRegion.js';

class Trigger {

	constructor( region = new TriggerRegion() ) {

		this.active = true;
		this.region = region;

	}

	check( entity ) {

		if ( ( this.active === true ) && ( this.region.touching( entity ) === true ) ) {

			this.execute( entity );

		}

	}

	execute( /* entity */ ) {}

	update( /* delta */ ) {}

}

export { Trigger };
