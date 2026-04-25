import { storage } from "./storage";
import type { InsertPlayer } from "@shared/schema";

// Platform scoring notes:
//   ESPN:        Standard + big-game bonuses (300+ pass yds +3, 100+ rush/rec yds +3)
//   Yahoo:       Full PPR (1pt/rec) + standard TDs
//   DraftKings:  DFS bonuses: 300+ pass = +3, 100+ rush/rec = +3, 300+ rush/rec = +3
//   Standard:    No reception points — yardage & TDs only

const playerData: InsertPlayer[] = [
  // ── QBs ────────────────────────────────────────────────────────────────────
  {
    name: "Lamar Jackson", team: "BAL", position: "QB",
    pointsPerGame: 29.8, touchdownRate: 2.1, yardsPerGame: 312, redZoneTargets: 1.8,
    snapShare: 99, targetShare: 0, airYards: 0, yacPerReception: 0,
    consistencyScore: 88, boomRate: 72, bustRate: 5, gamesPlayed: 16, usageRank: 1,
    adp: 14, depthChartRank: 1, teamPassingRank: 7, teamRushingRank: 2,
    strengthOfSchedule: 45, projectedPoints: 450,
    injuryRisk: 2, ageValue: 8.5, carryoverInjury: 0, missedGamesLastYear: 1,
    // Platform projections — QBs get big-game bonuses on ESPN/DK frequently
    espnProjected: 465, yahooProjected: 472, draftkingsProjected: 488, standardProjected: 430,
    targetedPasser: 95,
    notes: "Elite dual-threat QB, rushing upside is massive in Baltimore"
  },
  {
    name: "Josh Allen", team: "BUF", position: "QB",
    pointsPerGame: 28.4, touchdownRate: 2.0, yardsPerGame: 295, redZoneTargets: 1.6,
    snapShare: 99, targetShare: 0, airYards: 0, yacPerReception: 0,
    consistencyScore: 85, boomRate: 68, bustRate: 6, gamesPlayed: 17, usageRank: 2,
    adp: 18, depthChartRank: 1, teamPassingRank: 5, teamRushingRank: 18,
    strengthOfSchedule: 50, projectedPoints: 430,
    injuryRisk: 2, ageValue: 8.8, carryoverInjury: 0, missedGamesLastYear: 0,
    espnProjected: 445, yahooProjected: 451, draftkingsProjected: 462, standardProjected: 415,
    targetedPasser: 98,
    notes: "Monster arm talent, scrambles for TDs regularly"
  },
  {
    name: "Jalen Hurts", team: "PHI", position: "QB",
    pointsPerGame: 26.1, touchdownRate: 1.9, yardsPerGame: 278, redZoneTargets: 2.0,
    snapShare: 99, targetShare: 0, airYards: 0, yacPerReception: 0,
    consistencyScore: 80, boomRate: 62, bustRate: 8, gamesPlayed: 16, usageRank: 3,
    adp: 28, depthChartRank: 1, teamPassingRank: 8, teamRushingRank: 5,
    strengthOfSchedule: 52, projectedPoints: 400,
    injuryRisk: 3, ageValue: 8.5, carryoverInjury: 0, missedGamesLastYear: 1,
    espnProjected: 415, yahooProjected: 420, draftkingsProjected: 432, standardProjected: 388,
    targetedPasser: 93,
    notes: "Elite red zone rusher, shoulder history worth watching"
  },
  {
    name: "Patrick Mahomes", team: "KC", position: "QB",
    pointsPerGame: 24.9, touchdownRate: 1.8, yardsPerGame: 290, redZoneTargets: 1.2,
    snapShare: 99, targetShare: 0, airYards: 0, yacPerReception: 0,
    consistencyScore: 82, boomRate: 60, bustRate: 8, gamesPlayed: 17, usageRank: 4,
    adp: 35, depthChartRank: 1, teamPassingRank: 6, teamRushingRank: 22,
    strengthOfSchedule: 48, projectedPoints: 395,
    injuryRisk: 2, ageValue: 9.0, carryoverInjury: 0, missedGamesLastYear: 0,
    espnProjected: 408, yahooProjected: 413, draftkingsProjected: 422, standardProjected: 382,
    targetedPasser: 105,
    notes: "GOAT-tier accuracy, limited rushing upside compared to prior seasons"
  },
  {
    name: "Joe Burrow", team: "CIN", position: "QB",
    pointsPerGame: 23.5, touchdownRate: 1.7, yardsPerGame: 272, redZoneTargets: 1.1,
    snapShare: 99, targetShare: 0, airYards: 0, yacPerReception: 0,
    consistencyScore: 75, boomRate: 55, bustRate: 12, gamesPlayed: 10, usageRank: 5,
    adp: 60, depthChartRank: 1, teamPassingRank: 9, teamRushingRank: 20,
    strengthOfSchedule: 55, projectedPoints: 360,
    injuryRisk: 4, ageValue: 8.0, carryoverInjury: 1, missedGamesLastYear: 7,
    espnProjected: 370, yahooProjected: 375, draftkingsProjected: 381, standardProjected: 348,
    targetedPasser: 101,
    notes: "Elite talent but injury history is the key concern"
  },

  // ── RBs ────────────────────────────────────────────────────────────────────
  {
    name: "Christian McCaffrey", team: "SF", position: "RB",
    pointsPerGame: 27.4, touchdownRate: 1.4, yardsPerGame: 142, redZoneTargets: 2.8,
    snapShare: 85, targetShare: 22, airYards: 2.1, yacPerReception: 6.8,
    consistencyScore: 90, boomRate: 75, bustRate: 4, gamesPlayed: 6, usageRank: 1,
    adp: 1, depthChartRank: 1, teamPassingRank: 4, teamRushingRank: 3,
    strengthOfSchedule: 48, projectedPoints: 320,
    injuryRisk: 4, ageValue: 7.5, carryoverInjury: 1, missedGamesLastYear: 11,
    // Yahoo/DK heavily reward his reception volume
    espnProjected: 310, yahooProjected: 368, draftkingsProjected: 355, standardProjected: 272,
    targetedPasser: 100,
    notes: "Best RB alive when healthy — injury risk is real at age 28"
  },
  {
    name: "Saquon Barkley", team: "PHI", position: "RB",
    pointsPerGame: 22.8, touchdownRate: 1.2, yardsPerGame: 128, redZoneTargets: 2.2,
    snapShare: 80, targetShare: 15, airYards: 1.8, yacPerReception: 7.2,
    consistencyScore: 82, boomRate: 65, bustRate: 8, gamesPlayed: 16, usageRank: 2,
    adp: 5, depthChartRank: 1, teamPassingRank: 8, teamRushingRank: 5,
    strengthOfSchedule: 52, projectedPoints: 340,
    injuryRisk: 3, ageValue: 7.5, carryoverInjury: 0, missedGamesLastYear: 1,
    espnProjected: 332, yahooProjected: 374, draftkingsProjected: 362, standardProjected: 295,
    targetedPasser: 93,
    notes: "Phenomenal 2024 in Philly — elite receiving back who thrives in PPR"
  },
  {
    name: "Derrick Henry", team: "BAL", position: "RB",
    pointsPerGame: 19.8, touchdownRate: 1.3, yardsPerGame: 135, redZoneTargets: 3.1,
    snapShare: 72, targetShare: 8, airYards: 1.2, yacPerReception: 4.5,
    consistencyScore: 78, boomRate: 58, bustRate: 10, gamesPlayed: 16, usageRank: 3,
    adp: 15, depthChartRank: 1, teamPassingRank: 7, teamRushingRank: 2,
    strengthOfSchedule: 45, projectedPoints: 295,
    injuryRisk: 2, ageValue: 5.5, carryoverInjury: 0, missedGamesLastYear: 1,
    // Standard/ESPN favor him — minimal PPR value, but big-game rush bonuses help on DK
    espnProjected: 298, yahooProjected: 282, draftkingsProjected: 312, standardProjected: 305,
    targetedPasser: 95,
    notes: "Ageless wonder in Baltimore — dominant red zone rusher, low PPR value"
  },
  {
    name: "Jahmyr Gibbs", team: "DET", position: "RB",
    pointsPerGame: 19.1, touchdownRate: 1.1, yardsPerGame: 118, redZoneTargets: 1.8,
    snapShare: 65, targetShare: 18, airYards: 2.5, yacPerReception: 6.0,
    consistencyScore: 74, boomRate: 58, bustRate: 14, gamesPlayed: 17, usageRank: 4,
    adp: 8, depthChartRank: 1, teamPassingRank: 3, teamRushingRank: 1,
    strengthOfSchedule: 44, projectedPoints: 300,
    injuryRisk: 2, ageValue: 9.5, carryoverInjury: 0, missedGamesLastYear: 0,
    espnProjected: 295, yahooProjected: 334, draftkingsProjected: 318, standardProjected: 261,
    targetedPasser: 99,
    notes: "Shares carries with Montgomery but is electric — especially as receiver"
  },
  {
    name: "Bijan Robinson", team: "ATL", position: "RB",
    pointsPerGame: 17.5, touchdownRate: 0.9, yardsPerGame: 110, redZoneTargets: 1.5,
    snapShare: 78, targetShare: 14, airYards: 2.0, yacPerReception: 5.8,
    consistencyScore: 70, boomRate: 50, bustRate: 15, gamesPlayed: 17, usageRank: 5,
    adp: 11, depthChartRank: 1, teamPassingRank: 20, teamRushingRank: 10,
    strengthOfSchedule: 50, projectedPoints: 270,
    injuryRisk: 2, ageValue: 9.5, carryoverInjury: 0, missedGamesLastYear: 0,
    espnProjected: 265, yahooProjected: 298, draftkingsProjected: 280, standardProjected: 240,
    targetedPasser: 85,
    notes: "Elite talent but scheme hasn't fully unlocked him — scheme change could vault him"
  },

  // ── WRs ────────────────────────────────────────────────────────────────────
  {
    name: "Ja'Marr Chase", team: "CIN", position: "WR",
    pointsPerGame: 23.2, touchdownRate: 1.1, yardsPerGame: 118, redZoneTargets: 2.4,
    snapShare: 90, targetShare: 32, airYards: 12.8, yacPerReception: 4.2,
    consistencyScore: 80, boomRate: 65, bustRate: 10, gamesPlayed: 16, usageRank: 1,
    adp: 2, depthChartRank: 1, teamPassingRank: 9, teamRushingRank: 20,
    strengthOfSchedule: 55, projectedPoints: 320,
    injuryRisk: 2, ageValue: 9.5, carryoverInjury: 0, missedGamesLastYear: 1,
    // WRs with high rec volume spike hard in Yahoo PPR; DK rewards big yardage games
    espnProjected: 318, yahooProjected: 364, draftkingsProjected: 342, standardProjected: 278,
    targetedPasser: 101,
    notes: "Top WR in the NFL when Burrow is healthy — Burrow's return is the unlock"
  },
  {
    name: "Justin Jefferson", team: "MIN", position: "WR",
    pointsPerGame: 21.8, touchdownRate: 0.9, yardsPerGame: 115, redZoneTargets: 1.8,
    snapShare: 92, targetShare: 30, airYards: 13.5, yacPerReception: 3.8,
    consistencyScore: 82, boomRate: 62, bustRate: 8, gamesPlayed: 17, usageRank: 2,
    adp: 4, depthChartRank: 1, teamPassingRank: 12, teamRushingRank: 18,
    strengthOfSchedule: 48, projectedPoints: 310,
    injuryRisk: 2, ageValue: 9.0, carryoverInjury: 0, missedGamesLastYear: 0,
    espnProjected: 308, yahooProjected: 348, draftkingsProjected: 332, standardProjected: 272,
    targetedPasser: 95,
    notes: "Generational route runner — bounced back fully in 2024"
  },
  {
    name: "CeeDee Lamb", team: "DAL", position: "WR",
    pointsPerGame: 21.5, touchdownRate: 0.9, yardsPerGame: 120, redZoneTargets: 2.0,
    snapShare: 94, targetShare: 34, airYards: 11.2, yacPerReception: 4.5,
    consistencyScore: 84, boomRate: 68, bustRate: 7, gamesPlayed: 15, usageRank: 3,
    adp: 3, depthChartRank: 1, teamPassingRank: 15, teamRushingRank: 25,
    strengthOfSchedule: 50, projectedPoints: 305,
    injuryRisk: 2, ageValue: 9.0, carryoverInjury: 0, missedGamesLastYear: 2,
    espnProjected: 302, yahooProjected: 355, draftkingsProjected: 330, standardProjected: 268,
    targetedPasser: 90,
    notes: "Elite volume receiver — Dallas offense is the big question mark"
  },
  {
    name: "Amon-Ra St. Brown", team: "DET", position: "WR",
    pointsPerGame: 20.2, touchdownRate: 0.9, yardsPerGame: 102, redZoneTargets: 1.6,
    snapShare: 88, targetShare: 28, airYards: 8.5, yacPerReception: 5.2,
    consistencyScore: 86, boomRate: 60, bustRate: 5, gamesPlayed: 17, usageRank: 4,
    adp: 12, depthChartRank: 1, teamPassingRank: 3, teamRushingRank: 1,
    strengthOfSchedule: 44, projectedPoints: 295,
    injuryRisk: 1, ageValue: 8.8, carryoverInjury: 0, missedGamesLastYear: 0,
    // Massive PPR beneficiary — Yahoo/DK love his reception volume
    espnProjected: 292, yahooProjected: 345, draftkingsProjected: 318, standardProjected: 248,
    targetedPasser: 99,
    notes: "PPR machine — elite floor in Detroit's explosive offense"
  },
  {
    name: "Tyreek Hill", team: "MIA", position: "WR",
    pointsPerGame: 19.8, touchdownRate: 0.8, yardsPerGame: 112, redZoneTargets: 1.4,
    snapShare: 90, targetShare: 28, airYards: 14.2, yacPerReception: 5.8,
    consistencyScore: 76, boomRate: 62, bustRate: 12, gamesPlayed: 16, usageRank: 5,
    adp: 10, depthChartRank: 1, teamPassingRank: 14, teamRushingRank: 28,
    strengthOfSchedule: 52, projectedPoints: 285,
    injuryRisk: 2, ageValue: 7.0, carryoverInjury: 0, missedGamesLastYear: 1,
    espnProjected: 280, yahooProjected: 318, draftkingsProjected: 308, standardProjected: 248,
    targetedPasser: 92,
    notes: "Still elite speed — Tua's health is the wildcard"
  },
  {
    name: "Drake London", team: "ATL", position: "WR",
    pointsPerGame: 14.2, touchdownRate: 0.7, yardsPerGame: 78, redZoneTargets: 1.5,
    snapShare: 85, targetShare: 24, airYards: 10.1, yacPerReception: 4.0,
    consistencyScore: 65, boomRate: 42, bustRate: 18, gamesPlayed: 17, usageRank: 9,
    adp: 38, depthChartRank: 1, teamPassingRank: 20, teamRushingRank: 10,
    strengthOfSchedule: 50, projectedPoints: 220,
    injuryRisk: 2, ageValue: 9.5, carryoverInjury: 0, missedGamesLastYear: 0,
    espnProjected: 218, yahooProjected: 252, draftkingsProjected: 234, standardProjected: 192,
    targetedPasser: 85,
    notes: "Huge breakout upside with new offense — boom or bust play"
  },

  // ── TEs ────────────────────────────────────────────────────────────────────
  {
    name: "Sam LaPorta", team: "DET", position: "TE",
    pointsPerGame: 14.8, touchdownRate: 0.7, yardsPerGame: 68, redZoneTargets: 1.4,
    snapShare: 78, targetShare: 18, airYards: 6.5, yacPerReception: 3.8,
    consistencyScore: 72, boomRate: 48, bustRate: 15, gamesPlayed: 16, usageRank: 2,
    adp: 22, depthChartRank: 1, teamPassingRank: 3, teamRushingRank: 1,
    strengthOfSchedule: 44, projectedPoints: 200,
    injuryRisk: 2, ageValue: 9.8, carryoverInjury: 0, missedGamesLastYear: 1,
    espnProjected: 198, yahooProjected: 228, draftkingsProjected: 212, standardProjected: 168,
    targetedPasser: 99,
    notes: "Young TE on the best offense in football — rising star"
  },
  {
    name: "Travis Kelce", team: "KC", position: "TE",
    pointsPerGame: 15.2, touchdownRate: 0.8, yardsPerGame: 72, redZoneTargets: 1.8,
    snapShare: 82, targetShare: 22, airYards: 7.2, yacPerReception: 4.2,
    consistencyScore: 78, boomRate: 55, bustRate: 12, gamesPlayed: 17, usageRank: 1,
    adp: 16, depthChartRank: 1, teamPassingRank: 6, teamRushingRank: 22,
    strengthOfSchedule: 48, projectedPoints: 220,
    injuryRisk: 2, ageValue: 5.5, carryoverInjury: 0, missedGamesLastYear: 0,
    espnProjected: 218, yahooProjected: 252, draftkingsProjected: 236, standardProjected: 185,
    targetedPasser: 105,
    notes: "Declining from peak but still elite when paired with Mahomes"
  },
  {
    name: "Trey McBride", team: "ARI", position: "TE",
    pointsPerGame: 13.5, touchdownRate: 0.6, yardsPerGame: 72, redZoneTargets: 1.2,
    snapShare: 80, targetShare: 22, airYards: 6.8, yacPerReception: 4.5,
    consistencyScore: 68, boomRate: 40, bustRate: 18, gamesPlayed: 17, usageRank: 3,
    adp: 32, depthChartRank: 1, teamPassingRank: 22, teamRushingRank: 15,
    strengthOfSchedule: 55, projectedPoints: 190,
    injuryRisk: 1, ageValue: 9.0, carryoverInjury: 0, missedGamesLastYear: 0,
    espnProjected: 188, yahooProjected: 218, draftkingsProjected: 198, standardProjected: 158,
    targetedPasser: 88,
    notes: "Volume leader in Arizona — QB situation limits the upside"
  },
  {
    name: "Brock Bowers", team: "LV", position: "TE",
    pointsPerGame: 14.1, touchdownRate: 0.5, yardsPerGame: 82, redZoneTargets: 1.0,
    snapShare: 82, targetShare: 28, airYards: 8.0, yacPerReception: 5.5,
    consistencyScore: 70, boomRate: 44, bustRate: 16, gamesPlayed: 16, usageRank: 2,
    adp: 25, depthChartRank: 1, teamPassingRank: 28, teamRushingRank: 24,
    strengthOfSchedule: 52, projectedPoints: 195,
    injuryRisk: 1, ageValue: 10, carryoverInjury: 0, missedGamesLastYear: 1,
    // Massive PPR beneficiary — Yahoo rewards his huge reception volume
    espnProjected: 192, yahooProjected: 245, draftkingsProjected: 222, standardProjected: 155,
    targetedPasser: 82,
    notes: "Freakish receiver — poor QB situation in Las Vegas caps upside"
  },

  // ── K ──────────────────────────────────────────────────────────────────────
  {
    name: "Justin Tucker", team: "BAL", position: "K",
    pointsPerGame: 9.8, touchdownRate: 0, yardsPerGame: 0, redZoneTargets: 0,
    snapShare: 100, targetShare: 0, airYards: 0, yacPerReception: 0,
    consistencyScore: 88, boomRate: 40, bustRate: 8, gamesPlayed: 16, usageRank: 1,
    adp: 140, depthChartRank: 1, teamPassingRank: 7, teamRushingRank: 2,
    strengthOfSchedule: 45, projectedPoints: 145,
    injuryRisk: 1, ageValue: 6.5, carryoverInjury: 0, missedGamesLastYear: 1,
    // Kicker scoring barely varies by platform — DK sometimes adds bonuses
    espnProjected: 143, yahooProjected: 143, draftkingsProjected: 148, standardProjected: 143,
    targetedPasser: 95,
    notes: "GOAT kicker — had a rough 2024 but Baltimore offense keeps him busy"
  },

  // ── DST ────────────────────────────────────────────────────────────────────
  {
    name: "San Francisco 49ers", team: "SF", position: "DST",
    pointsPerGame: 11.2, touchdownRate: 0.4, yardsPerGame: 0, redZoneTargets: 0,
    snapShare: 100, targetShare: 0, airYards: 0, yacPerReception: 0,
    consistencyScore: 70, boomRate: 42, bustRate: 18, gamesPlayed: 17, usageRank: 1,
    adp: 85, depthChartRank: 1, teamPassingRank: 4, teamRushingRank: 3,
    strengthOfSchedule: 48, projectedPoints: 155,
    injuryRisk: 2, ageValue: 7.5, carryoverInjury: 0, missedGamesLastYear: 0,
    // DST scoring is relatively uniform across platforms
    espnProjected: 153, yahooProjected: 150, draftkingsProjected: 158, standardProjected: 153,
    targetedPasser: 100,
    notes: "Elite D with quality turnover production and pass rush"
  },
  {
    name: "Dallas Cowboys", team: "DAL", position: "DST",
    pointsPerGame: 10.5, touchdownRate: 0.5, yardsPerGame: 0, redZoneTargets: 0,
    snapShare: 100, targetShare: 0, airYards: 0, yacPerReception: 0,
    consistencyScore: 68, boomRate: 45, bustRate: 20, gamesPlayed: 17, usageRank: 2,
    adp: 92, depthChartRank: 1, teamPassingRank: 15, teamRushingRank: 25,
    strengthOfSchedule: 50, projectedPoints: 148,
    injuryRisk: 2, ageValue: 7.5, carryoverInjury: 0, missedGamesLastYear: 0,
    espnProjected: 146, yahooProjected: 143, draftkingsProjected: 151, standardProjected: 146,
    targetedPasser: 90,
    notes: "Micah Parsons anchors an elite front seven"
  },
];

export function seedPlayers() {
  for (const p of playerData) {
    storage.createPlayer(p);
  }
}
