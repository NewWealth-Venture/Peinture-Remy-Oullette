"use client";

import { useEffect, useRef, useState } from "react";
import { Field } from "@/components/ui/Field";
import { SectionCard } from "@/components/SectionCard";
import { Copy, Loader2, Mic, PauseCircle, PlayCircle, Upload, X } from "lucide-react";

type Props = {
  projectOptions?: { id: string; title: string }[];
  employeeOptions?: { id: string; name: string }[];
  defaultProjectId?: string;
  defaultEmployeeId?: string;
};

type StepState = "idle" | "recording" | "uploading" | "processing" | "done" | "error";

const inputClass =
  "w-full h-9 px-3 border border-neutral-border rounded bg-neutral-white text-body text-neutral-text focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 focus:outline-none";

export function VoiceReportRecorder({ projectOptions = [], employeeOptions = [], defaultProjectId, defaultEmployeeId }: Props) {
  const [step, setStep] = useState<StepState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>("Journal chantier");
  const [projectId, setProjectId] = useState<string>(defaultProjectId ?? "");
  const [employeeId, setEmployeeId] = useState<string>(defaultEmployeeId ?? "");
  const [reportDate, setReportDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [transcription, setTranscription] = useState("");
  const [summary, setSummary] = useState("");
  const [structuredReport, setStructuredReport] = useState("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [isMediaSupported, setIsMediaSupported] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && "MediaRecorder" in window) {
      setIsMediaSupported(true);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const resetState = () => {
    setError(null);
    setAudioFile(null);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setDuration(null);
    setTranscription("");
    setSummary("");
    setStructuredReport("");
    setStep("idle");
  };

  const handleStartRecording = async () => {
    try {
      setError(null);
      if (!navigator.mediaDevices?.getUserMedia) {
        setIsMediaSupported(false);
        setError("L'enregistrement direct n'est pas supporté sur ce navigateur. Utilisez l'import de fichier audio.");
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const file = new File([blob], "enregistrement.webm", { type: "audio/webm" });
        setAudioFile(file);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        const audio = new Audio(url);
        audio.addEventListener("loadedmetadata", () => {
          if (!isNaN(audio.duration)) {
            setDuration(Math.round(audio.duration));
          }
        });
        setStep("idle");
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setStep("recording");
    } catch (err) {
      setError("Impossible de démarrer l'enregistrement audio.");
      setStep("idle");
    }
  };

  const handleStopRecording = () => {
    const rec = mediaRecorderRef.current;
    if (rec && rec.state === "recording") {
      rec.stop();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setAudioFile(file);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    const url = URL.createObjectURL(file);
    setAudioUrl(url);
    const audio = new Audio(url);
    audio.addEventListener("loadedmetadata", () => {
      if (!isNaN(audio.duration)) {
        setDuration(Math.round(audio.duration));
      }
    });
  };

  const handlePlayPause = () => {
    if (!audioUrl) return;
    if (!audioElementRef.current) {
      audioElementRef.current = new Audio(audioUrl);
      audioElementRef.current.onended = () => setIsPlaying(false);
    }
    const audio = audioElementRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => setIsPlaying(true)).catch(() => setError("Impossible de lire l'audio local."));
    }
  };

  const handleSubmit = async () => {
    if (!audioFile) {
      setError("Ajoutez ou enregistrez un audio avant de lancer la transcription.");
      return;
    }
    setError(null);
    setStep("uploading");
    try {
      const formData = new FormData();
      formData.set("audio", audioFile);
      if (projectId) formData.set("project_id", projectId);
      if (employeeId) formData.set("employee_id", employeeId);
      if (title.trim()) formData.set("title", title.trim());
      if (category) formData.set("category", category);
      if (reportDate) formData.set("report_date", reportDate);

      setStep("processing");
      const res = await fetch("/api/voice-reports", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Erreur lors du traitement vocal.");
      }

      const report = json.report ?? json;
      setTranscription(report.transcription ?? "");
      setSummary(report.summary ?? "");
      setStructuredReport(report.structured_report ?? "");
      if (report.audio_duration_seconds && !duration) {
        setDuration(report.audio_duration_seconds);
      }
      setStep("done");
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      setStep("error");
    }
  };

  const handleCopy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      setError("Impossible de copier dans le presse-papiers.");
    }
  };

  const renderStatus = () => {
    if (step === "recording") return "Enregistrement en cours…";
    if (step === "uploading" || step === "processing") return "Traitement IA en cours…";
    if (step === "done") return "Transcription et rapport générés.";
    if (step === "error") return "Une erreur est survenue.";
    return "Prêt.";
  };

  const disabled = step === "uploading" || step === "processing";

  return (
    <SectionCard title="Compte rendu vocal" className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1.4fr)_minmax(0,2fr)] gap-6">
        <div className="space-y-4">
          <Field label="Chantier">
            <select className={inputClass} value={projectId} onChange={(e) => setProjectId(e.target.value)} disabled={disabled}>
              <option value="">Non rattaché</option>
              {projectOptions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Employé">
            <select className={inputClass} value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} disabled={disabled}>
              <option value="">Non rattaché</option>
              {employeeOptions.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Titre (optionnel)">
            <input type="text" className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} disabled={disabled} placeholder="Ex. Visite chantier du 12 mars" />
          </Field>

          <Field label="Catégorie">
            <select className={inputClass} value={category} onChange={(e) => setCategory(e.target.value)} disabled={disabled}>
              <option value="Journal chantier">Journal chantier</option>
              <option value="Avancement">Avancement</option>
              <option value="Visite">Visite</option>
              <option value="Incident">Incident</option>
              <option value="Note vocale">Note vocale</option>
              <option value="Autre">Autre</option>
            </select>
          </Field>

          <Field label="Date du rapport">
            <input type="date" className={inputClass} value={reportDate} onChange={(e) => setReportDate(e.target.value)} disabled={disabled} />
          </Field>

          <div className="mt-2 rounded border border-dashed border-neutral-border bg-neutral-bg-subtle/50 p-3 space-y-2">
            <p className="text-caption font-medium text-neutral-text">Source audio</p>
            <div className="flex flex-wrap gap-2">
              {isMediaSupported && (
                <>
                  {step !== "recording" ? (
                    <button
                      type="button"
                      onClick={handleStartRecording}
                      className="inline-flex items-center gap-1.5 h-9 px-3 text-caption font-medium text-white bg-primary-orange rounded hover:opacity-90 focus-ring disabled:opacity-50"
                      disabled={disabled}
                    >
                      <Mic size={16} /> Enregistrer
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleStopRecording}
                      className="inline-flex items-center gap-1.5 h-9 px-3 text-caption font-medium text-white bg-red-600 rounded hover:opacity-90 focus-ring"
                    >
                      <PauseCircle size={16} /> Arrêter
                    </button>
                  )}
                </>
              )}

              <label className="inline-flex items-center gap-1.5 h-9 px-3 text-caption font-medium text-neutral-text bg-neutral-white border border-neutral-border rounded hover:bg-neutral-bg-subtle focus-ring cursor-pointer">
                <Upload size={16} /> Importer un audio
                <input
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={disabled}
                />
              </label>

              {audioFile && (
                <button
                  type="button"
                  onClick={resetState}
                  className="inline-flex items-center gap-1.5 h-9 px-3 text-caption font-medium text-neutral-text bg-neutral-bg-subtle border border-neutral-border rounded hover:bg-neutral-bg-active focus-ring"
                >
                  <X size={14} /> Réinitialiser
                </button>
              )}
            </div>

            <div className="flex items-center justify-between text-caption-xs text-neutral-text-secondary mt-1">
              <span>{renderStatus()}</span>
              {duration != null && (
                <span>Durée : {duration} s</span>
              )}
            </div>

            {audioUrl && (
              <div className="mt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePlayPause}
                  className="inline-flex items-center gap-1.5 h-8 px-3 text-caption font-medium text-neutral-text bg-neutral-white border border-neutral-border rounded hover:bg-neutral-bg-subtle focus-ring"
                >
                  {isPlaying ? <PauseCircle size={16} /> : <PlayCircle size={16} />} Pré-écouter
                </button>
                <span className="text-caption-xs text-neutral-text-secondary truncate">
                  {audioFile?.name ?? "Enregistrement local"}
                </span>
              </div>
            )}
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!audioFile || disabled}
              className="inline-flex items-center gap-1.5 h-9 px-3.5 text-caption font-medium text-white bg-primary-blue rounded hover:opacity-90 focus-ring disabled:opacity-50"
            >
              {(step === "uploading" || step === "processing") && <Loader2 size={16} className="animate-spin" />}
              Générer le compte rendu
            </button>
          </div>

          {error && (
            <p className="text-caption-xs text-red-600 mt-1">
              {error}
            </p>
          )}
        </div>

        <div className="space-y-4">
          <div className="border border-neutral-border rounded-md bg-neutral-white p-3 h-[140px] flex flex-col">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-caption font-medium text-neutral-text">Transcription</p>
              <button
                type="button"
                onClick={() => transcription && handleCopy(transcription)}
                className="inline-flex items-center gap-1 h-7 px-2 text-caption-xs font-medium text-neutral-text bg-neutral-bg-subtle border border-neutral-border rounded hover:bg-neutral-bg-active focus-ring disabled:opacity-50"
                disabled={!transcription}
              >
                <Copy size={12} /> Copier
              </button>
            </div>
            <div className="flex-1 overflow-auto text-caption-xs text-neutral-text whitespace-pre-wrap">
              {transcription || <span className="text-neutral-text-secondary">La transcription complète apparaîtra ici après traitement.</span>}
            </div>
          </div>

          <div className="border border-neutral-border rounded-md bg-neutral-white p-3 h-[120px] flex flex-col">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-caption font-medium text-neutral-text">Résumé</p>
              <button
                type="button"
                onClick={() => summary && handleCopy(summary)}
                className="inline-flex items-center gap-1 h-7 px-2 text-caption-xs font-medium text-neutral-text bg-neutral-bg-subtle border border-neutral-border rounded hover:bg-neutral-bg-active focus-ring disabled:opacity-50"
                disabled={!summary}
              >
                <Copy size={12} /> Copier
              </button>
            </div>
            <div className="flex-1 overflow-auto text-caption-xs text-neutral-text whitespace-pre-wrap">
              {summary || <span className="text-neutral-text-secondary">Le résumé court sera généré automatiquement.</span>}
            </div>
          </div>

          <div className="border border-neutral-border rounded-md bg-neutral-white p-3 h-[180px] flex flex-col">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-caption font-medium text-neutral-text">Rapport structuré</p>
              <button
                type="button"
                onClick={() => structuredReport && handleCopy(structuredReport)}
                className="inline-flex items-center gap-1 h-7 px-2 text-caption-xs font-medium text-neutral-text bg-neutral-bg-subtle border border-neutral-border rounded hover:bg-neutral-bg-active focus-ring disabled:opacity-50"
                disabled={!structuredReport}
              >
                <Copy size={12} /> Copier
              </button>
            </div>
            <div className="flex-1 overflow-auto text-caption-xs text-neutral-text whitespace-pre-wrap">
              {structuredReport || (
                <span className="text-neutral-text-secondary">
                  Le rapport structuré sera généré en français professionnel, prêt à relire ou copier.
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

