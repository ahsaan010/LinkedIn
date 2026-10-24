import { v2 as cloudinary } from 'cloudinary';
import fs from "node:fs/promises"

const uploadOnCloundinary=async (filePath)=>{
    if(!filePath){
        return null
    }

    if (
        !process.env.CLOUDINARY_CLOUD_NAME
        || !process.env.CLOUDINARY_API_KEY
        || !process.env.CLOUDINARY_API_SECRET
    ) {
        throw new Error("Cloudinary credentials are required to upload images")
    }

    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    })

    try {
        const uploadResult = await cloudinary.uploader.upload(filePath)
        return uploadResult.secure_url
    } catch (error) {
        throw error
    } finally {
        try {
            await fs.unlink(filePath)
        } catch (error) {
            if (error.code !== "ENOENT") {
                console.error(JSON.stringify({
                    event: "cloudinary.temp_file_cleanup_failed",
                    name: error.name,
                    code: error.code
                }))
            }
        }
    }
}

export default uploadOnCloundinary