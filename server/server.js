import express from "express";
import cors from "cors";
import multer from "multer";
import path from "node:path";
import fs from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3001;
const savedProjectsDir = path.resolve(__dirname, "../saved-projects");
const allowedExtensions = new Set([".pdf", ".doc", ".docx", ".txt"]);
const allowedMimeTypes = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "application/octet-stream"
]);

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024, files: 60 },
  fileFilter: (req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    if (!allowedExtensions.has(extension) || !allowedMimeTypes.has(file.mimetype)) {
      return callback(new Error(`Unsupported file type: ${file.originalname}`));
    }
    callback(null, true);
  }
});

const uploadFields = upload.fields([
  { name: "projectBrief", maxCount: 20 },
  { name: "salesDocuments", maxCount: 20 },
  { name: "architecturalMaterials", maxCount: 40 }
]);

function validateFields(body) {
  const errors = {};
  if (!body.projectName?.trim()) errors.projectName = "Project name is required.";
  if (!body.architectName?.trim()) errors.architectName = "Architect name is required.";
  const units = Number(body.numberOfUnits);
  if (!body.numberOfUnits || !Number.isInteger(units) || units <= 0) {
    errors.numberOfUnits = "Number of units must be a positive whole number.";
  }
  const statuses = ["Planning", "Permit approved", "Under construction", "Finishing works", "Delivered"];
  if (!statuses.includes(body.buildingStatus)) errors.buildingStatus = "A valid building status is required.";
  return errors;
}

function safeFolderName(name) {
  const cleaned = name.normalize("NFKD").replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 55);
  return cleaned || "project";
}

function safeFileName(name) {
  const base = path.basename(name).replace(/[^\w.\- ()]/g, "_").slice(0, 120);
  return base || "uploaded-file";
}

app.post("/api/projects", (req, res) => {
  uploadFields(req, res, async (uploadError) => {
    if (uploadError) {
      const status = uploadError.code === "LIMIT_FILE_SIZE" ? 413 : 400;
      return res.status(status).json({ message: uploadError.message || "File upload failed." });
    }

    const errors = validateFields(req.body);
    if (Object.keys(errors).length) {
      return res.status(400).json({ message: "Please correct the submitted form.", errors });
    }

    const projectId = randomUUID();
    const folderName = `${safeFolderName(req.body.projectName)}-${projectId.slice(0, 8)}`;
    const projectDir = path.join(savedProjectsDir, folderName);
    const categories = [
      ["projectBrief", "project-brief"],
      ["salesDocuments", "sales-documents"],
      ["architecturalMaterials", "architectural-materials"]
    ];

    try {
      await fs.mkdir(projectDir, { recursive: true });
      for (const [, folder] of categories) {
        await fs.mkdir(path.join(projectDir, folder), { recursive: true });
      }

      const savedFiles = {};
      for (const [field, folder] of categories) {
        const uploaded = req.files?.[field] || [];
        savedFiles[field] = [];
        for (const file of uploaded) {
          const filename = `${randomUUID().slice(0, 8)}-${safeFileName(file.originalname)}`;
          await fs.writeFile(path.join(projectDir, folder, filename), file.buffer, { flag: "wx" });
          savedFiles[field].push({ originalName: file.originalname, savedName: filename });
        }
      }

      const projectData = {
        projectName: req.body.projectName.trim(),
        architectName: req.body.architectName.trim(),
        numberOfUnits: Number(req.body.numberOfUnits),
        projectNotes: (req.body.projectNotes || "").trim(),
        buildingStatus: req.body.buildingStatus,
        savedAt: new Date().toISOString(),
        files: savedFiles
      };

      await fs.writeFile(path.join(projectDir, "project.json"), JSON.stringify(projectData, null, 2), "utf8");
      return res.status(201).json({
        message: "Project saved successfully.",
        folderName,
        project: projectData
      });
    } catch (error) {
      await fs.rm(projectDir, { recursive: true, force: true }).catch(() => {});
      console.error("Project save failed:", error);
      return res.status(500).json({ message: "The project could not be saved. Please try again." });
    }
  });
});

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ message: "Unexpected server error." });
});

app.listen(PORT, () => {
  console.log(`Project Kickoff API running at http://localhost:${PORT}`);
});