"use client";

import { useState, useEffect, useCallback } from "react";
import type { Projet, Tache, PhotoProjet, MaterielUsage, AvancementJour } from "@/types/projet";
import type { MaterielItem } from "@/types/inventaire";
import type { Employe } from "@/types/employe";

const KEY_PROJETS = "peinture-projets";
const KEY_INVENTAIRE = "peinture-inventaire";
const KEY_EMPLOYES = "peinture-employes";
const KEY_AVANCEMENTS = "peinture-avancements";

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

export function useProjets() {
  const [projets, setProjets] = useState<Projet[]>([]);
  useEffect(() => {
    setProjets(load(KEY_PROJETS, []));
  }, []);

  const persist = useCallback((next: Projet[]) => {
    setProjets(next);
    save(KEY_PROJETS, next);
  }, []);

  const add = useCallback((p: Omit<Projet, "id">) => {
    const id = `proj-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const nouveau: Projet = { ...p, id, taches: [], photos: [], materielUtilise: [], avancements: [] };
    setProjets((prev) => {
      const next = [nouveau, ...prev];
      save(KEY_PROJETS, next);
      return next;
    });
    return id;
  }, []);

  const update = useCallback((id: string, payload: Partial<Projet>) => {
    setProjets((prev) => {
      const next = prev.map((p) => (p.id === id ? { ...p, ...payload } : p));
      save(KEY_PROJETS, next);
      return next;
    });
  }, []);

  const remove = useCallback((id: string) => {
    setProjets((prev) => {
      const next = prev.filter((p) => p.id !== id);
      save(KEY_PROJETS, next);
      return next;
    });
  }, []);

  const getById = useCallback((id: string) => projets.find((p) => p.id === id), [projets]);

  const addTache = useCallback((projetId: string, t: Omit<Tache, "id" | "creeLe">) => {
    const tache: Tache = { ...t, id: `tache-${Date.now()}`, creeLe: new Date().toISOString() };
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

  const removeTache = useCallback((projetId: string, tacheId: string) => {
    setProjets((prev) => {
      const next = prev.map((p) => (p.id === projetId && p.taches ? { ...p, taches: p.taches.filter((t) => t.id !== tacheId) } : p));
      save(KEY_PROJETS, next);
      return next;
    });
  }, []);

  const addPhoto = useCallback((projetId: string, ph: Omit<PhotoProjet, "id">) => {
    const photo: PhotoProjet = { ...ph, id: `photo-${Date.now()}` };
    setProjets((prev) => {
      const next = prev.map((p) => (p.id === projetId ? { ...p, photos: [...(p.photos ?? []), photo] } : p));
      save(KEY_PROJETS, next);
      return next;
    });
  }, []);

  const removePhoto = useCallback((projetId: string, photoId: string) => {
    setProjets((prev) => {
      const next = prev.map((p) => (p.id === projetId && p.photos ? { ...p, photos: p.photos.filter((ph) => ph.id !== photoId) } : p));
      save(KEY_PROJETS, next);
      return next;
    });
  }, []);

  const addMaterielUsage = useCallback((projetId: string, u: Omit<MaterielUsage, "id">) => {
    const usage: MaterielUsage = { ...u, id: `usage-${Date.now()}` };
    setProjets((prev) => {
      const next = prev.map((p) => (p.id === projetId ? { ...p, materielUtilise: [...(p.materielUtilise ?? []), usage] } : p));
      save(KEY_PROJETS, next);
      return next;
    });
  }, []);

  return {
    projets,
    add,
    update,
    remove,
    getById,
    addTache,
    updateTache,
    removeTache,
    addPhoto,
    removePhoto,
    addMaterielUsage,
  };
}

export function useInventaire() {
  const [items, setItems] = useState<MaterielItem[]>([]);
  useEffect(() => {
    setItems(load(KEY_INVENTAIRE, []));
  }, []);

  const persist = useCallback((next: MaterielItem[]) => {
    setItems(next);
    save(KEY_INVENTAIRE, next);
  }, []);

  const add = useCallback((m: Omit<MaterielItem, "id">) => {
    const id = `mat-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    setItems((prev) => {
      const next = [...prev, { ...m, id }];
      save(KEY_INVENTAIRE, next);
      return next;
    });
    return id;
  }, []);

  const update = useCallback((id: string, payload: Partial<MaterielItem>) => {
    setItems((prev) => {
      const next = prev.map((i) => (i.id === id ? { ...i, ...payload } : i));
      save(KEY_INVENTAIRE, next);
      return next;
    });
  }, []);

  const remove = useCallback((id: string) => {
    setItems((prev) => {
      const next = prev.filter((i) => i.id !== id);
      save(KEY_INVENTAIRE, next);
      return next;
    });
  }, []);

  const getById = useCallback((id: string) => items.find((i) => i.id === id), [items]);

  return { items, add, update, remove, getById };
}

export function useEmployes() {
  const [employes, setEmployes] = useState<Employe[]>([]);
  useEffect(() => {
    setEmployes(load(KEY_EMPLOYES, []));
  }, []);

  const persist = useCallback((next: Employe[]) => {
    setEmployes(next);
    save(KEY_EMPLOYES, next);
  }, []);

  const add = useCallback((e: Omit<Employe, "id">) => {
    const id = `emp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    setEmployes((prev) => {
      const next = [...prev, { ...e, id }];
      save(KEY_EMPLOYES, next);
      return next;
    });
    return id;
  }, []);

  const update = useCallback((id: string, payload: Partial<Employe>) => {
    setEmployes((prev) => {
      const next = prev.map((e) => (e.id === id ? { ...e, ...payload } : e));
      save(KEY_EMPLOYES, next);
      return next;
    });
  }, []);

  const getById = useCallback((id: string) => employes.find((e) => e.id === id), [employes]);

  return { employes, add, update, persist, getById };
}

export function useAvancements() {
  const [avancements, setAvancements] = useState<AvancementJour[]>([]);
  useEffect(() => {
    setAvancements(load(KEY_AVANCEMENTS, []));
  }, []);

  const persist = useCallback((next: AvancementJour[]) => {
    setAvancements(next);
    save(KEY_AVANCEMENTS, next);
  }, []);

  const add = useCallback((a: Omit<AvancementJour, "id">) => {
    const id = `av-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const nouveau: AvancementJour = { ...a, id };
    setAvancements((prev) => {
      const next = [nouveau, ...prev];
      save(KEY_AVANCEMENTS, next);
      return next;
    });
    return id;
  }, []);

  const byProjet = useCallback((projetId: string) => avancements.filter((a) => a.projetId === projetId).sort((a, b) => b.date.localeCompare(a.date)), [avancements]);
  const derniers = useCallback((n: number) => avancements.slice(0, n), [avancements]);

  return { avancements, add, byProjet, derniers };
}
