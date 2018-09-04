/**
 * @author Mugen87 / https://github.com/Mugen87
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../../build/yuka.js' );

const StayInNavMeshBehavior = YUKA.StayInNavMeshBehavior;
const NavMesh = YUKA.NavMesh;
const Polygon = YUKA.Polygon;
const Vector3 = YUKA.Vector3;
const Vehicle = YUKA.Vehicle;

// setup navigation mesh

const p1 = new Polygon();
const p2 = new Polygon();
const p3 = new Polygon();
const p4 = new Polygon();

const v1 = [
	new Vector3( 0, 0, 0 ),
	new Vector3( 0.5, 0, 1 ),
	new Vector3( 1, 0, 0 )
];

const v2 = [
	new Vector3( 1, 0, 0 ),
	new Vector3( 0.5, 0, 1 ),
	new Vector3( 1, 0, 1 )
];

const v3 = [
	new Vector3( 0, 0, 0 ),
	new Vector3( - 2, 0, 1 ),
	new Vector3( 0.5, 0, 1 )
];

const v4 = [
	new Vector3( 0.5, 0, 1 ),
	new Vector3( - 2, 0, 1 ),
	new Vector3( 0, 0, 2 )
];

p1.fromContour( v1 );
p2.fromContour( v2 );
p3.fromContour( v3 );
p4.fromContour( v4 );

const navMesh = new NavMesh().fromPolygons( [ p1, p2, p3, p4 ] );

//

describe( 'StayInNavMeshBehavior', function () {

	describe( '#constructor()', function () {

		it( 'should create an object with correct default values', function () {

			const stayInNavMeshBehavior = new StayInNavMeshBehavior();
			expect( stayInNavMeshBehavior ).to.have.a.property( 'navMesh' ).that.is.null;
			expect( stayInNavMeshBehavior ).to.have.a.property( '_currentRegion' ).that.is.null;

		} );

		it( 'should apply the parameters to the new object', function () {

			const stayInNavMeshBehavior = new StayInNavMeshBehavior( navMesh );
			expect( stayInNavMeshBehavior.navMesh ).to.equal( navMesh );


		} );

	} );

	describe( '#calculate()', function () {

		it( 'should determine the current region of the navMesh where the vehicle is in', function () {

			const vehicle = new Vehicle();
			vehicle.position.set( 0, 0, 1.8 );
			const force = new Vector3();
			const delta = 1;

			const stayInNavMeshBehavior = new StayInNavMeshBehavior( navMesh );

			stayInNavMeshBehavior.calculate( vehicle, force, delta );
			expect( stayInNavMeshBehavior._currentRegion ).to.equal( p1 );


		} );

		it( 'should procude no force if the vehicle stays inside the navMesh', function () {

			const vehicle = new Vehicle();
			vehicle.position.set( 0, 0, 1.8 );
			vehicle.velocity.set( 0, 0, 0.1 ); // new position will be ( 0, 0, 1.9 )
			const force = new Vector3();
			const delta = 1;

			const stayInNavMeshBehavior = new StayInNavMeshBehavior( navMesh );
			stayInNavMeshBehavior._currentRegion = p1;

			stayInNavMeshBehavior.calculate( vehicle, force, delta );
			expect( force.length() ).to.equal( 0 );

		} );

		it( 'should produce a force if the vehicle is going to leave the navMesh', function () {

			const vehicle = new Vehicle();
			vehicle.position.set( 0, 0, 1.5 );
			vehicle.velocity.set( 0.5, 0, 0.5 ); // new position will be ( 0.5, 0, 2 )
			const force = new Vector3();
			const delta = 1;

			const stayInNavMeshBehavior = new StayInNavMeshBehavior( navMesh );

			stayInNavMeshBehavior.calculate( vehicle, force, delta );
			expect( force ).to.deep.equal( { x: - 0.9472135954999579, y: - 0, z: 0.39442719099991586 } );

		} );

		it( 'should pick the closest edge of the nearest vertex in a region when calculating the force', function () {

			const vehicle = new Vehicle();
			vehicle.position.set( - 1.5, 0, 0.9 );
			vehicle.velocity.set( 0, 0, - 0.9 ); // new position will be ( - 1.5, 0, 0 )
			const force = new Vector3();
			const delta = 1;

			const stayInNavMeshBehavior = new StayInNavMeshBehavior( navMesh );

			stayInNavMeshBehavior.calculate( vehicle, force, delta );
			expect( force ).to.deep.equal( { x: - 0.8944271909999159, y: 0, z: 1.347213595499958 } );

		} );

	} );

} );
