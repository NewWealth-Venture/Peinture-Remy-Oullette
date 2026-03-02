"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import type { Brief, BriefStatus, ZoneInstruction, ChecklistItem, MediaPiece, BriefMessage } from "./types";

const KEY_BRIEFS = "peinture-briefs";
const KEY_SELECTED = "briefs-selected-id";

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

export function useBriefsStore() {
  const [briefs, setBriefs] = useState<Brief[]>([]);
  const [selectedId, setSelectedIdState] = useState<string | null>(null);

  useEffect(() => {
    setBriefs(load(KEY_BRIEFS, []));
    setSelectedIdState(load(KEY_SELECTED, null));
  }, []);

  const setSelectedBriefId = useCallback((id: string | null) => {
    setSelectedIdState(id);
    save(KEY_SELECTED, id);
  }, []);

  const now = () => new Date().toISOString();

  const create = useCallback((b: Omit<Brief, "id" | "creeLe" | "majLe">) => {
    const newBrief: Brief = {
      ...b,
      id: id("brief"),
      creeLe: now(),
      majLe: now(),
      zones: b.zones ?? [],
      checklist: b.checklist ?? [],
      pieces: b.pieces ?? [],
      messages: b.messages ?? [],
    };
    setBriefs((prev) => {
      const next = [newBrief, ...prev];
      save(KEY_BRIEFS, next);
      return next;
    });
    setSelectedBriefId(newBrief.id);
    return newBrief.id;
  }, [setSelectedBriefId]);

  const update = useCallback((briefId: string, payload: Partial<Brief>) => {
    setBriefs((prev) => {
      const next = prev.map((b) => (b.id === briefId ? { ...b, ...payload, majLe: now() } : b));
      save(KEY_BRIEFS, next);
      return next;
    });
  }, []);

  const remove = useCallback((briefId: string) => {
    setBriefs((prev) => {
      const next = prev.filter((b) => b.id !== briefId);
      save(KEY_BRIEFS, next);
      return next;
    });
    if (selectedId === briefId) setSelectedIdState(null);
  }, [selectedId]);

  const getById = useCallback((briefId: string) => briefs.find((b) => b.id === briefId), [briefs]);
  const selectedBrief = selectedId ? getById(selectedId) ?? null : null;

  const setStatut = useCallback((briefId: string, statut: BriefStatus) => update(briefId, { statut }), [update]);

  const addZone = useCallback((briefId: string, zone: Omit<ZoneInstruction, "id">) => {
    const z: ZoneInstruction = { ...zone, id: id("zone"), pieces: zone.pieces ?? [] };
    setBriefs((prev) => {
      const next = prev.map((b) => (b.id === briefId ? { ...b, zones: [...(b.zones ?? []), z], majLe: now() } : b));
      save(KEY_BRIEFS, next);
      return next;
    });
  }, []);

  const updateZone = useCallback((briefId: string, zoneId: string, payload: Partial<ZoneInstruction>) => {
    setBriefs((prev) => {
      const next = prev.map((b) => {
        if (b.id !== briefId || !b.zones) return b;
        return { ...b, zones: b.zones.map((z) => (z.id === zoneId ? { ...z, ...payload } : z)), majLe: now() };
      });
      save(KEY_BRIEFS, next);
      return next;
    });
  }, []);

  const removeZone = useCallback((briefId: string, zoneId: string) => {
    setBriefs((prev) => {
      const next = prev.map((b) => (b.id === briefId && b.zones ? { ...b, zones: b.zones.filter((z) => z.id !== zoneId), majLe: now() } : b));
      save(KEY_BRIEFS, next);
      return next;
    });
  }, []);

  const addChecklistItem = useCallback((briefId: string, item: Omit<ChecklistItem, "id">) => {
    const c: ChecklistItem = { ...item, id: id("check") };
    setBriefs((prev) => {
      const next = prev.map((b) => (b.id === briefId ? { ...b, checklist: [...(b.checklist ?? []), c], majLe: now() } : b));
      save(KEY_BRIEFS, next);
      return next;
    });
  }, []);

  const toggleChecklistItem = useCallback((briefId: string, itemId: string) => {
    setBriefs((prev) => {
      const next = prev.map((b) => {
        if (b.id !== briefId || !b.checklist) return b;
        return {
          ...b,
          checklist: b.checklist.map((c) => (c.id === itemId ? { ...c, fait: !c.fait, faitLe: !c.fait ? now() : undefined } : c)),
          majLe: now(),
        };
      });
      save(KEY_BRIEFS, next);
      return next;
    });
  }, []);

  const removeChecklistItem = useCallback((briefId: string, itemId: string) => {
    setBriefs((prev) => {
      const next = prev.map((b) => (b.id === briefId && b.checklist ? { ...b, checklist: b.checklist.filter((c) => c.id !== itemId), majLe: now() } : b));
      save(KEY_BRIEFS, next);
      return next;
    });
  }, []);

  const addPiece = useCallback((briefId: string, piece: Omit<MediaPiece, "id" | "creeLe">) => {
    const p: MediaPiece = { ...piece, id: id("media"), creeLe: now() };
    setBriefs((prev) => {
      const next = prev.map((b) => (b.id === briefId ? { ...b, pieces: [...(b.pieces ?? []), p], majLe: now() } : b));
      save(KEY_BRIEFS, next);
      return next;
    });
  }, []);

  const removePiece = useCallback((briefId: string, pieceId: string) => {
    setBriefs((prev) => {
      const next = prev.map((b) => (b.id === briefId && b.pieces ? { ...b, pieces: b.pieces.filter((p) => p.id !== pieceId), majLe: now() } : b));
      save(KEY_BRIEFS, next);
      return next;
    });
  }, []);

  const addPieceToZone = useCallback((briefId: string, zoneId: string, piece: Omit<MediaPiece, "id" | "creeLe">) => {
    const p: MediaPiece = { ...piece, id: id("media"), creeLe: now() };
    setBriefs((prev) => {
      const next = prev.map((b) => {
        if (b.id !== briefId || !b.zones) return b;
        return {
          ...b,
          zones: b.zones.map((z) => (z.id === zoneId ? { ...z, pieces: [...(z.pieces ?? []), p] } : z)),
          majLe: now(),
        };
      });
      save(KEY_BRIEFS, next);
      return next;
    });
  }, []);

  const addMessage = useCallback((briefId: string, msg: Omit<BriefMessage, "id" | "creeLe">) => {
    const m: BriefMessage = { ...msg, id: id("msg"), creeLe: now() };
    setBriefs((prev) => {
      const next = prev.map((b) => (b.id === briefId ? { ...b, messages: [...(b.messages ?? []), m], majLe: now() } : b));
      save(KEY_BRIEFS, next);
      return next;
    });
  }, []);

  return {
    briefs,
    selectedId,
    selectedBrief,
    setSelectedBriefId,
    getById,
    create,
    update,
    remove,
    setStatut,
    addZone,
    updateZone,
    removeZone,
    addChecklistItem,
    toggleChecklistItem,
    removeChecklistItem,
    addPiece,
    removePiece,
    addPieceToZone,
    addMessage,
  };
}

export type BriefsFilters = { search?: string; statut?: BriefStatus | ""; chantierId?: string; priorite?: Brief["priorite"] | "" };

export function useFilteredBriefs(briefs: Brief[], filters: BriefsFilters): Brief[] {
  return useMemo(() => {
    let list = [...briefs];
    if (filters.search?.trim()) {
      const q = filters.search.trim().toLowerCase();
      list = list.filter((b) => b.titre.toLowerCase().includes(q) || b.instructions.toLowerCase().includes(q));
    }
    if (filters.statut) list = list.filter((b) => b.statut === filters.statut);
    if (filters.chantierId) list = list.filter((b) => b.chantierId === filters.chantierId);
    if (filters.priorite) list = list.filter((b) => b.priorite === filters.priorite);
    return list;
  }, [briefs, filters.search, filters.statut, filters.chantierId, filters.priorite]);
}
