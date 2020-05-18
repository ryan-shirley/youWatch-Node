export default (app) => {
    /**
     * route('/').get() Welcome message root
     */
    app.route("/").get((req, res) => {
        return res.json({
            message: "Welcome to the main route of youWatch!",
        })
    })
}
