import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { insertPlayerSchema, computeOverallScore, MARKERS, type ScoringSystem } from "@shared/schema";
import { seedPlayers } from "./seed";

export function registerRoutes(httpServer: Server, app: Express) {
  // Seed on startup if empty
  const existing = storage.getAllPlayers();
  if (existing.length === 0) {
    seedPlayers();
  }

  // GET /api/players — list all or search, optional ?q=name&position=QB&scoring=espn
  app.get("/api/players", (req, res) => {
    const query = (req.query.q as string) || "";
    const position = req.query.position as string | undefined;
    const scoring = ((req.query.scoring as string) || "espn") as ScoringSystem;

    const players = query
      ? storage.searchPlayers(query, position)
      : storage.getAllPlayers().filter((p) => !position || p.position === position);

    const withScores = players.map((p) => ({
      ...p,
      overallScore: computeOverallScore(p, scoring),
    }));
    withScores.sort((a, b) => b.overallScore - a.overallScore);
    res.json(withScores);
  });

  // GET /api/players/:id
  app.get("/api/players/:id", (req, res) => {
    const player = storage.getPlayer(Number(req.params.id));
    if (!player) return res.status(404).json({ message: "Player not found" });
    const scoring = ((req.query.scoring as string) || "espn") as ScoringSystem;
    res.json({ ...player, overallScore: computeOverallScore(player, scoring) });
  });

  // POST /api/players
  app.post("/api/players", (req, res) => {
    const parsed = insertPlayerSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Validation error", errors: parsed.error.errors });
    const player = storage.createPlayer(parsed.data);
    res.status(201).json({ ...player, overallScore: computeOverallScore(player) });
  });

  // PATCH /api/players/:id
  app.patch("/api/players/:id", (req, res) => {
    const player = storage.updatePlayer(Number(req.params.id), req.body);
    if (!player) return res.status(404).json({ message: "Player not found" });
    res.json({ ...player, overallScore: computeOverallScore(player) });
  });

  // DELETE /api/players/:id
  app.delete("/api/players/:id", (req, res) => {
    const ok = storage.deletePlayer(Number(req.params.id));
    if (!ok) return res.status(404).json({ message: "Player not found" });
    res.json({ message: "Deleted" });
  });

  // GET /api/markers
  app.get("/api/markers", (_req, res) => {
    res.json(MARKERS);
  });

  return httpServer;
}
