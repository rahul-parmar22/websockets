
import User from "../model/userModel.js"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const JWT_SECRET = 'your_jwt_secret_key';

export  const register = async (req, res) => {
    console.log("body is ", req.body)
  const { username, password } = req.body;
  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).send('User already exists');
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, password: hashedPassword });
    res.status(201).send('User created');
  } catch (err) {
    res.status(500).send('Registration failed');
  }
};

export const login = async (req, res) => {
    console.log("body is", req.body)
  const { username, password } = req.body;
  console.log('Incoming login for:', username); // 👈

  try {
    const user = await User.findOne({ username });
    console.log('User found:', user); // 👈 

    if (!user) return res.status(400).send('User not found');

    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match:', isMatch); // 👈

    if (!isMatch) return res.status(400).send('Invalid credentials');



// This line needs to be changed when generating the token: (nicheni line)
   const token = jwt.sign(
  { id: user._id, username: user.username },  // 👈 add username here
  JWT_SECRET
);
    console.log('Generated token:', token); // 👈

    res.json({
      token,
      user: {
        _id: user._id,
        username: user.username,
      },
    });
  } catch (err) {
    console.error('Login failed due to:', err); // 👈 critical log
    res.status(500).send('Login failed');
  }
};





export const getAllUsers = async(req , res)=>{
    try {
        
        const users = await User.find({})

res.status(200).json({
    success:true,
    users:users
})
        
    } catch (error) {
        res.status(500).json({
            status:false,
            message:error.message
        })
    }
}