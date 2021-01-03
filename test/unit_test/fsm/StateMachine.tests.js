/**
 * @author Mugen87 / https://github.com/Mugen87
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../build/yuka.js' );

const State = YUKA.State;
const StateMachine = YUKA.StateMachine;
const GameEntity = YUKA.GameEntity;

const StateJSONs = require( '../../files/StateJSONs.js' );

describe( 'StateMachine', function () {

	describe( '#constructor()', function () {

		it( 'should create an object with correct default values', function () {

			const stateMachine = new StateMachine();
			expect( stateMachine ).to.have.a.property( 'owner' ).that.is.null;
			expect( stateMachine ).to.have.a.property( 'currentState' ).that.is.null;
			expect( stateMachine ).to.have.a.property( 'previousState' ).that.is.null;
			expect( stateMachine ).to.have.a.property( 'globalState' ).that.is.null;
			expect( stateMachine ).to.have.a.property( 'states' ).that.is.a( 'map' );

		} );

		it( 'should apply the parameters to the new object', function () {

			const entity = new GameEntity();
			const stateMachine = new StateMachine( entity );

			expect( stateMachine.owner ).to.equal( entity );

		} );

	} );

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

		it( 'should perform a state change', function () {

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

		it( 'should allow to change the state with an empty current state', function () {

			const stateMachine = new StateMachine();
			const globalState = new CustomState();

			stateMachine.globalState = globalState;

			const newState = new CustomState();

			stateMachine._change( newState );

			expect( stateMachine.previousState ).to.be.null;
			expect( stateMachine.currentState ).to.equal( newState );
			expect( newState.enterCalled ).to.be.true;
			expect( newState.exitCalled ).to.be.false;

		} );

	} );

	describe( '#toJSON', function () {

		it( 'should serialize this instance to a JSON object', function () {

			const owner = new GameEntity();
			owner._uuid = '4C06581E-448A-4557-835E-7A9D2CE20D30';

			const stateMachine = new StateMachine( owner );

			const state1 = new CustomState();
			stateMachine.add( 'STATE', state1 );

			const state2 = new MessageCustomState();
			stateMachine.add( 'MESSAGE_STATE', state2 );

			stateMachine.currentState = state1;
			stateMachine.previousState = state2;

			expect( stateMachine.toJSON() ).to.be.deep.equal( StateJSONs.StateMachine );

		} );

		it( 'should set current, previous and global state to null if no states are defined', function () {

			const owner = new GameEntity();
			owner._uuid = '4C06581E-448A-4557-835E-7A9D2CE20D30';

			const stateMachine = new StateMachine( owner );

			expect( stateMachine.toJSON() ).to.be.deep.equal( StateJSONs.StateMachineEmpty );

		} );

	} );

	describe( '#fromJSON()', function () {

		it( 'should deserialize this instance from the given JSON object', function () {

			YUKA.Logger.setLevel( YUKA.Logger.LEVEL.SILENT );

			const owner = new GameEntity();
			owner._uuid = '4C06581E-448A-4557-835E-7A9D2CE20D30';

			const entities = new Map();
			entities.set( owner.uuid, owner );

			const stateMachine1 = new StateMachine( owner );
			stateMachine1.registerType( 'CustomState', CustomState ); // so deep equal works

			const state = new CustomState();
			stateMachine1.add( 'STATE', state );
			state.resolveReferencesCalled = true; // so deep equal works

			stateMachine1.currentState = state;

			const stateMachine2 = new StateMachine();
			stateMachine2.registerType( 'CustomState', CustomState );
			stateMachine2.fromJSON( StateJSONs.StateMachine );
			stateMachine2.resolveReferences( entities );

			expect( stateMachine1 ).to.be.deep.equal( stateMachine2 );

		} );

		it( 'should set current, previous and global state to null if no states are defined', function () {

			const stateMachine = new StateMachine().fromJSON( StateJSONs.StateMachineEmpty );

			expect( stateMachine.currentState ).to.be.null;
			expect( stateMachine.previousState ).to.be.null;
			expect( stateMachine.globalState ).to.be.null;
			expect( stateMachine.states ).to.be.empty;

		} );

	} );

	describe( '#resolveReferences()', function () {

		it( 'should restore the references to other entities', function () {

			const stateMachine = new StateMachine();
			stateMachine.owner = '4C06581E-448A-4557-835E-7A9D2CE20D30';

			const state = new CustomState();
			stateMachine.add( 'STATE', state );

			const entities = new Map();
			const entity = new GameEntity();
			entity._uuid = '4C06581E-448A-4557-835E-7A9D2CE20D30';
			entities.set( entity.uuid, entity );

			stateMachine.resolveReferences( entities );

			expect( stateMachine.owner ).to.equal( entity );
			expect( state.resolveReferencesCalled ).to.be.true;

		} );

		it( 'should set the owner to null if the mapping is missing', function () {

			const stateMachine = new StateMachine();
			stateMachine.owner = '4C06581E-448A-4557-835E-7A9D2CE20D30';

			stateMachine.resolveReferences( new Map() );

			expect( stateMachine.owner ).to.be.null;

		} );

	} );

	describe( '#registerType()', function () {

		it( 'should register a custom type for deserialization', function () {

			const stateMachine = new StateMachine();

			stateMachine.registerType( 'CustomState', CustomState );

			expect( stateMachine._typesMap.get( 'CustomState' ) ).to.equal( CustomState );

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
		this.resolveReferencesCalled = false;

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

	toJSON() {

		return {};

	}

	fromJSON() {

		return this;

	}

	resolveReferences() {

		this.resolveReferencesCalled = true;

	}

}

class MessageCustomState extends CustomState {

	toJSON() {

		return {};

	}

	fromJSON() {

		return this;

	}

	onMessage() {

		return true; // message handled

	}

}
