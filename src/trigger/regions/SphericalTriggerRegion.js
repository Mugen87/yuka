import { TriggerRegion } from '../TriggerRegion.js';
import { BoundingSphere } from '../../math/BoundingSphere.js';
import { Vector3 } from '../../math/Vector3.js';

const boundingSphereEntity = new BoundingSphere();

/**
* Class for represeting a spherical trigger region as a bounding sphere.
*
* @author {@link https://github.com/Mugen87|Mugen87}
* @augments TriggerRegion
*/
class SphericalTriggerRegion extends TriggerRegion {

	/**
	* Constructs a new spherical trigger region with the given values.
	*
	* @param {Vector3} position - The center position of the region.
	* @param {Number} radius - The radius of the region.
	*/
	constructor( position = new Vector3(), radius = 0 ) {

		super();

		this._boundingSphere = new BoundingSphere( position, radius );

	}

	get position() {

		return this._boundingSphere.center;

	}

	set position( position ) {

		this._boundingSphere.center = position;

	}

	get radius() {

		return this._boundingSphere.radius;

	}

	set radius( radius ) {

		this._boundingSphere.radius = radius;

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

		return this._boundingSphere.intersectsBoundingSphere( boundingSphereEntity );


	}

}

export { SphericalTriggerRegion };
