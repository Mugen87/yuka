/**
 * @author Mugen87 / https://github.com/Mugen87
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../../build/yuka.js' );

const MemoryRecord = YUKA.MemoryRecord;
const GameEntity = YUKA.GameEntity;

describe( 'MemoryRecord', function () {

	describe( '#constructor()', function () {

		it( 'should create an object with correct default values', function () {

			const record = new MemoryRecord();
			expect( record ).to.have.a.property( 'entity' ).that.is.null;
			expect( record ).to.have.a.property( 'timeLastSensed' ).that.is.equal( - 1 );
			expect( record ).to.have.a.property( 'lastSensedPosition' ).that.is.deep.equal( { x: 0, y: 0, z: 0 } );
			expect( record ).to.have.a.property( 'visible' ).that.is.false;

		} );

		it( 'should apply the parameters to the new object', function () {

			const entity = new GameEntity();
			const record = new MemoryRecord( entity );

			expect( record.entity ).to.equal( entity );

		} );

	} );

} );
