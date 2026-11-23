
import { useRef, useState } from "react";
import { FileText, FileUp, X, AlertCircle, CheckCircle2 } from "lucide-react";

const ACCEPTED_EXTENSIONS = [".pdf", ".doc", ".docx", ".txt"];

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function FileUpload({
  title,
  description,
  files,
  onChange,
  large = false,
  language = "en",
}) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");

  const isHebrew = language === "he";

  const translations = {
    en: {
      file: "file",
      files: "files",
      drop: "Drop files here or",
      browse: "browse",
      formats: "PDF, DOC, DOCX or TXT",
      unsupported: "Unsupported file type",
      use: "Please use PDF, DOC, DOCX or TXT.",
      upload: "Upload",
      remove: "Remove",
    },
    he: {
      file: "קובץ",
      files: "קבצים",
      drop: "גררו קבצים לכאן או",
      browse: "לחצו לבחירה",
      formats: "PDF, DOC, DOCX או TXT",
      unsupported: "סוג קובץ לא נתמך",
      use: "יש להעלות קבצים מסוג PDF, DOC, DOCX או TXT.",
      upload: "העלאת",
      remove: "הסרת",
    },
  };

  const t = translations[language] || translations.en;

  function addFiles(fileList) {
    const incoming = Array.from(fileList || []);
    const valid = [];
    const invalid = [];

    incoming.forEach((file) => {
      const lowerName = file.name.toLowerCase();
      const allowed = ACCEPTED_EXTENSIONS.some((ext) =>
        lowerName.endsWith(ext)
      );

      if (allowed) valid.push(file);
      else invalid.push(file.name);
    });

    if (invalid.length) {
      setError(
        isHebrew
          ? `${t.unsupported}: ${invalid.join(", ")}. ${t.use}`
          : `${t.unsupported}: ${invalid.join(", ")}. ${t.use}`
      );
    } else {
      setError("");
    }

    if (valid.length) {
      const combined = [...files];

      valid.forEach((file) => {
        const duplicate = combined.some(
          (existing) =>
            existing.name === file.name &&
            existing.size === file.size &&
            existing.lastModified === file.lastModified
        );

        if (!duplicate) combined.push(file);
      });

      onChange(combined);
    }

    if (inputRef.current) {
      inputRef.current.value = "";
    }
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

        <span className="file-count">
          {files.length} {files.length === 1 ? t.file : t.files}
        </span>
      </div>

      <div
        className={`drop-zone ${dragging ? "is-dragging" : ""}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
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
        aria-label={`${t.upload} ${title}`}
      >
        <div className="upload-icon">
          <FileUp size={21} />
        </div>

        <strong>
          {t.drop} <span>{t.browse}</span>
        </strong>

        <small>{t.formats}</small>

        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.doc,.docx,.txt"
          multiple
          hidden
          onChange={(event) => addFiles(event.target.files)}
        />
      </div>

      {error && (
        <div className="inline-error">
          <AlertCircle size={15} />
          {error}
        </div>
      )}

      {files.length > 0 && (
        <ul className="file-list">
          {files.map((file, index) => (
            <li
              className="file-row"
              key={`${file.name}-${file.size}-${file.lastModified}-${index}`}
            >
              <div className="file-type-icon">
                <FileText size={17} />
              </div>

              <div className="file-meta">
                <strong title={file.name}>{file.name}</strong>
                <span>{formatSize(file.size)}</span>
              </div>

              <CheckCircle2 className="file-check" size={17} />

              <button
                type="button"
                className="icon-button remove-button"
                onClick={() => removeFile(index)}
                aria-label={`${t.remove} ${file.name}`}
              >
                <X size={17} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
