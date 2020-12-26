import { TriggerRegion } from '../TriggerRegion.js';
import { AABB } from '../../math/AABB.js';
import { BoundingSphere } from '../../math/BoundingSphere.js';
import { Vector3 } from '../../math/Vector3.js';

const boundingSphereEntity = new BoundingSphere();
const center = new Vector3();

/**
* Class for representing a rectangular trigger region as an AABB.
*
* @author {@link https://github.com/Mugen87|Mugen87}
* @augments TriggerRegion
*/
class RectangularTriggerRegion extends TriggerRegion {

	/**
	* Constructs a new rectangular trigger region with the given values.
	*
	* @param {Vector3} size - The size of the region.
	*/
	constructor( size = new Vector3() ) {

		super();

		/**
		* The size of the region.
		* @type {Vector3}
		*/
		this.size = size;

		this._aabb = new AABB();

	}

	/**
	* Returns true if the bounding volume of the given game entity touches/intersects
	* the trigger region.
	*
	* @param {GameEntity} entity - The entity to test.
	* @return {Boolean} Whether this trigger touches the given game entity or not.
	*/
	touching( entity ) {

		boundingSphereEntity.set( entity.position, entity.boundingRadius );

		return this._aabb.intersectsBoundingSphere( boundingSphereEntity );

	}

	/**
	* Updates this trigger region.
	*
	* @param {Trigger} trigger - The trigger that owns this region.
	* @return {RectangularTriggerRegion} A reference to this trigger region.
	*/
	update( trigger ) {

		trigger.getWorldPosition( center );

		this._aabb.fromCenterAndSize( center, this.size );

		return this;

	}

	/**
	* Transforms this instance into a JSON object.
	*
	* @return {Object} The JSON object.
	*/
	toJSON() {

		const json = super.toJSON();

		json.size = this.size.toArray( new Array() );

		return json;

	}

	/**
	* Restores this instance from the given JSON object.
	*
	* @param {Object} json - The JSON object.
	* @return {RectangularTriggerRegion} A reference to this trigger region.
	*/
	fromJSON( json ) {

		super.fromJSON( json );

		this.size.fromArray( json.size );

		return this;

	}

}

export { RectangularTriggerRegion };
