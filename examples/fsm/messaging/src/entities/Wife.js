/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { GameEntity, StateMachine } from '../../../../../build/yuka.module.js';

import { WifeGlobalState, DoHouseWork, VisitBathroom, CookStew } from '../states/WifeStates.js';

class Wife extends GameEntity {

	constructor() {

		super();

		this.name = 'wife';

		this.miner = null;

		this.location = 'shack';
		this.cooking = false; // is she presently cooking?

		this.stateMachine = new StateMachine( this );

		this.stateMachine.add( 'GLOBAL_STATE', new WifeGlobalState() );
		this.stateMachine.add( 'DO_HOUSE_WORK', new DoHouseWork() );
		this.stateMachine.add( 'VISIT_BATHROOM', new VisitBathroom() );
		this.stateMachine.add( 'COOK_STEW', new CookStew() );

		this.stateMachine.currentState = this.stateMachine.get( 'DO_HOUSE_WORK' );
		this.stateMachine.globalState = this.stateMachine.get( 'GLOBAL_STATE' );

	}

	start() {

		this.miner = this.manager.getEntityByName( 'miner' );

	}

	update() {

		this.stateMachine.update();

	}

	handleMessage( telegram ) {

		return this.stateMachine.handleMessage( telegram );

	}

}

export { Wife };
