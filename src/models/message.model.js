import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    msg_id: {
        type: String,
        index: true
    },
    meta_msg_id: {
        type: String,
        index: true
    },
    from: {
        type: String,
        required: true
    },
    to: {
        type: String,
        required: true
    },
    text: String,
    type: String,
    media: String,              // Cloudinary URL
    mediaPublicId: String,      // Cloudinary public_id
    status: {
        type: String,
        enum: ["created", "sent", "delivered", "read"],
        default: "created"
    },

    hidden_for: [
        { type: String } // wa_ids of contacts who hid the message
    ]

}, { timestamps: true });

export const Message = mongoose.model("Message", messageSchema);
