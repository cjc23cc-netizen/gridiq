import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { players, type Player, type InsertPlayer } from "@shared/schema";
import { eq } from "drizzle-orm";
import path from "path";

const sqlite = new Database(path.join(process.cwd(), "data.db"));
export const db = drizzle(sqlite);

// Auto-migrate: create table if not exists
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS players (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    team TEXT NOT NULL,
    position TEXT NOT NULL,
    points_per_game REAL NOT NULL DEFAULT 0,
    touchdown_rate REAL NOT NULL DEFAULT 0,
    yards_per_game REAL NOT NULL DEFAULT 0,
    red_zone_targets REAL NOT NULL DEFAULT 0,
    snap_share REAL NOT NULL DEFAULT 0,
    target_share REAL NOT NULL DEFAULT 0,
    air_yards REAL NOT NULL DEFAULT 0,
    yac_per_reception REAL NOT NULL DEFAULT 0,
    consistency_score REAL NOT NULL DEFAULT 0,
    boom_rate REAL NOT NULL DEFAULT 0,
    bust_rate REAL NOT NULL DEFAULT 0,
    games_played INTEGER NOT NULL DEFAULT 0,
    usage_rank INTEGER NOT NULL DEFAULT 99,
    adp REAL NOT NULL DEFAULT 200,
    depth_chart_rank INTEGER NOT NULL DEFAULT 3,
    team_passing_rank INTEGER NOT NULL DEFAULT 16,
    team_rushing_rank INTEGER NOT NULL DEFAULT 16,
    strength_of_schedule REAL NOT NULL DEFAULT 50,
    projected_points REAL NOT NULL DEFAULT 0,
    injury_risk INTEGER NOT NULL DEFAULT 3,
    age_value REAL NOT NULL DEFAULT 5,
    carryover_injury INTEGER NOT NULL DEFAULT 0,
    missed_games_last_year INTEGER NOT NULL DEFAULT 0,
    espn_projected REAL NOT NULL DEFAULT 0,
    yahoo_projected REAL NOT NULL DEFAULT 0,
    draftkings_projected REAL NOT NULL DEFAULT 0,
    standard_projected REAL NOT NULL DEFAULT 0,
    targeted_passer REAL NOT NULL DEFAULT 75,
    notes TEXT DEFAULT '',
    image_url TEXT DEFAULT ''
  )
`);

export interface IStorage {
  getAllPlayers(): Player[];
  searchPlayers(query: string, position?: string): Player[];
  getPlayer(id: number): Player | undefined;
  createPlayer(data: InsertPlayer): Player;
  updatePlayer(id: number, data: Partial<InsertPlayer>): Player | undefined;
  deletePlayer(id: number): boolean;
}

export const storage: IStorage = {
  getAllPlayers() {
    return db.select().from(players).all();
  },

  searchPlayers(query: string, position?: string) {
    const results = db.select().from(players).all();
    return results.filter((p) => {
      const matchesName =
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.team.toLowerCase().includes(query.toLowerCase());
      const matchesPosition = position ? p.position === position : true;
      return matchesName && matchesPosition;
    });
  },

  getPlayer(id: number) {
    return db.select().from(players).where(eq(players.id, id)).get();
  },

  createPlayer(data: InsertPlayer) {
    return db.insert(players).values(data).returning().get();
  },

  updatePlayer(id: number, data: Partial<InsertPlayer>) {
    return db
      .update(players)
      .set(data)
      .where(eq(players.id, id))
      .returning()
      .get();
  },

  deletePlayer(id: number) {
    const result = db.delete(players).where(eq(players.id, id)).run();
    return result.changes > 0;
  },
};
