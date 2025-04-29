import express, { Request, Response, Router } from 'express';
import cloudinary from '../lib/cloudinary';
import multer from 'multer';

const router = Router();

// Multer setup
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/', upload.single('image'), async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            res.status(400).json({ message: 'No file uploaded' });
            return;
        }

        const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
                if (error) return reject(error);
                resolve(result);
            });
            if (req.file) {
                stream.end(req.file.buffer);
            } else {
                throw new Error('File buffer is undefined');
            }
        });

        // @ts-ignore
        res.json({ url: result.secure_url });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Upload failed', error });
    }
});

export default router;
