/**
 * @author Mugen87 / https://github.com/Mugen87
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../build/yuka.js' );

const GameEntity = YUKA.GameEntity;
const Vector3 = YUKA.Vector3;
const Quaternion = YUKA.Quaternion;
const Matrix4 = YUKA.Matrix4;
const EntityManager = YUKA.EntityManager;

describe( 'GameEntity', function () {

	describe( '#constructor()', function () {

		it( 'should create an object with correct default values', function () {

			const entity = new GameEntity();
			expect( entity ).to.have.a.property( 'id' ).that.is.a( 'number' );
			expect( entity ).to.have.a.property( 'name' ).that.is.equal( '' );
			expect( entity ).to.have.a.property( 'active' ).that.is.true;

			expect( entity ).to.have.a.property( 'position' ).that.is.an.instanceof( Vector3 );
			expect( entity ).to.have.a.property( 'rotation' ).that.is.an.instanceof( Quaternion );
			expect( entity ).to.have.a.property( 'scale' ).that.is.an.instanceof( Vector3 ).and.that.is.deep.equal( { x: 1, y: 1, z: 1 } );

			expect( entity ).to.have.a.property( 'forward' ).that.is.an.instanceof( Vector3 ).and.that.is.deep.equal( { x: 0, y: 0, z: 1 } );
			expect( entity ).to.have.a.property( 'up' ).that.is.an.instanceof( Vector3 ).and.that.is.deep.equal( { x: 0, y: 1, z: 0 } );

			expect( entity ).to.have.a.property( 'boundingRadius' ).that.is.equal( 0 );
			expect( entity ).to.have.a.property( 'maxTurnRate' ).that.is.equal( Math.PI );

			expect( entity ).to.have.a.property( 'matrix' ).that.is.an.instanceof( Matrix4 );

			expect( entity ).to.have.a.property( 'manager' ).that.is.null;

		} );

	} );

	describe( '#start()', function () {

		it( 'should exist', function () {

			const entity = new GameEntity();
			expect( entity ).respondTo( 'start' );

		} );

	} );

	describe( '#update()', function () {

		it( 'should exist', function () {

			const entity = new GameEntity();
			expect( entity ).respondTo( 'update' );

		} );

	} );

	describe( '#getDirection()', function () {

		it( 'should return a vector that represents the look direction of a game entity', function () {

			const entity = new GameEntity();
			const direction = new Vector3();

			entity.getDirection( direction );

			expect( direction ).to.deep.equal( { x: 0, y: 0, z: 1 } );

		} );

	} );

	describe( '#lookAt()', function () {

		it( 'should change the rotation property so the game entity directly faces the given target', function () {

			const entity = new GameEntity();
			const target = new Vector3( 0, 0, - 1 );
			entity.lookAt( target );

			expect( entity.rotation.x ).to.closeTo( 0, Number.EPSILON );
			expect( entity.rotation.y ).to.closeTo( 1, Number.EPSILON );
			expect( entity.rotation.z ).to.closeTo( 0, Number.EPSILON );
			expect( entity.rotation.w ).to.closeTo( 0, Number.EPSILON );

		} );

	} );

	describe( '#rotateTo()', function () {

		it( 'should gradually change the rotation property so the game entity directly faces the given target', function () {

			const entity = new GameEntity();
			const target = new Vector3( 0, 0, - 1 );

			entity.rotateTo( target, 0.5 );
			expect( entity.rotation.x ).to.closeTo( 0, Number.EPSILON );
			expect( entity.rotation.y ).to.closeTo( 0.7071067811865475, Number.EPSILON );
			expect( entity.rotation.z ).to.closeTo( 0, Number.EPSILON );
			expect( entity.rotation.w ).to.closeTo( 0.7071067811865475, Number.EPSILON );

			entity.rotateTo( target, 0.5 );
			expect( entity.rotation.x ).to.closeTo( 0, Number.EPSILON );
			expect( entity.rotation.y ).to.closeTo( 1, Number.EPSILON );
			expect( entity.rotation.z ).to.closeTo( 0, Number.EPSILON );
			expect( entity.rotation.w ).to.closeTo( 0, Number.EPSILON );

		} );

	} );

	describe( '#updateMatrix()', function () {

		it( 'should compose a matrix from position, rotation and scale', function () {

			const entity = new GameEntity();
			entity.position.set( 1, 1, 1 );
			entity.scale.set( 2, 2, 2 );

			entity.updateMatrix();

			expect( entity.matrix.elements ).to.deep.equal( [ 2, 0, 0, 0, 0, 2, 0, 0, 0, 0, 2, 0, 1, 1, 1, 1 ] );

		} );

	} );

	describe( '#handleMessage()', function () {

		it( 'should exist', function () {

			const entity = new GameEntity();
			expect( entity ).respondTo( 'handleMessage' );

		} );

		it( 'should return "false" to indicate no message handling', function () {

			const entity = new GameEntity();
			expect( entity.handleMessage() ).to.be.false;

		} );

	} );

	describe( '#sendMessage()', function () {

		it( 'should send a message to another entity', function () {

			const manager = new EntityManager();

			const sender = new GameEntity();
			const receiver = new MessageEntity();

			manager.add( sender );
			manager.add( receiver );

			sender.sendMessage( receiver, 'test' );

			expect( receiver.messageHandled ).to.be.true;

		} );

	} );

} );

//

class MessageEntity extends GameEntity {

	constructor() {

		super();

		this.messageHandled = false;

	}

	handleMessage() {

		this.messageHandled = true;

		return true;

	}

}
