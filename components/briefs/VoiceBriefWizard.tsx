"use client";

import { useEffect, useRef, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Field } from "@/components/ui/Field";
import { SectionCard } from "@/components/SectionCard";
import { Copy, Loader2, Mic, PauseCircle, PlayCircle, Upload } from "lucide-react";

type ProjectOption = { id: string; title: string };
type EmployeeOption = { id: string; name: string };

type ExtractedData = {
  titre: string | null;
  resume: string | null;
  instructions: string | null;
  priority: "Basse" | "Normale" | "Haute" | null;
  dueDate: string | null;
  projectNameDetected: string | null;
  projectId: string | null;
  employeeMentions: string[];
  employeeMatches: { name: string; employeeId: string | null; confidence: number; ambiguous: boolean }[];
  zones: string[];
  materials: string[];
  checklist: string[];
  warnings: string[];
} | null;

type Step = 1 | 2 | 3;

type Props = {
  open: boolean;
  onClose: () => void;
  projects: ProjectOption[];
  employees: EmployeeOption[];
  defaultProjectId?: string;
};

const inputClass =
  "w-full h-9 px-3 border border-neutral-border rounded bg-neutral-white text-body text-neutral-text focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 focus:outline-none";

export function VoiceBriefWizard({ open, onClose, projects, employees, defaultProjectId }: Props) {
  const [step, setStep] = useState<Step>(1);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioDuration, setAudioDuration] = useState<number | null>(null);
  const [voiceBriefId, setVoiceBriefId] = useState<string | null>(null);
  const [transcription, setTranscription] = useState("");
  const [aiSummary, setAiSummary] = useState("");
  const [extracted, setExtracted] = useState<ExtractedData>(null);

  const [title, setTitle] = useState("");
  const [projectId, setProjectId] = useState<string>(defaultProjectId ?? "");
  const [priority, setPriority] = useState<"Basse" | "Normale" | "Haute">("Normale");
  const [dueDate, setDueDate] = useState<string>("");
  const [instructions, setInstructions] = useState("");
  const [zones, setZones] = useState<string[]>([]);
  const [materials, setMaterials] = useState<string[]>([]);
  const [checklist, setChecklist] = useState<string[]>([]);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);

  const [isMediaSupported, setIsMediaSupported] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && "MediaRecorder" in window) {
      setIsMediaSupported(true);
    }
  }, []);

  useEffect(() => {
    if (!open) {
      resetAll();
    }
  }, [open]);

  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const resetAll = () => {
    setStep(1);
    setError(null);
    setLoading(false);
    setAudioFile(null);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setAudioDuration(null);
    setVoiceBriefId(null);
    setTranscription("");
    setAiSummary("");
    setExtracted(null);
    setTitle("");
    setProjectId(defaultProjectId ?? "");
    setPriority("Normale");
    setDueDate("");
    setInstructions("");
    setZones([]);
    setMaterials([]);
    setChecklist([]);
    setSelectedEmployeeIds([]);
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
        const file = new File([blob], "brief-vocal.webm", { type: "audio/webm" });
        setAudioFile(file);
        if (audioUrl) URL.revokeObjectURL(audioUrl);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        const audio = new Audio(url);
        audio.addEventListener("loadedmetadata", () => {
          if (!isNaN(audio.duration)) {
            setAudioDuration(Math.round(audio.duration));
          }
        });
        setIsRecording(false);
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch {
      setError("Impossible de démarrer l'enregistrement audio.");
      setIsRecording(false);
    }
  };

  const handleStopRecording = () => {
    const rec = mediaRecorderRef.current;
    if (rec && rec.state === "recording") {
      rec.stop();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        setAudioDuration(Math.round(audio.duration));
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

  const handleAnalyze = async () => {
    if (!audioFile) {
      setError("Ajoutez ou enregistrez un audio avant de lancer l'analyse.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const formData = new FormData();
      formData.set("audio", audioFile);
      const res = await fetch("/api/voice-briefs/analyze", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Erreur lors de l'analyse IA du brief vocal.");
      }
      setVoiceBriefId(json.id);
      setTranscription(json.draft.transcription ?? "");
      setAiSummary(json.draft.ai_summary ?? "");
      setExtracted(json.draft.extracted_data ?? null);

      const data = json.draft.extracted_data as ExtractedData;
      if (data) {
        setTitle(data.titre || "");
        setInstructions(data.instructions || "");
        setPriority(data.priority || "Normale");
        if (data.dueDate) setDueDate(data.dueDate);
        if (data.projectId) setProjectId(data.projectId);
        setZones(data.zones || []);
        setMaterials(data.materials || []);
        setChecklist(data.checklist || []);

        const autoAssigned = (data.employeeMatches || [])
          .filter((m) => m.employeeId && !m.ambiguous)
          .map((m) => m.employeeId!) as string[];
        setSelectedEmployeeIds(autoAssigned);
      }

      setStep(3);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const toggleEmployeeId = (id: string) => {
    setSelectedEmployeeIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleAddZone = () => {
    setZones((prev) => [...prev, ""]);
  };

  const handleZoneChange = (idx: number, value: string) => {
    setZones((prev) => prev.map((z, i) => (i === idx ? value : z)));
  };

  const handleAddChecklistItem = () => {
    setChecklist((prev) => [...prev, ""]);
  };

  const handleChecklistChange = (idx: number, value: string) => {
    setChecklist((prev) => prev.map((c, i) => (i === idx ? value : c)));
  };

  const handleCopy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      setError("Impossible de copier dans le presse-papiers.");
    }
  };

  const handleSubmit = async (status: "Brouillon" | "Envoyé") => {
    if (!voiceBriefId) {
      setError("Aucun brouillon vocal à confirmer.");
      return;
    }
    if (!title.trim()) {
      setError("Le titre du brief est requis.");
      return;
    }
    if (!instructions.trim()) {
      setError("Les instructions du brief sont requises.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/voice-briefs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          voiceBriefId,
          brief: {
            title: title.trim(),
            projectId: projectId || null,
            priority,
            dueDate: dueDate || null,
            instructions: instructions.trim(),
            zones: zones.filter((z) => z.trim()).map((z) => ({ title: z.trim(), details: null })),
            checklist: checklist.filter((c) => c.trim()).map((c) => ({ label: c.trim(), required: false })),
            employeeIds: selectedEmployeeIds,
            status,
          },
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Erreur lors de la création du brief.");
      }
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (step === 1) {
      return (
        <div className="space-y-4">
          <p className="text-caption text-neutral-text">
            Enregistrez un message vocal ou importez un audio. Il sera analysé pour générer un brief structuré.
          </p>

          <SectionCard title="Source audio">
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {isMediaSupported && (
                  <>
                    {!isRecording ? (
                      <button
                        type="button"
                        onClick={handleStartRecording}
                        className="inline-flex items-center gap-1.5 h-9 px-3 text-caption font-medium text-white bg-primary-orange rounded hover:opacity-90 focus-ring"
                      >
                        <Mic size={16} /> Enregistrer un brief
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
                  />
                </label>
              </div>

              {audioFile && (
                <div className="flex items-center justify-between text-caption-xs text-neutral-text-secondary">
                  <span>{audioFile.name}</span>
                  {audioDuration != null && <span>Durée estimée : {audioDuration}s</span>}
                </div>
              )}

              {audioUrl && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePlayPause}
                    className="inline-flex items-center gap-1.5 h-8 px-3 text-caption font-medium text-neutral-text bg-neutral-white border border-neutral-border rounded hover:bg-neutral-bg-subtle focus-ring"
                  >
                    {isPlaying ? <PauseCircle size={16} /> : <PlayCircle size={16} />} Pré-écouter
                  </button>
                </div>
              )}
            </div>
          </SectionCard>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={!audioFile || loading}
              className="inline-flex items-center gap-1.5 h-9 px-3.5 text-caption font-medium text-white bg-primary-blue rounded hover:opacity-90 focus-ring disabled:opacity-50"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              Analyser le message vocal
            </button>
          </div>
        </div>
      );
    }

    if (step === 3 && extracted) {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)] gap-4">
            <div className="space-y-3">
              <SectionCard title="Audio & transcription">
                <div className="space-y-3">
                  {audioUrl && (
                    <div className="flex items-center justify-between text-caption-xs text-neutral-text-secondary mb-2">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handlePlayPause}
                          className="inline-flex items-center gap-1.5 h-8 px-3 text-caption font-medium text-neutral-text bg-neutral-white border border-neutral-border rounded hover:bg-neutral-bg-subtle focus-ring"
                        >
                          {isPlaying ? <PauseCircle size={16} /> : <PlayCircle size={16} />} Audio
                        </button>
                        <span className="truncate max-w-[180px]">{audioFile?.name ?? "Audio source"}</span>
                      </div>
                      {audioDuration != null && <span>Durée : {audioDuration}s</span>}
                    </div>
                  )}
                  <div className="border border-neutral-border rounded-md bg-neutral-white p-2 h-[140px] flex flex-col">
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
                      {transcription || <span className="text-neutral-text-secondary">La transcription complète apparaîtra ici.</span>}
                    </div>
                  </div>
                  <div className="border border-neutral-border rounded-md bg-neutral-white p-2 h-[80px] flex flex-col">
                    <p className="text-caption font-medium text-neutral-text mb-1">Résumé IA</p>
                    <div className="flex-1 overflow-auto text-caption-xs text-neutral-text whitespace-pre-wrap">
                      {aiSummary || extracted.resume || <span className="text-neutral-text-secondary">Résumé opérationnel généré à partir du message vocal.</span>}
                    </div>
                  </div>
                </div>
              </SectionCard>

              <SectionCard title="Warnings / À confirmer">
                {(!extracted.warnings || extracted.warnings.length === 0) ? (
                  <p className="text-caption-xs text-neutral-text-secondary">Aucun warning particulier. Vérifiez néanmoins les informations avant validation.</p>
                ) : (
                  <ul className="list-disc list-inside space-y-1 text-caption-xs text-neutral-text">
                    {extracted.warnings.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                )}
              </SectionCard>
            </div>

            <div className="space-y-3">
              <SectionCard title="Brief proposé">
                <div className="space-y-3">
                  <Field label="Titre" required>
                    <input type="text" className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} />
                  </Field>
                  <Field label="Chantier">
                    <select className={inputClass} value={projectId} onChange={(e) => setProjectId(e.target.value)}>
                      <option value="">Non rattaché</option>
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>{p.title}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Priorité">
                    <select className={inputClass} value={priority} onChange={(e) => setPriority(e.target.value as "Basse" | "Normale" | "Haute")}>
                      <option value="Basse">Basse</option>
                      <option value="Normale">Normale</option>
                      <option value="Haute">Haute</option>
                    </select>
                  </Field>
                  <Field label="Échéance (optionnel)">
                    <input type="date" className={inputClass} value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                  </Field>
                  <Field label="Employés assignés">
                    <div className="border border-neutral-border rounded max-h-32 overflow-auto p-1.5 space-y-1">
                      {employees.length === 0 ? (
                        <p className="text-caption-xs text-neutral-text-secondary px-1 py-0.5">Aucun employé disponible.</p>
                      ) : (
                        employees.map((e) => {
                          const checked = selectedEmployeeIds.includes(e.id);
                          const match = extracted.employeeMatches?.find((m) => m.employeeId === e.id);
                          return (
                            <label key={e.id} className="flex items-center gap-2 text-caption-xs text-neutral-text px-1 py-0.5 cursor-pointer">
                              <input
                                type="checkbox"
                                className="h-3.5 w-3.5 rounded border-neutral-border text-primary-blue focus:ring-primary-blue/30"
                                checked={checked}
                                onChange={() => toggleEmployeeId(e.id)}
                              />
                              <span className="truncate">{e.name}</span>
                              {match && <span className="text-neutral-text-secondary text-[10px]">(détecté)</span>}
                            </label>
                          );
                        })
                      )}
                    </div>
                  </Field>
                  <Field label="Instructions principales" required>
                    <textarea
                      className={inputClass + " min-h-[120px] resize-y py-2"}
                      value={instructions}
                      onChange={(e) => setInstructions(e.target.value)}
                    />
                  </Field>
                  <Field label="Zones / pièces">
                    <div className="space-y-1">
                      {zones.map((z, idx) => (
                        <input
                          key={idx}
                          type="text"
                          className={inputClass + " h-8 text-caption"}
                          value={z}
                          onChange={(e) => handleZoneChange(idx, e.target.value)}
                          placeholder="Ex. Salon, Chambre 1, Cage d'escalier…"
                        />
                      ))}
                      <button
                        type="button"
                        onClick={handleAddZone}
                        className="text-caption-xs text-primary-blue hover:underline"
                      >
                        + Ajouter une zone
                      </button>
                    </div>
                  </Field>
                  <Field label="Checklist">
                    <div className="space-y-1">
                      {checklist.map((c, idx) => (
                        <input
                          key={idx}
                          type="text"
                          className={inputClass + " h-8 text-caption"}
                          value={c}
                          onChange={(e) => handleChecklistChange(idx, e.target.value)}
                          placeholder="Ex. Vérifier la protection des planchers…"
                        />
                      ))}
                      <button
                        type="button"
                        onClick={handleAddChecklistItem}
                        className="text-caption-xs text-primary-blue hover:underline"
                      >
                        + Ajouter un item
                      </button>
                    </div>
                  </Field>
                  <Field label="Matériel mentionné (lecture seule)">
                    <div className="min-h-[32px] border border-neutral-border rounded px-2 py-1 text-caption-xs text-neutral-text whitespace-pre-wrap">
                      {materials && materials.length > 0 ? materials.join(", ") : <span className="text-neutral-text-secondary">Le matériel détecté sera affiché ici.</span>}
                    </div>
                  </Field>
                </div>
              </SectionCard>
            </div>
          </div>

          {error && <p className="text-caption-xs text-red-600">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => onClose()}
              className="h-9 px-3 text-caption font-medium text-neutral-text bg-neutral-bg-subtle border border-neutral-border rounded focus-ring"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={() => handleSubmit("Brouillon")}
              disabled={loading}
              className="h-9 px-3 text-caption font-medium text-neutral-text bg-neutral-white border border-neutral-border rounded hover:bg-neutral-bg-subtle focus-ring disabled:opacity-50"
            >
              {loading && <Loader2 size={14} className="mr-1 inline-block animate-spin" />} Créer le brief
            </button>
            <button
              type="button"
              onClick={() => handleSubmit("Envoyé")}
              disabled={loading}
              className="h-9 px-3.5 text-caption font-medium text-white bg-primary-orange rounded hover:opacity-90 focus-ring disabled:opacity-50"
            >
              {loading && <Loader2 size={14} className="mr-1 inline-block animate-spin" />} Créer et envoyer
            </button>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <Modal open={open} onClose={onClose} title="Nouveau brief vocal" maxWidth="5xl">
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-2 text-caption-xs text-neutral-text-secondary">
          <span className={step === 1 ? "font-medium text-neutral-text" : ""}>1. Enregistrement / import</span>
          <span>›</span>
          <span className={step === 2 ? "font-medium text-neutral-text" : ""}>2. Analyse IA</span>
          <span>›</span>
          <span className={step === 3 ? "font-medium text-neutral-text" : ""}>3. Validation & création</span>
        </div>
        {renderContent()}
      </div>
    </Modal>
  );
}

