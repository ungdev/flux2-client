import BaseService from 'services/BaseService';

/**
 * Class used for all about bottle actions
 */
class BottleActionService extends BaseService {

    constructor() {
        super('bottleaction');
    }

    /**
     * Make a request to get the current count of each bottle in each team
     * @param {Team} team
     * @return {Promise}
     */
    getCount(team) {
        if(team && team.id) {
            team = team.id;
        }
        return this._makeRequest({
            method: 'get',
            url: '/bottleaction/count',
            data: { team },
        });
    }

}

export default new BottleActionService();
