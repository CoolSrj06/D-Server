import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { User } from "../model/admin.model.js";

const generateAccessAndRefreshTokens = (async(userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        
        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: true})

        return {accessToken, refreshToken}

    } catch (err) {
        throw new ApiError(500, "Something went wrong while generating access and refresh tokens")
    }
})

const handleUserSignUp = asyncHandler(async (req, res) => {
    const { fullName, username, password, userType } = req.body;
    
    if ([fullName, userType, username, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }
    
    if(userType=== "admin") {
        throw new ApiError(401, "You are not authorized to create an admin account")
    }

    const existedUser = await User.findOne({
        $or: [{ username }]
    });
    
    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists");
    }
    
    try {
        const user = await User.create({
        fullName,
        userType,
        password,
        username: username.toLowerCase(),
        });    
    
        const createdUser = await User.findById(user._id).select("-password -refreshToken");

        if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
        }
    
        return res.status(201).json(createdUser);
    } catch (error) {
        if (error.name === "ValidationError") {
        
        // Handle Mongoose validation errors
        const validationErrors = Object.keys(error.errors).map(field => ({
            field,
            message: error.errors[field].message
        }));
        throw new ApiError(400, "Validation failed", validationErrors);
        }
    
        // Handle other errors
        throw new ApiError(500, "Something went wrong while registering the user");
    }
})

const handleUserLogin = asyncHandler(async (req, res) => {
    const { userType, username, password } = req.body;
    
    if(!username || !password) {
        throw new ApiError(400, "Username and password are required");
    }
    const user = await User.findOne({ username: username }).select('+password'); 
    if (!user) {
        throw new ApiError(404, "No such admin")
    }
     
    if(user.userType !== userType) {
        throw new ApiError(401, `You are a ${user.userType}`);
    }
    const isPasswordValid = await user.isPasswordCorrect(password)
    if(!isPasswordValid){
        throw new ApiError(401, "Incorrect password")
    }

    const { accessToken,refreshToken } = await generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select( " -password -refreshToken" )

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: 'None',
    }

    return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(loggedInUser);
})

const users = asyncHandler(async (req, res) => {
    try {
        // Fetch users excluding those with userType 'admin'
        const users = await User.find({ userType: { $ne: "admin" } })
            .select("fullName userType _id");

        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching users", error: error.message });
    }
});


const deleteUser = asyncHandler(async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User
            .findByIdAndDelete(userId)
            .select("fullName userType _id");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error deleting user", error: error.message });
    }
});

export {
    handleUserSignUp,
    handleUserLogin,  
    users,
    deleteUser
};
