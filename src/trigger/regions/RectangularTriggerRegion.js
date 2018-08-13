/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { TriggerRegion } from '../TriggerRegion.js';
import { AABB } from '../../math/AABB.js';
import { BoundingSphere } from '../../math/BoundingSphere.js';
import { Vector3 } from '../../math/Vector3.js';

const boundingSphereEntity = new BoundingSphere();

class RectangularTriggerRegion extends TriggerRegion {

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

	fromPositionAndSize( position, size ) {

		this._aabb.fromCenterAndSize( position, size );

		return this;

	}

	touching( entity ) {

		boundingSphereEntity.set( entity.position, entity.boundingRadius );

		return this._aabb.intersectsBoundingSphere( boundingSphereEntity );


	}

}

export { RectangularTriggerRegion };
