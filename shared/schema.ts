import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ─── Players Table ────────────────────────────────────────────────────────────
export const players = sqliteTable("players", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  team: text("team").notNull(),
  position: text("position").notNull(), // QB, RB, WR, TE, K, DST

  // ── Offensive Production (8 markers) ────────────────────────────────────────
  pointsPerGame: real("points_per_game").notNull().default(0),       // 1. Avg FF pts/game last season
  touchdownRate: real("touchdown_rate").notNull().default(0),        // 2. TDs per game (0-3 scale)
  yardsPerGame: real("yards_per_game").notNull().default(0),         // 3. Total yards/game
  redZoneTargets: real("red_zone_targets").notNull().default(0),     // 4. Red zone looks per game
  snapShare: real("snap_share").notNull().default(0),                // 5. % of offensive snaps (0-100)
  targetShare: real("target_share").notNull().default(0),            // 6. % of team targets (WR/TE/RB)
  airYards: real("air_yards").notNull().default(0),                  // 7. Avg air yards per target
  yacPerReception: real("yac_per_reception").notNull().default(0),   // 8. Yards after catch per rec.

  // ── Consistency & Volume (5 markers) ────────────────────────────────────────
  consistencyScore: real("consistency_score").notNull().default(0),  // 9.  % of games >= 10 FF pts (0-100)
  boomRate: real("boom_rate").notNull().default(0),                  // 10. % of games >= 20 FF pts (0-100)
  bustRate: real("bust_rate").notNull().default(0),                  // 11. % of games < 5 FF pts (0-100)
  gamesPlayed: integer("games_played").notNull().default(0),         // 12. Games played last season (0-17)
  usageRank: integer("usage_rank").notNull().default(99),            // 13. Positional usage rank (1=best)

  // ── Opportunity & Situation (6 markers) ─────────────────────────────────────
  adp: real("adp").notNull().default(200),                               // 14. Average Draft Position
  depthChartRank: integer("depth_chart_rank").notNull().default(3),      // 15. Depth chart position (1=starter)
  teamPassingRank: integer("team_passing_rank").notNull().default(16),   // 16. Team pass-offense rank (1=best)
  teamRushingRank: integer("team_rushing_rank").notNull().default(16),   // 17. Team rush-offense rank (1=best)
  strengthOfSchedule: real("strength_of_schedule").notNull().default(50),// 18. SOS (0=easy, 100=hard)
  projectedPoints: real("projected_points").notNull().default(0),        // 19. Expert consensus season pts

  // ── Health & Risk (4 markers) ────────────────────────────────────────────────
  injuryRisk: integer("injury_risk").notNull().default(3),           // 20. 1=low risk, 5=high risk
  ageValue: real("age_value").notNull().default(5),                  // 21. Age value (10=prime, 1=decline)
  carryoverInjury: integer("carryover_injury").notNull().default(0), // 22. Lingering injury flag (0/1)
  missedGamesLastYear: integer("missed_games_last_year").notNull().default(0), // 23. Games missed prev season

  // ── Platform Scoring (marker 24) ─────────────────────────────────────────────
  // Stores projected season points under each major platform's scoring rules.
  // ESPN: Standard scoring + bonus points for big games
  // Yahoo: PPR (1pt/reception) + standard TD scoring
  // DraftKings: DFS-style with big bonuses for 300+ pass yds, 100+ rush/rec yds
  // Standard: No reception points, pure yardage/TD
  espnProjected: real("espn_projected").notNull().default(0),        // 24a. ESPN-format projected pts
  yahooProjected: real("yahoo_projected").notNull().default(0),      // 24b. Yahoo PPR projected pts
  draftkingsProjected: real("draftkings_projected").notNull().default(0), // 24c. DraftKings projected pts
  standardProjected: real("standard_projected").notNull().default(0),// 24d. Standard (no PPR) projected pts

  // ── Advanced Analytics (1 marker) ────────────────────────────────────────────
  targetedPasser: real("targeted_passer").notNull().default(75),     // 25. QB passer rating when targeting this player

  // Metadata
  notes: text("notes").default(""),
  imageUrl: text("image_url").default(""),
});

export const insertPlayerSchema = createInsertSchema(players).omit({ id: true });
export type InsertPlayer = z.infer<typeof insertPlayerSchema>;
export type Player = typeof players.$inferSelect;

export type ScoringSystem = "espn" | "yahoo" | "draftkings" | "standard";

// Returns projected points for the active scoring system
export function getScoringProjected(p: Player, system: ScoringSystem): number {
  switch (system) {
    case "espn": return p.espnProjected;
    case "yahoo": return p.yahooProjected;
    case "draftkings": return p.draftkingsProjected;
    case "standard": return p.standardProjected;
  }
}

// Computed overall score (0-100), scoring-system-aware for marker 24
export function computeOverallScore(p: Player, system: ScoringSystem = "espn"): number {
  const projForSystem = getScoringProjected(p, system);

  const scores: number[] = [
    clamp(p.pointsPerGame / 3, 0, 10),                // 1  Pts/Game
    clamp(p.touchdownRate * 4, 0, 10),                // 2  TD Rate
    clamp(p.yardsPerGame / 15, 0, 10),                // 3  Yards/Game
    clamp(p.redZoneTargets * 3, 0, 10),               // 4  Red Zone
    clamp(p.snapShare / 10, 0, 10),                   // 5  Snap %
    clamp(p.targetShare / 3, 0, 10),                  // 6  Target Share
    clamp(p.airYards / 3, 0, 10),                     // 7  Air Yards
    clamp(p.yacPerReception / 0.8, 0, 10),            // 8  YAC/Rec
    clamp(p.consistencyScore / 10, 0, 10),            // 9  Consistency
    clamp(p.boomRate / 10, 0, 10),                    // 10 Boom Rate
    clamp((100 - p.bustRate) / 10, 0, 10),            // 11 Bust Rate (inverted)
    clamp(p.gamesPlayed / 1.7, 0, 10),                // 12 Games Played
    clamp((20 - p.usageRank) / 2, 0, 10),             // 13 Usage Rank (inverted)
    clamp((300 - p.adp) / 30, 0, 10),                 // 14 ADP (inverted)
    clamp((4 - p.depthChartRank) * 3.3, 0, 10),       // 15 Depth Rank (inverted)
    clamp((32 - p.teamPassingRank) / 3.2, 0, 10),     // 16 Pass Offense (inverted)
    clamp((32 - p.teamRushingRank) / 3.2, 0, 10),     // 17 Rush Offense (inverted)
    clamp((100 - p.strengthOfSchedule) / 10, 0, 10),  // 18 SOS (inverted)
    clamp(p.projectedPoints / 40, 0, 10),             // 19 Consensus Projected Pts
    clamp((6 - p.injuryRisk) * 2, 0, 10),             // 20 Injury Risk (inverted)
    clamp(p.ageValue, 0, 10),                         // 21 Age Value
    clamp((1 - p.carryoverInjury) * 10, 0, 10),       // 22 Carryover Injury (inverted)
    clamp((17 - p.missedGamesLastYear) / 1.7, 0, 10), // 23 Games Missed (inverted)
    clamp(projForSystem / 40, 0, 10),                 // 24 Platform Scoring (system-aware)
    clamp(p.targetedPasser / 15, 0, 10),              // 25 QB Rating when targeted
  ];

  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  return Math.round(avg * 10);
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

export const SCORING_SYSTEMS: { id: ScoringSystem; label: string; description: string; color: string }[] = [
  { id: "espn",        label: "ESPN",        description: "Standard scoring + big-game bonuses (300+ pass yds, 100+ rush/rec yds)", color: "#CC0000" },
  { id: "yahoo",       label: "Yahoo",       description: "Full PPR (1 pt per reception) with standard TD values",                   color: "#6001D2" },
  { id: "draftkings",  label: "DraftKings",  description: "DFS-style: premium bonuses for 300+ pass, 100+ rush/rec yard games",     color: "#53D337" },
  { id: "standard",    label: "Standard",    description: "No reception points — pure yardage and touchdown scoring",               color: "#F5A623" },
];

export const MARKERS: { key: keyof Player | "platformScoring"; label: string; description: string; category: string; systemAware?: boolean }[] = [
  // Production
  { key: "pointsPerGame",      label: "Pts/Game",       description: "Average fantasy points per game last season",                        category: "Production" },
  { key: "touchdownRate",      label: "TD Rate",         description: "Touchdowns scored per game",                                        category: "Production" },
  { key: "yardsPerGame",       label: "Yards/Game",      description: "Total yards (rush + receiving) per game",                           category: "Production" },
  { key: "redZoneTargets",     label: "Red Zone",        description: "Red zone targets or carries per game",                              category: "Production" },
  { key: "snapShare",          label: "Snap %",          description: "Percentage of offensive snaps on the field",                        category: "Production" },
  { key: "targetShare",        label: "Target Share",    description: "% of team targets (pass catchers)",                                 category: "Production" },
  { key: "airYards",           label: "Air Yards",       description: "Average air yards per target",                                      category: "Production" },
  { key: "yacPerReception",    label: "YAC/Rec",         description: "Yards after catch per reception",                                   category: "Production" },
  // Consistency
  { key: "consistencyScore",   label: "Consistency",     description: "% of games scoring 10+ fantasy points",                            category: "Consistency" },
  { key: "boomRate",           label: "Boom Rate",       description: "% of games scoring 20+ fantasy points",                            category: "Consistency" },
  { key: "bustRate",           label: "Bust Rate",       description: "% of games scoring under 5 pts (lower = better)",                  category: "Consistency" },
  { key: "gamesPlayed",        label: "Games Played",    description: "Games played last season (max 17)",                                 category: "Consistency" },
  { key: "usageRank",          label: "Usage Rank",      description: "Positional usage ranking (1 = most used)",                         category: "Consistency" },
  // Opportunity
  { key: "adp",                label: "ADP",             description: "Average Draft Position across major platforms",                    category: "Opportunity" },
  { key: "depthChartRank",     label: "Depth Rank",      description: "Position on team depth chart (1 = clear starter)",                 category: "Opportunity" },
  { key: "teamPassingRank",    label: "Pass Offense",    description: "Team passing offense ranking (1 = best)",                          category: "Opportunity" },
  { key: "teamRushingRank",    label: "Rush Offense",    description: "Team rushing offense ranking (1 = best)",                          category: "Opportunity" },
  { key: "strengthOfSchedule", label: "SOS",             description: "Strength of schedule (lower = easier matchups)",                   category: "Opportunity" },
  { key: "projectedPoints",    label: "Consensus Proj.", description: "Expert consensus total season fantasy points projection",           category: "Opportunity" },
  // Health & Risk
  { key: "injuryRisk",         label: "Injury Risk",     description: "Injury risk level: 1 = very low, 5 = very high",                  category: "Health & Risk" },
  { key: "ageValue",           label: "Age Value",       description: "Age-based value score: 10 = prime, 1 = steep decline",            category: "Health & Risk" },
  { key: "carryoverInjury",    label: "Carry-Over Inj.", description: "Lingering injury concern entering the season (0=no, 1=yes)",       category: "Health & Risk" },
  { key: "missedGamesLastYear",label: "Games Missed",    description: "Games missed due to injury last season",                           category: "Health & Risk" },
  // Platform Scoring — the system-aware marker
  { key: "platformScoring",    label: "Platform Score",  description: "Projected season points under the selected scoring system (ESPN, Yahoo, DraftKings, Standard). Changes when you switch platforms above.", category: "Platform Scoring", systemAware: true },
  // Advanced
  { key: "targetedPasser",     label: "QB Rating",       description: "QB passer rating when targeting this player",                      category: "Advanced" },
];
