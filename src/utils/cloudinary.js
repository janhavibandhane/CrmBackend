import {v2 as cloudinary} from "cloudinary";
import fs from "fs"; //use for link or unink file

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const uploadOnClodinary= async (localFilePath) =>{
    try {

        if(!fs.existsSync(localFilePath)){
            console.error(`file not found: ${localFilePath}`);
            return null;
        }

        // if file  is not uploded then here we are uploading file
        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type: "auto"
        })
         // File has been uploaded successfully
          console.log("File uploaded to Cloudinary:", response.url);
        
        fs.unlinkSync(localFilePath);  //file upload zhali ata public/temp madhun unlick kar
        return response;

    } catch (error) {
        console.error("Cloudinary upload error:", error);
        // Remove the local file if the upload operation failed
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);    //remove the file on localy save temp file as the upload operation got faild
        }
        return null;
    }    
}

export {uploadOnClodinary}