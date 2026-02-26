"use client";

import { useState, useMemo } from "react";
import { PageHeader } from "@/components/PageHeader";
import { SectionCard } from "@/components/SectionCard";
import {
  Plus,
  Trash2,
  Calculator,
  Ruler,
  Package,
  Users,
  FileText,
} from "lucide-react";

type SurfaceType = "mur" | "plafond" | "plinthes" | "portes_fenetres" | "autre";
type SurfaceRow = {
  id: string;
  type: SurfaceType;
  description: string;
  largeur: number;
  hauteur: number;
  quantite: number;
  prixUnitaire: number;
};
type MaterialRow = {
  id: string;
  nom: string;
  quantite: number;
  unite: string;
  prixUnitaire: number;
};

const SURFACE_LABELS: Record<SurfaceType, string> = {
  mur: "Mur",
  plafond: "Plafond",
  plinthes: "Plinthes (m.l.)",
  portes_fenetres: "Portes / Fenêtres",
  autre: "Autre",
};

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export default function AccueilEstimePage() {
  const [clientNom, setClientNom] = useState("");
  const [clientAdresse, setClientAdresse] = useState("");
  const [clientTelephone, setClientTelephone] = useState("");
  const [clientCourriel, setClientCourriel] = useState("");
  const [nomProjet, setNomProjet] = useState("");
  const [dateValidite, setDateValidite] = useState("");
  const [surfaces, setSurfaces] = useState<SurfaceRow[]>([
    {
      id: crypto.randomUUID(),
      type: "mur",
      description: "",
      largeur: 0,
      hauteur: 0,
      quantite: 1,
      prixUnitaire: 0,
    },
  ]);
  const [materiaux, setMateriaux] = useState<MaterialRow[]>([
    {
      id: crypto.randomUUID(),
      nom: "",
      quantite: 0,
      unite: "L",
      prixUnitaire: 0,
    },
  ]);
  const [heuresMainOeuvre, setHeuresMainOeuvre] = useState(0);
  const [tauxHoraire, setTauxHoraire] = useState(45);
  const [notes, setNotes] = useState("");
  const [tpsPercent, setTpsPercent] = useState(5);
  const [tvqPercent, setTvqPercent] = useState(9.975);

  const addSurface = () => {
    setSurfaces((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        type: "mur",
        description: "",
        largeur: 0,
        hauteur: 0,
        quantite: 1,
        prixUnitaire: 0,
      },
    ]);
  };
  const removeSurface = (id: string) => {
    if (surfaces.length <= 1) return;
    setSurfaces((prev) => prev.filter((r) => r.id !== id));
  };
  const updateSurface = (id: string, field: keyof SurfaceRow, value: string | number) => {
    setSurfaces((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  const addMateriel = () => {
    setMateriaux((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        nom: "",
        quantite: 0,
        unite: "L",
        prixUnitaire: 0,
      },
    ]);
  };
  const removeMateriel = (id: string) => {
    if (materiaux.length <= 1) return;
    setMateriaux((prev) => prev.filter((r) => r.id !== id));
  };
  const updateMateriel = (id: string, field: keyof MaterialRow, value: string | number) => {
    setMateriaux((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  const surfaceTotals = useMemo(() => {
    return surfaces.map((s) => {
      const m2 = s.largeur * s.hauteur * s.quantite;
      const sousTotal = round2(m2 * s.prixUnitaire);
      return { m2, sousTotal };
    });
  }, [surfaces]);

  const totalSurfaces = useMemo(
    () => round2(surfaceTotals.reduce((a, t) => a + t.sousTotal, 0)),
    [surfaceTotals]
  );

  const totalMateriaux = useMemo(
    () =>
      round2(
        materiaux.reduce((a, m) => a + m.quantite * m.prixUnitaire, 0)
      ),
    [materiaux]
  );

  const totalMainOeuvre = useMemo(
    () => round2(heuresMainOeuvre * tauxHoraire),
    [heuresMainOeuvre, tauxHoraire]
  );

  const sousTotal = useMemo(
    () => round2(totalSurfaces + totalMateriaux + totalMainOeuvre),
    [totalSurfaces, totalMateriaux, totalMainOeuvre]
  );

  const tps = useMemo(() => round2(sousTotal * (tpsPercent / 100)), [sousTotal, tpsPercent]);
  const tvq = useMemo(() => round2(sousTotal * (tvqPercent / 100)), [sousTotal, tvqPercent]);
  const total = useMemo(
    () => round2(sousTotal + tps + tvq),
    [sousTotal, tps, tvq]
  );

  const totalM2 = useMemo(
    () => round2(surfaceTotals.reduce((a, t) => a + t.m2, 0)),
    [surfaceTotals]
  );

  const inputClass =
    "w-full rounded border border-neutral-border bg-neutral-white px-3 py-2 text-body text-neutral-text focus:border-primary-blue focus:outline-none focus:ring-1 focus:ring-primary-blue";
  const labelClass = "block text-caption text-neutral-text-secondary mb-1";

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <PageHeader
        title="Estimé"
        subtitle="Outil complet pour préparer des soumissions et estimés de peinture."
      />

      <div className="grid grid-cols-12 gap-6">
        {/* Colonne principale */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
          {/* Client et projet */}
          <SectionCard
            title="Client et projet"
            description="Informations du client et du projet"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className={labelClass}>Nom du client</label>
                <input
                  type="text"
                  className={inputClass}
                  value={clientNom}
                  onChange={(e) => setClientNom(e.target.value)}
                  placeholder="Nom ou entreprise"
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Adresse du chantier</label>
                <input
                  type="text"
                  className={inputClass}
                  value={clientAdresse}
                  onChange={(e) => setClientAdresse(e.target.value)}
                  placeholder="Adresse complète"
                />
              </div>
              <div>
                <label className={labelClass}>Téléphone</label>
                <input
                  type="tel"
                  className={inputClass}
                  value={clientTelephone}
                  onChange={(e) => setClientTelephone(e.target.value)}
                  placeholder="(514) 000-0000"
                />
              </div>
              <div>
                <label className={labelClass}>Courriel</label>
                <input
                  type="email"
                  className={inputClass}
                  value={clientCourriel}
                  onChange={(e) => setClientCourriel(e.target.value)}
                  placeholder="client@exemple.ca"
                />
              </div>
              <div>
                <label className={labelClass}>Nom du projet</label>
                <input
                  type="text"
                  className={inputClass}
                  value={nomProjet}
                  onChange={(e) => setNomProjet(e.target.value)}
                  placeholder="Ex: Peinture salon et chambres"
                />
              </div>
              <div>
                <label className={labelClass}>Validité de l&apos;estimé (date)</label>
                <input
                  type="date"
                  className={inputClass}
                  value={dateValidite}
                  onChange={(e) => setDateValidite(e.target.value)}
                />
              </div>
            </div>
          </SectionCard>

          {/* Surfaces */}
          <SectionCard
            title="Surfaces à peindre"
            description="Dimensions et prix au m² ou m.l. — calcul automatique des sous-totaux"
            actions={
              <button
                type="button"
                onClick={addSurface}
                className="flex items-center gap-1.5 text-caption text-primary-blue hover:underline focus-ring rounded"
              >
                <Plus size={16} /> Ajouter une surface
              </button>
            }
          >
            <div className="space-y-4">
              <div className="grid grid-cols-12 gap-2 text-caption text-neutral-text-secondary font-medium px-1">
                <div className="col-span-2">Type</div>
                <div className="col-span-2">Description</div>
                <div className="col-span-1">L (m)</div>
                <div className="col-span-1">H (m)</div>
                <div className="col-span-1">Qté</div>
                <div className="col-span-2">Prix unit.</div>
                <div className="col-span-2">Sous-total</div>
                <div className="col-span-1" />
              </div>
              {surfaces.map((s, i) => (
                <div
                  key={s.id}
                  className="grid grid-cols-12 gap-2 items-center p-2 rounded bg-neutral-bg-subtle"
                >
                  <div className="col-span-2">
                    <select
                      className={inputClass + " py-1.5 text-caption"}
                      value={s.type}
                      onChange={(e) =>
                        updateSurface(s.id, "type", e.target.value as SurfaceType)
                      }
                    >
                      {(Object.keys(SURFACE_LABELS) as SurfaceType[]).map((t) => (
                        <option key={t} value={t}>
                          {SURFACE_LABELS[t]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <input
                      type="text"
                      className={inputClass + " py-1.5 text-caption"}
                      value={s.description}
                      onChange={(e) =>
                        updateSurface(s.id, "description", e.target.value)
                      }
                      placeholder="Ex: Salon"
                    />
                  </div>
                  <div className="col-span-1">
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      className={inputClass + " py-1.5 text-caption"}
                      value={s.largeur || ""}
                      onChange={(e) =>
                        updateSurface(s.id, "largeur", parseFloat(e.target.value) || 0)
                      }
                    />
                  </div>
                  <div className="col-span-1">
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      className={inputClass + " py-1.5 text-caption"}
                      value={s.hauteur || ""}
                      onChange={(e) =>
                        updateSurface(s.id, "hauteur", parseFloat(e.target.value) || 0)
                      }
                    />
                  </div>
                  <div className="col-span-1">
                    <input
                      type="number"
                      min={1}
                      className={inputClass + " py-1.5 text-caption"}
                      value={s.quantite || ""}
                      onChange={(e) =>
                        updateSurface(s.id, "quantite", parseInt(e.target.value, 10) || 1)
                      }
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      className={inputClass + " py-1.5 text-caption"}
                      value={s.prixUnitaire || ""}
                      onChange={(e) =>
                        updateSurface(s.id, "prixUnitaire", parseFloat(e.target.value) || 0)
                      }
                      placeholder="$/m²"
                    />
                  </div>
                  <div className="col-span-2 text-body font-medium text-neutral-text">
                    {surfaceTotals[i].sousTotal > 0
                      ? `${surfaceTotals[i].sousTotal.toFixed(2)} $`
                      : "—"}
                  </div>
                  <div className="col-span-1">
                    <button
                      type="button"
                      onClick={() => removeSurface(s.id)}
                      disabled={surfaces.length <= 1}
                      className="p-1.5 rounded text-neutral-text-secondary hover:bg-neutral-border hover:text-neutral-text disabled:opacity-40 focus-ring"
                      aria-label="Supprimer la ligne"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Matériaux */}
          <SectionCard
            title="Matériaux"
            description="Peinture, apprêt, fournitures"
            actions={
              <button
                type="button"
                onClick={addMateriel}
                className="flex items-center gap-1.5 text-caption text-primary-blue hover:underline focus-ring rounded"
              >
                <Plus size={16} /> Ajouter
              </button>
            }
          >
            <div className="space-y-4">
              <div className="grid grid-cols-12 gap-2 text-caption text-neutral-text-secondary font-medium px-1">
                <div className="col-span-4">Article</div>
                <div className="col-span-2">Quantité</div>
                <div className="col-span-2">Unité</div>
                <div className="col-span-2">Prix unit.</div>
                <div className="col-span-2">Sous-total</div>
                <div className="col-span-1" />
              </div>
              {materiaux.map((m, i) => (
                <div
                  key={m.id}
                  className="grid grid-cols-12 gap-2 items-center p-2 rounded bg-neutral-bg-subtle"
                >
                  <div className="col-span-4">
                    <input
                      type="text"
                      className={inputClass + " py-1.5 text-caption"}
                      value={m.nom}
                      onChange={(e) => updateMateriel(m.id, "nom", e.target.value)}
                      placeholder="Ex: Peinture latex satin"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      className={inputClass + " py-1.5 text-caption"}
                      value={m.quantite || ""}
                      onChange={(e) =>
                        updateMateriel(m.id, "quantite", parseFloat(e.target.value) || 0)
                      }
                    />
                  </div>
                  <div className="col-span-2">
                    <select
                      className={inputClass + " py-1.5 text-caption"}
                      value={m.unite}
                      onChange={(e) => updateMateriel(m.id, "unite", e.target.value)}
                    >
                      <option value="L">L</option>
                      <option value="gal">gal</option>
                      <option value="pce">pce</option>
                      <option value="m">m</option>
                      <option value="un">un</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      className={inputClass + " py-1.5 text-caption"}
                      value={m.prixUnitaire || ""}
                      onChange={(e) =>
                        updateMateriel(m.id, "prixUnitaire", parseFloat(e.target.value) || 0)
                      }
                    />
                  </div>
                  <div className="col-span-2 text-body font-medium text-neutral-text">
                    {m.quantite * m.prixUnitaire > 0
                      ? `${(m.quantite * m.prixUnitaire).toFixed(2)} $`
                      : "—"}
                  </div>
                  <div className="col-span-1">
                    <button
                      type="button"
                      onClick={() => removeMateriel(m.id)}
                      disabled={materiaux.length <= 1}
                      className="p-1.5 rounded text-neutral-text-secondary hover:bg-neutral-border hover:text-neutral-text disabled:opacity-40 focus-ring"
                      aria-label="Supprimer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Main d'œuvre */}
          <SectionCard
            title="Main d'œuvre"
            description="Heures estimées × taux horaire"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Heures estimées</label>
                <input
                  type="number"
                  min={0}
                  step={0.5}
                  className={inputClass}
                  value={heuresMainOeuvre || ""}
                  onChange={(e) =>
                    setHeuresMainOeuvre(parseFloat(e.target.value) || 0)
                  }
                />
              </div>
              <div>
                <label className={labelClass}>Taux horaire ($/h)</label>
                <input
                  type="number"
                  min={0}
                  step={1}
                  className={inputClass}
                  value={tauxHoraire || ""}
                  onChange={(e) =>
                    setTauxHoraire(parseFloat(e.target.value) || 0)
                  }
                />
              </div>
            </div>
          </SectionCard>

          {/* Notes */}
          <SectionCard title="Notes" description="Conditions, exclusions, délais">
            <textarea
              className={inputClass + " min-h-[100px] resize-y"}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Préparation des murs incluse. Peinture fournie par le client. Délai de réalisation: 2 semaines après acceptation."
            />
          </SectionCard>
        </div>

        {/* Récapitulatif */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          <SectionCard
            title="Récapitulatif"
            description="Totaux calculés automatiquement"
            className="lg:sticky lg:top-24"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-neutral-text-secondary">
                <Ruler size={18} />
                <span className="text-caption">Surface totale</span>
              </div>
              <p className="text-h3 text-neutral-text">
                {totalM2 > 0 ? `${totalM2} m²` : "—"}
              </p>

              <hr className="border-neutral-border" />

              <div className="flex justify-between text-body">
                <span className="text-neutral-text-secondary">Surfaces</span>
                <span className="font-medium">{totalSurfaces.toFixed(2)} $</span>
              </div>
              <div className="flex justify-between text-body">
                <span className="text-neutral-text-secondary">Matériaux</span>
                <span className="font-medium">{totalMateriaux.toFixed(2)} $</span>
              </div>
              <div className="flex justify-between text-body">
                <span className="text-neutral-text-secondary">Main d&apos;œuvre</span>
                <span className="font-medium">{totalMainOeuvre.toFixed(2)} $</span>
              </div>

              <hr className="border-neutral-border" />

              <div className="flex justify-between text-body font-medium">
                <span>Sous-total</span>
                <span>{sousTotal.toFixed(2)} $</span>
              </div>
              <div className="flex justify-between text-caption">
                <span>TPS ({tpsPercent}%)</span>
                <span>{tps.toFixed(2)} $</span>
              </div>
              <div className="flex justify-between text-caption">
                <span>TVQ ({tvqPercent.toFixed(2)}%)</span>
                <span>{tvq.toFixed(2)} $</span>
              </div>

              <hr className="border-neutral-border" />

              <div className="flex justify-between items-baseline">
                <span className="text-h3 text-neutral-text">Total</span>
                <span className="text-h2 text-primary-blue">
                  {total.toFixed(2)} $
                </span>
              </div>

              <div className="pt-2 grid grid-cols-2 gap-2">
                <div>
                  <label className={labelClass}>TPS %</label>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    className={inputClass + " py-1.5 text-caption"}
                    value={tpsPercent}
                    onChange={(e) =>
                      setTpsPercent(parseFloat(e.target.value) || 0)
                    }
                  />
                </div>
                <div>
                  <label className={labelClass}>TVQ %</label>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    className={inputClass + " py-1.5 text-caption"}
                    value={tvqPercent}
                    onChange={(e) =>
                      setTvqPercent(parseFloat(e.target.value) || 0)
                    }
                  />
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title="Raccourcis"
            description="Outils utiles"
          >
            <ul className="space-y-2 text-caption text-neutral-text-secondary">
              <li className="flex items-center gap-2">
                <Calculator size={14} /> Calcul des m² et sous-totaux par ligne
              </li>
              <li className="flex items-center gap-2">
                <Ruler size={14} /> Surface totale = somme des L × H × quantité
              </li>
              <li className="flex items-center gap-2">
                <Package size={14} /> Unités: L, gal, pce, m, un
              </li>
              <li className="flex items-center gap-2">
                <Users size={14} /> Main d&apos;œuvre en heures × taux
              </li>
              <li className="flex items-center gap-2">
                <FileText size={14} /> Notes pour conditions et exclusions
              </li>
            </ul>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
