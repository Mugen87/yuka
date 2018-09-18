/**
 * @author Mugen87 / https://github.com/Mugen87
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../build/yuka.js' );

const State = YUKA.State;
const StateMachine = YUKA.StateMachine;

describe( 'StateMachine', function () {

	describe( '#update()', function () {

		it( 'should call execute() of the global and current state', function () {

			const stateMachine = new StateMachine();
			stateMachine.globalState = new CustomState();
			stateMachine.currentState = new CustomState();

			stateMachine.update();

			expect( stateMachine.globalState.executeCalled ).to.be.true;
			expect( stateMachine.currentState.executeCalled ).to.be.true;

		} );

		it( 'should do nothing if not states are set', function () {

			const stateMachine = new StateMachine();
			stateMachine.update();

		} );

	} );

	describe( '#add()', function () {

		it( 'should add a state with the given ID', function () {

			const stateMachine = new StateMachine();
			const state = new CustomState();

			stateMachine.add( 'STATE', state );

			expect( stateMachine.states.has( 'STATE' ) ).to.be.true;
			expect( stateMachine.states.get( 'STATE' ) ).to.equal( state );

		} );

		it( 'should not add a state with wrong type', function () {

			const stateMachine = new StateMachine();
			const state = {};

			YUKA.Logger.setLevel( YUKA.Logger.LEVEL.SILENT );

			stateMachine.add( 'STATE', state );

			expect( stateMachine.states.has( 'STATE' ) ).to.be.false;

		} );

	} );

	describe( '#remove()', function () {

		it( 'should remove the state with the given ID', function () {

			const stateMachine = new StateMachine();
			const state = new CustomState();

			stateMachine.add( 'STATE', state );
			stateMachine.remove( 'STATE' );

			expect( stateMachine.states.has( 'STATE' ) ).to.be.false;

		} );

	} );

	describe( '#get()', function () {

		it( 'should return the state with the given ID', function () {

			const stateMachine = new StateMachine();
			const state = new CustomState();

			stateMachine.add( 'STATE', state );

			expect( stateMachine.get( 'STATE' ) ).to.equal( state );

		} );

	} );

	describe( '#changeTo()', function () {

		it( 'should change the current state to the defined one', function () {

			const stateMachine = new StateMachine();
			stateMachine.currentState = new CustomState();
			const state = new CustomState();

			stateMachine.add( 'STATE', state );
			stateMachine.changeTo( 'STATE' );

			expect( stateMachine.currentState ).to.equal( state );

		} );

	} );

	describe( '#revert()', function () {

		it( 'should revert to the previous state', function () {

			const stateMachine = new StateMachine();
			const state1 = new CustomState();
			const state2 = new CustomState();

			stateMachine.add( 'STATE1', state1 );
			stateMachine.add( 'STATE2', state2 );

			stateMachine.currentState = state1;
			stateMachine.changeTo( 'STATE2' );

			stateMachine.revert();

			expect( stateMachine.currentState ).to.equal( state1 );

		} );

	} );

	describe( '#in()', function () {

		it( 'should return true if the current state corresponds to the given ID', function () {

			const stateMachine = new StateMachine();
			const state = new CustomState();

			stateMachine.add( 'STATE', state );
			stateMachine.currentState = state;

			expect( stateMachine.in( 'STATE' ) ).to.be.true;

		} );

	} );

	describe( '#handleMessage()', function () {

		it( 'should return "false" if no states handle the message', function () {

			const stateMachine = new StateMachine();
			stateMachine.globalState = new CustomState();
			stateMachine.currentState = new CustomState();

			expect( stateMachine.handleMessage() ).to.be.false;

		} );

		it( 'should return "true" if the current state handles the message', function () {

			const stateMachine = new StateMachine();
			stateMachine.currentState = new MessageCustomState();

			expect( stateMachine.handleMessage() ).to.be.true;

		} );

		it( 'should return "true" if the global state handles the message', function () {

			const stateMachine = new StateMachine();
			stateMachine.globalState = new MessageCustomState();

			expect( stateMachine.handleMessage() ).to.be.true;

		} );

	} );

	describe( '#_change()', function () {

		it( 'should return true if the current state corresponds to the given ID', function () {

			const stateMachine = new StateMachine();
			const globalState = new CustomState();
			const currentState = new CustomState();

			stateMachine.globalState = globalState;
			stateMachine.currentState = currentState;

			const newState = new CustomState();

			stateMachine._change( newState );

			expect( currentState.enterCalled ).to.be.false;
			expect( currentState.exitCalled ).to.be.true;
			expect( stateMachine.previousState ).to.equal( currentState );
			expect( stateMachine.currentState ).to.equal( newState );
			expect( newState.enterCalled ).to.be.true;
			expect( newState.exitCalled ).to.be.false;

		} );

	} );

} );

//

class CustomState extends State {

	constructor() {

		super();

		this.enterCalled = false;
		this.executeCalled = false;
		this.exitCalled = false;

	}

	enter() {

		this.enterCalled = true;

	}

	execute() {

		this.executeCalled = true;

	}

	exit() {

		this.exitCalled = true;

	}

}

class MessageCustomState extends CustomState {

	onMessage() {

		return true; // message handled

	}

}
