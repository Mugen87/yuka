/**
 * @author Mugen87 / https://github.com/Mugen87
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../../build/yuka.js' );

const MemorySystem = YUKA.MemorySystem;
const GameEntity = YUKA.GameEntity;

describe( 'MemorySystem', function () {

	describe( '#constructor()', function () {

		it( 'should create an object with correct default values', function () {

			const memorySystem = new MemorySystem();
			expect( memorySystem ).to.have.a.property( 'owner' ).that.is.null;
			expect( memorySystem ).to.have.a.property( 'records' ).that.is.an( 'array' );
			expect( memorySystem ).to.have.a.property( 'recordsMap' ).that.is.a( 'map' );
			expect( memorySystem ).to.have.a.property( 'memorySpan' ).that.is.equal( 1 );

		} );

		it( 'should apply the parameters to the new object', function () {

			const entity = new GameEntity();
			const memorySystem = new MemorySystem( entity );

			expect( memorySystem.owner ).to.equal( entity );

		} );

	} );

	describe( '#createRecord()', function () {

		it( 'should create a memory record for the given game entity', function () {

			const memorySystem = new MemorySystem();
			const entity = new GameEntity();

			memorySystem.createRecord( entity );
			expect( memorySystem.recordsMap.has( entity.id ) ).to.be.true;

			const record = memorySystem.recordsMap.get( entity.id );
			expect( memorySystem.records ).to.include( record );

		} );

	} );

	describe( '#getRecord()', function () {

		it( 'should return the memory record for the given game entity', function () {

			const memorySystem = new MemorySystem();
			const entity = new GameEntity();

			memorySystem.createRecord( entity );
			const record = memorySystem.getRecord( entity );

			expect( record.entity ).to.equal( entity );

		} );

	} );

	describe( '#deleteRecord()', function () {

		it( 'should delete the memory record of the given game entity', function () {

			const memorySystem = new MemorySystem();
			const entity = new GameEntity();

			memorySystem.createRecord( entity );
			const record = memorySystem.getRecord( entity );

			memorySystem.deleteRecord( entity );

			expect( memorySystem.recordsMap.has( entity.id ) ).to.be.false;
			expect( memorySystem.records ).to.not.include( record );

		} );

	} );

	describe( '#hasRecord()', function () {

		it( 'should return true if there is a memory record for the given game entity', function () {

			const memorySystem = new MemorySystem();
			const entity = new GameEntity();

			memorySystem.createRecord( entity );
			expect( memorySystem.hasRecord( entity ) ).to.be.true;

			memorySystem.deleteRecord( entity );
			expect( memorySystem.hasRecord( entity ) ).to.be.false;


		} );

	} );

	describe( '#clear()', function () {

		it( 'should remove all memory records from the memory system', function () {

			const memorySystem = new MemorySystem();
			const entity = new GameEntity();

			memorySystem.createRecord( entity );
			memorySystem.clear();

			expect( memorySystem.hasRecord( entity ) ).to.be.false;

		} );

	} );

	describe( '#getValidMemoryRecords()', function () {

		it( 'should determine all valid memory record and store the result in the given array', function () {

			const memorySystem = new MemorySystem();
			memorySystem.memorySpan = 1;
			const currentTime = 2;
			const result = [];

			const entity1 = new GameEntity();
			const entity2 = new GameEntity();
			const entity3 = new GameEntity();

			memorySystem.createRecord( entity1 );
			memorySystem.createRecord( entity2 );
			memorySystem.createRecord( entity3 );

			const record1 = memorySystem.getRecord( entity1 );
			record1.timeLastSensed = 1.5;

			const record2 = memorySystem.getRecord( entity2 );
			record2.timeLastSensed = 1.1;

			const record3 = memorySystem.getRecord( entity3 );
			record3.timeLastSensed = 0.9; // too old

			memorySystem.getValidMemoryRecords( currentTime, result );

			expect( result ).to.include( record1, record2 );
			expect( result ).to.not.include( record3 );

		} );

	} );

} );
