import { TriggerRegion } from '../TriggerRegion.js';
import { BoundingSphere } from '../../math/BoundingSphere.js';

const boundingSphereEntity = new BoundingSphere();

/**
* Class for representing a spherical trigger region as a bounding sphere.
*
* @author {@link https://github.com/Mugen87|Mugen87}
* @augments TriggerRegion
*/
class SphericalTriggerRegion extends TriggerRegion {

	/**
	* Constructs a new spherical trigger region.
	*
	* @param {Number} radius - The radius of the region.
	*/
	constructor( radius = 0 ) {

		super();

		/**
		* The radius of the region.
		* @type {Number}
		* @default 0
		*/
		this.radius = radius;

		//

		this._boundingSphere = new BoundingSphere();

	}

	/**
	* Returns true if the bounding volume of the given game entity touches/intersects
	* the trigger region.
	*
	* @param {GameEntity} entity - The entity to test.
	* @return {Boolean} Whether this trigger touches the given game entity or not.
	*/
	touching( entity ) {

		entity.getWorldPosition( boundingSphereEntity.center );
		boundingSphereEntity.radius = entity.boundingRadius;

		return this._boundingSphere.intersectsBoundingSphere( boundingSphereEntity );

	}

	/**
	* Updates this trigger region.
	*
	* @param {Trigger} trigger - The trigger that owns this region.
	* @return {SphericalTriggerRegion} A reference to this trigger region.
	*/
	update( trigger ) {

		trigger.getWorldPosition( this._boundingSphere.center );
		this._boundingSphere.radius = this.radius;

		return this;

	}

	/**
	* Transforms this instance into a JSON object.
	*
	* @return {Object} The JSON object.
	*/
	toJSON() {

		const json = super.toJSON();

		json.radius = this.radius;

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

		this.radius = json.radius;

		return this;

	}

}

export { SphericalTriggerRegion };
