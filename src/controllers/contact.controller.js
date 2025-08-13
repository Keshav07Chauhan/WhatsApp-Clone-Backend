import { Contact } from "../models/contact.model.js"
import { ApiError } from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const generateAccessAndRefreshToken = async (userId) => {
    try {
        const contact = await Contact.findById(userId)
        const accessToken = contact.generateAccessToken()
        const refreshToken = contact.generateRefreshToken()

        contact.refreshToken = refreshToken
        await contact.save({ validateBeforeSave: false })
        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token")
    }
}


/**
 * GET all contacts of the logged-in user
 */
const getContactsList = asyncHandler(async (req, res) => {
    try {
        const myContactId = req.contact._id;
        // console.log(req.contact)
        const me = await Contact.findById(myContactId)
            // .populate("contacts", "_id wa_id name");

        if (!me) {
            throw new ApiError(404,"User not found")
        }


        return res.status(201).json(
        new ApiResponse(200, me.contacts, "Contact list fetched Successfully")
    )

    } catch (error) {
        throw new ApiError(500, "Something went wrong while getting contact list")
    }
})

/**
 * POST add a contact by phone number
 */
const addContactByPhone = asyncHandler(async (req, res) => {
    try {
        const { phone } = req.body;
        const myContactId = req.contact._id;

        const me = await Contact.findById(myContactId);
        if (!me){
            throw new ApiError(404, "Your account not found")
        }

        const other = await Contact.findOne({ wa_id: phone });
        if (!other){
            throw new ApiError(404, "Contact not found for adding")
        }

        // Add to my contacts
        if (!me.contacts.includes(other._id)) {
            me.contacts.push(other._id);
            await me.save();
        }

        // Add me to their contacts
        if (!other.contacts.includes(me._id)) {
            other.contacts.push(me._id);
            await other.save();
        }

        const addedContact = { _id: other._id, wa_id: other.wa_id, name: other.name }

        return res.status(200).json(
        new ApiResponse(200, addedContact, "Contact added successfully")
    )
    } catch (error) {
        throw new ApiError(500, "Something went wrong while adding contact to your list")
    }
})

/**
 * POST register new contact
 */
const registerContact = asyncHandler(async (req, res) => {
    try {
        const { name, wa_id, password } = req.body;

        const existing = await Contact.findOne({ wa_id });
        if (existing){
            throw new ApiError(409, "Contact already exists")
        }


        const contact = await Contact.create({
            name,
            wa_id,
            password,
            contacts: []
        });

        const contactCreated = { _id: contact._id, name: contact.name, wa_id: contact.wa_id }

        return res.status(201).json(
        new ApiResponse(200, contactCreated, "User registered Successfully")
    )
    } catch (error) {
         throw new ApiError(500, "Something went wrong while registering user")
    }
})

/**
 * POST login contact
 */
const loginContact = asyncHandler(async (req, res) => {
    try {
        const { wa_id, password } = req.body;

        const contact = await Contact.findOne({ wa_id });
        if (!contact){
             throw new ApiError(404, "Contact does not exist for login")
        }

        const isMatch = await contact.isPasswordCorrect(password);
        if (!isMatch){
             throw new ApiError(401, "Invalid credentials for login")
        }

        const { accessToken, refreshToken } = await generateAccessAndRefreshToken(contact._id)

        const loggedInUser = await Contact.findById(contact._id).select("-password -refreshToken")

        const options = {
            httpOnly: true,     
            secure: true
        }

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(200, {
                    user: loggedInUser, accessToken, refreshToken   
                }, "User logged In Successfully")
            )
    } catch (error) {
        throw new ApiError(500, "Something went wrong while logging")
    }
})



export{
    registerContact,
    loginContact,
    addContactByPhone,
    getContactsList
}