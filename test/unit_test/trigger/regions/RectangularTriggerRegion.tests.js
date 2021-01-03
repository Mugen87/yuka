/**
 * @author Mugen87 / https://github.com/Mugen87
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../../build/yuka.js' );
const TriggerJSONs = require( '../../../files/TriggerJSONs.js' );

const AABB = YUKA.AABB;
const RectangularTriggerRegion = YUKA.RectangularTriggerRegion;
const Vector3 = YUKA.Vector3;
const GameEntity = YUKA.GameEntity;
const Trigger = YUKA.Trigger;

describe( 'RectangularTriggerRegion', function () {

	describe( '#constructor()', function () {

		it( 'should create an object with correct default values', function () {

			const region = new RectangularTriggerRegion();
			expect( region ).to.have.a.property( 'size' ).that.is.an.instanceof( Vector3 );
			expect( region ).to.have.a.property( '_aabb' ).that.is.an.instanceof( AABB );

		} );

		it( 'should create an object with properties according to the given values', function () {

			const size = new Vector3( 1, 1, 1 );

			const region = new RectangularTriggerRegion( size );

			expect( region.size ).to.deep.equal( new Vector3( 1, 1, 1 ) );

		} );

	} );

	describe( '#touching()', function () {

		it( 'should interpret a game entity inside the region as touching', function () {

			const entity = new GameEntity();
			entity.boundingRadius = 1;

			const region = new RectangularTriggerRegion();
			region._aabb.fromCenterAndSize( new Vector3( 0, 0, 0 ), new Vector3( 1, 1, 1 ) );

			expect( region.touching( entity ) ).to.be.true;

		} );

		it( 'should interpret a game entity outside the region as no touching', function () {

			const entity = new GameEntity();
			entity.position.set( 0.5, 0.5, 1.5 );
			entity.boundingRadius = 0.4;

			const region = new RectangularTriggerRegion();
			region._aabb.fromCenterAndSize( new Vector3( 0, 0, 0 ), new Vector3( 1, 1, 1 ) );

			expect( region.touching( entity ) ).to.be.false;

		} );

	} );

	describe( '#update()', function () {

		it( 'should update the region based on the given trigger', function () {

			const trigger = new Trigger();
			trigger.position.set( 1, 0, 0 );

			const region = new RectangularTriggerRegion( new Vector3( 1, 1, 1 ) );

			region.update( trigger );

			expect( region._aabb.min ).to.deep.equal( new Vector3( 0.5, - 0.5, - 0.5 ) );
			expect( region._aabb.max ).to.deep.equal( new Vector3( 1.5, 0.5, 0.5 ) );

		} );

	} );

	describe( '#toJSON()', function () {

		it( 'should serialize this instance to a JSON object', function () {

			const region = new RectangularTriggerRegion();

			const json = region.toJSON();

			expect( json ).to.be.deep.equal( TriggerJSONs.RectangularTriggerRegion );

		} );

	} );

	describe( '#fromJSON()', function () {

		it( 'should deserialize this instance from the given JSON object', function () {

			const region = new RectangularTriggerRegion();
			const region2 = new RectangularTriggerRegion( new Vector3( 1, 1, 1 ) ).fromJSON( TriggerJSONs.RectangularTriggerRegion );

			expect( region2 ).to.be.deep.equal( region );

		} );

	} );

} );
