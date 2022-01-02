import { Vector3 } from '../math/Vector3.js';
import { Quaternion } from '../math/Quaternion.js';
import { Matrix4 } from '../math/Matrix4.js';
import { Logger } from './Logger.js';
import { MathUtils } from '../math/MathUtils.js';

const targetRotation = new Quaternion();
const targetDirection = new Vector3();
const positionWorld = new Vector3();
const quaternionWorld = new Quaternion();

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
		* The name of this game entity.
		* @type {String}
		*/
		this.name = '';

		/**
		* Whether this game entity is active or not.
		* @type {Boolean}
		* @default true
		*/
		this.active = true;

		/**
		* The child entities of this game entity.
		* @type {Array<GameEntity>}
		*/
		this.children = new Array();

		/**
		* A reference to the parent entity of this game entity.
		* Automatically set when added to a {@link GameEntity}.
		* @type {?GameEntity}
		* @default null
		* @readonly
		*/
		this.parent = null;

		/**
		* A list of neighbors of this game entity.
		* @type {Array<GameEntity>}
		* @readonly
		*/
		this.neighbors = new Array();

		/**
		* Game entities within this radius are considered as neighbors of this entity.
		* @type {Number}
		* @default 1
		*/
		this.neighborhoodRadius = 1;

		/**
		* Whether the neighborhood of this game entity is updated or not.
		* @type {Boolean}
		* @default false
		*/
		this.updateNeighborhood = false;

		/**
		* The position of this game entity.
		* @type {Vector3}
		*/
		this.position = new Vector3();

		/**
		* The rotation of this game entity.
		* @type {Quaternion}
		*/
		this.rotation = new Quaternion();

		/**
		* The scaling of this game entity.
		* @type {Vector3}
		*/
		this.scale = new Vector3( 1, 1, 1 );

		/**
		* The default forward vector of this game entity.
		* @type {Vector3}
		* @default (0,0,1)
		*/
		this.forward = new Vector3( 0, 0, 1 );

		/**
		* The default up vector of this game entity.
		* @type {Vector3}
		* @default (0,1,0)
		*/
		this.up = new Vector3( 0, 1, 0 );

		/**
		* The bounding radius of this game entity in world units.
		* @type {Number}
		* @default 0
		*/
		this.boundingRadius = 0;

		/**
		* The maximum turn rate of this game entity in radians per seconds.
		* The only method that uses this property right now is {@link GameEntity#rotateTo}.
		* @type {Number}
		* @default π
		*/
		this.maxTurnRate = Math.PI;

		/**
		* Whether the entity can activate a trigger or not.
		* @type {Boolean}
		* @default true
		*/
		this.canActivateTrigger = true;

		/**
		* A reference to the entity manager of this game entity.
		* Automatically set when added to an {@link EntityManager}.
		* @type {EntityManager}
		* @default null
		* @readonly
		*/
		this.manager = null;

		// private properties

		// local transformation matrix. no part of the public API due to caching

		this._localMatrix = new Matrix4();

		// internal world matrix reference (only accessible via a getter)

		this._worldMatrix = new Matrix4();

		// per-entity cache in order to avoid unnecessary matrix calculations

		this._cache = {
			position: new Vector3(),
			rotation: new Quaternion(),
			scale: new Vector3( 1, 1, 1 )
		};

		// render component

		this._renderComponent = null;
		this._renderComponentCallback = null;

		// flag to indicate whether the entity was updated by its manager at least once or not

		this._started = false;

		//

		this._uuid = null;

		// if set to true, it means the world matrix requires a recomputation

		this._worldMatrixDirty = false;

	}

	/**
	* A transformation matrix representing the world space of this game entity.
	* @type {Matrix4}
	* @readonly
	*/
	get worldMatrix() {

		this._updateWorldMatrix();

		return this._worldMatrix;

	}

	/**
	* Unique ID, primarily used in context of serialization/deserialization.
	* @type {String}
	* @readonly
	*/
	get uuid() {

		if ( this._uuid === null ) {

			this._uuid = MathUtils.generateUUID();

		}

		return this._uuid;

	}

	/**
	* Executed when this game entity is updated for the first time by its {@link EntityManager}.
	*
	* @return {GameEntity} A reference to this game entity.
	*/
	start() {

		return this;

	}

	/**
	* Updates the internal state of this game entity. Normally called by {@link EntityManager#update}
	* in each simulation step.
	*
	* @param {Number} delta - The time delta.
	* @return {GameEntity} A reference to this game entity.
	*/
	update( /* delta */ ) {

		return this;

	}


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

		const parent = this.parent;

		if ( parent !== null ) {

			this.getWorldPosition( positionWorld );

			targetDirection.subVectors( target, positionWorld ).normalize();

			this.rotation.lookAt( this.forward, targetDirection, this.up );

			quaternionWorld.extractRotationFromMatrix( parent.worldMatrix ).inverse();

			this.rotation.premultiply( quaternionWorld );

		} else {

			targetDirection.subVectors( target, this.position ).normalize();

			this.rotation.lookAt( this.forward, targetDirection, this.up );

		}

		return this;

	}

	/**
	* Given a target position, this method rotates the entity by an amount not
	* greater than {@link GameEntity#maxTurnRate} until it directly faces the target.
	*
	* @param {Vector3} target - The target position.
	* @param {Number} delta - The time delta.
	* @param {Number} tolerance - A tolerance value in radians to tweak the result
	* when a game entity is considered to face a target.
	* @return {Boolean} Whether the entity is faced to the target or not.
	*/
	rotateTo( target, delta, tolerance = 0.0001 ) {

		const parent = this.parent;

		if ( parent !== null ) {

			this.getWorldPosition( positionWorld );

			targetDirection.subVectors( target, positionWorld ).normalize();

			targetRotation.lookAt( this.forward, targetDirection, this.up );

			quaternionWorld.extractRotationFromMatrix( parent.worldMatrix ).inverse();

			targetRotation.premultiply( quaternionWorld );

		} else {

			targetDirection.subVectors( target, this.position ).normalize();

			targetRotation.lookAt( this.forward, targetDirection, this.up );

		}

		return this.rotation.rotateTo( targetRotation, this.maxTurnRate * delta, tolerance );

	}

	/**
	* Computes the current direction (forward) vector of this game entity
	* in world space and stores the result in the given vector.
	*
	* @param {Vector3} result - The direction vector of this game entity in world space.
	* @return {Vector3} The direction vector of this game entity in world space.
	*/
	getWorldDirection( result ) {

		quaternionWorld.extractRotationFromMatrix( this.worldMatrix );

		return result.copy( this.forward ).applyRotation( quaternionWorld ).normalize();

	}

	/**
	* Computes the current position of this game entity in world space and
	* stores the result in the given vector.
	*
	* @param {Vector3} result - The position of this game entity in world space.
	* @return {Vector3} The position of this game entity in world space.
	*/
	getWorldPosition( result ) {

		return result.extractPositionFromMatrix( this.worldMatrix );

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
	* Holds the implementation for the line of sight test of this game entity.
	* This method is used by {@link Vision#visible} in order to determine whether
	* this game entity blocks the given line of sight or not. Implement this method
	* when your game entity acts as an obstacle.
	*
	* @param {Ray} ray - The ray that represents the line of sight.
	* @param {Vector3} intersectionPoint - The intersection point.
	* @return {Vector3} The intersection point.
	*/
	lineOfSightTest() {

		return null;

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

	/**
	* Transforms this instance into a JSON object.
	*
	* @return {Object} The JSON object.
	*/
	toJSON() {

		return {
			type: this.constructor.name,
			uuid: this.uuid,
			name: this.name,
			active: this.active,
			children: entitiesToIds( this.children ),
			parent: ( this.parent !== null ) ? this.parent.uuid : null,
			neighbors: entitiesToIds( this.neighbors ),
			neighborhoodRadius: this.neighborhoodRadius,
			updateNeighborhood: this.updateNeighborhood,
			position: this.position.toArray( new Array() ),
			rotation: this.rotation.toArray( new Array() ),
			scale: this.scale.toArray( new Array() ),
			forward: this.forward.toArray( new Array() ),
			up: this.up.toArray( new Array() ),
			boundingRadius: this.boundingRadius,
			maxTurnRate: this.maxTurnRate,
			canActivateTrigger: this.canActivateTrigger,
			worldMatrix: this.worldMatrix.toArray( new Array() ),
			_localMatrix: this._localMatrix.toArray( new Array() ),
			_cache: {
				position: this._cache.position.toArray( new Array() ),
				rotation: this._cache.rotation.toArray( new Array() ),
				scale: this._cache.scale.toArray( new Array() ),
			},
			_started: this._started
		};

	}

	/**
	* Restores this instance from the given JSON object.
	*
	* @param {Object} json - The JSON object.
	* @return {GameEntity} A reference to this game entity.
	*/
	fromJSON( json ) {

		this.name = json.name;
		this.active = json.active;
		this.neighborhoodRadius = json.neighborhoodRadius;
		this.updateNeighborhood = json.updateNeighborhood;
		this.position.fromArray( json.position );
		this.rotation.fromArray( json.rotation );
		this.scale.fromArray( json.scale );
		this.forward.fromArray( json.forward );
		this.up.fromArray( json.up );
		this.boundingRadius = json.boundingRadius;
		this.maxTurnRate = json.maxTurnRate;
		this.canActivateTrigger = json.canActivateTrigger;

		this.children = json.children.slice();
		this.neighbors = json.neighbors.slice();
		this.parent = json.parent;

		this._localMatrix.fromArray( json._localMatrix );
		this._worldMatrix.fromArray( json.worldMatrix );

		this._cache.position.fromArray( json._cache.position );
		this._cache.rotation.fromArray( json._cache.rotation );
		this._cache.scale.fromArray( json._cache.scale );

		this._started = json._started;

		this._uuid = json.uuid;

		return this;

	}

	/**
	* Restores UUIDs with references to GameEntity objects.
	*
	* @param {Map<String,GameEntity>} entities - Maps game entities to UUIDs.
	* @return {GameEntity} A reference to this game entity.
	*/
	resolveReferences( entities ) {

		//

		const neighbors = this.neighbors;

		for ( let i = 0, l = neighbors.length; i < l; i ++ ) {

			neighbors[ i ] = entities.get( neighbors[ i ] );

		}

		//

		const children = this.children;

		for ( let i = 0, l = children.length; i < l; i ++ ) {

			children[ i ] = entities.get( children[ i ] );

		}

		//

		this.parent = entities.get( this.parent ) || null;

		return this;

	}

	// Updates the transformation matrix representing the local space.

	_updateMatrix() {

		const cache = this._cache;

		if ( cache.position.equals( this.position ) &&
				cache.rotation.equals( this.rotation ) &&
				cache.scale.equals( this.scale ) ) {

			return;

		}

		this._localMatrix.compose( this.position, this.rotation, this.scale );

		cache.position.copy( this.position );
		cache.rotation.copy( this.rotation );
		cache.scale.copy( this.scale );

		this._worldMatrixDirty = true;

	}

	_updateWorldMatrix() {

		const parent = this.parent;

		if ( parent !== null ) {

			parent._updateWorldMatrix();

		}

		this._updateMatrix();

		if ( this._worldMatrixDirty === true ) {

			if ( parent === null ) {

				this._worldMatrix.copy( this._localMatrix );

			} else {

				this._worldMatrix.multiplyMatrices( this.parent._worldMatrix, this._localMatrix );

			}

			this._worldMatrixDirty = false;

			// invalidate world matrices of children

			const children = this.children;

			for ( let i = 0, l = children.length; i < l; i ++ ) {

				const child = children[ i ];
				child._worldMatrixDirty = true;

			}

		}

	}

	// deprecated

	updateWorldMatrix() {

		// this warning will be removed with v1.0.0

		console.warn( 'GameEntity: .updateWorldMatrix() has been removed. World matrices are automatically updated on access.' );
		return this;

	}

}

function entitiesToIds( array ) {

	const ids = new Array();

	for ( let i = 0, l = array.length; i < l; i ++ ) {

		ids.push( array[ i ].uuid );

	}

	return ids;

}

export { GameEntity };
