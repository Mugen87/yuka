/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { Telegram } from './Telegram.js';

class MessageDispatcher {

	constructor() {

		this.delayedTelegrams = new Array();

	}

	deliver( telegram ) {

		const receiver = telegram.receiver;

		if ( receiver.handleMessage( telegram ) === false ) {

			console.warn( 'YUKA.MessageDispatcher: Message not handled by receiver: %o', receiver );

		}

	}

	// send a message to another agent

	dispatch( sender, receiver, message, delay, data ) {

		const telegram = new Telegram( sender, receiver, message, data, 0 );

		if ( delay <= 0 ) {

			this.deliver( telegram );

		} else {

			telegram.delay = delay;

			this.delayedTelegrams.push( telegram );

		}

	}

	// process delayed messages

	dispatchDelayedMessages( delta ) {

		let i = this.delayedTelegrams.length;

		while ( i -- ) {

			const telegram = this.delayedTelegrams[ i ];

			telegram.delay -= delta;

			if ( telegram.delay <= 0 ) {

				this.deliver( telegram );

				this.delayedTelegrams.pop();

			}

		}

	}

	clear() {

		this.delayedTelegrams.length = 0;

	}

}

export { MessageDispatcher };
