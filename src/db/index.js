import mongoose from "mongoose";


const connectDB=async()=>{
    try{

        await mongoose.connect(process.env.MONGODB_URL,{
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        console.log("connected to mongodb")
    }
    catch(err){
        console.error('MongoDB connection failed', err);
        process.exit(1);
    }
}

export default connectDB;