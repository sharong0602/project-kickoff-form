import { useState } from "react";
import { Building2, Sparkles, ArrowUpRight, CheckCircle2, AlertCircle, LoaderCircle } from "lucide-react";
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

export default function App() {
  const [form, setForm] = useState(initialForm);
  const [files, setFiles] = useState(initialFiles);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ type: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
    setStatus({ type: "", message: "" });
  }

  function validate() {
    const next = {};
    if (!form.projectName.trim()) next.projectName = "Please enter a project name.";
    if (!form.architectName.trim()) next.architectName = "Please enter the architect's name.";
    if (!form.numberOfUnits.trim()) next.numberOfUnits = "Please enter the number of units.";
    else if (!/^\d+$/.test(form.numberOfUnits) || Number(form.numberOfUnits) <= 0) {
      next.numberOfUnits = "Enter a positive whole number.";
    }
    if (!form.buildingStatus) next.buildingStatus = "Please select a building status.";
    return next;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus({ type: "", message: "" });
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      setStatus({ type: "error", message: "Please review the highlighted fields." });
      return;
    }

    const payload = new FormData();
    Object.entries(form).forEach(([key, value]) => payload.append(key, value));
    Object.entries(files).forEach(([field, selected]) => {
      selected.forEach((file) => payload.append(field, file));
    });

    setSubmitting(true);
    try {
      const response = await fetch("/api/projects", { method: "POST", body: payload });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message || "The project could not be saved.");
      setStatus({ type: "success", message: `Project saved successfully. Folder: ${result.folderName}` });
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message.includes("Failed to fetch")
          ? "Could not connect to the server. Make sure the backend is running."
          : error.message
      });
    } finally {
      setSubmitting(false);
    }
  }

  function startNewProject() {
    setForm(initialForm);
    setFiles(initialFiles);
    setErrors({});
    setStatus({ type: "", message: "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <main className="page-shell">
      <header className="topbar">
        <a className="brand" href="#" aria-label="Northstar home">
          <span className="brand-mark"><Building2 size={19} /></span>
          <span>NORTHSTAR <small>PROJECTS</small></span>
        </a>
        <div className="topbar-right"><span className="secure-dot" /> Workspace setup</div>
      </header>

      <div className="page-content">
        <div className="eyebrow"><Sparkles size={14} /> PROJECT WORKSPACE</div>
        <div className="page-heading">
          <div>
            <h1>Project kickoff</h1>
            <p className="intro">Let's lay the groundwork. Share a few details and upload the documents we'll need to get started.</p>
          </div>
          <div className="step-pill"><span>01</span> Project details</div>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <section className="section-card details-card">
            <div className="section-title">
              <div className="section-number">01</div>
              <div><h2>Project details</h2><p>Tell us a little about the project.</p></div>
            </div>

            <div className="form-grid">
              <div className="field">
                <label htmlFor="projectName">Project name <span>*</span></label>
                <input id="projectName" name="projectName" value={form.projectName} onChange={updateField} placeholder="e.g. Park Towers" aria-invalid={!!errors.projectName} />
                {errors.projectName && <small className="field-error">{errors.projectName}</small>}
              </div>
              <div className="field">
                <label htmlFor="architectName">Architect name <span>*</span></label>
                <input id="architectName" name="architectName" value={form.architectName} onChange={updateField} placeholder="e.g. Dana Levi" aria-invalid={!!errors.architectName} />
                {errors.architectName && <small className="field-error">{errors.architectName}</small>}
              </div>
              <div className="field">
                <label htmlFor="numberOfUnits">Number of units <span>*</span></label>
                <input id="numberOfUnits" name="numberOfUnits" type="number" min="1" step="1" value={form.numberOfUnits} onChange={updateField} placeholder="e.g. 48" aria-invalid={!!errors.numberOfUnits} />
                {errors.numberOfUnits && <small className="field-error">{errors.numberOfUnits}</small>}
              </div>
              <div className="field">
                <label htmlFor="buildingStatus">Building status <span>*</span></label>
                <select id="buildingStatus" name="buildingStatus" value={form.buildingStatus} onChange={updateField} aria-invalid={!!errors.buildingStatus}>
                  <option value="">Select current status</option>
                  <option>Planning</option>
                  <option>Permit approved</option>
                  <option>Under construction</option>
                  <option>Finishing works</option>
                  <option>Delivered</option>
                </select>
                {errors.buildingStatus && <small className="field-error">{errors.buildingStatus}</small>}
              </div>
              <div className="field field-full">
                <label htmlFor="projectNotes">Project notes <span className="optional">OPTIONAL</span></label>
                <textarea id="projectNotes" name="projectNotes" rows="4" value={form.projectNotes} onChange={updateField} placeholder="Anything else we should know about this project?" />
              </div>
            </div>
          </section>

          <section className="uploads-section">
            <div className="section-title upload-section-title">
              <div className="section-number">02</div>
              <div><h2>Project documents</h2><p>Add the files that will help our team get up to speed.</p></div>
            </div>
            <div className="upload-grid">
              <FileUpload title="Project brief" description="The project overview and objectives." files={files.projectBrief} onChange={(value) => setFiles((current) => ({ ...current, projectBrief: value }))} />
              <FileUpload title="Sales documents" description="Sales materials, brochures and related files." files={files.salesDocuments} onChange={(value) => setFiles((current) => ({ ...current, salesDocuments: value }))} />
              <FileUpload title="Architectural materials" description="Plans, drawings, specifications and other technical documents." files={files.architecturalMaterials} onChange={(value) => setFiles((current) => ({ ...current, architecturalMaterials: value }))} large />
            </div>
          </section>

          <div className="form-footer">
            <div className="required-note"><span>*</span> Required fields</div>
            <button className="finish-button" type="submit" disabled={submitting}>
              {submitting ? <><LoaderCircle className="spin" size={17} /> Saving project...</> : <>Finish & save <ArrowUpRight size={17} /></>}
            </button>
          </div>
        </form>

        {status.message && (
          <div className={`status-message ${status.type}`} role="status">
            {status.type === "success" ? <CheckCircle2 size={19} /> : <AlertCircle size={19} />}
            <span>{status.message}</span>
            {status.type === "success" && <button type="button" onClick={startNewProject}>Start a new project</button>}
          </div>
        )}

        <footer className="page-footer"><span> NORTHSTAR PROJECTS</span><span>Project intake · Local workspace</span></footer>
      </div>
    </main>
  );
}