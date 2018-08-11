/**
 * @author Mugen87 / https://github.com/Mugen87
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../../build/yuka.js' );

const AABB = YUKA.AABB;
const RectangularTriggerRegion = YUKA.RectangularTriggerRegion;
const Vector3 = YUKA.Vector3;
const GameEntity = YUKA.GameEntity;

describe( 'RectangularTriggerRegion', function () {

	describe( '#constructor()', function () {

		it( 'should create an internal bounding volume from the given parameter', function () {

			const min = new Vector3( 0, 0, 0 );
			const max = new Vector3( 1, 1, 1 );

			const region = new RectangularTriggerRegion( min, max );

			expect( region ).to.have.a.property( '_aabb' ).that.is.an.instanceof( AABB );
			expect( region._aabb.min ).to.deep.equal( min );
			expect( region._aabb.max ).to.deep.equal( max );

		} );

	} );


	describe( '#touching()', function () {

		it( 'should interpret a game entity inside the region as touching', function () {

			const entity = new GameEntity();
			entity.boundingRadius = 1;

			const region = new RectangularTriggerRegion( new Vector3( 0, 0, 0 ), new Vector3( 1, 1, 1 ) );

			expect( region.touching( entity ) ).to.equal( true );

		} );

		it( 'should interpret a game entity outside the region as no touching', function () {

			const entity = new GameEntity();
			entity.position.set( 0.5, 0.5, 1.5 );
			entity.boundingRadius = 0.4;

			const region = new RectangularTriggerRegion( new Vector3( 0, 0, 0 ), new Vector3( 1, 1, 1 ) );

			expect( region.touching( entity ) ).to.equal( false );

		} );

	} );

} );
