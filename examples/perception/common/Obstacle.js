
import { GameEntity, MeshGeometry } from '../../../build/yuka.module.js';

/**
 * @author robp94 / https://github.com/robp94
 */
class Obstacle extends GameEntity {

	constructor( geometry = new MeshGeometry() ) {

		super();

		this.geometry = geometry;

	}

	lineOfSightTest( ray, intersectionPoint ) {

		return this.geometry.intersectRay( ray, this.worldMatrix, true, intersectionPoint );

	}

}

export { Obstacle };
