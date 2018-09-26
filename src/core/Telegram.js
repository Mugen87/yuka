/**
* Class for representing a telegram, an envelope which contains a message
* and certain metadata like sender and receiver. Part of the messaging system
* for game entities.
*
* @author {@link https://github.com/Mugen87|Mugen87}
*/
class Telegram {

	/**
	* Constructs a new telegram object.
	*
	* @param {GameEntity} sender - The sender.
	* @param {GameEntity} receiver - The receiver.
	* @param {String} message - The actual message.
	* @param {Number} delay - A time value in millisecond used to delay the message dispatching.
	* @param {Object} data - An object for custom data.
	*/
	constructor( sender, receiver, message, delay, data ) {

		/**
		* The sender.
		* @type GameEntity
		*/
		this.sender = sender;

		/**
		* The receiver.
		* @type GameEntity
		*/
		this.receiver = receiver;

		/**
		* The actual message.
		* @type String
		*/
		this.message = message;

		/**
		* A time value in millisecond used to delay the message dispatching.
		* @type Number
		*/
		this.delay = delay;

		/**
		* An object for custom data.
		* @type Object
		*/
		this.data = data;

	}

}

export { Telegram };
