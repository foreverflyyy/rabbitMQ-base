const mongoose = require('mongoose')
const lodashMerge = require('./utils/lodash_merge')
const chooser_random_from_weights = require('./utils/chooser_random_from_weights')

const _getObjectId = (id) => {
    try {
        const objectId = id ? new mongoose.Types.ObjectId(id) : null;
        if (!objectId || !id || id.toString() !== objectId.toString()) {
            return null
        }
        return objectId
    } catch (e) {
        return null
    }
}

const _isEmptyObject = (obj) => {
    for (let key in obj) {
      // если тело цикла начнет выполняться - значит в объекте есть свойства
      return false;
    }
    return true;
}

const _generateFilter = (filter, keyToType) => {
    const queryKey = Object.keys(filter)
    const returnFilter = queryKey.reduce((acc, row) => {
        let value = filter[row]
        const valueType = keyToType[row]
        let addToFilter = true
        switch (valueType) {
            case 'String':
                if (!value){
                    addToFilter=false
                    break;
                }
                value = { '$regex': new RegExp(value.toString(), 'i') }
                break;
            case 'Boolean':
                value = JSON.parse(value)
                break;
            case 'ObjectId':
                if (_getObjectId(value)){
                    value = _getObjectId(value)
                }
                break;
            case 'Date':
                value = moment(value).toDate()
                break;
            case 'Number':
                value = Number.parseInt(value)
                break;
            default:

        }
        if (valueType && addToFilter){
            acc[row] = value
        }

        return acc
    }, {})
    return returnFilter
}


global._getObjectId = _getObjectId
global._isEmptyObject = _isEmptyObject
global._lodashMerge = lodashMerge
global._generateFilter = _generateFilter
global._chooser_random_from_weights = chooser_random_from_weights
