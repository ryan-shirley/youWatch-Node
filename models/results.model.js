import mongoose from "mongoose"

let ResultsSchema = new mongoose.Schema(
    {
        camera_id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "Camera",
        },
        person_home: {
            type: Boolean,
            required: false,
        },
        person_found: {
            type: Boolean,
            required: false,
        },
        frame_person_found: {
            type: Number,
            required: false,
        },
        time_to_detect: {
            type: Number,
            required: false,
        },
        avg_api_response_time: {
            type: Number,
            required: false,
        },
        override_time: {
            type: Boolean,
            required: true,
        },
        notification_sent: {
            type: Boolean,
            required: true,
        },
        fps: {
            type: Number,
            required: true,
        },
        duration: {
            type: Number,
            required: true,
        },
        resolution: {
            type: String,
            required: true,
        },
        video_finish_time: {
            type: Date,
            required: true,
        },
        job_start_time: {
            type: Date,
            required: true,
        },
    },
    {
        timestamps: true,
    }
)

// Export the model
export default mongoose.model("Results", ResultsSchema)
