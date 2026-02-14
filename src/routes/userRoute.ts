import express, { Request, Response } from "express";

const router = express.Router();

router.get("/", async (req: Request, res: Response) => {
  res.status(202).json({
    message: "Welcome to Amazon EC2 Deployment with Node.js"
  });
});

export default router;

