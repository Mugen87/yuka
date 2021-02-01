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

		entity._renderComponent.material.color.set( 0x00ff00 );

	}

}

export { CustomTrigger };
