"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import type { Projet, StatutProjet, PrioriteProjet, Tache } from "@/types/projet";

const KEY_PROJETS = "peinture-projets";
const KEY_SELECTED = "chantiers-selected-id";

function load<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function save(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

function id(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function useProjectsStore() {
  const [projets, setProjets] = useState<Projet[]>([]);
  const [selectedId, setSelectedIdState] = useState<string | null>(null);

  useEffect(() => {
    setProjets(load(KEY_PROJETS, []));
    setSelectedIdState(load(KEY_SELECTED, null));
  }, []);

  const setSelectedProjectId = useCallback((id: string | null) => {
    setSelectedIdState(id);
    save(KEY_SELECTED, id);
  }, []);

  const persist = useCallback((next: Projet[]) => {
    setProjets(next);
    save(KEY_PROJETS, next);
  }, []);

  const createProject = useCallback((p: Omit<Projet, "id" | "taches" | "photos" | "materielUtilise" | "avancements">) => {
    const now = new Date().toISOString();
    const newProjet: Projet = {
      ...p,
      id: id("proj"),
      taches: [],
      photos: [],
      materielUtilise: [],
      avancements: [],
      derniereMaj: now,
    };
    setProjets((prev) => {
      const next = [newProjet, ...prev];
      save(KEY_PROJETS, next);
      return next;
    });
    setSelectedProjectId(newProjet.id);
    return newProjet.id;
  }, [setSelectedProjectId]);

  const updateProject = useCallback((projectId: string, payload: Partial<Projet>) => {
    const now = new Date().toISOString();
    setProjets((prev) => {
      const next = prev.map((p) =>
        p.id === projectId ? { ...p, ...payload, derniereMaj: payload.derniereMaj ?? now } : p
      );
      save(KEY_PROJETS, next);
      return next;
    });
  }, []);

  const deleteProject = useCallback((projectId: string) => {
    setProjets((prev) => {
      const next = prev.filter((p) => p.id !== projectId);
      save(KEY_PROJETS, next);
      return next;
    });
    if (selectedId === projectId) setSelectedProjectId(null);
  }, [selectedId, setSelectedProjectId]);

  const getById = useCallback((projectId: string) => projets.find((p) => p.id === projectId), [projets]);
  const selectedProject = selectedId ? getById(selectedId) ?? null : null;

  const addTache = useCallback((projetId: string, t: Omit<Tache, "id" | "creeLe">) => {
    const tache: Tache = { ...t, id: id("tache"), creeLe: new Date().toISOString() };
    setProjets((prev) => {
      const next = prev.map((p) => (p.id === projetId ? { ...p, taches: [...(p.taches ?? []), tache] } : p));
      save(KEY_PROJETS, next);
      return next;
    });
    return tache.id;
  }, []);

  const updateTache = useCallback((projetId: string, tacheId: string, payload: Partial<Tache>) => {
    setProjets((prev) => {
      const next = prev.map((p) => {
        if (p.id !== projetId || !p.taches) return p;
        return { ...p, taches: p.taches.map((t) => (t.id === tacheId ? { ...t, ...payload } : t)) };
      });
      save(KEY_PROJETS, next);
      return next;
    });
  }, []);

  return {
    projets,
    listProjects: projets,
    createProject,
    updateProject,
    deleteProject,
    selectedId,
    selectedProject,
    setSelectedProjectId,
    getById,
    addTache,
    updateTache,
    persist,
  };
}

export type ProjectsFilters = {
  search?: string;
  statut?: StatutProjet | "";
  priorite?: PrioriteProjet | "";
  responsable?: string;
};

export function useFilteredProjects(projets: Projet[], filters: ProjectsFilters): Projet[] {
  return useMemo(() => {
    let list = [...projets];
    if (filters.search?.trim()) {
      const q = filters.search.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.titre.toLowerCase().includes(q) ||
          p.adresse?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      );
    }
    if (filters.statut) list = list.filter((p) => p.statut === filters.statut);
    if (filters.priorite) list = list.filter((p) => p.priorite === filters.priorite);
    if (filters.responsable) list = list.filter((p) => p.responsable === filters.responsable);
    return list;
  }, [projets, filters.search, filters.statut, filters.priorite, filters.responsable]);
}

export function getProchaineEtape(projet: Projet): string {
  const taches = projet.taches ?? [];
  const next = taches.find((t) => t.statut === "À faire" || t.statut === "En cours");
  return next?.titre ?? "—";
}

export function getAvancementPourcent(projet: Projet): number | null {
  const taches = projet.taches ?? [];
  if (taches.length === 0) return null;
  const done = taches.filter((t) => t.statut === "Terminé").length;
  return Math.round((done / taches.length) * 100);
}
