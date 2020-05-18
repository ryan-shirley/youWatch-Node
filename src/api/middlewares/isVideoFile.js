export default (req, res, next) => {
    // Get video file name
    let fileName = req.query.fileName

    // Ensure file name was passes
    if (!fileName)
        return res.status(400).json({
            code: 400,
            message: "A filename must be passed",
        })

    // Ensure file is an mp4
    if (fileName.slice(-3) !== "mp4")
        return res.status(400).json({
            code: 400,
            message: "File format must be a .mp4",
        })

    return next()
}
