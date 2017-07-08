class GameEntity {

	constructor () {

		this.id = GameEntity.__nextId ++;

	}

	update () {

	}

}

GameEntity.__nextId = 0;

export { GameEntity };
