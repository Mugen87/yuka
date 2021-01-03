/**
 * @author Mugen87 / https://github.com/Mugen87
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../build/yuka.js' );
const CoreJSONs = require( '../../files/CoreJSONs.js' );

const MessageDispatcher = YUKA.MessageDispatcher;
const GameEntity = YUKA.GameEntity;
const Telegram = YUKA.Telegram;

describe( 'MessageDispatcher', function () {

	describe( '#constructor()', function () {

		it( 'should create an object with correct default values', function () {

			const messageDispatcher = new MessageDispatcher();
			expect( messageDispatcher ).to.have.a.property( 'delayedTelegrams' ).that.is.an( 'array' ).and.empty;

		} );

	} );

	describe( '#deliver()', function () {

		it( 'should deliver a message to the defined receiver of a telegram', function () {

			const messageDispatcher = new MessageDispatcher();
			const entity = new MessageEntity();
			const telegram = new Telegram();
			telegram.receiver = entity;

			messageDispatcher.deliver( telegram );

			expect( entity.messageHandled ).to.be.true;
			expect( entity.validTelegram ).to.be.true;

		} );

		it( 'should print a warning if the message was not handled by the receiver', function () {

			const messageDispatcher = new MessageDispatcher();
			const entity = new GameEntity();
			const telegram = new Telegram();
			telegram.receiver = entity;

			YUKA.Logger.setLevel( YUKA.Logger.LEVEL.SILENT );

			messageDispatcher.deliver( telegram );

		} );

	} );

	describe( '#dispatch()', function () {

		it( 'should create a telegram from the given data and perform the delivery', function () {

			const messageDispatcher = new MessageDispatcher();

			const sender = new MessageEntity();
			const receiver = new MessageEntity();

			messageDispatcher.dispatch( sender, receiver, 'test', 0, {} );

			expect( receiver.messageHandled ).to.be.true;
			expect( receiver.validTelegram ).to.be.true;

		} );

		it( 'should push a delayed telegram to the internal array', function () {

			const messageDispatcher = new MessageDispatcher();

			const sender = new MessageEntity();
			const receiver = new MessageEntity();

			messageDispatcher.dispatch( sender, receiver, 'test', 100, {} );

			expect( messageDispatcher.delayedTelegrams ).to.have.lengthOf( 1 );

		} );

	} );

	describe( '#dispatchDelayedMessages()', function () {

		it( 'should process delayed messages with correct timing', function () {

			const messageDispatcher = new MessageDispatcher();

			const entity = new MessageEntity();

			const telegram = new Telegram();
			telegram.receiver = entity;
			telegram.delay = 1000; // ms

			messageDispatcher.delayedTelegrams.push( telegram );

			messageDispatcher.dispatchDelayedMessages( 500 );
			expect( messageDispatcher.delayedTelegrams ).to.have.lengthOf( 1 );
			messageDispatcher.dispatchDelayedMessages( 1000 );
			expect( messageDispatcher.delayedTelegrams ).to.be.empty;

		} );

	} );

	describe( '#clear()', function () {

		it( 'should remove all delayed messages from the internal array', function () {

			const messageDispatcher = new MessageDispatcher();
			messageDispatcher.delayedTelegrams.push( new Telegram() );
			messageDispatcher.delayedTelegrams.push( new Telegram() );
			messageDispatcher.delayedTelegrams.push( new Telegram() );

			messageDispatcher.clear();

			expect( messageDispatcher.delayedTelegrams ).to.be.empty;

		} );

	} );
	describe( '#toJSON()', function () {

		it( 'should serialize this instance to a JSON object', function () {

			const sender = new GameEntity();
			const receiver = new GameEntity();
			const telegram = new Telegram( sender, receiver, 'Test', 1, null );
			const messageDispatcher = new MessageDispatcher();
			messageDispatcher.dispatch( telegram.sender, telegram.receiver, telegram.message, telegram.delay, telegram.data );

			sender._uuid = '4C06581E-448A-4557-835E-7A9D2CE20D30';
			receiver._uuid = '52A33A16-6843-4C98-9A8E-9FCEA255A481';

			const json = messageDispatcher.toJSON();

			expect( json ).to.deep.equal( CoreJSONs.MessageDispatcher );

		} );

	} );

	describe( '#fromJSON()', function () {

		it( 'should deserialize this instance from the given JSON object', function () {

			const sender = new GameEntity();
			const receiver = new GameEntity();
			const telegram = new Telegram( sender, receiver, 'Test', 1, null );
			const messageDispatcher = new MessageDispatcher();
			messageDispatcher.dispatch( telegram.sender, telegram.receiver, telegram.message, telegram.delay, telegram.data );
			const messageDispatcher2 = new MessageDispatcher().fromJSON( CoreJSONs.MessageDispatcher );

			sender._uuid = '4C06581E-448A-4557-835E-7A9D2CE20D30';
			receiver._uuid = '52A33A16-6843-4C98-9A8E-9FCEA255A481';

			const map = new Map();
			map.set( sender.uuid, sender );
			map.set( receiver.uuid, receiver );

			messageDispatcher2.resolveReferences( map );

			expect( messageDispatcher2 ).to.deep.equal( messageDispatcher );

		} );

	} );

	describe( '#resolveReferences()', function () {

		it( 'should restore the references to other entities', function () {


			const sender = new GameEntity();
			const receiver = new GameEntity();
			const telegram = new Telegram( sender, receiver, 'Test', 1, null );
			const messageDispatcher = new MessageDispatcher();
			messageDispatcher.dispatch( telegram.sender, telegram.receiver, telegram.message, telegram.delay, telegram.data );

			sender._uuid = '4C06581E-448A-4557-835E-7A9D2CE20D30';
			receiver._uuid = '52A33A16-6843-4C98-9A8E-9FCEA255A481';

			const messageDispatcher2 = new MessageDispatcher();
			messageDispatcher2.dispatch( telegram.sender.uuid, telegram.receiver.uuid, telegram.message, telegram.delay, telegram.data );

			const map = new Map();
			map.set( sender.uuid, sender );
			map.set( receiver.uuid, receiver );

			messageDispatcher2.resolveReferences( map );

			expect( messageDispatcher2 ).to.deep.equal( messageDispatcher );

		} );

	} );

} );

//

class MessageEntity extends GameEntity {

	constructor() {

		super();

		this.validTelegram = false;
		this.messageHandled = false;

	}

	handleMessage( telegram ) {

		this.validTelegram = ( telegram instanceof Telegram );
		this.messageHandled = true;

		return true;

	}

}
