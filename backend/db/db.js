import mongoose, { connect } from "mongoose";


const connectDB = async()=>{
 
   try {
    await  mongoose.connect("mongodb://localhost:27017/websocket");
    console.log("mongodb connected successfully..!")
   } catch (error) {
    console.log(error);
process.exit(1); 

   }
    
}

export default connectDB; 

