/**
 * @author Mugen87 / https://github.com/Mugen87
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../../build/yuka.js' );
const NavMeshJSONs = require( '../../../files/NavMeshJSONs.js' );

const CostTable = YUKA.CostTable;
const NavMesh = YUKA.NavMesh;
const Polygon = YUKA.Polygon;
const Vector3 = YUKA.Vector3;

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

describe( 'CostTable', function () {

	describe( '#constructor()', function () {

		it( 'should create an object with correct default values', function () {

			const costTable = new CostTable();

			expect( costTable ).to.have.a.property( '_nodeMap' ).that.is.a( 'map' );

		} );

	} );

	describe( '#set()', function () {

		it( 'should set a cost value for a given pair of nodes', function () {

			const costTable = new CostTable();
			costTable.set( 0, 1, 2 );

			const nodeCostMap = costTable._nodeMap.get( 0 );
			expect( nodeCostMap.get( 1 ) ).to.equal( 2 );

		} );

	} );

	describe( '#get()', function () {

		it( 'should get a cost value for a given pair of nodes', function () {

			const costTable = new CostTable();
			costTable.set( 0, 1, 2 );

			expect( costTable.get( 0, 1 ) ).to.equal( 2 );

		} );

	} );

	describe( '#size()', function () {

		it( 'should returns the size of the cost table (amount of entries)', function () {

			const costTable = new CostTable();
			costTable.set( 0, 1, 2 );

			expect( costTable.size() ).to.equal( 1 );

		} );

	} );

	describe( '#init()', function () {

		it( 'should init the cost table for the given navigation mesh', function () {

			const costTable = new CostTable();
			costTable.init( navMesh );

			expect( costTable.size() ).to.equal( 2 );
			expect( costTable.get( 0, 1 ) ).to.closeTo( 0.9428090415820634, Number.EPSILON );
			expect( costTable.get( 1, 0 ) ).to.closeTo( 0.9428090415820634, Number.EPSILON );
			expect( costTable.get( 0, 0 ) ).to.equal( 0 );
			expect( costTable.get( 1, 1 ) ).to.equal( 0 );

		} );

	} );

	describe( '#clear()', function () {

		it( 'should clear the cost table', function () {

			const costTable = new CostTable();
			costTable.init( navMesh );
			costTable.clear();

			expect( costTable.size() ).to.equal( 0 );

		} );

	} );

	describe( '#toJSON()', function () {

		it( 'should serialize this instance to a JSON object', function () {

			const costTable = new CostTable();
			costTable.init( navMesh );
			const json = costTable.toJSON();

			expect( json ).to.deep.equal( NavMeshJSONs.CostTable );

		} );

	} );

	describe( '#fromJSON()', function () {

		it( 'should deserialize this instance from the given JSON object', function () {

			const costTable1 = new CostTable();
			costTable1.init( navMesh );

			const costTable2 = new CostTable().fromJSON( NavMeshJSONs.CostTable );

			expect( costTable1 ).to.deep.equal( costTable2 );

		} );

	} );

} );
