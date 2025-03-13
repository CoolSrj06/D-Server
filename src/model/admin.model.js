import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true,
        index: true,
        minlength: [3, 'Full name must be at least 3 characters long'],
        maxlength: [50, 'Full name cannot exceed 50 characters']
    },
    username: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
        minlength: [3, 'Username must be at least 3 characters long'],
        maxlength: [30, 'Username cannot exceed 30 characters']
    },
    password: {
        type: String,
        minlength: [6, 'Password must be at least 6 characters long'],
        select: false 
    },
    userType: {
        type: String,
        enum: ['admin', 'sales', 'market'],
    },
    refreshToken: {
        type: String,
        select: false
    },
}, {timestamps: true});

userSchema.methods.isPasswordCorrect = async function(password){ 
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

userSchema.pre("save", async function (next) {
    if(!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10)
    next()
})

export const User = mongoose.model('User ', userSchema);