import {ApiError} from "../utils/ApiError.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import jwt from "jsonwebtoken"
import { Contact } from "../models/contact.model.js"

export const verifyJWT = asyncHandler(async (req, _, next)=>{       // in place of "res", we have written "_", it is because res is not used.so, _ is used for it.
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")   //req.header is used when app is used which does not store the accessToken.
    
        if(!token){
            throw new ApiError(401, "Unauthorized request")
        }
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        const contact = await Contact.findById(decodedToken?._id).select("-password -refreshToken")
    
        if(!contact){
            throw new ApiError(401, "Invalid Access Token")
        }
    
        req.contact = contact;
        next()
    } catch (error) {
        throw new ApiError(401, error.message || "Invalid access token")
    }

})