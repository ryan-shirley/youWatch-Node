import mongoose from "mongoose"

let ResultsSchema = new mongoose.Schema(
    {
        camera_id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "Camera",
        },
        person_found: {
            type: Boolean,
            required: false,
        },
        video_analysed: {
            type: Boolean,
            required: true,
        },
        additional_details: {
            frame_person_found: {
                type: Number,
                required: false,
            },
            time_to_detect: {
                type: Number,
                required: false,
            },
            person_home: {
                type: Boolean,
                required: false,
            },
            avg_api_response_time: {
                type: Number,
                required: false,
            },
            override_time: {
                type: Boolean,
                required: true,
                default: false
            },
            notification_sent: {
                type: Boolean,
                required: true,
            },
            job_start_time: {
                type: Date,
                required: false,
            },
        },
        video_information: {
            fps: {
                type: Number,
                required: false,
            },
            duration: {
                type: Number,
                required: false,
            },
            resolution: {
                type: String,
                required: false,
            },
            recordingStartTime: {
                type: Date,
                required: true,
            },
            recordingEndTime: {
                type: Date,
                required: true,
            },
        },
    },
    {
        timestamps: true,
    }
)

// Export the model
export default mongoose.model("Results", ResultsSchema)
