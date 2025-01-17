import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { Survey } from '../model/survey.model.js'
//import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
//import { oauth2Client } from "../utils/googleClient.js";
//import axios from 'axios';


const postSurvey = asyncHandler(async(req,res) => {
    try{
        const { surveyName, description, link } = req.body;

        if (!surveyName?.trim() || !description?.trim() || !link?.trim()) {
            throw new ApiError(400, "Survey Link and Description fields are required");
        }

        // Create the new query
        const surveyDetail = await Survey.create({
            surveyName,
            description,
            link: link,
        });
        return res.status(201)
            .json(
                new ApiResponse(201, surveyDetail, "Query posted successfully")
            );
    } catch (error) {
        console.error("Error in postDoubt:", error);
        throw error; // AsyncHandler will catch and return the error
    }
});

const postSurveyForm = asyncHandler(async(req,res) => {
    try{
        const { name, email, message, surveyId } = req.body;

        if (!name?.trim() || !message?.trim() || !email?.trim()){
            throw new ApiError(400, "name, message and email fields are required");
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }

        //Create a new answer object
        const newSurvey = {
            name: name.trim(),
            email: email.trim(), // Ensure no leading/trailing spaces
            message: message.trim(), // Ensure no leading/trailing spaces
        };
    
        // Find the surveyDetail by ID and update it
        const surveyDetail = await Survey.findById(surveyId);
    
        if (!surveyDetail) {
            return res.status(404).json({ message: "Survey Detail not found" });
        }
        
        // Add the new answer to the answers array
        surveyDetail.surveyFormData.push(newSurvey);
        const updatedSurvey = await surveyDetail.save();
    
        // Return the updated query
        res.status(201).json(updatedSurvey);
    } catch (error) {
        console.error("Error submitting surveyForm:", error);
        // General error handling
        res.status(500).json({ message: "Internal Server Error", error });
    }
});  


// const generateAccessAndRefreshTokens = (async(userId) => {
//     try {
//         const user = await User.findById(userId)
//         const accessToken = user.generateAccessToken()
//         const refreshToken = user.generateRefreshToken()

//         user.refreshToken = refreshToken
//         await user.save({validateBeforeSave: true})

//         return {accessToken, refreshToken}

//     } catch (err) {
//         throw new ApiError(500, "Something went wrong while generating access and refresh tokens")
//     }
// })

// const handleUserSignUp = asyncHandler(async (req, res) => {
//     console.log('hello world');
    
//     const { fullName, email, username, password } = req.body;
    
//     if ([fullName, email, username, password].some((field) => field?.trim() === "")) {
//         throw new ApiError(400, "All fields are required");
//     }
    
//     const existedUser = await User.findOne({
//         $or: [{ username }, { email }]
//     });
    
//     if (existedUser) {
//         throw new ApiError(409, "User with email or username already exists");
//     }
    
//     try {
//         const user = await User.create({
//         fullName,
//         email,
//         password,
//         username: username.toLowerCase(),
//         });
    
//         const createdUser = await User.findById(user._id).select("-password -refreshToken");

//         if (!createdUser) {
//         throw new ApiError(500, "Something went wrong while registering the user");
//         }
    
//         return res.status(201).json(createdUser);
//     } catch (error) {
//         if (error.name === "ValidationError") {
//         // Handle Mongoose validation errors
        
//         const validationErrors = Object.keys(error.errors).map(field => ({
//             field,
//             message: error.errors[field].message
//         }));
//         throw new ApiError(400, "Validation failed", validationErrors);
//         }
    
//         // Handle other errors
//         throw new ApiError(500, "Something went wrong while registering the user");
//     }
// })
      
// const handleUserLogin = asyncHandler(async (req, res) => {

//     const { email, password } = req.body;

//     if(!email){ 
//         throw new ApiError(400, "Email is required")
//     }

//     const user = await User.findOne({ email: email }).select('+password'); // Include the password for comparison

//     if (!user) {
//         // User not found
//         throw new ApiError(404, "User does not exist")
//     }

//     // Compare password (make sure to hash passwords in your user model)
//     const isPasswordValid = await user.isPasswordCorrect(password)

    
//     if(!isPasswordValid){
//         throw new ApiError(401, "Incorrect password")
//     }

//     const { accessToken,refreshToken } = await generateAccessAndRefreshTokens(user._id)

//     const loggedInUser = await User.findById(user._id).select( " -password -refreshToken" )

//     const options = {
//         httpOnly: true,
//         secure: true,
//         sameSite: 'None',
//     }
    
    
//     return res.status(200)
//     .cookie("accessToken", accessToken, options)
//     .cookie("refreshToken", refreshToken, options)
//     .json(loggedInUser);
// })

// const logoutUser = asyncHandler(async(req, res) => {
    
//     User.findByIdAndUpdate(
//         req.user._id,
//         {
//             $unset: {
//                 refreshToken: 1,
//             }
//         },
//         {
//             new: true
//         }
//     )

//     const options = {
//         httpOnly: true,
//         secure: true
//     }

//     return res
//     .status(200)
//     .cookie("refreshToken", options)
//     .cookie("accessToken", options)
//     .json( new ApiResponse(200, {} , "User logged out successfully"))
// })

// const getCurrentUser = asyncHandler(async(req, res) => {
//     // Check if req.user exists (set by verifyJWT middleware)
//     if (!req.user) {
//         throw new ApiError(401, "Unauthorized", ["No user information available"]);
//     }
    
//     return res
//     .status(200)
//     .json({
//         statusCode: 200,
//         user: req.user,
//         message: "Current user fetched successfully"
//     })
// })

// const updateAccountDetails = asyncHandler(async(req, res) => {
//     const { fullName, email } = req.body

//     if(!fullName||!email) {
//         throw new ApiError(400, "All fields are required")
//     }

//     const user = await User.findByIdAndUpdate(
//         req.user?._id,
//         {
//             $set: {
//                 fullName,
//                 email
//             }
//         },
//         {
//             new: true,
//         }
//     ).select("-password")

//     return res.status(200)
//     .json(new ApiResponse(200, user, "Account details updated successfully"))
// })  

// const changeCurrentPassword = asyncHandler(async(req, res) => {
//     const { oldPassword, newPassword } = req.body
    
    
//     if (!oldPassword || !newPassword || oldPassword === newPassword) {
//         throw new ApiError(400, 
//             !oldPassword || !newPassword 
//             ? "All fields are required" 
//             : "New password cannot be the same as the old password"
//         );
//     }

//     const user = await User.findById(req.user?._id).select("+password")
    
//     const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
    
//     if(!isPasswordCorrect) {
//         throw new ApiError(400, "Incorrect old password")
//     }

//     user.password = newPassword
//     await user.save({ validateBeforeSave: false })

//     return res.status(200)
//     .json(new ApiResponse(200,{},"Password updated successfully"))
// })

// const postDoubt = asyncHandler(async (req, res) => {
//     try {
//         const { title, description, tags } = req.body;

//         if (!title?.trim() || !description?.trim()) {
//             throw new ApiError(400, "Title and description fields are required");
//         }

//         // Process tags: split a string like '#javascript#react' into an array or handle it if already an array
//         const tagArray = typeof tags === 'string'
//             ? tags.split('#').filter(tag => tag.trim()).map(tag => tag.trim())
//             : tags.map(tag => tag.trim());

//         const tagString = tagArray.join(', '); // Convert tags to a comma-separated string for Query model

//         // Create the new query
//         const query = await Query.create({
//             title,
//             description,
//             tags: tagString,
//             user: req.user._id,
//         });

//         // Update the Language model
//         for (const tag of tagArray) {
//             const languageName = ['JavaScript', 'React', 'Node.js', 'Python', 'CSS', 'HTML'].includes(tag) 
//                 ? tag 
//                 : 'Others';
        
//             const language = await Language.findOne({ name: languageName });
        
//             if (language) {
//                 // If it exists, add the query ID to the questions array (if not already present)
//                 if (!language.questions.includes(query._id)) {
//                     language.questions.push(query._id);
//                     await language.save();
//                 }
//             } else {
//                 // If it doesn't exist, create a new language entry
//                 await Language.create({
//                     name: languageName,
//                     questions: [query._id],
//                 });
//             }
//         }  
        
//         // Increment the 'questionAsked' field for the current user
//         const user = await User.findById(req.user._id);
//         if (user) {
//             user.questionsAsked += 1; // Increment the count

//             // Add the new question to 'quesAskId'
//             user.quesAskId.push({
//                 queryId: query._id, // The ObjectId of the question
//                 description: title.trim(), // The title from the request body
//             });

//             await user.save(); // Save the updated user
//         }

//         return res.status(201).json(new ApiResponse(201, query, "Query posted successfully"));
//     } catch (error) {
//         console.error("Error in postDoubt:", error);
//         throw error; // AsyncHandler will catch and return the error
//     }
// });

// const fetchData = asyncHandler(async (req, res) => {
//     try {
//       const doubts = await Query.find();
//       res.json(doubts);
//     } catch (error) {
//       console.error("Error fetching data:", error);
//       res.status(500).send('Error fetching data'); // Send a server error status
//     }
// });

// const submitAnswer = asyncHandler(async (req, res) => {
//     try {
//         const { text } = req.body;
//         const { queryId } = req.body; // Extract queryId from the request parameters      
    
//         // Validate the input
//         if (!text || text.trim() === "") {
//             return res.status(400).json({ message: "Text and answeredBy are required" });
//         }
    
//         // Create a new answer object
//         const newAnswer = {
//             text: text.trim(), // Ensure no leading/trailing spaces
//             answeredBy: req.user._id, // Convert to ObjectId
//         };
    
//         // Find the query by ID and update it
//         const query = await Query.findById(queryId);
    
//         if (!query) {
//             return res.status(404).json({ message: "Query not found" });
//         }
        
//         // Add the new answer to the answers array
//         query.answers.push(newAnswer);
//         const updatedQuery = await query.save();
        

//         // Update the `questionsAnswered` field in the User model
//         const user = await User.findById(req.user._id);
//         if (user) {
//         user.questionsAnswered += 1; // Increment the count

//         // Add the new answer ID to 'questionsAnsweredId' if not already present
//         user.questionsAnsweredId.push({
//             queryId: query._id, // The ObjectId of the question
//             description: text.trim(), // The title from the request body
//         });
        
//         await user.save(); // Save the updated user
//         } else {
//         return res.status(404).json({ message: "User not found" });
//         }
    
//         // Return the updated query
//         res.status(201).json(updatedQuery);
//     } catch (error) {
//         console.error("Error submitting answer:", error);
    
//         if (error instanceof mongoose.Error.CastError) {
//             return res.status(400).json({ message: "Invalid queryId or answeredBy" });
//         }
    
//         res.status(500).json({ message: "Internal Server Error" });
//     }
// });  

// const displayPerticularDoubt = asyncHandler(async (req, res) => {
//     try {
//         const questionId = req.params.id; // Extract ID from route parameters
//         const question = await Query.findById(questionId); // Assuming Mongoose is used
    
//         if (!question) {
//           return res.status(404).json({ message: 'Question not found' });
//         }
    
//         res.status(200).json({ question });
//     } catch (error) {
//     console.error('Error fetching question:', error);
//     res.status(500).json({ message: 'Internal Server Error' });
//     }
// });

// const vote = asyncHandler(async (req, res) => {
//     try {
//         const { voteType, answerId, questionId } = req.body;

//         // Determine the update operation based on the vote type
//         const updateOperation =
//             voteType === 'upvote'
//                 ? { $inc: { 'answers.$.upvotes': 1 } }
//                 : voteType === 'downvote'
//                 ? { $inc: { 'answers.$.downvotes': 1 } }
//                 : null;

//         if (!updateOperation) {
//             return res.status(400).json({ error: 'Invalid vote type' });
//         }

//         // Perform an atomic update to increment the upvotes or downvotes
//         const updatedQuery = await Query.findOneAndUpdate(
//             { _id: questionId, 'answers._id': answerId }, // Match the query and answer IDs
//             updateOperation,
//             { new: true } // Return the updated document
//         );

//         if (!updatedQuery) {
//             return res.status(404).json({ error: 'Question or Answer not found' });
//         }

//         // Find the updated answer in the answers array
//         const updatedAnswer = updatedQuery.answers.find(
//             (ans) => ans._id.toString() === answerId.toString()
//         );

//         if (!updatedAnswer) {
//             return res.status(404).json({ error: 'Answer not found after update' });
//         }
//         // Send back the updated answer with the new vote counts
//         res.json({
//             upvotes: updatedAnswer.upvotes,
//             downvotes: updatedAnswer.downvotes,
//         });
//     } catch (error) {
//         console.error('Error updating votes:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });

// const googleAuth = asyncHandler(async (req, res) => {
//     const code = req.query.code;

//     if (!code) {
//         throw new ApiError(400, "Authorization code is missing");
//     }

//     try{
//         const googleRes = await oauth2Client.getToken(code);
//         oauth2Client.setCredentials(googleRes.tokens);
//         const userRes = await axios.get(
//             `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`
//         );
        
//         const { email, name } = userRes.data;

//         let user = await User.findOne({email});

//         if (!user) {
//             user = await User.create({
//                 fullName: name,
//                 email,
//             });
//         }

//         const { accessToken,refreshToken } = await generateAccessAndRefreshTokens(user._id)

//         const loggedInUser = await User.findById(user._id).select( " -password -refreshToken" )

//         const options = {
//             httpOnly: true,
//             secure: true,
//         }
        
//         return res.status(200)
//         .cookie("accessToken", accessToken, options)
//         .cookie("refreshToken", refreshToken, options)
//         .json(loggedInUser);
//     }
//     catch(error){
//         console.error("Error during Google OAuth:", error);
//         throw new ApiError(401, `Failed to authenticate with Google: ${error.message}`);
//     }
// });

// const updateProfile = (async (req, res) => {
//     try {
//         const { bio } = req.body; // Extract `bio` from the request body
//         const coverLocalPath = req.file?.path;

//         let coverImageUrl = null;

//         // Upload cover image if provided
//         if (coverLocalPath) {
//             const coverImage = await uploadOnCloudinary(coverLocalPath);

//             if (!coverImage.url) {
//                 throw new ApiError(400, "Error while uploading CoverImg file");
//             }

//             coverImageUrl = coverImage.url;
//         }

//         // Check if the document exists
//         let userDetails = await User.findOne({ user: req.user?._id });
        
//         const updateData = {};
//         if (coverImageUrl) updateData.coverImage = coverImageUrl;
//         if (bio) updateData.bio = bio;
        
//         // Update the existing document
//         userDetails = await User.findOneAndUpdate(
//             { _id: req.user?._id }, // Correct filter
//             { $set: updateData },    // Correct update operation
//             { new: true, runValidators: true } // Options to return updated document and validate
//         );

//         // Send the response
//         return res.status(200).json(
//             new ApiResponse(
//                 200,
//                 userDetails,
//             )
//         );
//     } catch (error) {
//         return res.status(error.statusCode || 500).json(
//             new ApiResponse(
//                 error.statusCode || 500,
//                 null,
//                 error.message ||"An error occurred"
//             )
//         );
//     }
// })


export {
    postSurvey,
    postSurveyForm,
};
