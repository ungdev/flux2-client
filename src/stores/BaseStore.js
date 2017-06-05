import { EventEmitter } from 'events';
import AppDispatcher from 'lib/AppDispatcher';
import ModelCollection from 'lib/ModelCollection';

export default class BaseStore extends EventEmitter {

    constructor(modelName, service) {
        super();

        // the fetched data
        this._modelData = new Map();
        // the model name
        this._modelName = modelName;
        // the service of this model
        this._service = service;

        // the data to fetch
        this._filters = {};
        this._filterLastId = 0;

        // If this variable is true, the store will subscribe to new events and never unsubscribe
        this._forceSubscribe = false;

        // True if subscrbied has already been excecuted
        this._subscribed = false;

        this.subscribe(() => this._handleActions.bind(this));

        // binding
        this._delete = this._delete.bind(this);
        this._set = this._set.bind(this);
        this._handleModelEvents = this._handleModelEvents.bind(this);
    }

    subscribe(actionSubscribe) {
        this._dispatchToken = AppDispatcher.register(actionSubscribe());
    }

    get dispatchToken() {
        return this._dispatchToken;
    }

    get length() {
        return Object.keys(this._modelData).length;
    }

    /**
     * Emit a CHANGE event
     * CHANGE means that the store has been updated
     */
    emitChange() {
        this.emit('CHANGE');
    }

    /**
     * Emit a NEW event
     * NEW means that a new object has been added in the store
     */
    emitNew(data) {
        this.emit('NEW', data);
    }

    addChangeListener(cb) {
        this.on('CHANGE', cb);
    }

    addNewListener(cb) {
        this.on('NEW', cb);
    }

    removeChangeListener(cb) {
        this.removeListener('CHANGE', cb);
    }

    removeNewListener(cb) {
        this.removeListener('NEW', cb);
    }

    /**
     * Use the fetchMethod to fetch the data needed of this model.
     *
     * @param {number} [componentToken]: the new component
     * @param {boolean} force Force refresh
     * @return {Promise}
     */
    fetchData(componentToken, force) {
        let filters = this.getFiltersSet();

        // No need to ask the server if there is no filter
        if(Array.isArray(filters) && filters.length === 0) {
            this._setModelData([]);
            return Promise.resolve({
                result: [],
                token: componentToken
            });
        }
        else {
            // Check if the new filter already exist
            let fetch = true;
            if(componentToken !== null) {
                for (let index in this._filters) {
                    if (index != componentToken &&
                    (this._filters[index] === null || Object.is(this._filters[index], this._filters[componentToken]))) {
                        fetch = false;
                        break;
                    }
                }
            }
            else {
                // If there a filter has been deleted, then only refresh if there is no "null" filter
                for (let index in this._filters) {
                    if (this._filters[index] === null) {
                        fetch = false;
                        break;
                    }
                }
            }

            return new Promise((resolve, reject) => {
                // Fetch from the server only if it use usefull
                // if(fetch || force) { // TODO promise shoudln't be resolve if there is a get started, should resolve when are loading are over
                    this._service.get(this.getFiltersSet())
                        .then(result => {
                            this._setModelData(result);

                            resolve({
                                result: this.find(this._filters[componentToken]),
                                token: componentToken
                            });
                        })
                        .catch(error => reject(error));
                // }
                // else {
                //     resolve({
                //         result: this.find(this._filters[componentToken]),
                //         token: componentToken
                //     });
                // }
            })
        }
    }


    /**
     * This will do exactly the same as loadData except that filter will be generated
     * according to an object list and the name of the foreign key in theses objects.
     * @param {Array} list Array of foreign objects containing a foreign key to this object
     * @param {String} key Name of the foreign key in theses foreign object
     * @returns {Promise}
     */
    loadDataByRelation(list, key) {
        let filter = [];
        let idList = [];
        if(Array.isArray(list)) {
            for (let foreignObject of list) {
                if(idList.indexOf(foreignObject[key]) === -1) {
                    idList.push(foreignObject[key]);
                    filter.push({id: foreignObject[key]});
                }
            }
        }

        return this.loadData(filter);
    }

    /**
     * Add new filters and fetch the data to get the new asked data
     *
     * @param {Array|null} filters: new the data to get
     * @returns {Promise}
     */
    loadData(filters) {
        // Convert filter to array if it's a simple condition
        if(filters !== null && !Array.isArray(filters)) {
            filters = [filters];
        }

        // Add to the filter list
        this._filterLastId++;
        const componentToken = this._filterLastId;
        this._filters[componentToken] = filters;

        // If store was empty before, subscribe
        if(!this._subscribed && (Object.keys(this._filters).length == 1 || this._forceSubscribe)) {
            // listen model changes
            io.on('model:' + this._modelName, this._handleModelEvents);

            // Subscribe
            this._service.subscribe();
            this._subscribed = true;
        }

        // refresh the store with the new filters
        return this.fetchData(componentToken);
    }

    /**
     * Remove the data used only for the component which has this token
     * This function can be called safely with a null token
     *
     * @param {number|null} token: the component's token
     */
    unloadData(token) {
        if(this._filters[token] !== undefined) {
            // Delete filter
            delete this._filters[token];
            // reload only the data needed
            this.fetchData();

            // If store is now empty
            if(Object.keys(this._filters).length === 0 && !this._forceSubscribe) {
                // unlisten model changes
                io.off('model:' + this._modelName, this._handleModelEvents);

                // unsubscribe
                this._service.unsubscribe();
                this._subscribed = false;
            }
        }
    }

    /**
     * From this._filters, return an array of unique filters
     * Or null if one filter is null
     *
     * @returns {Array|null}
     */
    getFiltersSet() {
        let filters = [];
        for (let filter in this._filters) {
            if (this._filters[filter] === null) {
                filters = null;
                break;
            }
            filters = [...new Set([...filters, ...this._filters[filter]])];
        }
        return filters;
    }

    /**
     * Delete an item in modelData by id
     * @param {string} id: the item id
     */
    _delete(id) {
        this._modelData.delete(id);
        this.emitChange();
    }

    /**
     * Add or update an item
     * @param {string} id: the item id
     * @param {object} data: the item data
     */
    _set(id, data) {
        // Test if data is different
        let same = true;
        if(this._modelData.has(id) && Object.keys(this._modelData.get(id)).length == Object.keys(data).length) {
            for (let attr in this._modelData.get(id)) {
                if(this._modelData.get(id)[attr] != data[attr]) {
                    same = false;
                    break;
                }
            }
        }
        else {
            same = false;
        }

        // Update and trigger redrawinf if necessary
        if(!same) {
            this._modelData.set(id, data);
            this.emitChange();
        }
    }

    /**
     * From an array of objects, create an array where the key is
     * the object id and the value is the object
     *
     * @param {Array} data: array of objects
     */
    _setModelData(data) {
        let newModelData = new Map();
        for (let item of data) {
            newModelData.set(item.id, Object.freeze(item));
        }
        this._modelData = newModelData;
        this.emitChange();
    }

    /**
     * Find a data in the store by his id
     *
     * @param {string} id: the requested data id
     * @returns {object|undefined}
     */
    findById(id) {
        if(this._modelData[id]) {
            return Object.assign({}, this._modelData.get(id));
        }
        return undefined;
    }

    /**
     * Find list of elements that match filters
     *
     * @param  {Object|Array} filters: Object of filters or array of list of filter
     * @return {Map} Map of elements indexed by id
     */
    find(filters) {
        let out = new Map();

        for (let [key, val] of this._modelData) {
            if(BaseStore.match(val, filters)) {
                out.set(key, val);
            }
        }

        return new ModelCollection(out);
    }

    /**
     * Helpper to check if an object match against the given filter
     *
     * @param  {Object} obj Object to test
     * @param  {Object|Array} filters Object of filters or array of list of filter
     * @return {Boolean} True if the object match
     */
    static match(obj, filters) {
        if(!Array.isArray(filters)) {
            filters = [filters];
        }

        for (let filter of filters) {
            if(filter !== undefined) {
                let match = true;
                for (let key in filter) {
                    // if filter is an array, check if the value is included
                    if(Array.isArray(filter[key]) && !Array.isArray(obj[key])) {
                        if(!filter[key].includes(obj[key])) {
                            match = false;
                            break;
                        }
                    }
                    // Else try to match values
                    else if(obj[key] !== filter[key]) {
                        match = false;
                        break;
                    }
                }
                if(match) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Handle webSocket events about the model
     *
     * @param {object} e : the event
     */
    _handleModelEvents(e) {
        console.log('DB Event for ' + this._modelName, e);
        switch (e.verb) {
            case "created":
                if(!this._modelData.has(e.id)) {
                    // Add to the list only if it match our list
                    if(BaseStore.match(e.data, this.getFiltersSet())) {
                        this._set(e.id, e.data);
                        this.emitNew(e.data);
                    }
                }
                else {
                    console.warn('Received `created` socket event more than once for the store `' + this._modelName + '`', e);
                }
                break;
            case "updated":
                this._set(e.id, e.data);
                break;
            case "destroyed":
                if(this._modelData.has(e.id)) {
                    this._delete(e.id);
                }
                break;
        }
    }

    _handleActions(action) {
        switch(action.type) {
            case "AUTH_AUTHENTICATED":
                // Refresh all stores after login or relogin
                this.fetchData(null, true);

                // If filter was not empty re-subscribe
                if(this._forceSubscribe || Object.keys(this._filters).length >= 1) {
                    // listen model changes
                    io.off('model:' + this._modelName, this._handleModelEvents);
                    io.on('model:' + this._modelName, this._handleModelEvents);

                    // Subscribe
                    this._service.subscribe();
                    this._subscribed = true;
                }
                break;
        }
    }
}
