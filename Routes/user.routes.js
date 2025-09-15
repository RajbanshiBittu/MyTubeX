import express from 'express';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';


import User from '../Models/user.Model.js';
import cloudinary from '../Config/Cloudinary.js';
import { checkAuth } from '../Middleware/auth.middleware.js';

const router = express.Router();

router.post("/signup", async (req, res) => {
    // res.status(200).send(`signup successfully`);

    try {
        console.log('Request received');

        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        console.log("Hashed Password: ", hashedPassword);

        const uploadImage = await cloudinary.uploader.upload(
            req.files.logoUrl.tempFilePath
        )

        console.log("Image: ", uploadImage);

        const newUser = new User({
            _id: new  mongoose.Types.ObjectId,
            email: req.body.email,
            password: hashedPassword,
            ChannelName: req.body.ChannelName,
            phone: req.body.phone,
            logoUrl: uploadImage.secure_url,
            logoId: uploadImage.public_id
        });

        let user = await newUser.save();

        res.status(201).json({user});
    } catch (error) {
        console.log(error);
        res.status(500).json({error: " Something went wrong", message: error.message})
    }
});

router.post("/login", async (req, res) => {
    try {
        const existingUser = await User.findOne({email: req.body.email});

        if(!existingUser) {
            return res.status(404).send({message: "User not found"});
        }

        const isValid = await bcrypt.compare(
            req.body.password,
            existingUser.password
        )

        if(!isValid) {
            return res.status(401).json({message: "Invalid credentials"});
        }

        const token = jwt.sign(
            {
                _id: existingUser.id,
                ChannelName: existingUser.ChannelName,
                email: existingUser.email,
                phone: existingUser.phone,
                logoId: existingUser.logoId
            },
            process.env.JWT_SECRET || "defaultSecret",
            {expiresIn: '10d'}
    );

    res.status(200).json({
            _id: existingUser.id,
            ChannelName: existingUser.ChannelName,
            email: existingUser.email,
            phone: existingUser.phone,
            logoId: existingUser.logoId,
            logoUrl: existingUser.logoUrl,
            token: token,
            subscriber: existingUser.subscriber,
            subscribedChannels: existingUser.subscribedChannels
        });

    } catch (error) {
        console.error("Login Error", error);
        res.status(500).json({error: "Something went wrong", message: error.message});
    }
});

router.put("/update-profile", checkAuth, async (req, res) => {
    try {
        const {ChannelName, phone} = req.body;
        let updatedData = {ChannelName, phone};

        if(req.files && req.files.logoUrl) {
            const uploadedImage = await cloudinary.uploader.upload(req.files.logoUrl.tempFilePath);
            updatedData.logoUrl = uploadedImage.secure_url;
            updatedData.logoId = uploadedImage.public_id;
        }

        const updatedUser = await User.findByIdAndUPdate(req.user._id, updatedData, {new:true});

        res.status(200).json({message: "Profile updated Successfully", updatedUser});
    } catch (error) {
        console.log(error);
        res.status(500).json({error: "something went wrong", message: error.message})
    }
});

router.post("/subscribe", checkAuth, async (req, res) => {
    try {
        const {ChannelId} = req.body;   //userId == currentUser & channelId ==user to subscribe (channel);

        if(req.user._id == ChannelId) {
            return res.status(400).json({error: "You Can't subscribe to yourself"});
        }

        const currentUser = await User.findByIdAndUpdate(req.user._id, {
            $addToSet: {subscribedChannels: ChannelId}
        })

        const subscribedUser = await User.findByIdAndUPdate(ChannelId, {
            $inc: {subscriber: 1}
        })
        res.status(200).json(
            {
                message: "Subscribed successfully",
                data: {
                    currentUser,
                    subscribedUser
                }
            }
        )
    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Something went wrong", message: error.message});
        
    }
})

export default router;