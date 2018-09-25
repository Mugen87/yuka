import { TriggerRegion } from '../TriggerRegion.js';
import { AABB } from '../../math/AABB.js';
import { BoundingSphere } from '../../math/BoundingSphere.js';
import { Vector3 } from '../../math/Vector3.js';

const boundingSphereEntity = new BoundingSphere();

/**
* Class for represeting a rectangular trigger region as an AABB.
*
* @author {@link https://github.com/Mugen87|Mugen87 }
* @augments TriggerRegion
*/
class RectangularTriggerRegion extends TriggerRegion {

	/**
	* Constructs a new rectangular trigger region with the given values.
	*
	* @param {Vector3} min - The minimum bounds of the region.
	* @param {Vector3} max - The maximum bounds of the region.
	*/
	constructor( min = new Vector3(), max = new Vector3() ) {

		super();

		this._aabb = new AABB( min, max );

	}

	get min() {

		return this._aabb.min;

	}

	set min( min ) {

		this._aabb.min = min;

	}

	get max() {

		return this._aabb.max;

	}

	set max( max ) {

		this._aabb.max = max;

	}

	/**
	* Creates the new rectangular trigger region from a given position and size.
	*
	* @param {Vector3} position - The center position of the trigger region.
	* @param {Vector3} size - The size of the trigger region per axis.
	* @return {RectangularTriggerRegion} A reference to this trigger region.
	*/
	fromPositionAndSize( position, size ) {

		this._aabb.fromCenterAndSize( position, size );

		return this;

	}

	/**
	* Returns true if the bounding volume of the given game entity touches/intersects
	* the trigger region.
	*
	* @param {GameEntity} entity - The entity to test.
	* @return {Boolean} The result of the intersection test.
	*/
	touching( entity ) {

		boundingSphereEntity.set( entity.position, entity.boundingRadius );

		return this._aabb.intersectsBoundingSphere( boundingSphereEntity );


	}

}

export { RectangularTriggerRegion };
