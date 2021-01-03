/**
 * @author Mugen87 / https://github.com/Mugen87
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../build/yuka.js' );
const PartitioningJSONs = require( '../../files/PartitioningJSONs.js' );

const Cell = YUKA.Cell;
const AABB = YUKA.AABB;
const Vector3 = YUKA.Vector3;
const GameEntity = YUKA.GameEntity;

describe( 'Cell', function () {

	describe( '#constructor()', function () {

		it( 'should create an object with correct default values', function () {

			const cell = new Cell();

			expect( cell ).to.have.a.property( 'aabb' ).that.is.an.instanceof( AABB );
			expect( cell ).to.have.a.property( 'entries' ).that.is.an( 'array' );

		} );

		it( 'should apply the parameters to the new object', function () {

			const aabb = new AABB();
			const cell = new Cell( aabb );

			expect( cell.aabb ).to.equal( aabb );

		} );

	} );

	describe( '#add()', function () {

		it( 'should add an entry to the cell', function () {

			const entity = new GameEntity();
			const cell = new Cell();

			cell.add( entity );

			expect( cell.entries ).to.include( entity );

		} );

	} );

	describe( '#remove()', function () {

		it( 'should remove an entry from the cell', function () {

			const entity = new GameEntity();
			const cell = new Cell();

			cell.add( entity );
			cell.remove( entity );

			expect( cell.entries ).to.not.include( entity );

		} );

	} );

	describe( '#makeEmpty()', function () {

		it( 'should remove all entries from the cell', function () {

			const entity = new GameEntity();
			const cell = new Cell();

			cell.add( entity );
			cell.makeEmpty();

			expect( cell.empty() ).to.be.true;

		} );

	} );

	describe( '#empty()', function () {

		it( 'should return true if the cell is empty', function () {

			const entity = new GameEntity();
			const cell = new Cell();

			expect( cell.empty() ).to.be.true;

			cell.add( entity );

			expect( cell.empty() ).to.be.false;

		} );

	} );

	describe( '#intersects()', function () {

		it( 'should return true if the given AABB intersects with the internal AABB', function () {

			const cell = new Cell();
			cell.aabb.min.set( 0, 0, 0 );
			cell.aabb.max.set( 1, 1, 1 );

			const aabb1 = new AABB( new Vector3( 0.5, 0.5, 0.5 ), new Vector3( 2, 2, 2 ) );
			const aabb2 = new AABB( new Vector3( 1.5, 1.5, 1.5 ), new Vector3( 2, 2, 2 ) );

			expect( cell.intersects( aabb1 ) ).to.be.true;
			expect( cell.intersects( aabb2 ) ).to.be.false;

		} );

	} );

	describe( '#toJSON()', function () {

		it( 'should serialize this instance to a JSON object', function () {

			const cell = new Cell();
			const entity = new GameEntity();
			entity._uuid = '4C06581E-448A-4557-835E-7A9D2CE20D30';
			cell.add( entity );
			const json = cell.toJSON();

			expect( json ).to.deep.equal( PartitioningJSONs.Cell );

		} );

	} );

	describe( '#fromJSON()', function () {

		it( 'should deserialize this instance from the given JSON object', function () {

			const cell = new Cell();
			const entity = new GameEntity();
			entity._uuid = '4C06581E-448A-4557-835E-7A9D2CE20D30';
			cell.add( entity );

			const cell2 = new Cell( new AABB( new Vector3( 1, 1, 1 ), new Vector3( 1, 1, 1 ) ) ).fromJSON( PartitioningJSONs.Cell );

			const map = new Map();
			map.set( entity.uuid, entity );
			cell2.resolveReferences( map );

			expect( cell2 ).to.deep.equal( cell );

		} );

	} );

	describe( '#resolveReferences()', function () {

		it( 'should restore the references to other entities', function () {

			const cell = new Cell();
			const entity = new GameEntity();
			entity._uuid = '4C06581E-448A-4557-835E-7A9D2CE20D30';
			cell.add( entity.uuid );

			const map = new Map();
			map.set( entity.uuid, entity );
			cell.resolveReferences( map );

			expect( cell.entries[ 0 ] ).to.deep.equal( entity );

		} );

	} );

} );
