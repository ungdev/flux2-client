import BaseStore from 'stores/BaseStore';
import BottleActionService from 'services/BottleActionService';
import NotificationActions from 'actions/NotificationActions';

class BottleActionStore extends BaseStore {

    constructor() {
        super('bottleAction', BottleActionService);

        this._count = {};
        this._countRequest = 0;
    }

    get count() {
        return this._count;
    }


    /**
     * Same as loadDAta bur for requesting count
     */
    loadCount() {
        this._countRequest++;
        // Use a fake filter to load 0 entry but subscribe
        return new Promise((resolve, reject) => {
            BottleActionService.getCount()
            .then((count) => {
                this._count = count;
                return resolve();
            })
            .catch((error) => {
                return reject(error);
            });
        })
        .then(() => this.loadData({id: '0'}));
    }


    /**
     * Same as unloadData but for unrequesting count
     *
     * @param {number|null} token: the component's token
     */
    unloadCount(token) {
        if(this._filters[token] !== undefined) {
            this._countRequest--;
            if(this._countRequest === 0) {
                this._count = {};
            }
        }
        return this.unloadData(token);
    }


    /**
     * Overload _handleModelEvents to update bottle count
     *
     * @param {object} e : the event
     */
    _handleModelEvents(e) {
        if(this._countRequest) {
            // init count object
            if(!this._count[e.data.teamId || null]) this._count[e.data.teamId || null] = {};
            if(!this._count[e.data.teamId || null][e.data.typeId]) this._count[e.data.teamId || null][e.data.typeId] = {empty: 0, new: 0};
            if(e.data.fromTeamId) {
                if(!this._count[e.data.fromTeamId || null]) this._count[e.data.fromTeamId || null] = {};
                if(!this._count[e.data.fromTeamId || null][e.data.typeId]) this._count[e.data.fromTeamId || null][e.data.typeId] = {empty: 0, new: 0};
            }

            switch (e.verb) {
                case "created":
                    // Update count
                    if(e.data.operation == 'purchased') {
                        this._count[e.data.teamId || null][e.data.typeId].new -= e.data.quantity;
                        this._count[e.data.teamId || null][e.data.typeId].empty += e.data.quantity;
                    }
                    else if(e.data.operation == 'moved') {
                        this._count[e.data.fromTeamId || null][e.data.typeId].new -= e.data.quantity;
                        this._count[e.data.teamId || null][e.data.typeId].new += e.data.quantity;
                    }
                    this.emitChange();
                    break;
            }
        }
        return super._handleModelEvents(e);
    }

}

export default new BottleActionStore();
