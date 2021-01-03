/**
 * @author Mugen87 / https://github.com/Mugen87
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../../build/yuka.js' );
const PerceptionJSONs = require( '../../../files/PerceptionJSONs.js' );

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
			expect( memorySystem.recordsMap.has( entity ) ).to.be.true;

			const record = memorySystem.recordsMap.get( entity );
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

			expect( memorySystem.recordsMap.has( entity ) ).to.be.false;
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

	describe( '#toJSON()', function () {

		it( 'should serialize this instance to a JSON object', function () {

			const owner = new GameEntity();
			owner._uuid = '4C06581E-448A-4557-835E-7A9D2CE20D30';

			const memorySystem = new MemorySystem( owner );

			const entity = new GameEntity();
			entity._uuid = '52A33A16-6843-4C98-9A8E-9FCEA255A481';
			memorySystem.createRecord( entity );

			expect( memorySystem.toJSON() ).to.be.deep.equal( PerceptionJSONs.MemorySystem );

		} );

	} );

	describe( '#fromJSON()', function () {

		it( 'should deserialize this instance from the given JSON object', function () {

			const owner = new GameEntity();
			owner._uuid = '4C06581E-448A-4557-835E-7A9D2CE20D30';

			const memorySystem1 = new MemorySystem( owner );

			const entity = new GameEntity();
			entity._uuid = '52A33A16-6843-4C98-9A8E-9FCEA255A481';
			memorySystem1.createRecord( entity );

			const entities = new Map();
			entities.set( owner.uuid, owner );
			entities.set( entity.uuid, entity );

			const memorySystem2 = new MemorySystem().fromJSON( PerceptionJSONs.MemorySystem );

			memorySystem2.resolveReferences( entities );

			expect( memorySystem1 ).to.be.deep.equal( memorySystem2 );

		} );

	} );

	describe( '#resolveReferences()', function () {

		it( 'should restore the reference to the entity', function () {

			const owner = new GameEntity();
			owner._uuid = '4C06581E-448A-4557-835E-7A9D2CE20D30';

			const entities = new Map();
			entities.set( owner.uuid, owner );

			const memorySystem = new MemorySystem();
			memorySystem.owner = '4C06581E-448A-4557-835E-7A9D2CE20D30';

			memorySystem.resolveReferences( entities );

			expect( memorySystem.owner ).to.equal( owner );

		} );

		it( 'should set the owner to null if the mapping is missing', function () {

			const memorySystem = new MemorySystem();
			memorySystem.owner = '4C06581E-448A-4557-835E-7A9D2CE20D30';

			memorySystem.resolveReferences( new Map() );

			expect( memorySystem.owner ).to.be.null;

		} );

	} );

} );
