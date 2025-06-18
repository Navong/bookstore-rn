import express, { Request, Response, RequestHandler, Router } from "express";
import User from "../models/User";
import jwt from 'jsonwebtoken'

const router = Router()

const generateToken = (userId: any) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET!, {
        expiresIn: "3h",
    })
}

router.post('/register', (async (req, res) => {
    try {
        const { username, email, password } = req.body

        if (!username || !email || !password) {
            res.status(400).json({ error: "Missing required fields" });
            return
        }

        if (password.length < 6) {
            res.status(400).json({ error: "Password should be at least 6 characters long" });
            return
        }

        if (username.length < 3) {
            res.status(400).json({ error: "Username should be at least 3 characters long" });
            return
        }


        // check if user already exists
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            res.status(400).json({ error: "User already exists" });
            return
        }

        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
            res.status(400).json({ error: "Username already exists" });
            return
        }

        // get ramdom profile image
        const profileImage = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;

        const user = new User({
            email,
            username,
            password,
            profileImage,
        });

        await user.save();


        // generate token
        const token = generateToken(user._id)

        res.status(201).json({
            token,
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                profileImage: user.profileImage,
                createdAt : user.createdAt
            }
        })

    } catch (error) {
        console.error(error)
        res.status(500).json({ error : `${error}` });
    }
}))

router.get('/me', async (req: Request, res: Response) => {
    try {
        const users = await User.find({});
        res.status(200).json(users)
    } catch (error) {
        console.error(error)
    }
})

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            res.status(400).json({ error: "Missing required fields" });
            return
        }

        const user = await User.findOne({ email })
        if (!user) { 
            res.status(404).json({ error: "User not found" });
            return
         }

        const isMatch = await user.comparePassword(password)
        if (!isMatch) {
            res.status(401).json({ error: "Invalid credentials" });
            return
        }

        // generate token
        const token = generateToken(user._id)

        res.status(200).json({
            token,
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                profileImage: user.profileImage,
                createdAt : user.createdAt
            }
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: `${error}` });
        return
    }
})


export default router