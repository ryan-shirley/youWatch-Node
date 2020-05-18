import cameraModel from "../models/cameras.model"

export default {
    find: function (query, cb = null) {
        if(cb) {
            cameraModel.find(query, cb)
        } else {
            return cameraModel.find(query)
        }
    },
    findOne: function (query, cb = null) {
        if(cb) {
            cameraModel.findOne(query, cb)
        } else {
            return cameraModel.findOne(query)
        }
    },
}
