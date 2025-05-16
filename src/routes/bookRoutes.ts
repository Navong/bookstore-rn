import express, { Request, Response, Router } from "express";
import Book from "../models/Book";
import protectedRoute from "../middleware/auth.middleware";
import cloudinary from "../lib/cloudinary";

const router = Router();

router.post("/", protectedRoute, async (req: Request, res: Response) => {
    try {
        const { title, caption, image, rating } = req.body;
        // console.log(req.body);
        if (!title || !caption || !image || !rating) {
            res.status(400).json({ message: "Missing required fields" });
            return;
        }



        // upload image to cloudinary
        const uploadedImage = await cloudinary.uploader.upload(image, {
            folder: "books-images",
            transformation: [
                { width: 1000, crop: "scale" },
                { quality: "auto" },
                { fetch_format: "auto" }
            ]
        });
        const imageUrl = uploadedImage.secure_url;


        if (!imageUrl) {
            res.status(400).json({ error: "Image upload failed" });
            return;
        }

        // if exists
        if (await Book.findOne({ title })) {
            res.status(400).json({ error: "Book already exists" });
            return;
        }

        const book = new Book({ title, caption, image: imageUrl, rating, user: (req as any).user._id });
        await book.save();
        res.status(201).json(book);
    } catch (error: any) {
        console.error('Error creating book:', error);
        res.status(500).json({ error: `Internal server error ${error.message}` });
    }
});

// pagination => infinite loading
router.get("/", async (req: Request, res: Response) => {
    // const response = await fetch("http://localhost:3000/api/books?page=1&limit=5");

    try {
        // we need page & limit
        const page = req.query.page || 1;
        const limit = req.query.limit || 5;

        // skip the page that already fetched
        const skip = (Number(page) - 1) * Number(limit);

        // populate help us get user details from user id
        const books = await Book.find().skip(skip).limit(Number(limit)).populate("user", "username profileImage");

        const totalBook = await Book.countDocuments();
        res.status(200).json({
            books,
            totalBook,
            totalPages: Math.ceil(totalBook / Number(limit))
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: `Internal server error ${error}` });
    }
})

// get recommended books by the logged in user
router.get("/user", protectedRoute, async (req: Request, res: Response) => {
    try {
        const books = await Book.find({ user: (req as any).user._id }).sort({ createdAt: -1 });
        // createAt : -1 => most recent first
        res.json(books);
    } catch (error: any) {
        console.error("Get user books error:", error.message);
        res.status(500).json({ message: "Server error" });
    }
});

router.delete("/:id", protectedRoute, async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            res.status(404).json({ message: "Book not found" });
            return;
        }

        // check if user is the creator of the book
        if (book.user.toString() !== (req as any).user._id.toString()) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        // https://res.cloudinary.com/de1rm4uto/image/upload/v1741568358/qyup61vejflxxw8igvi0.png
        if (book.image && book.image.includes("cloudinary")) {
            try {
                const publicId = book.image ? book.image.split("/").pop()?.split(".")[0] : "";
                if (publicId) {
                    await cloudinary.uploader.destroy(publicId);
                }
            } catch (deleteError) {
                console.log("Error deleting image from cloudinary", deleteError);
            }
        }

        await book.deleteOne();

        res.json({ message: "Book deleted successfully" });
    } catch (error) {
        console.log("Error deleting book", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

export default router;