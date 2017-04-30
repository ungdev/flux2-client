import BaseStore from './BaseStore';
import ChatService from '../services/ChatService';

class ChatStore extends BaseStore {

    constructor() {
        super('message', ChatService);

        this._newMessages = {};
    }

    get messages() {
        return this.getUnIndexedData();
    }

    get newMessages() {
        return this._newMessages;
    }

    /**
     * Return the number of new messages of the given channel
     * @param {string} channel: the channel name
     * @returns {number}
     */
    getNewMessages(channel) {
        if (this._newMessages[channel]) {
            return this._newMessages[channel];
        }
        return 0;
    }

    /**
     * set new messages of a given channel to 0
     * @param {string} channel
     */
    resetNewMessages(channel) {
        this._newMessages[channel] = 0;
        this.emitChange();
    }

    /**
     * Handle new Message
     * @param message
     */
    _handleNewMessage(message) {
        // increment the number of unviewed messages for this channel
        this._newMessages[message.channel] ? this._newMessages[message.channel]++ : this._newMessages[message.channel] = 1;
        this.emitChange();
    }

    /**
     * Handle webSocket events about the model
     *
     * @param {object} e : the event
     */
    _handleModelEvents(e) {
        switch (e.verb) {
            case "created":
                if(!this.findById(e.id)) {
                    // Add to the list only if it match our list
                    if(this._match(e.data, this.getFiltersSet())) {
                        this._set(e.id, e.data);
                    }
                    // notification
                    this._handleNewMessage(e.data);
                }
                else {
                    console.warn('Received `created` socket event more than once for the store `' + this._modelName + '`', e);
                }
                break;
            case "updated":
                if(this.findById(e.id)) {
                    this._set(e.id, e.data);
                }
                break;
            case "destroyed":
                if(this.findById(e.id)) {
                    this._delete(e.id);
                }
                break;
        }
    }

}

export default new ChatStore();
