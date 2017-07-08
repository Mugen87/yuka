/**
 * @author Mugen87 / https://github.com/Mugen87
 */

class GameEntity {

	constructor () {

		this.id = GameEntity.__nextId ++;

	}

	update () {

	}

}

GameEntity.__nextId = 0;

export { GameEntity };
