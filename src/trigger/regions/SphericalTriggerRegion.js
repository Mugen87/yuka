import { TriggerRegion } from '../TriggerRegion.js';
import { BoundingSphere } from '../../math/BoundingSphere.js';
import { Vector3 } from '../../math/Vector3.js';

const boundingSphereEntity = new BoundingSphere();

/**
* Class for representing a spherical trigger region as a bounding sphere.
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
	* @return {Boolean} Whether this trigger touches the given game entity or not.
	*/
	touching( entity ) {

		boundingSphereEntity.set( entity.position, entity.boundingRadius );

		return this._boundingSphere.intersectsBoundingSphere( boundingSphereEntity );

	}

	/**
	* Transforms this instance into a JSON object.
	*
	* @return {Object} The JSON object.
	*/
	toJSON() {

		const json = super.toJSON();

		json._boundingSphere = this._boundingSphere.toJSON();

		return json;

	}

	/**
	* Restores this instance from the given JSON object.
	*
	* @param {Object} json - The JSON object.
	* @return {SphericalTriggerRegion} A reference to this trigger region.
	*/
	fromJSON( json ) {

		super.fromJSON( json );

		this._boundingSphere.fromJSON( json._boundingSphere );

		return this;

	}

}

export { SphericalTriggerRegion };
