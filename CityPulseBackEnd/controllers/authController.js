const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Register a new user
const registerUser = async (req , res)=>{
    const { email , password , name , role , sector } = req.body;
    try{
        // check if user already exist:
        //
        //                === deprecated ===
        // if ( email && password && name && role ) {
        //     const existingUser = await User.findOne({ email });
        //     if (existingUser) {
        //         return res.status(400).json({ message: 'User already exists' });
        //     }

        // check if user already exist:
        const existingUser = await User.findOne({ email });
        if ( existingUser ) {
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
            role,
            sector: sector || null
        });

        // Save the new user to the database
        await newUser.save();
        console.log('User registered successfully');
        return res.status(201).json({ message: 'User registered successfully' });
    }
    catch(error){
        console.error('Error registering user:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = {
    registerUser
}