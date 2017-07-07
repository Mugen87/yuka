class EntityManager {

	constructor () {

		this.entities = [];

	}

	add ( entity ) {

		this.entities.push( entity );

	}

}

export { EntityManager };
