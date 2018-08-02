/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { TriggerRegion } from '../TriggerRegion.js';
import { BoundingSphere } from '../../math/BoundingSphere.js';
import { Vector3 } from '../../math/Vector3.js';

const boundingSphereEntity = new BoundingSphere();

class SphericalTriggerRegion extends TriggerRegion {

	constructor( position = new Vector3(), radius ) {

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

	touching( entity ) {

		boundingSphereEntity.set( entity.position, entity.boundingRadius );

		return this._boundingSphere.intersectsBoundingSphere( boundingSphereEntity );


	}

}

export { SphericalTriggerRegion };
