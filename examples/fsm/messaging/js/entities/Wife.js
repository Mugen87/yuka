/**
 * @author Mugen87 / https://github.com/Mugen87
 */

class Wife extends YUKA.GameEntity {

	constructor() {

		super();

		this.location = 'shack';
		this.cooking = false; // is she presently cooking?

		this.stateMachine = new YUKA.StateMachine( this );

		this.stateMachine.currentState = WIFE_STATES.DO_HOUSE_WORK;
		this.stateMachine.globalState = WIFE_STATES.GLOBAL_STATE;

	}

	update() {

		this.stateMachine.update();

	}

	handleMessage( telegram ) {

		return this.stateMachine.handleMessage( telegram );

	}

}
