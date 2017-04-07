import TeamActions from '../actions/TeamActions';

/**
 * Class used for all about barrel types
 */
class BarrelTypeService {

    /**
     * Make a webSocket request to get the barrel types
     * Then call the callback with the result
     *
     * @callback successCallback
     * @callback errCallback
     *
     * @param {successCallback} success
     * @param {errCallback} err
     */
    getBarrelTypes(success, err) {
        iosocket.request({
            method: 'get',
            url: '/barreltype'
        }, (resData, jwres) => {
            if (jwres.error) {
                err(jwres);
            } else {
                success(jwres.body);
            }
        });
    }

    /**
     * Make a request to delete this barrel type
     *
     * @callback doneCallback
     *
     * @param {String} typeId : the barrel type to delete
     * @param {doneCallback} callback
     */
    deleteBarrelType(typeId, callback) {
        iosocket.request({
            method: 'delete',
            url: '/barreltype/' + typeId
        }, (resData, jwres) => {
            jwres.error ? callback(jwres.error) : callback(null, resData);
        });
    }

    /**
     * Make a request to create a new barrel type
     *
     * @callback doneCallback
     *
     * @param {object} data
     * @param {doneCallback} callback
     */
    createBarrelType(data, callback) {
        iosocket.request({
            method: 'post',
            url: '/barreltype',
            data
        }, (resData, jwres) => {
            jwres.error ? callback(jwres.error) : callback(null, resData);
        });
    }

    /**
     * Make a request to update a barrel type
     *
     * @callback doneCallback
     *
     * @param {string} typeId
     * @param {object} data
     * @param {doneCallback} callback
     */
    updateBarrelType(typeId, data, callback) {
        iosocket.request({
            method: 'put',
            url: '/barreltype/' + typeId,
            data
        }, (resData, jwres) => {
            jwres.error ? callback(jwres.error) : callback(null, resData);
        });
    }

    /**
     * Make a request to create barrels
     *
     * @callback doneCallback
     *
     * @param {object} data
     * @param {doneCallback} callback
     */
    saveBarrels(data, callback) {
        iosocket.request({
            method: 'post',
            url: '/barreltype/barrel',
            data
        }, (resData, jwres) => {
            jwres.error ? callback(jwres.error) : callback(null, resData);
        });
    }

}

export default new BarrelTypeService();