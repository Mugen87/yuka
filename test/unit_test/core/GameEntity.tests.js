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

			expect( entity ).to.have.a.property( 'children' ).that.is.an( 'array' );
			expect( entity ).to.have.a.property( 'parent' ).that.is.null;

			expect( entity ).to.have.a.property( 'neighbors' ).that.is.an( 'array' );
			expect( entity ).to.have.a.property( 'neighborhoodRadius' ).that.is.equal( 1 );
			expect( entity ).to.have.a.property( 'updateNeighborhood' ).that.is.false;

			expect( entity ).to.have.a.property( 'position' ).that.is.an.instanceof( Vector3 );
			expect( entity ).to.have.a.property( 'rotation' ).that.is.an.instanceof( Quaternion );
			expect( entity ).to.have.a.property( 'scale' ).that.is.an.instanceof( Vector3 ).and.that.is.deep.equal( { x: 1, y: 1, z: 1 } );

			expect( entity ).to.have.a.property( 'forward' ).that.is.an.instanceof( Vector3 ).and.that.is.deep.equal( { x: 0, y: 0, z: 1 } );
			expect( entity ).to.have.a.property( 'up' ).that.is.an.instanceof( Vector3 ).and.that.is.deep.equal( { x: 0, y: 1, z: 0 } );

			expect( entity ).to.have.a.property( 'boundingRadius' ).that.is.equal( 0 );
			expect( entity ).to.have.a.property( 'maxTurnRate' ).that.is.equal( Math.PI );

			expect( entity ).to.have.a.property( 'matrix' ).that.is.an.instanceof( Matrix4 );
			expect( entity ).to.have.a.property( 'worldMatrix' ).that.is.an.instanceof( Matrix4 );

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

	describe( '#add()', function () {

		it( 'should add a game entity as a child to this entity', function () {

			const entity1 = new GameEntity();
			const entity2 = new GameEntity();

			entity1.add( entity2 );

			expect( entity1.children ).to.include( entity2 );
			expect( entity2.parent ).to.equal( entity1 );

		} );

		it( 'should remove an existing parent', function () {

			const entity1 = new GameEntity();
			const entity2 = new GameEntity();
			const entity3 = new GameEntity();

			entity1.add( entity2 );
			expect( entity2.parent ).to.equal( entity1 );

			entity3.add( entity2 );
			expect( entity2.parent ).to.equal( entity3 );
			expect( entity1.children ).to.not.include( entity2 );

		} );

	} );

	describe( '#remove()', function () {

		it( 'should remove a game entity from its parent', function () {

			const entity1 = new GameEntity();
			const entity2 = new GameEntity();

			entity1.add( entity2 );
			entity1.remove( entity2 );

			expect( entity1.children ).to.not.include( entity2 );
			expect( entity2.parent ).to.be.null;

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

	describe( '#updateWorldMatrix()', function () {

		it( 'should calculate a matrix that transforms the entity into world space', function () {

			const entity1 = new GameEntity();
			entity1.position.set( 1, 1, 1 );

			const entity2 = new GameEntity();
			entity2.position.set( 0, 0, 1 );

			entity1.add( entity2 );

			entity1.updateWorldMatrix();
			entity2.updateWorldMatrix();

			expect( entity1.worldMatrix.elements ).to.deep.equal( [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1 ] );
			expect( entity2.worldMatrix.elements ).to.deep.equal( [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 1, 2, 1 ] );

		} );

		it( 'should use its parameters to traverse the hierarchy up and down', function () {

			const entity1 = new GameEntity();
			entity1.position.set( 1, 1, 1 );

			const entity2 = new GameEntity();
			entity2.position.set( 0, 0, 1 );

			const entity3 = new GameEntity();
			entity3.position.set( 0, 1, 0 );

			entity1.add( entity2 );
			entity2.add( entity3 );

			entity2.updateWorldMatrix( true, true );

			expect( entity1.worldMatrix.elements ).to.deep.equal( [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1 ] );
			expect( entity2.worldMatrix.elements ).to.deep.equal( [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 1, 2, 1 ] );
			expect( entity3.worldMatrix.elements ).to.deep.equal( [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 2, 2, 1 ] );

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

		it( 'should print an error if no entity manager is set', function () {

			const sender = new GameEntity();
			const receiver = new MessageEntity();

			YUKA.Logger.setLevel( YUKA.Logger.LEVEL.SILENT );

			sender.sendMessage( receiver, 'test' );

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
