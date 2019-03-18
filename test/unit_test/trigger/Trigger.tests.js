/**
 * @author Mugen87 / https://github.com/Mugen87
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../build/yuka.js' );
const TriggerJSONs = require( '../../files/TriggerJSONs.js' );

const Trigger = YUKA.Trigger;
const TriggerRegion = YUKA.TriggerRegion;
const SphericalTriggerRegion = YUKA.SphericalTriggerRegion;
const RectangularTriggerRegion = YUKA.RectangularTriggerRegion;

describe( 'Trigger', function () {

	describe( '#constructor()', function () {

		it( 'should create an object with correct default values', function () {

			const trigger = new Trigger();

			expect( trigger ).to.have.a.property( 'active' ).that.is.true;
			expect( trigger ).to.have.a.property( 'region' ).that.is.an.instanceof( TriggerRegion );
			expect( trigger ).to.have.a.property( '_typesMap' ).that.is.a( 'map' );

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

	describe( '#toJSON()', function () {

		it( 'should serialize this instance to a JSON object', function () {

			const region = new TriggerRegion();
			const trigger = new Trigger( region );


			const json = trigger.toJSON();

			expect( json ).to.be.deep.equal( TriggerJSONs.TriggerTR );

		} );

		it( 'should serialize this instance to a JSON object, bigger test', function () {

			const sphericalRegion = new SphericalTriggerRegion();
			const rectangularRegion = new RectangularTriggerRegion();
			const customRegion = new CustomTriggerRegion();
			const triggerSR = new Trigger( sphericalRegion );
			const triggerRR = new Trigger( rectangularRegion );
			const triggerCR = new Trigger( customRegion );

			expect( triggerSR.toJSON() ).to.be.deep.equal( TriggerJSONs.TriggerSR );
			expect( triggerRR.toJSON() ).to.be.deep.equal( TriggerJSONs.TriggerRR );
			expect( triggerCR.toJSON() ).to.be.deep.equal( TriggerJSONs.TriggerCR );

		} );

	} );

	describe( '#fromJSON()', function () {

		it( 'should deserialize this instance from the given JSON object', function () {

			const region = new TriggerRegion();
			const trigger = new Trigger( region );

			const trigger2 = new Trigger().fromJSON( TriggerJSONs.TriggerTR );


			expect( trigger2 ).to.be.deep.equal( trigger );

		} );

		it( 'should deserialize this instance from the given JSON object, bigger test', function () {

			YUKA.Logger.setLevel( YUKA.Logger.LEVEL.SILENT );
			const sphericalRegion = new SphericalTriggerRegion();
			const rectangularRegion = new RectangularTriggerRegion();
			const customRegion = new CustomTriggerRegion();
			const triggerSR = new Trigger( sphericalRegion );
			const triggerRR = new Trigger( rectangularRegion );
			const triggerCR = new Trigger( customRegion );

			const triggerSR2 = new Trigger( ).fromJSON( TriggerJSONs.TriggerSR );
			const triggerRR2 = new Trigger( ).fromJSON( TriggerJSONs.TriggerRR );
			const triggerCR2 = new Trigger( );

			triggerCR.registerType( 'CustomTriggerRegion', CustomTriggerRegion );
			triggerCR2.registerType( 'CustomTriggerRegion', CustomTriggerRegion );
			triggerCR2.fromJSON( TriggerJSONs.TriggerCR );

			expect( triggerSR2 ).to.be.deep.equal( triggerSR );
			expect( triggerRR2 ).to.be.deep.equal( triggerRR );
			expect( triggerCR2 ).to.be.deep.equal( triggerCR );

			const triggerCR3 = new Trigger( ).fromJSON( TriggerJSONs.TriggerCR );
			expect( triggerCR3 ).to.be.deep.equal( new Trigger() );

		} );

	} );

	describe( '#registerType()', function () {

		it( 'should register a custom type for deserialization', function () {

			const trigger = new Trigger();

			trigger.registerType( 'CustomTriggerRegion', CustomTriggerRegion );

			expect( trigger._typesMap.get( 'CustomTriggerRegion' ) ).to.equal( CustomTriggerRegion );

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
