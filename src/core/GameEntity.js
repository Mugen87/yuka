import { Vector3 } from '../math/Vector3.js';
import { Quaternion } from '../math/Quaternion.js';
import { Matrix4 } from '../math/Matrix4.js';
import { Logger } from './Logger.js';

let nextId = 0;

const targetRotation = new Quaternion();
const targetDirection = new Vector3();

/**
* Base class for all game entities.
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class GameEntity {

	/**
	* Constructs a new game entity.
	*/
	constructor() {

		/**
		* The unique ID of this game entity.
		* @type Number
		*/
		this.id = nextId ++;

		/**
		* The name of this game entity.
		* @type String
		*/
		this.name = '';

		/**
		* Whether this game entity is active or not.
		* @type Boolean
		* @default true
		*/
		this.active = true;

		/**
		* The child entities of this game entity.
		* @type Array
		*/
		this.children = new Array();

		/**
		* A reference to the parent entity of this game entity.
		* Automatically set when added to a {@link GameEntity}.
		* @type GameEntity
		* @default null
		*/
		this.parent = null;

		/**
		* A list of neighbors of this game entity.
		* @type Array
		*/
		this.neighbors = new Array();

		/**
		* Game entities within this radius are considered as neighbors of this entity.
		* @type Number
		* @default 1
		*/
		this.neighborhoodRadius = 1;

		/**
		* Whether the neighborhood of this game entity is updated or not.
		* @type Boolean
		* @default false
		*/
		this.updateNeighborhood = false;

		/**
		* The position of this game entity.
		* @type Vector3
		*/
		this.position = new Vector3();

		/**
		* The rotation of this game entity.
		* @type Quaternion
		*/
		this.rotation = new Quaternion();

		/**
		* The scaling of this game entity.
		* @type Vector3
		*/
		this.scale = new Vector3( 1, 1, 1 );

		/**
		* The default forward vector of this game entity.
		* @type Vector3
		* @default (0,0,1)
		*/
		this.forward = new Vector3( 0, 0, 1 );

		/**
		* The default up vector of this game entity.
		* @type Vector3
		* @default (0,1,0)
		*/
		this.up = new Vector3( 0, 1, 0 );

		/**
		* The bounding radius of this game entity in world units.
		* @type Number
		* @default 0
		*/
		this.boundingRadius = 0;

		/**
		* The maximum turn rate of this game entity in radians per seconds.
		* @type Number
		* @default π
		*/
		this.maxTurnRate = Math.PI;

		/**
		* The field of view of this game entity in radians.
		* @type Number
		* @default π/2
		*/
		this.fieldOfView = Math.PI;

		/**
		* The visual range of this game entity in world units.
		* @type Number
		* @default Infinity
		*/
		this.visualRange = Infinity;

		/**
		* A transformation matrix representing the local space of this game entity.
		* @type Matrix4
		*/
		this.matrix = new Matrix4();

		/**
		* A transformation matrix representing the world space of this game entity.
		* @type Matrix4
		*/
		this.worldMatrix = new Matrix4();

		/**
		* A reference to the entity manager of this game entity.
		* Automatically set when added to an {@link EntityManager}.
		* @type EntityManager
		* @default null
		*/
		this.manager = null;

		//

		this._cache = {
			position: new Vector3(),
			rotation: new Quaternion(),
			scale: new Vector3()
		};

		this._renderComponent = null;
		this._renderComponentCallback = null;

	}

	/**
	* Executed when this game entity is updated for the first time by its {@link EntityManager}.
	*
	* @return {GameEntity} A reference to this game entity.
	*/
	start() {}

	/**
	* Updates the internal state of this game entity. Normally called by {@link EntityManager#update}
	* in each simulation step.
	*
	* @param {Number} delta - The time delta.
	* @return {GameEntity} A reference to this game entity.
	*/
	update( /* delta */ ) {}


	/**
	* Adds a game entity as a child to this game entity.
	*
	* @param {GameEntity} entity - The game entity to add.
	* @return {GameEntity} A reference to this game entity.
	*/
	add( entity ) {

		if ( entity.parent !== null ) {

			entity.parent.remove( entity );

		}

		this.children.push( entity );
		entity.parent = this;

		return this;

	}

	/**
	* Removes a game entity as a child from this game entity.
	*
	* @param {GameEntity} entity - The game entity to remove.
	* @return {GameEntity} A reference to this game entity.
	*/
	remove( entity ) {

		const index = this.children.indexOf( entity );
		this.children.splice( index, 1 );

		entity.parent = null;

		return this;

	}

	/**
	* Computes the current direction (forward) vector of this game entity
	* and stores the result in the given vector.
	*
	* @param {Vector3} result - The direction vector of this game entity.
	* @return {Vector3} The direction vector of this game entity.
	*/
	getDirection( result ) {

		return result.copy( this.forward ).applyRotation( this.rotation ).normalize();

	}

	/**
	* Directly rotates the entity so it faces the given target position.
	*
	* @param {Vector3} target - The target position.
	* @return {GameEntity} A reference to this game entity.
	*/
	lookAt( target ) {

		targetDirection.subVectors( target, this.position ).normalize();

		this.rotation.lookAt( this.forward, targetDirection, this.up );

		return this;

	}

	/**
	* Given a target position, this method rotates the entity by an amount not
	* greater than {@link GameEntity#maxTurnRate} until it directly faces the target.
	*
	* @param {Vector3} target - The target position.
	* @param {Number} delta - The time delta.
	* @return {GameEntity} A reference to this game entity.
	*/
	rotateTo( target, delta ) {

		targetDirection.subVectors( target, this.position ).normalize();
		targetRotation.lookAt( this.forward, targetDirection, this.up );

		this.rotation.rotateTo( targetRotation, this.maxTurnRate * delta );

		return this;

	}

	/**
	* Updates the transformation matrix representing the local space.
	*
	* @return {GameEntity} A reference to this game entity.
	*/
	updateMatrix() {

		const cache = this._cache;

		if ( cache.position.equals( this.position ) &&
				cache.rotation.equals( this.rotation ) &&
				cache.scale.equals( this.scale ) ) {

			return this;

		}

		this.matrix.compose( this.position, this.rotation, this.scale );

		cache.position.copy( this.position );
		cache.rotation.copy( this.rotation );
		cache.scale.copy( this.scale );

		return this;

	}

	/**
	* Updates the world matrix representing the world space.
	*
	* @param {Boolean} up - Whether to update the world matrices of the parents or not.
	* @param {Boolean} down - Whether to update the world matrices of the childs or not.
	* @return {GameEntity} A reference to this game entity.
	*/
	updateWorldMatrix( up = false, down = false ) {

		const parent = this.parent;
		const children = this.children;

		// update higher levels first

		if ( up === true && parent !== null ) {

			parent.updateWorldMatrix( true );

		}

		// update this entity

		this.updateMatrix();

		if ( parent === null ) {

			this.worldMatrix.copy( this.matrix );

		} else {

			this.worldMatrix.multiplyMatrices( this.parent.worldMatrix, this.matrix );

		}

		// update lower levels

		if ( down === true ) {

			for ( let i = 0, l = children.length; i < l; i ++ ) {

				const child = children[ i ];

				child.updateWorldMatrix( false, true );

			}

		}

		return this;

	}

	/**
	* Sets a renderable component of a 3D engine with a sync callback for this game entity.
	*
	* @param {Object} renderComponent - A renderable component of a 3D engine.
	* @param {Function} callback - A callback that can be used to sync this game entity with the renderable component.
	* @return {GameEntity} A reference to this game entity.
	*/
	setRenderComponent( renderComponent, callback ) {

		this._renderComponent = renderComponent;
		this._renderComponentCallback = callback;

		return this;

	}

	/**
	* Holds the implementation for the message handling of this game entity.
	*
	* @param {Telegram} telegram - The telegram with the message data.
	* @return {Boolean} Whether the message was processed or not.
	*/
	handleMessage() {

		return false;

	}

	/**
	* Sends a message with the given data to the specified receiver.
	*
	* @param {GameEntity} receiver - The receiver.
	* @param {String} message - The actual message.
	* @param {Number} delay - A time value in millisecond used to delay the message dispatching.
	* @param {Object} data - An object for custom data.
	* @return {GameEntity} A reference to this game entity.
	*/
	sendMessage( receiver, message, delay = 0, data = null ) {

		if ( this.manager !== null ) {

			this.manager.sendMessage( this, receiver, message, delay, data );

		} else {

			Logger.error( 'YUKA.GameEntity: The game entity must be added to a manager in order to send a message.' );

		}

		return this;

	}

}

export { GameEntity };
