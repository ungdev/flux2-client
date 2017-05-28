import BaseStore from 'stores/BaseStore';

import AlertButtonService from 'services/AlertButtonService';

class AlertButtonStore extends BaseStore {

    constructor() {
        super('alertButton', AlertButtonService);
    }

    get buttons() {
        return this.getUnIndexedData();
    }

}

export default new AlertButtonStore();
