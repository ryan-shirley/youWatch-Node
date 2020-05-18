import mongoose from "mongoose"

let CameraSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    cctv_name: {
        type: String,
        required: true,
    },
})

// Export the model
export default mongoose.model("Camera", CameraSchema)
