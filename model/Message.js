import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation',
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Assuming your User model is named 'User'
        required: true
    },
    receiver: { // Optional redundancy, useful for quick queries
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    content: {
        type: String,
        required: true
    },
    read: {
        type: Boolean,
        default: false
    },
    attachments: [{
        type: String // URL to file
    }]
}, { timestamps: true });

export default mongoose.model('Message', messageSchema);
