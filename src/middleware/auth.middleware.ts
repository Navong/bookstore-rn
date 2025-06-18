import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import User from "../models/User";

const protectedRoute = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.header("Authorization");
        if (!authHeader) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        const token = authHeader.replace("Bearer ", "");
        if (!token) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!);

        if (typeof decoded !== "object" || !("userId" in decoded)) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const user = await User.findById((decoded as jwt.JwtPayload).userId);
        if (!user) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        (req as any).user = user;
        next();
    } catch (error : any) {
        console.error(error);

        if (error.name === "TokenExpiredError") {
            res.status(401).json({ error: "Session expired. Please log in again." });
            return;
        }

        res.status(401).json({ error: "Unauthorized" });
    }
};

export default protectedRoute;