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

describe( 'RectangularTriggerRegion', function () {

	describe( '#constructor()', function () {

		it( 'should create an internal bounding box from the given parameter', function () {

			const min = new Vector3( 0, 0, 0 );
			const max = new Vector3( 1, 1, 1 );

			const region = new RectangularTriggerRegion( min, max );

			expect( region ).to.have.a.property( '_aabb' ).that.is.an.instanceof( AABB );
			expect( region._aabb.min ).to.deep.equal( min );
			expect( region._aabb.max ).to.deep.equal( max );

		} );

	} );

	describe( '#get min()', function () {

		it( 'should return the min vector of the internal bounding box', function () {

			const min = new Vector3( 0, 0, 0 );
			const max = new Vector3( 1, 1, 1 );

			const region = new RectangularTriggerRegion( min, max );

			expect( region.min ).to.equal( region._aabb.min );

		} );

	} );

	describe( '#set min()', function () {

		it( 'should set the min vector of the internal bounding box', function () {

			const min = new Vector3( 0, 0, 0 );

			const region = new RectangularTriggerRegion();

			region.min = min;

			expect( min ).to.equal( region._aabb.min );

		} );

	} );

	describe( '#get max()', function () {

		it( 'should return the max vector of the internal bounding box', function () {

			const min = new Vector3( 0, 0, 0 );
			const max = new Vector3( 1, 1, 1 );

			const region = new RectangularTriggerRegion( min, max );

			expect( region.max ).to.equal( region._aabb.max );

		} );

	} );

	describe( '#set max()', function () {

		it( 'should set the max vector of the internal bounding box', function () {

			const max = new Vector3( 1, 1, 1 );

			const region = new RectangularTriggerRegion();

			region.max = max;

			expect( max ).to.equal( region._aabb.max );

		} );

	} );

	describe( '#fromPositionAndSize()', function () {

		it( 'should set the trigger region from a given position and size vector', function () {

			const position = new Vector3( 0, 0, 0.5 );
			const size = new Vector3( 1, 1, 1 );

			const region = new RectangularTriggerRegion().fromPositionAndSize( position, size );

			expect( region.min ).to.deep.equal( { x: - 0.5, y: - 0.5, z: 0 } );
			expect( region.max ).to.deep.equal( { x: 0.5, y: 0.5, z: 1 } );

		} );

	} );

	describe( '#touching()', function () {

		it( 'should interpret a game entity inside the region as touching', function () {

			const entity = new GameEntity();
			entity.boundingRadius = 1;

			const region = new RectangularTriggerRegion( new Vector3( 0, 0, 0 ), new Vector3( 1, 1, 1 ) );

			expect( region.touching( entity ) ).to.be.true;

		} );

		it( 'should interpret a game entity outside the region as no touching', function () {

			const entity = new GameEntity();
			entity.position.set( 0.5, 0.5, 1.5 );
			entity.boundingRadius = 0.4;

			const region = new RectangularTriggerRegion( new Vector3( 0, 0, 0 ), new Vector3( 1, 1, 1 ) );

			expect( region.touching( entity ) ).to.be.false;

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
			const region2 = new RectangularTriggerRegion( new Vector3( 1, 1, 1 ), new Vector3( 1, 1, 1 ) ).fromJSON( TriggerJSONs.RectangularTriggerRegion );

			expect( region2 ).to.be.deep.equal( region );

		} );

	} );

} );
