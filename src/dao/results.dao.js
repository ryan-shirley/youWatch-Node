import model from "../models/results.model"

export default {
    find: function (query, cb = null) {
        if (cb) {
            model.find(query, cb)
        } else {
            return model.find(query)
        }
    },
    findOne: function (query, cb = null) {
        if (cb) {
            model.findOne(query, cb)
        } else {
            return model.findOne(query)
        }
    },
    save: function (data, cb = null) {
        const obj = new model(data)

        if (cb) {
            obj.save(cb)
        } else {
            return obj.save()
        }
    },
}
