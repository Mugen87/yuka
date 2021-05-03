/**
 * @author Mugen87 / https://github.com/Mugen87
 */

const expect = require( 'chai' ).expect;
const YUKA = require( '../../../build/yuka.js' );
const CoreJSONs = require( '../../files/CoreJSONs.js' );

const GameEntity = YUKA.GameEntity;
const Vector3 = YUKA.Vector3;
const Quaternion = YUKA.Quaternion;
const Matrix4 = YUKA.Matrix4;
const EntityManager = YUKA.EntityManager;

describe( 'GameEntity', function () {

	describe( '#constructor()', function () {

		it( 'should create an object with correct default values', function () {

			const entity = new GameEntity();

			expect( entity ).to.have.a.property( 'uuid' ).that.is.a( 'string' );
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
			expect( entity ).to.have.a.property( 'canActivateTrigger' ).that.is.true;

			expect( entity ).to.have.a.property( 'worldMatrix' ).that.is.an.instanceof( Matrix4 );

			expect( entity ).to.have.a.property( 'manager' ).that.is.null;

			expect( entity ).to.have.a.property( '_localMatrix' ).that.is.an.instanceof( Matrix4 );

			expect( entity ).to.have.a.property( '_renderComponent' ).that.is.null;
			expect( entity ).to.have.a.property( '_renderComponentCallback' ).that.is.null;
			expect( entity ).to.have.a.property( '_started' ).that.is.false;

		} );

	} );

	describe( '#start()', function () {

		it( 'should exist', function () {

			const entity = new GameEntity();
			expect( entity ).respondTo( 'start' );

		} );

		it( 'should return self', function () {

			const entity = new GameEntity();
			expect( entity.start() ).to.equal( entity );

		} );

	} );

	describe( '#update()', function () {

		it( 'should exist', function () {

			const entity = new GameEntity();
			expect( entity ).respondTo( 'update' );

		} );

		it( 'should return self', function () {

			const entity = new GameEntity();
			expect( entity.update() ).to.equal( entity );

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
			entity.position.set( - 1, 0, 0 );

			const target = new Vector3( - 1, 0, - 1 );
			entity.lookAt( target );

			expect( entity.rotation.x ).to.closeTo( 0, Number.EPSILON );
			expect( entity.rotation.y ).to.closeTo( 1, Number.EPSILON );
			expect( entity.rotation.z ).to.closeTo( 0, Number.EPSILON );
			expect( entity.rotation.w ).to.closeTo( 0, Number.EPSILON );

		} );

		it( 'should support transformed parents', function () {

			const parent = new GameEntity();
			parent.position.set( - 1, 0, 0 );
			parent.rotation.fromEuler( 0, Math.PI * 0.5, 0 );

			const entity = new GameEntity();
			const target = new Vector3( - 1, 0, - 1 );

			parent.add( entity );
			entity.lookAt( target );

			expect( entity.rotation.x ).to.closeTo( 0, Number.EPSILON );
			expect( entity.rotation.y ).to.closeTo( 0.7071067811865475, Number.EPSILON );
			expect( entity.rotation.z ).to.closeTo( 0, Number.EPSILON );
			expect( entity.rotation.w ).to.closeTo( 0.7071067811865475, Number.EPSILON );

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

		it( 'should support transformed parents', function () {

			const parent = new GameEntity();
			parent.rotation.fromEuler( 0, Math.PI * 0.5, 0 );

			const entity = new GameEntity();
			const target = new Vector3( 0, 0, - 1 );
			parent.add( entity );

			entity.rotateTo( target, 1 );
			expect( entity.rotation.x ).to.closeTo( 0, Number.EPSILON );
			expect( entity.rotation.y ).to.closeTo( 0.7071067811865475, Number.EPSILON );
			expect( entity.rotation.z ).to.closeTo( 0, Number.EPSILON );
			expect( entity.rotation.w ).to.closeTo( 0.7071067811865475, Number.EPSILON );

		} );

	} );

	describe( '#getWorldDirection()', function () {

		it( 'should compute the direction of this game entity in world space', function () {

			const parent = new GameEntity();
			const entity = new GameEntity();

			parent.add( entity );

			const targetPosition = new Vector3( - 1, 0, 0 );

			parent.lookAt( targetPosition );

			const worldDirection = new Vector3();

			entity.getWorldDirection( worldDirection );

			expect( worldDirection.x ).to.closeTo( - 1, Number.EPSILON );
			expect( worldDirection.y ).to.closeTo( 0, Number.EPSILON );
			expect( worldDirection.z ).to.closeTo( 0, Number.EPSILON );

		} );

	} );

	describe( '#getWorldPosition()', function () {

		it( 'should compute the position of this game entity in world space', function () {

			const parent = new GameEntity();
			const entity = new GameEntity();

			parent.add( entity );

			const targetPosition = new Vector3( 1, 1, 1 );
			parent.position.copy( targetPosition );

			const worldPosition = new Vector3();

			entity.getWorldPosition( worldPosition );

			expect( worldPosition ).to.deep.equal( targetPosition );

		} );

	} );

	describe( '#setRenderComponent()', function () {

		it( 'should set the given parameters to the internal private properties', function () {

			const entity = new GameEntity();

			const mesh = {};
			const sync = function () {};

			entity.setRenderComponent( mesh, sync );

			expect( entity._renderComponent ).to.equal( mesh );
			expect( entity._renderComponentCallback ).to.equal( sync );

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

	describe( '#lineOfSightTest()', function () {

		it( 'should exist', function () {

			const entity = new GameEntity();
			expect( entity ).respondTo( 'lineOfSightTest' );

		} );

		it( 'should return "null" to indicate no blocking of the given line of sight', function () {

			const entity = new GameEntity();
			expect( entity.lineOfSightTest() ).to.be.null;

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

	describe( '#toJSON()', function () {

		it( 'should serialize this instance to a JSON object', function () {

			const entity = new GameEntity();
			entity._uuid = '4C06581E-448A-4557-835E-7A9D2CE20D30';

			expect( entity.toJSON() ).to.be.deep.equal( CoreJSONs.GameEntity );

		} );

	} );

	describe( '#fromJSON()', function () {

		it( 'should deserialize this instance from the given JSON object', function () {

			const entity1 = new GameEntity();
			entity1._uuid = '4C06581E-448A-4557-835E-7A9D2CE20D30';

			const entity2 = new GameEntity().fromJSON( CoreJSONs.GameEntity );

			expect( entity2 ).to.be.deep.equal( entity1 );

		} );

	} );

	describe( '#resolveReferences()', function () {

		it( 'should restore the references to other entities', function () {

			const entity1 = new GameEntity();
			const entity2 = new GameEntity();
			const entity1a = new GameEntity();

			//set ids
			entity1._uuid = '4C06581E-448A-4557-835E-7A9D2CE20D30';
			entity2._uuid = '52A33A16-6843-4C98-9A8E-9FCEA255A481';
			entity1a._uuid = '4C06581E-448A-4557-835E-7A9D2CE20D30';

			//set references
			entity1.add( entity2 );
			entity2.add( entity1 );
			entity1.neighbors.push( entity2 );

			entity1a.children.push( entity2.uuid );
			entity1a.parent = entity2.uuid;
			entity1a.neighbors.push( entity2.uuid );

			const map = new Map();
			map.set( entity2.uuid, entity2 );

			entity1a.resolveReferences( map );

			expect( entity1a ).to.deep.equal( entity1 );

		} );

		it( 'should set the parent to null if the mapping is missing', function () {

			const entity = new GameEntity();
			entity.parent = '4C06581E-448A-4557-835E-7A9D2CE20D30';

			entity.resolveReferences( new Map() );

			expect( entity.parent ).to.be.null;

		} );

	} );

	describe( '#_updateMatrix()', function () {

		it( 'should compose a matrix from position, rotation and scale', function () {

			const entity = new GameEntity();
			entity.position.set( 1, 1, 1 );
			entity.scale.set( 2, 2, 2 );

			entity._updateMatrix();

			expect( entity._localMatrix.elements ).to.deep.equal( [ 2, 0, 0, 0, 0, 2, 0, 0, 0, 0, 2, 0, 1, 1, 1, 1 ] );

		} );

		it( 'should invalidate the world matrix if an update is necessary', function () {

			const entity = new GameEntity();
			entity.position.set( 1, 1, 1 );
			entity.scale.set( 2, 2, 2 );

			entity._updateMatrix();

			expect( entity._worldMatrixDirty ).to.be.true;

			entity._worldMatrixDirty = false; // reset

			entity._updateMatrix();

			expect( entity._worldMatrixDirty ).to.be.false;

		} );

	} );

	describe( '#_updateWorldMatrix()', function () {

		it( 'should update the local matrix of the entity', function () {

			const entity = new GameEntity();
			entity.position.set( 1, 1, 1 );
			entity.scale.set( 2, 2, 2 );

			entity._updateWorldMatrix();

			expect( entity._localMatrix.elements ).to.deep.equal( [ 2, 0, 0, 0, 0, 2, 0, 0, 0, 0, 2, 0, 1, 1, 1, 1 ] );

		} );

		it( 'should not recompute the world matrix if it is still valid', function () {

			const entity = new GameEntity();
			entity.position.set( 1, 1, 1 );
			entity.scale.set( 2, 2, 2 );

			entity._updateWorldMatrix();

			expect( entity._localMatrix.elements ).to.deep.equal( [ 2, 0, 0, 0, 0, 2, 0, 0, 0, 0, 2, 0, 1, 1, 1, 1 ] );

			entity._updateWorldMatrix(); // does not trigger a recompute

		} );

		it( 'should update the world matrix with the local matrix if the game entity has no parent', function () {

			const entity = new GameEntity();
			entity.position.set( 1, 1, 1 );
			entity.scale.set( 2, 2, 2 );

			entity._updateWorldMatrix();

			expect( entity._worldMatrix.elements ).to.deep.equal( entity._localMatrix.elements );

		} );

		it( 'should invalidate the world matrix of children if an update is necessary', function () {

			const entity = new GameEntity();
			entity.position.set( 1, 1, 1 );
			entity.scale.set( 2, 2, 2 );

			const child1 = new GameEntity();
			entity.add( child1 );

			const child2 = new GameEntity();
			entity.add( child2 );

			const childOfChild1 = new GameEntity();
			child1.add( childOfChild1 );

			entity._updateWorldMatrix();

			expect( child1._worldMatrixDirty ).to.be.true;
			expect( child2._worldMatrixDirty ).to.be.true;
			expect( childOfChild1._worldMatrixDirty ).to.be.false;

		} );

		it( 'should update the upper hierachy of game entities to ensure a correct world matrix', function () {

			const entity = new GameEntity();
			entity.position.set( 1, 1, 1 );

			const child = new GameEntity();
			child.position.set( 0, 0, 1 );
			entity.add( child );

			const childOfChild = new GameEntity();
			childOfChild.position.set( 1, 0, 0 );
			child.add( childOfChild );

			childOfChild._updateWorldMatrix();

			expect( entity._localMatrix.elements ).to.deep.equal( [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1 ] );
			expect( child._localMatrix.elements ).to.deep.equal( [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1 ] );
			expect( childOfChild._localMatrix.elements ).to.deep.equal( [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1 ] );

			expect( entity._worldMatrix.elements ).to.deep.equal( [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1 ] );
			expect( child._worldMatrix.elements ).to.deep.equal( [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 1, 2, 1 ] );
			expect( childOfChild._worldMatrix.elements ).to.deep.equal( [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 2, 1, 2, 1 ] );

		} );

		it( 'should update the world matrix if no changes to the local matrix happen but the dirty flag is true', function () {

			const entity = new GameEntity();
			entity.position.set( 1, 1, 1 );
			entity.scale.set( 2, 2, 2 );

			const child = new GameEntity();
			entity.add( child );

			entity._updateWorldMatrix(); // this call will set the dirty flag in child to true which forces a recompute
			child._updateWorldMatrix();

			expect( child._worldMatrix.elements ).to.deep.equal( entity._worldMatrix.elements );

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
