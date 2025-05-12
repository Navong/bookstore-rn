import express from "express";
import authRoutes from "./routes/authRoutes";
import bookRoutes from "./routes/bookRoutes";
import { connectDB } from "./lib/db";
import cors from "cors"
import job from "./lib/cron";

const app = express();
const port = 3000;

//middleware
app.use(express.json({ limit: "50mb" }));
app.use(cors());

// //log for crud operations
app.get('/', (req, res) => {
    res.status(200).json({
        message: "I'm Awake"
    })
})

app.use('/api/auth', authRoutes)
app.use('/api/books', bookRoutes);
// app.use('/api/image', imageRoutes);


app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
    connectDB();
    // job.start();
});