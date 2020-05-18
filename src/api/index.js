import { Router } from "express"
import root from "./routes/root.route"
import bulldash from "./routes/bulldash.route"
import videos from "./routes/videos.route"

// guaranteed to get dependencies
export default () => {
    const app = Router()
    root(app)
    bulldash(app)
    videos(app)

    return app
}
