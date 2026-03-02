"use client";

import { useState, useEffect, useCallback } from "react";
import type {
  InventoryItem,
  Location,
  StockByLocation,
  InventoryMovement,
  MovementType,
} from "./types";

const KEY_ITEMS = "inv-v2-items";
const KEY_LOCATIONS = "inv-v2-locations";
const KEY_STOCK = "inv-v2-stock";
const KEY_MOVEMENTS = "inv-v2-movements";
const KEY_EMPLOYE_NOM = "inv-v2-employe-nom";

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

function getStockAtLocation(stock: StockByLocation[], itemId: string, locationId: string): number {
  const row = stock.find((s) => s.itemId === itemId && s.locationId === locationId);
  return row?.quantite ?? 0;
}

function setStockAtLocation(
  stock: StockByLocation[],
  itemId: string,
  locationId: string,
  quantite: number,
  now: string
): StockByLocation[] {
  const rest = stock.filter((s) => !(s.itemId === itemId && s.locationId === locationId));
  if (quantite <= 0) return rest;
  const existing = stock.find((s) => s.itemId === itemId && s.locationId === locationId);
  return [
    ...rest,
    {
      id: existing?.id ?? id("st"),
      itemId,
      locationId,
      quantite,
      derniereMaj: now,
    },
  ];
}

export function applyMovementToStock(
  stock: StockByLocation[],
  mov: InventoryMovement,
  now: string
): StockByLocation[] {
  switch (mov.type) {
    case "Entrée":
      if (mov.locationDestinationId) {
        const cur = getStockAtLocation(stock, mov.itemId, mov.locationDestinationId);
        return setStockAtLocation(stock, mov.itemId, mov.locationDestinationId, cur + mov.quantite, now);
      }
      return stock;
    case "Sortie":
      if (mov.locationSourceId) {
        const cur = getStockAtLocation(stock, mov.itemId, mov.locationSourceId);
        return setStockAtLocation(stock, mov.itemId, mov.locationSourceId, Math.max(0, cur - mov.quantite), now);
      }
      return stock;
    case "Transfert":
      if (mov.locationSourceId && mov.locationDestinationId) {
        let s = stock;
        const curSrc = getStockAtLocation(s, mov.itemId, mov.locationSourceId);
        s = setStockAtLocation(s, mov.itemId, mov.locationSourceId, Math.max(0, curSrc - mov.quantite), now);
        const curDst = getStockAtLocation(s, mov.itemId, mov.locationDestinationId);
        s = setStockAtLocation(s, mov.itemId, mov.locationDestinationId, curDst + mov.quantite, now);
        return s;
      }
      return stock;
    case "Ajustement":
      if (mov.locationSourceId) {
        return setStockAtLocation(stock, mov.itemId, mov.locationSourceId, mov.quantite, now);
      }
      return stock;
    default:
      return stock;
  }
}

export function useInventoryItems() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  useEffect(() => setItems(load(KEY_ITEMS, [])), []);

  const persist = useCallback((next: InventoryItem[]) => {
    setItems(next);
    save(KEY_ITEMS, next);
  }, []);

  const add = useCallback((item: Omit<InventoryItem, "id" | "creeLe">) => {
    const now = new Date().toISOString();
    const newItem: InventoryItem = { ...item, id: id("it"), creeLe: now };
    setItems((prev) => {
      const next = [...prev, newItem];
      save(KEY_ITEMS, next);
      return next;
    });
    return newItem.id;
  }, []);

  const update = useCallback((itemId: string, payload: Partial<InventoryItem>) => {
    setItems((prev) => {
      const next = prev.map((i) => (i.id === itemId ? { ...i, ...payload } : i));
      save(KEY_ITEMS, next);
      return next;
    });
  }, []);

  const getById = useCallback((itemId: string) => items.find((i) => i.id === itemId), [items]);

  return { items, add, update, getById, persist };
}

export function useInventoryLocations() {
  const [locations, setLocations] = useState<Location[]>([]);
  useEffect(() => setLocations(load(KEY_LOCATIONS, [])), []);

  const add = useCallback((loc: Omit<Location, "id">) => {
    const newLoc: Location = { ...loc, id: id("loc") };
    setLocations((prev) => {
      const next = [...prev, newLoc];
      save(KEY_LOCATIONS, next);
      return next;
    });
    return newLoc.id;
  }, []);

  const update = useCallback((locationId: string, payload: Partial<Location>) => {
    setLocations((prev) => {
      const next = prev.map((l) => (l.id === locationId ? { ...l, ...payload } : l));
      save(KEY_LOCATIONS, next);
      return next;
    });
  }, []);

  const getById = useCallback((locationId: string) => locations.find((l) => l.id === locationId), [locations]);
  const actives = useCallback(() => locations.filter((l) => l.actif), [locations]);

  return { locations, add, update, getById, actives };
}

export function useInventoryStock() {
  const [stock, setStock] = useState<StockByLocation[]>([]);
  useEffect(() => setStock(load(KEY_STOCK, [])), []);

  const persist = useCallback((next: StockByLocation[]) => {
    setStock(next);
    save(KEY_STOCK, next);
  }, []);

  const getByItem = useCallback((itemId: string) => stock.filter((s) => s.itemId === itemId), [stock]);
  const getByLocation = useCallback((locationId: string) => stock.filter((s) => s.locationId === locationId), [stock]);
  const getQty = useCallback((itemId: string, locationId: string) => getStockAtLocation(stock, itemId, locationId), [stock]);
  const getTotalByItem = useCallback((itemId: string) => stock.filter((s) => s.itemId === itemId).reduce((sum, s) => sum + s.quantite, 0), [stock]);

  return { stock, persist, getByItem, getByLocation, getQty, getTotalByItem };
}

export function useInventoryMovements() {
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  useEffect(() => setMovements(load(KEY_MOVEMENTS, [])), []);

  const add = useCallback((mov: Omit<InventoryMovement, "id">) => {
    const newMov: InventoryMovement = { ...mov, id: id("mov") };
    setMovements((prev) => {
      const next = [newMov, ...prev];
      save(KEY_MOVEMENTS, next);
      return next;
    });
    return newMov.id;
  }, []);

  const getByItem = useCallback((itemId: string, limit?: number) => {
    const list = movements.filter((m) => m.itemId === itemId);
    return limit ? list.slice(0, limit) : list;
  }, [movements]);

  return { movements, add, getByItem };
}

export function useInventoryStore() {
  const itemsApi = useInventoryItems();
  const locationsApi = useInventoryLocations();
  const stockApi = useInventoryStock();
  const movementsApi = useInventoryMovements();

  const recordMovement = useCallback(
    (mov: Omit<InventoryMovement, "id">) => {
      const now = new Date().toISOString();
      const item = itemsApi.getById(mov.itemId);
      if (!item) return { success: false as const, error: "Article introuvable" };

      if (mov.type === "Entrée" && !mov.locationDestinationId) return { success: false as const, error: "Emplacement de destination requis" };
      if (mov.type === "Sortie") {
        if (!mov.locationSourceId) return { success: false as const, error: "Emplacement source requis" };
        const available = stockApi.getQty(mov.itemId, mov.locationSourceId);
        if (available < mov.quantite) return { success: false as const, error: `Stock insuffisant (disponible: ${available})` };
      }
      if (mov.type === "Transfert") {
        if (!mov.locationSourceId || !mov.locationDestinationId) return { success: false as const, error: "Source et destination requises" };
        if (mov.locationSourceId === mov.locationDestinationId) return { success: false as const, error: "Source et destination doivent être différentes" };
        const available = stockApi.getQty(mov.itemId, mov.locationSourceId);
        if (available < mov.quantite) return { success: false as const, error: `Stock insuffisant (disponible: ${available})` };
      }
      if (mov.type === "Ajustement") {
        if (!mov.locationSourceId) return { success: false as const, error: "Emplacement requis" };
        if (!mov.note?.trim()) return { success: false as const, error: "La note est obligatoire pour un ajustement" };
      }

      movementsApi.add(mov);
      const nextStock = applyMovementToStock(stockApi.stock, { ...mov, id: "" }, now);
      stockApi.persist(nextStock);
      return { success: true as const };
    },
    [itemsApi, locationsApi, stockApi, movementsApi]
  );

  const stockTotalByItem = useCallback((itemId: string) => stockApi.getTotalByItem(itemId), [stockApi]);

  const lowStockItems = useCallback(() => {
    return itemsApi.items.filter((item) => {
      if (!item.actif) return false;
      const total = stockApi.getTotalByItem(item.id);
      if (item.stockMin == null) return total === 0;
      return total < item.stockMin;
    });
  }, [itemsApi.items, stockApi]);

  const zeroStockItems = useCallback(() => {
    return itemsApi.items.filter((item) => item.actif && stockApi.getTotalByItem(item.id) === 0);
  }, [itemsApi.items, stockApi]);

  return {
    ...itemsApi,
    locations: locationsApi.locations,
    locationsActives: locationsApi.actives,
    getLocation: locationsApi.getById,
    addLocation: locationsApi.add,
    updateLocation: locationsApi.update,
    stock: stockApi.stock,
    getStockByItem: stockApi.getByItem,
    getStockByLocation: stockApi.getByLocation,
    getStockQty: stockApi.getQty,
    stockTotalByItem,
    movements: movementsApi.movements,
    addMovement: movementsApi.add,
    getMovementsByItem: movementsApi.getByItem,
    recordMovement,
    lowStockItems,
    zeroStockItems,
  };
}

export function useEmployeNom() {
  const [nom, setNomState] = useState("");
  useEffect(() => setNomState(load(KEY_EMPLOYE_NOM, "")), []);

  const setNom = useCallback((v: string) => {
    setNomState(v);
    save(KEY_EMPLOYE_NOM, v);
  }, []);

  return [nom, setNom] as const;
}
