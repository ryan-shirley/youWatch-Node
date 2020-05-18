import { Router } from "express"
const route = Router()

// Bull UI
import { UI } from "bull-board"

export default (app) => {
    app.use("/bull", route)

    route.use("/queues", UI)
}
