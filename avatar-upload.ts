import { Router } from "express";
import multer from "multer";
import { storagePut } from "./storage";
import { authenticateRequest } from "./_core/auth";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      cb(new Error("Only image files are allowed"));
      return;
    }
    cb(null, true);
  },
});

router.post("/api/upload-avatar", upload.single("file"), async (req, res) => {
  try {
    let user;
    try {
      user = await authenticateRequest(req);
    } catch {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    if (!req.file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }

    // Generate unique filename
    const fileExt = req.file.originalname.split(".").pop();
    const fileName = `avatars/${user.id}-${Date.now()}.${fileExt}`;

    // Upload to S3
    const { url } = await storagePut(fileName, req.file.buffer, req.file.mimetype);

    res.json({ url });
  } catch (error) {
    console.error("Avatar upload error:", error);
    res.status(500).json({ error: "Failed to upload avatar" });
  }
});

export default router;
