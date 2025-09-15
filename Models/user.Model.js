import mongoose from 'mongoose';


const userSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    ChannelName: {
        type: String,
        require: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: String,
        require: true
    },
    password: {
        type: String,
        require: true
    },
    logoUrl: {
        type: String,
        require: true
    },
    logoId: {
        type: String,
        require: true
    },
    subscriber: {
        type: Number,
        default: 0
    }
}, {timestamps: true}
);

const User = mongoose.model("User", userSchema);

export default User;

// token = ""