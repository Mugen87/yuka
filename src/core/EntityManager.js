class EntityManager {

	constructor () {

		this.entities = [];

	}

	add ( entity ) {

		this.entities.push( entity );

		return this;

	}

	remove ( entity ) {

		const index = this.entities.indexOf( entity );

		this.entities.splice( index, 1 );

		return this;

	}

	update ( delta ) {

		for ( let entity of this.entities ) {

			entity.update( delta );

		}

		return this;

	}

}

export { EntityManager };
