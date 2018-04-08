/**
 * @author Mugen87 / https://github.com/Mugen87
 */

class Wife extends YUKA.GameEntity {

	constructor() {

		super();

		this.name = 'wife';

		this.location = 'shack';
		this.cooking = false; // is she presently cooking?

		this.stateMachine = new YUKA.StateMachine( this );

		this.stateMachine.add( 'GLOBAL_STATE', new WifeGlobalState() );
		this.stateMachine.add( 'DO_HOUSE_WORK', new DoHouseWork() );
		this.stateMachine.add( 'VISIT_BATHROOM', new VisitBathroom() );
		this.stateMachine.add( 'COOK_STEW', new CookStew() );

		this.stateMachine.currentState = this.stateMachine.get( 'DO_HOUSE_WORK' );
		this.stateMachine.globalState = this.stateMachine.get( 'GLOBAL_STATE' );

	}

	update() {

		this.stateMachine.update();

	}

	handleMessage( telegram ) {

		return this.stateMachine.handleMessage( telegram );

	}

}
