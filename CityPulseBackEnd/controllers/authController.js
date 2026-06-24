const User = require('../models/Users');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register a new user
const registerUser = async (req , res)=>{

    const { email , password , name , role } = req.body; 
    try{

        // Validate required fields
        if (!email || !password || !name )
        {
           console.log('Missing required fields');
           return res.status(400).json({ message: 'Missing required fields' }); 
        }
        // check if user already exist:

        //                === deprecated ===
        // if ( email && password && name && role ) {
        //     const existingUser = await User.findOne({ email });
        //     if (existingUser) {
        //         return res.status(400).json({ message: 'User already exists' });
        // }
        //                === deprecated ===


        // check if user already exist:
        const existingUser = await User.findOne({ email });
        if (existingUser ) {
            console.log('User already exists');
            return res.status(400).json({ message: 'User already exists' });
        }
        
        // Hash the password
        const hashedPassword = await bcrypt.hash(password,10);

        // creating a new user
        const newUser = new User({
            email,
            password: hashedPassword,
            name,
            role
        });

        // Save the new user to the database
        await newUser.save();
        console.log('User registered successfully');
        return res.status(201).json({ message: 'User registered successfully' });

    // printing all things that saves to database in the console for testing purposes
    console.log("---------------------------");
    console.log("User registered successfully");
    console.log(`email : ${newUser.email}`);
    console.log(`name : ${newUser.name}`);  
    console.log(`password : ${newUser.password}`);
    console.log(`role : ${newUser.role}`);             
    console.log(`createdAt : ${newUser.createdAt} - updatedAt : ${newUser.updatedAt}`);
    console.log("---------------------------");       

    }

    catch(error){
        console.error('Error registering user:', error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}

const loginUser = async (req, res) => {
    // Implement login logic here
    const { email , password } = req.body;
    try{
   // Check if the user exists in the database
    const user = await User.findOne({email});
    // If user not found, return an error response
    if(!user){
        console.log("user not found");
        return res.status(404).json({message: "User not found"});
    }

    // Compare the provided password with the hashed password in the database
    const isPasswordValid = await bcrypt.compare(password , user.password);

    // check if the password is valid
    if(!isPasswordValid){
        console.log("Invalid password");
        return res.status(401).json({message: "Invalid password"});
    }
        // If login is successful, return a success message or token
        console.log("---------------------------");
        console.log("Login successful");
        console.log(`email : ${user.email}`);
        console.log(`name : ${user.name}`);  
        console.log(`password : ${user.password}`);
        console.log(`role : ${user.role}`);             
        console.log(`createdAt : ${user.createdAt} - updatedAt : ${user.updatedAt}`);
        console.log("---------------------------");       

        const token = jwt.sign(
            { id: user._id , role: user.role },
             process.env.JWT_SECRET || "MSSK159357", 
             { expiresIn: '30d' });

        // show the token in the console for testing purposes
        console.log(`Generated token: ${token}`);

        return res.status(200).json({
            message: "Login successful",
            token: token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            }
        }); 

    }
    catch(error){
        console.error('Error logging in user:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }

}

const getAllUser = async (req, res) => {
    try {
        const users = await User.find().select("-password"); // Exclude password field from the response
        // Check if users were not found
        if (!users || users.length === 0) {
            return res.status(404).json({ message: 'No users found' });
        }
        console.log('Users fetched successfully');
        console.log('----------------------------');
        console.log(users)
        console.log('----------------------------');

        return res.status(200).json(users);
    }
    catch (error) {
        console.error('Error fetching users:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = 
{ 
    registerUser,
    loginUser,
    getAllUser,

 };


 // =========== //
 // testing code snippets for loginUser function 
 // not for real use, just for testing purposes
 // not for reviewing, just for testing purposes
 // =========== //

//  if (user){
//     // If user found, return a success response
//     console.log("User found");
//     return res.status(200).json({message: "User found"});
//  }
//  else{
//     // If user not found, return an error response
//     console.log("User not found");
//     return res.status(404).json({message: "User not found"});
//  }

//  if(user === user.findOne({email})){
//     // If user found, return a success response
//     console.log("User found");
//     return res.status(200).json({message: "User found"});
//  }
//  else{
//     // If user not found, return an error response
//     console.log("User not found");
//     return res.status(404).json({message: "User not found"});
//  }

//
// if (user === null) {
//     console.log("user not found");
//     return res.status(404).json({ message: "User not found" });
// }
