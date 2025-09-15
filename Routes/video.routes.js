import express from 'express';
import mongoose from 'mongoose';

import User from '../Models/user.Model.js';
import cloudinary from '../Config/Cloudinary.js';
import videoModel from '../Models/video.Model.js';
import { checkAuth } from '../Middleware/auth.middleware.js';

const router = express.Router();

//creating upload video endpoint
router.post("/upload", checkAuth, async (req, res) => {
    try {
        const {title, description, category, tags} = req.body;
        if(!req.files || !req.files.video || !req.files.thumbnail) {
            res.status(400).json({error: "Video & thumbnail are required"});
        }

        const videoUpload = await cloudinary.uploader(req.files.video.tempFilePath, {
            resource_type: "video",
            folder: "videoes",
        });

        const thumbnailUpload = await cloudinary.uploader.upload(
            req.files.thumbnail.tempFilePath,
            {
                folder: "thumbnails",
            }
        );

        const newVideo = new Video({
            _id: new mongoose.Types.ObjectId(),
            title,
            description,
            user_id: req.user_id,
            videoUrl: videoUpload.secure_url,
            thumbnailUrl: thumbnailUpload.secure_url,
            thumbnailId: thumbnailUpload.public_id,
            category,
            tags: tags ? tags.split(",") : [],
        });

        await newVideo.save();

        res.status(201).json({message: "video Uploaded Scuuessfully", video: newVideo});

    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Something went wrong", message: error.message});
    }
});

//update video endpoint (no video change only metadata & thumbnail is change)
router.put("/update/:id", checkAuth, async (req, res) => {
    try {
        const {title, description, category, tags} = req.body;
        const videoId = req.params.id;

        //find video by id
        let video = await Video.findById(videoId);
        if(!video) {
            return res.status(404).json({error: "video not found"});
        }

        if(video.user_id.toString() !== req.user_id.toString()) {
            return res(403).json({error: "unauthorized"});
        }

        if(req.files && req.files.thumbnail) {
            await cloudinary.uploader.destroy(video.thumbnailId);

            const thumbnailUpload = await cloudinary.uploader.upload(req.files.thumbnail.tempFilePath, {
                folder: "thumbnail"
            })

            video.thumbnailUrl = thumbnailUpload.secure_url;
            video.thumbnailId = thumbnailUpload.public_id;
        }

        video.title = title || video.title;
        video.description = description || video.description;
        video.category = category || video.category;
        video.tags || tags ? tags.split(",") : video.tags;

        video.save();

        res.status(200).json({message: "video updated successfully", video})

    } catch (error) {
        console.log(error);
        res.status(500).json({error: "something went wrong", message: error.message});
    }
})

//Delete video
router.delete("/delete/:id", checkAuth, async (req, res)=>{

})

//get all videoes
router.get("/all", async (req, res) => {
    
})


router.get("/my-videoes", checkAuth, async(req, res) => {

});

//get video by id
router.get("/:id", checkAuth, async (req, res) => {
    try {
        const videoId = req.params.id;
        const userId = req.user_id;

        //use findByAndUpdate to add the userid ti the viewedBy array if not already present
        const video = await video.findIdAndUpdate(
            videoId,
            {
                $addToSet: {viewedBy: userId},  //Add user id to viewedBy array, avoiding duplicates
            },
            {new: true} //return the updated video document
        );

        if(!video) return res.status(404).json({eror: "videoes not found"});

        res.status(200).jsom({message: "Video not found"})
    } catch (error) {
        console.error("Fetch error", error);
        res.status(500).json({message: "something went wrong"});
    }
});


router.get("/like", checkAuth, async (req, res) => {

})
router.post("/dislike", checkAuth, async (req, res) => {
    try {
        const {videoId} = req.body;

        await Video.findIdAndUpdate(videoId, {
            $set: {dislikes: req.user_id},
            $pull: {likes: req.user_id}, //removes from likes if previously liked
        });
    } catch (error) {
        console.error("Dislike Error:", error);
        res.status(500).json({error: "something went wrong"});
    }
})

router.get("/tags/:tag", async (req, res) => {
    try {
        const tag = req.params.tag;
        const videos = await Video.find({tags: tag}).sort({createdAt: 1});
    } catch (error) {
        console.error("Fetch Error: ");
        res.status(500).json({mesage: "something went wrong"});
    }
})

//get videoes by category
router.get("category/:category", async (req, res) => {
    try {
        const category = req.params.category;
        const videos = await Video.find({category: category}).sort({createdAt: 1});
    } catch (error) {
        console.error("Fetch Error: ");
        res.status(500).json({message: "Something went wrong"});
    }
})

export default router;