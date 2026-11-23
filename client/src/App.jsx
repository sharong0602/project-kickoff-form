
import { useState, useEffect } from "react";
import {
  Building2,
  Sparkles,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  LoaderCircle,
  Languages
} from "lucide-react";
import FileUpload from "./components/FileUpload.jsx";

const initialForm = {
  projectName: "",
  architectName: "",
  numberOfUnits: "",
  projectNotes: "",
  buildingStatus: ""
};

const initialFiles = {
  projectBrief: [],
  salesDocuments: [],
  architecturalMaterials: []
};

const translations = {
  en: {
    workspace: "Workspace setup",
    eyebrow: "PROJECT WORKSPACE",
    heading: "Project kickoff",
    intro: "Let's lay the groundwork. Share a few details and upload the documents we'll need to get started.",
    step: "Project details",
    details: "Project details",
    detailsDescription: "Tell us a little about the project.",
    projectName: "Project name",
    projectNamePlaceholder: "e.g. Park Towers",
    architectName: "Architect name",
    architectPlaceholder: "e.g. Dana Levi",
    units: "Number of units",
    unitsPlaceholder: "e.g. 48",
    buildingStatus: "Building status",
    selectStatus: "Select current status",
    statuses: {
      Planning: "Planning",
      "Permit approved": "Permit approved",
      "Under construction": "Under construction",
      "Finishing works": "Finishing works",
      Delivered: "Delivered"
    },
    notes: "Project notes",
    optional: "OPTIONAL",
    notesPlaceholder: "Anything else we should know about this project?",
    documents: "Project documents",
    documentsDescription: "Add the files that will help our team get up to speed.",
    brief: "Project brief",
    briefDescription: "The project overview and objectives.",
    sales: "Sales documents",
    salesDescription: "Sales materials, brochures and related files.",
    architectural: "Architectural materials",
    architecturalDescription: "Plans, drawings, specifications and other technical documents.",
    required: "Required fields",
    finish: "Finish & save",
    saving: "Saving project...",
    uploadProgress: "Uploading project...",
    success: "Project saved successfully. Folder:",
    newProject: "Start a new project",
    review: "Please review the highlighted fields.",
    projectNameError: "Please enter a project name.",
    architectError: "Please enter the architect's name.",
    unitsError: "Please enter the number of units.",
    unitsInvalid: "Enter a positive whole number.",
    statusError: "Please select a building status.",
    saveError: "The project could not be saved.",
    connectionError: "Could not connect to the server. Make sure the backend is running.",
    footer: "Project intake · Local workspace",
    languageButton: "עברית"
  },

  he: {
    workspace: "הגדרת סביבת עבודה",
    eyebrow: "סביבת הפרויקט",
    heading: "פתיחת פרויקט",
    intro: "בואו נתחיל בתכנון הפרויקט. מלאו כמה פרטים והעלו את המסמכים הדרושים לנו.",
    step: "פרטי הפרויקט",
    details: "פרטי הפרויקט",
    detailsDescription: "ספרו לנו קצת על הפרויקט.",
    projectName: "שם הפרויקט",
    projectNamePlaceholder: "לדוגמה: מגדלי הפארק",
    architectName: "שם האדריכל",
    architectPlaceholder: "לדוגמה: דנה לוי",
    units: "מספר יחידות דיור",
    unitsPlaceholder: "לדוגמה: 48",
    buildingStatus: "סטטוס הבנייה",
    selectStatus: "בחרו סטטוס נוכחי",
    statuses: {
      Planning: "בתכנון",
      "Permit approved": "היתר בנייה מאושר",
      "Under construction": "בבנייה",
      "Finishing works": "עבודות גמר",
      Delivered: "נמסר"
    },
    notes: "הערות לפרויקט",
    optional: "לא חובה",
    notesPlaceholder: "האם יש מידע נוסף שכדאי שנדע על הפרויקט?",
    documents: "מסמכי הפרויקט",
    documentsDescription: "העלו את הקבצים שיעזרו לצוות שלנו להכיר את הפרויקט.",
    brief: "תקציר הפרויקט",
    briefDescription: "סקירה כללית של הפרויקט והמטרות שלו.",
    sales: "מסמכי מכירות",
    salesDescription: "חומרי מכירה, חוברות ומסמכים קשורים.",
    architectural: "חומרים אדריכליים",
    architecturalDescription: "תוכניות, שרטוטים, מפרטים ומסמכים טכניים נוספים.",
    required: "שדות חובה",
    finish: "סיום ושמירה",
    saving: "הפרויקט נשמר...",
    uploadProgress: "מעלה את הפרויקט...",
    success: "הפרויקט נשמר בהצלחה. שם התיקייה:",
    newProject: "פתיחת פרויקט חדש",
    review: "נא לבדוק את השדות המסומנים.",
    projectNameError: "נא להזין שם פרויקט.",
    architectError: "נא להזין את שם האדריכל.",
    unitsError: "נא להזין את מספר יחידות הדיור.",
    unitsInvalid: "יש להזין מספר שלם וחיובי.",
    statusError: "נא לבחור סטטוס בנייה.",
    saveError: "לא ניתן היה לשמור את הפרויקט.",
    connectionError: "לא ניתן להתחבר לשרת. יש לוודא שהשרת פועל.",
    footer: "קליטת פרויקט · סביבת עבודה מקומית",
    languageButton: "English"
  }
};

// Sends the form and reports upload progress.
function uploadProject(payload, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.open("POST", "/api/projects");

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentage = Math.round(
          (event.loaded / event.total) * 100
        );

        onProgress(percentage);
      }
    };

    xhr.onload = () => {
      let result = {};

      try {
        result = JSON.parse(xhr.responseText);
      } catch {
        result = {};
      }

      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress(100);
        resolve(result);
      } else {
        reject(new Error(result.message || "SAVE_ERROR"));
      }
    };

    xhr.onerror = () => {
      reject(new Error("NETWORK_ERROR"));
    };

    xhr.onabort = () => {
      reject(new Error("UPLOAD_ABORTED"));
    };

    xhr.send(payload);
  });
}

export default function App() {
  // Load the previously selected language.
  const [language, setLanguage] = useState(() => {
    try {
      const savedLanguage = localStorage.getItem("projectLanguage");

      return savedLanguage === "en" ? "en" : "he";
    } catch {
      return "he";
    }
  });

  const t = translations[language];
  const isHebrew = language === "he";

  const [form, setForm] = useState(() => {
    try {
      const savedDraft = localStorage.getItem("projectDraft");

      return savedDraft
        ? { ...initialForm, ...JSON.parse(savedDraft) }
        : initialForm;
    } catch {
      return initialForm;
    }
  });

  const [files, setFiles] = useState(initialFiles);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ type: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Save the selected language.
  useEffect(() => {
    try {
      localStorage.setItem("projectLanguage", language);
    } catch (error) {
      console.error("Could not save language:", error);
    }
  }, [language]);

  // Save the form draft.
  useEffect(() => {
    try {
      localStorage.setItem("projectDraft", JSON.stringify(form));
    } catch (error) {
      console.error("Could not save draft:", error);
    }
  }, [form]);

  function updateField(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value
    }));

    setErrors((current) => ({
      ...current,
      [name]: ""
    }));

    setStatus({ type: "", message: "" });
  }

  function validate() {
    const next = {};

    if (!form.projectName.trim()) {
      next.projectName = t.projectNameError;
    }

    if (!form.architectName.trim()) {
      next.architectName = t.architectError;
    }

    if (!form.numberOfUnits.trim()) {
      next.numberOfUnits = t.unitsError;
    } else if (
      !/^\d+$/.test(form.numberOfUnits) ||
      Number(form.numberOfUnits) <= 0
    ) {
      next.numberOfUnits = t.unitsInvalid;
    }

    if (!form.buildingStatus) {
      next.buildingStatus = t.statusError;
    }

    return next;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus({ type: "", message: "" });

    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length) {
      setStatus({
        type: "error",
        message: t.review
      });
      return;
    }

    const payload = new FormData();

    Object.entries(form).forEach(([key, value]) => {
      payload.append(key, value);
    });

    Object.entries(files).forEach(([field, selected]) => {
      selected.forEach((file) => {
        payload.append(field, file);
      });
    });

    setSubmitting(true);
    setUploadProgress(0);

    try {
      const result = await uploadProject(payload, setUploadProgress);

      localStorage.removeItem("projectDraft");

      setStatus({
        type: "success",
        message: `${t.success} ${result.folderName || ""}`
      });
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error.message === "NETWORK_ERROR"
            ? t.connectionError
            : error.message === "UPLOAD_ABORTED"
              ? t.saveError
              : error.message === "SAVE_ERROR"
                ? t.saveError
                : error.message
      });
    } finally {
      setSubmitting(false);
      setUploadProgress(0);
    }
  }

  function startNewProject() {
    setForm(initialForm);
    setFiles(initialFiles);
    setErrors({});
    setStatus({ type: "", message: "" });

    localStorage.removeItem("projectDraft");

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }

  function changeLanguage() {
    setLanguage(isHebrew ? "en" : "he");
    setErrors({});
    setStatus({ type: "", message: "" });
  }

  return (
    <main className="page-shell" dir={isHebrew ? "rtl" : "ltr"} lang={language}>
      <header className="topbar">
        <a className="brand" href="#" aria-label="Northstar home">
          <span className="brand-mark">
            <Building2 size={19} />
          </span>

          <span>
            NORTHSTAR <small>PROJECTS</small>
          </span>
        </a>

        <div className="topbar-right">
          <span className="secure-dot" />
          {t.workspace}

          <button
            type="button"
            className="language-button"
            onClick={changeLanguage}
          >
            <Languages size={15} />
            {t.languageButton}
          </button>
        </div>
      </header>

      <div className="page-content">
        <div className="eyebrow">
          <Sparkles size={14} />
          {t.eyebrow}
        </div>

        <div className="page-heading">
          <div>
            <h1>{t.heading}</h1>
            <p className="intro">{t.intro}</p>
          </div>

          <div className="step-pill">
            <span>01</span>
            {t.step}
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <section className="section-card details-card">
            <div className="section-title">
              <div className="section-number">01</div>

              <div>
                <h2>{t.details}</h2>
                <p>{t.detailsDescription}</p>
              </div>
            </div>

            <div className="form-grid">
              <div className="field">
                <label htmlFor="projectName">
                  {t.projectName} <span>*</span>
                </label>

                <input
                  id="projectName"
                  name="projectName"
                  value={form.projectName}
                  onChange={updateField}
                  placeholder={t.projectNamePlaceholder}
                  aria-invalid={!!errors.projectName}
                />

                {errors.projectName && (
                  <small className="field-error">
                    {errors.projectName}
                  </small>
                )}
              </div>

              <div className="field">
                <label htmlFor="architectName">
                  {t.architectName} <span>*</span>
                </label>

                <input
                  id="architectName"
                  name="architectName"
                  value={form.architectName}
                  onChange={updateField}
                  placeholder={t.architectPlaceholder}
                  aria-invalid={!!errors.architectName}
                />

                {errors.architectName && (
                  <small className="field-error">
                    {errors.architectError}
                  </small>
                )}
              </div>

              <div className="field">
                <label htmlFor="numberOfUnits">
                  {t.units} <span>*</span>
                </label>

                <input
                  id="numberOfUnits"
                  name="numberOfUnits"
                  type="number"
                  min="1"
                  step="1"
                  value={form.numberOfUnits}
                  onChange={updateField}
                  placeholder={t.unitsPlaceholder}
                  aria-invalid={!!errors.numberOfUnits}
                />

                {errors.numberOfUnits && (
                  <small className="field-error">
                    {errors.numberOfUnits}
                  </small>
                )}
              </div>

              <div className="field">
                <label htmlFor="buildingStatus">
                  {t.buildingStatus} <span>*</span>
                </label>

                <select
                  id="buildingStatus"
                  name="buildingStatus"
                  value={form.buildingStatus}
                  onChange={updateField}
                  aria-invalid={!!errors.buildingStatus}
                >
                  <option value="">{t.selectStatus}</option>

                  {Object.entries(t.statuses).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>

                {errors.buildingStatus && (
                  <small className="field-error">
                    {errors.buildingStatus}
                  </small>
                )}
              </div>

              <div className="field field-full">
                <label htmlFor="projectNotes">
                  {t.notes}
                  <span className="optional">{t.optional}</span>
                </label>

                <textarea
                  id="projectNotes"
                  name="projectNotes"
                  rows="4"
                  value={form.projectNotes}
                  onChange={updateField}
                  placeholder={t.notesPlaceholder}
                />
              </div>
            </div>
          </section>

          <section className="uploads-section">
            <div className="section-title upload-section-title">
              <div className="section-number">02</div>

              <div>
                <h2>{t.documents}</h2>
                <p>{t.documentsDescription}</p>
              </div>
            </div>

            <div className="upload-grid">
              <FileUpload
                language={language}
                title={t.brief}
                description={t.briefDescription}
                files={files.projectBrief}
                onChange={(value) =>
                  setFiles((current) => ({
                    ...current,
                    projectBrief: value
                  }))
                }
              />

              <FileUpload
                language={language}
                title={t.sales}
                description={t.salesDescription}
                files={files.salesDocuments}
                onChange={(value) =>
                  setFiles((current) => ({
                    ...current,
                    salesDocuments: value
                  }))
                }
              />

              <FileUpload
                language={language}
                title={t.architectural}
                description={t.architecturalDescription}
                files={files.architecturalMaterials}
                onChange={(value) =>
                  setFiles((current) => ({
                    ...current,
                    architecturalMaterials: value
                  }))
                }
                large
              />
            </div>
          </section>

          <div className="form-footer">
            <div className="required-note">
              <span>*</span> {t.required}
            </div>

            <button
              className="finish-button"
              type="submit"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <LoaderCircle className="spin" size={17} />
                  {t.saving}
                </>
              ) : (
                <>
                  {t.finish}
                  <ArrowUpRight size={17} />
                </>
              )}
            </button>
          </div>

          {submitting && (
            <div className="upload-progress" role="status" aria-live="polite">
              <div className="upload-progress-heading">
                <span>{t.uploadProgress}</span>
                <strong>{uploadProgress}%</strong>
              </div>

              <div
                className="upload-progress-track"
                role="progressbar"
                aria-valuenow={uploadProgress}
                aria-valuemin="0"
                aria-valuemax="100"
              >
                <div
                  className="upload-progress-fill"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </form>

        {status.message && (
          <div className={`status-message ${status.type}`} role="status">
            {status.type === "success" ? (
              <CheckCircle2 size={19} />
            ) : (
              <AlertCircle size={19} />
            )}

            <span>{status.message}</span>

            {status.type === "success" && (
              <button type="button" onClick={startNewProject}>
                {t.newProject}
              </button>
            )}
          </div>
        )}

        <footer className="page-footer">
          <span>NORTHSTAR PROJECTS</span>
          <span>{t.footer}</span>
        </footer>
      </div>
    </main>
  );
}
