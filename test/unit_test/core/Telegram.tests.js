/**
 * @author Mugen87 / https://github.com/Mugen87
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../build/yuka.js' );
const CoreJSONs = require( '../../files/CoreJSONs.js' );

const Telegram = YUKA.Telegram;
const GameEntity = YUKA.GameEntity;

describe( 'Telegram', function () {

	describe( '#constructor()', function () {

		it( 'should create an object with correct default values', function () {

			const telegram = new Telegram();
			expect( telegram ).to.have.a.property( 'sender' );
			expect( telegram ).to.have.a.property( 'receiver' );
			expect( telegram ).to.have.a.property( 'message' );
			expect( telegram ).to.have.a.property( 'delay' );
			expect( telegram ).to.have.a.property( 'data' );

		} );

	} );

	describe( '#toJSON()', function () {

		it( 'should serialize this instance to a JSON object', function () {

			const sender = new GameEntity();
			const receiver = new GameEntity();
			const telegram = new Telegram( sender, receiver, 'Test', 1, null );

			sender._uuid = '4C06581E-448A-4557-835E-7A9D2CE20D30';
			receiver._uuid = '52A33A16-6843-4C98-9A8E-9FCEA255A481';

			const json = telegram.toJSON();

			expect( json ).to.deep.equal( CoreJSONs.Telegram );

		} );

	} );

	describe( '#fromJSON()', function () {

		it( 'should deserialize this instance from the given JSON object', function () {

			const sender = new GameEntity();
			const receiver = new GameEntity();
			const telegram = new Telegram( sender, receiver, 'Test', 1, null );
			const telegram2 = new Telegram().fromJSON( CoreJSONs.Telegram );

			sender._uuid = '4C06581E-448A-4557-835E-7A9D2CE20D30';
			receiver._uuid = '52A33A16-6843-4C98-9A8E-9FCEA255A481';

			const map = new Map();
			map.set( sender.uuid, sender );
			map.set( receiver.uuid, receiver );

			telegram2.resolveReferences( map );

			expect( telegram2 ).to.deep.equal( telegram );

		} );

	} );

	describe( '#resolveReferences()', function () {

		it( 'should restore the references to other entities', function () {


			const sender = new GameEntity();
			const receiver = new GameEntity();
			const telegram = new Telegram( sender, receiver, 'Test', 1, null );

			sender._uuid = '4C06581E-448A-4557-835E-7A9D2CE20D30';
			receiver._uuid = '52A33A16-6843-4C98-9A8E-9FCEA255A481';

			const telegram2 = new Telegram( sender.uuid, receiver.uuid, 'Test', 1, null );

			const map = new Map();
			map.set( sender.uuid, sender );
			map.set( receiver.uuid, receiver );

			telegram2.resolveReferences( map );

			expect( telegram2 ).to.deep.equal( telegram );

		} );

	} );

} );
