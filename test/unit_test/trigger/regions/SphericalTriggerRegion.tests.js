/**
 * @author Mugen87 / https://github.com/Mugen87
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../../build/yuka.js' );
const TriggerJSONs = require( '../../../files/TriggerJSONs.js' );

const BoundingSphere = YUKA.BoundingSphere;
const SphericalTriggerRegion = YUKA.SphericalTriggerRegion;
const Vector3 = YUKA.Vector3;
const GameEntity = YUKA.GameEntity;
const Trigger = YUKA.Trigger;

describe( 'SphericalTriggerRegion', function () {

	describe( '#constructor()', function () {

		it( 'should create an object with correct default values', function () {

			const region = new SphericalTriggerRegion();
			expect( region ).to.have.a.property( 'radius' ).that.is.equal( 0 );
			expect( region ).to.have.a.property( '_boundingSphere' ).that.is.an.instanceof( BoundingSphere );

		} );

		it( 'should create an object with properties according to the given values', function () {

			const radius = 2;
			const region = new SphericalTriggerRegion( radius );

			expect( region.radius ).to.equal( 2 );

		} );

	} );

	describe( '#touching()', function () {

		it( 'should interpret a game entity inside the region as touching', function () {

			const entity = new GameEntity();
			entity.boundingRadius = 1;

			const region = new SphericalTriggerRegion();
			region._boundingSphere.radius = 1;
			region._boundingSphere.center = new Vector3( 1, 0, 0 );

			expect( region.touching( entity ) ).to.be.true;

		} );

		it( 'should interpret a game entity outside the region as no touching', function () {

			const entity = new GameEntity();
			entity.boundingRadius = 1;

			const region = new SphericalTriggerRegion();
			region._boundingSphere.radius = 1;
			region._boundingSphere.center = new Vector3( 3, 0, 0 );

			expect( region.touching( entity ) ).to.be.false;

		} );

	} );

	describe( '#update()', function () {

		it( 'should update the region based on the given trigger', function () {

			const trigger = new Trigger();
			trigger.position.set( 1, 0, 0 );

			const region = new SphericalTriggerRegion( 1 );

			region.update( trigger );

			expect( region._boundingSphere.center ).to.deep.equal( new Vector3( 1, 0, 0 ) );
			expect( region._boundingSphere.radius ).to.equal( 1 );

		} );

	} );

	describe( '#toJSON()', function () {

		it( 'should serialize this instance to a JSON object', function () {

			const region = new SphericalTriggerRegion();

			const json = region.toJSON();

			expect( json ).to.be.deep.equal( TriggerJSONs.SphericalTriggerRegion );

		} );

	} );

	describe( '#fromJSON()', function () {

		it( 'should deserialize this instance from the given JSON object', function () {

			const region = new SphericalTriggerRegion();
			const region2 = new SphericalTriggerRegion( 1 ).fromJSON( TriggerJSONs.SphericalTriggerRegion );

			expect( region2 ).to.be.deep.equal( region );

		} );

	} );

} );
