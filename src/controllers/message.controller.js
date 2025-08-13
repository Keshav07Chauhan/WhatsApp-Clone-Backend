import { Message } from "../models/message.model.js";
import { Contact } from "../models/contact.model.js";
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

// 1. Get conversation between two contacts
const getConversation = asyncHandler(async (req, res) => {
    try {
        const { wa_id } = req.body;
        const myWaId = req.contact.wa_id;

        let conversation = await Message.aggregate([
            {
                $match: {
                    $or: [
                        { from: myWaId, to: wa_id },
                        { from: wa_id, to: myWaId }
                    ],
                    hidden_for: { $ne: myWaId }
                }
            },
            { $sort: { createdAt: 1 } }
        ]);

        // Compute direction dynamically
        conversation = conversation.map(msg => ({
            ...msg,
            direction: msg.from === myWaId ? "outbound" : "inbound"
        }));


        return res.status(200).json(
            new ApiResponse(200, conversation, "Conversation are fetched Successfully")
        )
    } catch (error) {
        throw new ApiError(500, "Something went wrong while getting conversation")
    }
})

// 2. Add a message (text or media)--------------------------------------------------------Need One Touch---------
const addMessage = asyncHandler(async (req, res) => {
    try {
        const { to, text, type } = req.body;
        const from = req.contact.wa_id;

        // let mediaUrl, mediaPublicId;
        // if (req.file) {
        //     const result = await cloudinary.v2.uploader.upload(req.file.path, {
        //         resource_type: "auto"
        //     });
        //     mediaUrl = result.secure_url;
        //     mediaPublicId = result.public_id;
        // }

        const message = await Message.create({
            from,
            to,
            text,
            type: type || (req.file ? "media" : "text"),
            // media: mediaUrl,
            // mediaPublicId
        });


        return res.status(201).json(
            new ApiResponse(200, {
                ...message.toObject(),
                direction: "outbound"
            }
                , "Message created Successfully")
        )
    } catch (error) {
        throw new ApiError(500, "Something went wrong while adding message")
    }
})

// 3. Delete message (5 min rule)-------------------------------------------------------Need One Touch-------------
const deleteMessage = asyncHandler(async (req, res) => {
    try {
        const { msgId } = req.params;
        const myWaId = req.contact.wa_id;

        const msg = await Message.findById(msgId);
        if (!msg) {
            throw new ApiError(404, "Message not found for deleting")
        }
        if (msg.from !== myWaId) {
            throw new ApiError(403, "Unauthorized Access for message deletion")
        }

        const diffSec = (Date.now() - new Date(msg.createdAt).getTime()) / 1000;

        if (diffSec <= 300) {
            // Remove from DB for everyone

            // if (msg.mediaPublicId) {
            //     await cloudinary.v2.uploader.destroy(msg.mediaPublicId, { resource_type: "auto" });
            // }
            await Message.deleteOne({ _id: msg._id });

            return res.status(200).json(
                new ApiResponse(200, {}, "Message deleted for everyone Successfully")
            )

        } else {
            // Hide only for sender
            if (!msg.hidden_for.includes(myWaId)) {
                msg.hidden_for.push(myWaId);
                await msg.save();
            }

            return res.status(200).json(
                new ApiResponse(200, {}, "Message deleted for you Successfully")
            )
        }
    } catch (error) {
        throw new ApiError(500, "Something went wrong while deleting message")
    }
})

// 4. Update message (5 min rule)
const updateMessage = asyncHandler(async (req, res) => {
    try {
        const { msgId } = req.params;
        const { text } = req.body;
        const myWaId = req.contact.wa_id;

        const msg = await Message.findById(msgId);
        if (!msg){
            throw new ApiError(404, "Message not found for deleting")
        }
        if (msg.from !== myWaId){
            throw new ApiError(403, "Unauthorized Access for message deletion")
        }

        const diffSec = (Date.now() - new Date(msg.createdAt).getTime()) / 1000;
        if (diffSec > 300) {
            throw new ApiError(403, "Cannot update after 5 minutes")
        }

        msg.text = text;
        await msg.save();


        return res.status(200).json(
                new ApiResponse(200, { message: "Message updated", msg },
                     "Message deleted for everyone Successfully")
            )

    } catch (error) {
        throw new ApiError(500, "Something went wrong while updating message")
    }
})

// 5. Get unread count for contact pair
const getUnreadCountForContact = asyncHandler(async (req, res) => {
    try {
        const myWaId = req.contact.wa_id;
        const { contactWaId } = req.params;

        const count = await Message.countDocuments({
            from: contactWaId,
            to: myWaId,
            status: { $ne: "read" },
            hidden_for: { $ne: myWaId }
        });


        return res.status(200).json(
                new ApiResponse(200, { unreadCount: count }, "Count of unread messages fetched Successfully")
            )
        
    } catch (error) {
        throw new ApiError(500, "Something went wrong while getting unread count of messages")
    }
})

// 6. Mark delivered messages as read
const markMessagesAsRead = asyncHandler(async (req, res) => {
    try {
        const myWaId = req.contact.wa_id;
        const { contactWaId } = req.params;

        await Message.updateMany(
            { from: contactWaId, to: myWaId, status: "delivered" },
            { $set: { status: "read" } }
        );


        return res.status(200).json(
                new ApiResponse(200, { message: "Messages marked as read" },
                     "Messages are marked as read Successfully")
            )
    } catch (error) {
        throw new ApiError(500, "Something went wrong while marking message as read")
    }
})


export {
    getConversation,
    addMessage,
    deleteMessage,
    updateMessage,
    getUnreadCountForContact,
    markMessagesAsRead,
}