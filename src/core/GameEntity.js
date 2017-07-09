/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { EventDispatcher } from './EventDispatcher';

class GameEntity extends EventDispatcher {

	constructor () {

		super();

		this.id = GameEntity.__nextId ++;
		this.name = '';

	}

	update () {

		console.warn( 'YUKA.GameEntity: .update() must be implemented in derived class.' );

	}

	sendMessage ( receiver, message, delay = 0, data = null ) {

		const event = {
			type: 'message',
			receiver: receiver,
			message: message,
			delay: delay,
			data: data
		};

		this.dispatchEvent( event );

	}

	handleMessage () {

		return false;

	}

}

GameEntity.__nextId = 0;

export { GameEntity };
