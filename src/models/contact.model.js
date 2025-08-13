import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const contactSchema = new mongoose.Schema({

    wa_id: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        index: true
    },
    name: {
        type: String,
        trim: true,
        index: true
    },
    password: {
        type: String,
        required: [true, 'Password is required']
    },
    avatar: {
        type: String,  //cloudinary url
        // required: true
    },
    avatarPublicId: {
        type: String,
        // required: true
    },
    refreshToken: {
        type: String
    },
    last_seen: {
        type: Date
    },
    contacts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Contact"
        }
    ],
}, { timestamps: true })

contactSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10)
    next()
})

contactSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

contactSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            wa_id: this.wa_id,
            name: this.name
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

contactSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const Contact = mongoose.model("Contact", contactSchema)