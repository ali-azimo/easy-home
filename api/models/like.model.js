import mongoose from "mongoose";

const likeSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    postId: {
        type: String,
        required: true,
    },
    propertyId: {
        type: String,
    },
    imoId: { 
        type: String,
    }
}, { 
    timestamps: true,
    indexes: [
        { userId: 1, postId: 1 },
        { userId: 1, propertyId: 1 },
        { userId: 1, imoId: 1 }
    ]
});

likeSchema.pre('save', function(next) {
    if (this.postId && !this.propertyId) {
        this.propertyId = this.postId;
    }
    if (this.postId && !this.imoId) {
        this.imoId = this.postId;
    }
    next();
});

const Like = mongoose.model("Like", likeSchema);
export default Like;