import express from "express";
import authRoutes from "./routes/authRoutes";
import bookRoutes from "./routes/bookRoutes";
import { connectDB } from "./lib/db";
import cors from "cors"
import job from "./lib/cron";

const app = express();
const port = 3000;

//middleware
app.use(express.json());
app.use(cors())

app.use('/api/auth', authRoutes)
app.use("/api/books", bookRoutes);


app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
    connectDB();
    job.start();
});