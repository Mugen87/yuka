/**
 * @author Mugen87 / https://github.com/Mugen87
 */

class Telegram {

	constructor( senderId, receiverId, message, data, delay ) {

		this.senderId = senderId;
		this.receiverId = receiverId;
		this.message = message;
		this.data = data;
		this.delay = delay;

	}

}

export { Telegram };
