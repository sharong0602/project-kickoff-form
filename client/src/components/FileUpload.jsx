import { useRef, useState } from "react";
import { FileText, FileUp, X, AlertCircle, CheckCircle2 } from "lucide-react";

const ACCEPTED_EXTENSIONS = [".pdf", ".doc", ".docx", ".txt"];

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function FileUpload({ title, description, files, onChange, large = false, fieldName }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");

  function addFiles(fileList) {
    const incoming = Array.from(fileList || []);
    const valid = [];
    const invalid = [];

    incoming.forEach((file) => {
      const lowerName = file.name.toLowerCase();
      const allowed = ACCEPTED_EXTENSIONS.some((ext) => lowerName.endsWith(ext));
      if (allowed) valid.push(file);
      else invalid.push(file.name);
    });

    if (invalid.length) {
      setError(`Unsupported file type: ${invalid.join(", ")}. Please use PDF, DOC, DOCX or TXT.`);
    } else {
      setError("");
    }

    if (valid.length) {
      const combined = [...files];
      valid.forEach((file) => {
        const duplicate = combined.some((existing) =>
          existing.name === file.name && existing.size === file.size && existing.lastModified === file.lastModified
        );
        if (!duplicate) combined.push(file);
      });
      onChange(combined);
    }
    if (inputRef.current) inputRef.current.value = "";
  }

  function removeFile(index) {
    onChange(files.filter((_, i) => i !== index));
  }

  return (
    <section className={`upload-card ${large ? "upload-card-large" : ""}`}>
      <div className="upload-heading">
        <div>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
        <span className="file-count">{files.length} {files.length === 1 ? "file" : "files"}</span>
      </div>

      <div
        className={`drop-zone ${dragging ? "is-dragging" : ""}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          addFiles(event.dataTransfer.files);
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        aria-label={`Upload ${title}`}
      >
        <div className="upload-icon"><FileUp size={21} /></div>
        <strong>Drop files here or <span>browse</span></strong>
        <small>PDF, DOC, DOCX or TXT</small>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.doc,.docx,.txt"
          multiple
          hidden
          onChange={(event) => addFiles(event.target.files)}
        />
      </div>

      {error && <div className="inline-error"><AlertCircle size={15} />{error}</div>}

      {files.length > 0 && (
        <ul className="file-list">
          {files.map((file, index) => (
            <li className="file-row" key={`${file.name}-${file.size}-${file.lastModified}-${index}`}>
              <div className="file-type-icon"><FileText size={17} /></div>
              <div className="file-meta">
                <strong title={file.name}>{file.name}</strong>
                <span>{formatSize(file.size)}</span>
              </div>
              <CheckCircle2 className="file-check" size={17} />
              <button type="button" className="icon-button remove-button" onClick={() => removeFile(index)} aria-label={`Remove ${file.name}`}>
                <X size={17} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}