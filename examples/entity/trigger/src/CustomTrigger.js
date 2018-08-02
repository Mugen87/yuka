/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { Trigger } from '../../../../build/yuka.module.js';

class CustomTrigger extends Trigger {

	constructor( triggerRegion ) {

		super( triggerRegion );

	}

	execute( entity ) {

		super.execute();

		console.log( 'Trigger activate by entity with ID: ', entity.id );

	}

}

export { CustomTrigger };
