# Project Kickoff Form

A responsive project intake form built with React, Vite, Node.js and Express.

## Features

- Project details form with required-field validation.
- Three document upload areas with drag-and-drop and file removal.
- PDF, DOC, DOCX and TXT file type checks in the browser and server.
- Express API using Multer to receive files.
- Saves uploaded documents and a `project.json` file into a unique project folder.
- Responsive desktop and mobile layout.

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

## Why Express + Multer?

The assignment requires saving files to a folder on the computer. A browser frontend cannot silently write to arbitrary local folders. A small local Express server provides a clear upload endpoint, and Multer handles multipart file uploads. This approach also keeps file-system access on the server side.

## AI usage

AI assistance was used to help scaffold the project, implement the form and upload flow, and draft documentation. The implementation should be reviewed and understood by the developer before submission.

## Possible future improvements

- Add automated unit and integration tests.
- Add draft persistence.
- Add upload progress indicators.
- Add stronger content-based file validation and malware scanning.
- Add authentication and access control if deployed for real users.