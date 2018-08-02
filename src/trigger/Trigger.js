/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { TriggerRegion } from './TriggerRegion.js';

class Trigger {

	constructor( triggerRegion = new TriggerRegion() ) {

		this.active = true;
		this.triggerRegion = triggerRegion;

	}

	check( entity ) {

		if ( ( this.active === true ) && ( this.triggerRegion.touching( entity ) === true ) ) {

			this.execute( entity );

		}

	}

	execute( /* entity */ ) {}

	update() {}

}

export { Trigger };
