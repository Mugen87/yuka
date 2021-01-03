/**
 * @author Mugen87 / https://github.com/Mugen87
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../../build/yuka.js' );
const PerceptionJSONs = require( '../../../files/PerceptionJSONs.js' );

const MemoryRecord = YUKA.MemoryRecord;
const GameEntity = YUKA.GameEntity;

describe( 'MemoryRecord', function () {

	describe( '#constructor()', function () {

		it( 'should create an object with correct default values', function () {

			const record = new MemoryRecord();
			expect( record ).to.have.a.property( 'entity' ).that.is.null;
			expect( record ).to.have.a.property( 'timeBecameVisible' ).that.is.equal( - Infinity );
			expect( record ).to.have.a.property( 'timeLastSensed' ).that.is.equal( - Infinity );
			expect( record ).to.have.a.property( 'lastSensedPosition' ).that.is.deep.equal( { x: 0, y: 0, z: 0 } );
			expect( record ).to.have.a.property( 'visible' ).that.is.false;

		} );

		it( 'should apply the parameters to the new object', function () {

			const entity = new GameEntity();
			const record = new MemoryRecord( entity );

			expect( record.entity ).to.equal( entity );

		} );

	} );

	describe( '#toJSON()', function () {

		it( 'should serialize this instance to a JSON object', function () {

			const entity = new GameEntity();
			entity._uuid = '4C06581E-448A-4557-835E-7A9D2CE20D30';

			const record = new MemoryRecord( entity );

			expect( record.toJSON() ).to.be.deep.equal( PerceptionJSONs.MemoryRecord );

		} );

	} );

	describe( '#fromJSON()', function () {

		it( 'should deserialize this instance from the given JSON object', function () {

			const record1 = new MemoryRecord();
			record1.entity = '4C06581E-448A-4557-835E-7A9D2CE20D30';

			const record2 = new MemoryRecord().fromJSON( PerceptionJSONs.MemoryRecord );

			expect( record1 ).to.be.deep.equal( record2 );

		} );

	} );

	describe( '#resolveReferences()', function () {

		it( 'should restore the reference to the entity', function () {

			const entity = new GameEntity();
			entity._uuid = '4C06581E-448A-4557-835E-7A9D2CE20D30';

			const entities = new Map();
			entities.set( entity.uuid, entity );

			const record = new MemoryRecord();
			record.entity = entity.uuid;

			record.resolveReferences( entities );

			expect( record.entity ).to.equal( entity );

		} );

		it( 'should set the owner to null if the mapping is missing', function () {

			const record = new MemoryRecord();
			record.entity = '4C06581E-448A-4557-835E-7A9D2CE20D30';

			record.resolveReferences( new Map() );

			expect( record.entity ).to.be.null;

		} );

	} );

} );
