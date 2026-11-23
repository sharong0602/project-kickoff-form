
# Project Kickoff Form

A responsive project intake form built with React, Vite, Node.js and Express.

## Features

- Project details form with required-field validation.
- Three document upload areas with drag-and-drop and file removal.
- PDF, DOC, DOCX and TXT file type checks in the browser and server.
- Express API using Multer to receive files.
- Saves uploaded documents and a `project.json` file into a unique project folder.
- Responsive desktop and mobile layout.
- Hebrew and English language support with RTL/LTR layout.
- Automatic draft saving using browser localStorage.
- Upload progress indicator using XMLHttpRequest.

## Requirements

- Node.js 18 or newer
- npm

## Install

From the project root:

```bash
npm run install:all
```

On Windows PowerShell, you can use:

```powershell
npm.cmd run install:all
```

## Run

From the project root:

```bash
npm run dev
```

On Windows PowerShell:

```powershell
npm.cmd run dev
```

Then open:

- Frontend: http://localhost:5173
- Backend health check: http://localhost:3001/api/health

The Vite development server forwards `/api` requests to the backend.

## Where data is saved

Each successful submission creates a unique folder under `server/saved-projects/`. It contains:

- `project.json`
- `project-brief/`
- `sales-documents/`
- `architectural-materials/`

Each upload is limited to 20 MB. The server checks file extensions and MIME types. MIME metadata is not a complete security scan; production systems should additionally inspect file contents and use malware scanning.

## Draft persistence

The form automatically saves text field values in the browser's localStorage under the `projectDraft` key. When the user returns to the form, the saved draft is restored.

Uploaded files are not saved in localStorage and must be selected again.

## Upload progress

The frontend uses XMLHttpRequest to track file upload progress. The progress indicator displays the percentage of data sent from the browser to the server.

## Why Express + Multer?

The assignment requires saving files to a folder on the computer. A browser frontend cannot silently write to arbitrary local folders. A small local Express server provides a clear upload endpoint, and Multer handles multipart file uploads. This approach also keeps file-system access on the server side.

## AI usage

AI assistance was used to help scaffold the project, implement the form and upload flow, add language support, draft persistence and upload progress, and draft documentation. The implementation should be reviewed and understood by the developer before submission.

## Possible future improvements

- Add automated unit and integration tests.
- Add stronger file content validation and malware scanning.
- Add authentication and access control for production use.
- Integrate Google Drive for cloud-based document storage.