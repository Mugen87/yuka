/**
 * @author Mugen87 / https://github.com/Mugen87
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../build/yuka.js' );

const Trigger = YUKA.Trigger;
const TriggerRegion = YUKA.TriggerRegion;

describe( 'Trigger', function () {

	describe( '#constructor()', function () {

		it( 'should create an object with correct default values', function () {

			const trigger = new Trigger();

			expect( trigger ).to.have.a.property( 'active' ).that.is.true;
			expect( trigger ).to.have.a.property( 'region' ).that.is.an.instanceof( TriggerRegion );

		} );

	} );

	describe( '#check()', function () {

		it( 'should call execute() if the trigger is active and the trigger region reports touching', function () {

			const region = new CustomTriggerRegion();
			const trigger = new CustomTrigger( region );

			trigger.check( {} );

			expect( trigger.entityPassed ).to.be.true;
			expect( trigger.executeCalled ).to.be.true;

		} );

		it( 'should not call execute() if the trigger is inactive', function () {

			const region = new CustomTriggerRegion();
			const trigger = new CustomTrigger( region );

			trigger.active = false;
			trigger.check( {} );

			expect( trigger.entityPassed ).to.be.false;
			expect( trigger.executeCalled ).to.be.false;

		} );

		it( 'should not call execute() if the trigger region reports no touching', function () {

			const trigger = new CustomTrigger();

			trigger.check( {} );

			expect( trigger.entityPassed ).to.be.false;
			expect( trigger.executeCalled ).to.be.false;

		} );

	} );

	describe( '#execute()', function () {

		it( 'should exist', function () {

			const trigger = new Trigger();
			expect( trigger ).respondTo( 'execute' );
			trigger.execute();

		} );

	} );

	describe( '#update()', function () {

		it( 'should exist', function () {

			const trigger = new Trigger();
			expect( trigger ).respondTo( 'update' );
			trigger.update();

		} );

	} );

} );

//

class CustomTriggerRegion extends TriggerRegion {

	touching() {

		return true;

	}

}

class CustomTrigger extends Trigger {

	constructor( region ) {

		super( region );

		this.executeCalled = false;
		this.entityPassed = false;

	}

	execute( entity ) {

		if ( entity ) this.entityPassed = true;
		this.executeCalled = true;

	}

}
