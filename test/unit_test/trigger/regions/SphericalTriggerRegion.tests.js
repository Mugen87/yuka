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

describe( 'SphericalTriggerRegion', function () {

	describe( '#constructor()', function () {

		it( 'should create an internal bounding sphere from the given parameter', function () {

			const position = new Vector3( 1, 1, 1 );
			const radius = 2;

			const region = new SphericalTriggerRegion( position, radius );

			expect( region ).to.have.a.property( '_boundingSphere' ).that.is.an.instanceof( BoundingSphere );
			expect( region._boundingSphere.center ).to.deep.equal( position );
			expect( region._boundingSphere.radius ).to.equal( radius );

		} );

	} );

	describe( '#get position()', function () {

		it( 'should return the center vector of the internal bounding sphere', function () {

			const position = new Vector3( 1, 1, 1 );
			const radius = 2;

			const region = new SphericalTriggerRegion( position, radius );

			expect( region.position ).to.equal( region._boundingSphere.center );

		} );

	} );

	describe( '#set position()', function () {

		it( 'should set the center vector of the internal bounding sphere', function () {

			const position = new Vector3( 1, 1, 1 );

			const region = new SphericalTriggerRegion();

			region.position = position;

			expect( position ).to.equal( region._boundingSphere.center );

		} );

	} );

	describe( '#get radius()', function () {

		it( 'should return the radius of the internal bounding sphere', function () {

			const position = new Vector3( 1, 1, 1 );
			const radius = 2;

			const region = new SphericalTriggerRegion( position, radius );

			expect( region.radius ).to.equal( region._boundingSphere.radius );

		} );

	} );

	describe( '#set radius()', function () {

		it( 'should set the radius of the internal bounding sphere', function () {

			const radius = 2;

			const region = new SphericalTriggerRegion();

			region.radius = radius;

			expect( radius ).to.equal( region._boundingSphere.radius );

		} );

	} );

	describe( '#touching()', function () {

		it( 'should interpret a game entity inside the region as touching', function () {

			const entity = new GameEntity();
			entity.boundingRadius = 1;

			const region = new SphericalTriggerRegion( new Vector3( 1, 0, 0 ), 1 );

			expect( region.touching( entity ) ).to.be.true;

		} );

		it( 'should interpret a game entity outside the region as no touching', function () {

			const entity = new GameEntity();
			entity.boundingRadius = 1;

			const region = new SphericalTriggerRegion( new Vector3( 3, 0, 0 ), 1 );

			expect( region.touching( entity ) ).to.be.false;

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
			const region2 = new SphericalTriggerRegion( new Vector3( 1, 1, 1 ), 1 ).fromJSON( TriggerJSONs.SphericalTriggerRegion );

			expect( region2 ).to.be.deep.equal( region );

		} );

	} );

} );
