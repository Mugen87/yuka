/**
 * @author Mugen87 / https://github.com/Mugen87
 *
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../../build/yuka.min.js' );

const BoundingSphere = YUKA.BoundingSphere;
const SphericalTriggerRegion = YUKA.SphericalTriggerRegion;
const Vector3 = YUKA.Vector3;
const GameEntity = YUKA.GameEntity;

describe( 'SphericalTriggerRegion', function () {

	describe( '#constructor()', function () {

		it( 'should create an internal bounding volume from the given parameter', function () {

			const position = new Vector3( 1, 1, 1 );
			const radius = 2;

			const region = new SphericalTriggerRegion( position, radius );

			expect( region ).to.have.a.property( '_boundingSphere' ).that.is.an.instanceof( BoundingSphere );
			expect( region._boundingSphere.center ).to.deep.equal( position );
			expect( region._boundingSphere.radius ).to.equal( radius );

		} );

	} );


	describe( '#touching()', function () {

		it( 'should interpret a game entity inside the region as touching', function () {

			const entity = new GameEntity();
			entity.boundingRadius = 1;

			const region = new SphericalTriggerRegion( new Vector3( 1, 0, 0 ), 1 );

			expect( region.touching( entity ) ).to.equal( true );

		} );

		it( 'should interpret a game entity outside the region as no touching', function () {

			const entity = new GameEntity();
			entity.boundingRadius = 1;

			const region = new SphericalTriggerRegion( new Vector3( 3, 0, 0 ), 1 );

			expect( region.touching( entity ) ).to.equal( false );

		} );

	} );

} );
