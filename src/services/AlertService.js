import {ApiError} from 'errors';
import BaseService from 'services/BaseService';

/**
 * Class used for all about alert
 */
class AlertService extends BaseService {

    constructor() {
        super('alert');
    }

    /**
     * Make a request to update the users assigned to an alert
     * @param {string} id: the alert id
     * @param {Array} users: the new users list
     * @returns {Promise}
     */
    updateAssignedUsers(id, users) {
        return this._makeRequest({
            method: 'put',
            url: this._baseUrl + '/' + id + '/users',
            data: {
                users
            }
        });
    }
}

export default new AlertService();
