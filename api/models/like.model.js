import mongoose from "mongoose";

const likeSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    postId: {
        type: String,
        required: true,
    }
}, { timestamps: true });

const Like = mongoose.model("Like", likeSchema);
export default Like;
