import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import GridIQLogo from "@/components/GridIQLogo";
import AddToHomeScreen from "@/components/AddToHomeScreen";
import ScoreRing from "@/components/ScoreRing";
import { MARKERS, SCORING_SYSTEMS, computeOverallScore, getScoringProjected, type ScoringSystem, type Player } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

const POSITION_COLORS: Record<string, string> = {
  QB:  "bg-red-500/15 text-red-400 border-red-500/30",
  RB:  "bg-green-500/15 text-green-400 border-green-500/30",
  WR:  "bg-blue-500/15 text-blue-400 border-blue-500/30",
  TE:  "bg-orange-500/15 text-orange-400 border-orange-500/30",
  K:   "bg-purple-500/15 text-purple-400 border-purple-500/30",
  DST: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
};

const PLATFORM_STYLES: Record<ScoringSystem, { bg: string; text: string; border: string; glow: string; color: string }> = {
  espn:       { bg: "bg-[#CC0000]/15", text: "text-[#ff4444]", border: "border-[#CC0000]/50", glow: "shadow-[0_0_20px_#CC000055]", color: "#ff4444" },
  yahoo:      { bg: "bg-[#6001D2]/15", text: "text-[#a855f7]", border: "border-[#6001D2]/50", glow: "shadow-[0_0_20px_#6001D255]", color: "#a855f7" },
  draftkings: { bg: "bg-[#53D337]/15", text: "text-[#53D337]", border: "border-[#53D337]/50", glow: "shadow-[0_0_20px_#53D33755]", color: "#53D337" },
  standard:   { bg: "bg-[#F5A623]/15", text: "text-[#F5A623]", border: "border-[#F5A623]/50", glow: "shadow-[0_0_20px_#F5A62355]", color: "#F5A623" },
};

const CATEGORY_COLORS: Record<string, string> = {
  "Production":      "text-emerald-400 border-emerald-400/30 bg-emerald-400/8",
  "Consistency":     "text-blue-400 border-blue-400/30 bg-blue-400/8",
  "Opportunity":     "text-purple-400 border-purple-400/30 bg-purple-400/8",
  "Health & Risk":   "text-orange-400 border-orange-400/30 bg-orange-400/8",
  "Platform Scoring":"text-yellow-400 border-yellow-400/30 bg-yellow-400/8",
  "Advanced":        "text-cyan-400 border-cyan-400/30 bg-cyan-400/8",
};

function getBarColor(pct: number): string {
  if (pct >= 80) return "bg-emerald-400";
  if (pct >= 60) return "bg-green-400";
  if (pct >= 40) return "bg-yellow-400";
  if (pct >= 25) return "bg-orange-400";
  return "bg-red-400";
}

function getMarkerValue(player: Player, key: string, scoringSystem: ScoringSystem): number {
  if (key === "platformScoring") {
    return getScoringProjected(player, scoringSystem);
  }
  const raw = (player as any)[key];
  return typeof raw === "number" ? raw : 0;
}

function getMarkerPercent(player: Player, key: string, scoringSystem: ScoringSystem): number {
  const v = getMarkerValue(player, key, scoringSystem);
  // Normalize each metric to 0-100%
  const norms: Record<string, (n: number) => number> = {
    pointsPerGame:       (n) => Math.min(100, (n / 30) * 100),
    touchdownRate:       (n) => Math.min(100, (n / 2.5) * 100),
    yardsPerGame:        (n) => Math.min(100, (n / 150) * 100),
    redZoneTargets:      (n) => Math.min(100, (n / 4) * 100),
    snapShare:           (n) => Math.min(100, n),
    targetShare:         (n) => Math.min(100, (n / 35) * 100),
    airYards:            (n) => Math.min(100, (n / 20) * 100),
    yacPerReception:     (n) => Math.min(100, (n / 8) * 100),
    consistencyScore:    (n) => Math.min(100, n),
    boomRate:            (n) => Math.min(100, n),
    bustRate:            (n) => Math.max(0, 100 - n),        // inverted
    gamesPlayed:         (n) => Math.min(100, (n / 17) * 100),
    usageRank:           (n) => Math.max(0, ((20 - n) / 19) * 100),  // inverted
    adp:                 (n) => Math.max(0, ((300 - n) / 299) * 100),// inverted
    depthChartRank:      (n) => Math.max(0, ((4 - n) / 3) * 100),    // inverted
    teamPassingRank:     (n) => Math.max(0, ((32 - n) / 31) * 100),  // inverted
    teamRushingRank:     (n) => Math.max(0, ((32 - n) / 31) * 100),  // inverted
    strengthOfSchedule:  (n) => Math.max(0, 100 - n),                // inverted
    projectedPoints:     (n) => Math.min(100, (n / 500) * 100),
    injuryRisk:          (n) => Math.max(0, ((6 - n) / 5) * 100),    // inverted
    ageValue:            (n) => Math.min(100, n * 10),
    carryoverInjury:     (n) => Math.max(0, (1 - n) * 100),           // inverted
    missedGamesLastYear: (n) => Math.max(0, ((17 - n) / 17) * 100),  // inverted
    platformScoring:     (n) => Math.min(100, (n / 500) * 100),
    targetedPasser:      (n) => Math.min(100, (n / 158.3) * 100),
  };
  const fn = norms[key];
  return fn ? Math.round(fn(v)) : Math.min(100, v);
}

function formatMarkerValue(key: string, value: number, scoringSystem: ScoringSystem): string {
  if (key === "platformScoring") return `${value.toFixed(0)} pts`;
  if (key === "snapShare" || key === "consistencyScore" || key === "boomRate" || key === "bustRate") return `${value.toFixed(0)}%`;
  if (key === "pointsPerGame" || key === "touchdownRate" || key === "yardsPerGame" || key === "redZoneTargets") return value.toFixed(1);
  if (key === "targetShare") return `${value.toFixed(1)}%`;
  if (key === "airYards" || key === "yacPerReception") return `${value.toFixed(1)} yds`;
  if (key === "adp") return `#${value.toFixed(0)}`;
  if (key === "projectedPoints") return `${value.toFixed(0)} pts`;
  if (key === "injuryRisk") return `${value}/5`;
  if (key === "ageValue") return `${value.toFixed(1)}/10`;
  if (key === "carryoverInjury") return value ? "Yes" : "No";
  if (key === "missedGamesLastYear") return `${value} games`;
  if (key === "gamesPlayed") return `${value}/17`;
  if (key === "usageRank" || key === "depthChartRank") return `#${value}`;
  if (key === "teamPassingRank" || key === "teamRushingRank") return `#${value}`;
  if (key === "strengthOfSchedule") return `${value.toFixed(0)}/100`;
  if (key === "targetedPasser") return value.toFixed(1);
  if (key === "pprBonus") return `${value.toFixed(1)}/gm`;
  return value.toFixed(1);
}

// Group markers by category
const GROUPED_MARKERS = MARKERS.reduce((acc, m) => {
  if (!acc[m.category]) acc[m.category] = [];
  acc[m.category].push(m);
  return acc;
}, {} as Record<string, typeof MARKERS>);

const CATEGORY_ORDER = ["Production", "Consistency", "Opportunity", "Health & Risk", "Platform Scoring", "Advanced"];

export default function PlayerDetail() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const [scoringSystem, setScoringSystem] = useState<ScoringSystem>("espn");

  // Read scoring param from URL hash query string
  useEffect(() => {
    const hash = window.location.hash;
    const queryStart = hash.indexOf("?");
    if (queryStart !== -1) {
      const params = new URLSearchParams(hash.slice(queryStart + 1));
      const sys = params.get("scoring") as ScoringSystem;
      if (sys && ["espn", "yahoo", "draftkings", "standard"].includes(sys)) {
        setScoringSystem(sys);
      }
    }
  }, []);

  const { data: player, isLoading } = useQuery<Player & { overallScore: number }>({
    queryKey: ["/api/players", id],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/players/${id}`);
      return res.json();
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background field-grid">
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">
          <Skeleton className="h-10 w-32 rounded-lg bg-card" />
          <Skeleton className="h-40 w-full rounded-xl bg-card" />
          <Skeleton className="h-96 w-full rounded-xl bg-card" />
        </div>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-display font-bold text-muted-foreground">Player not found</p>
          <button onClick={() => navigate("/")} className="mt-4 text-primary text-sm hover:underline">← Back to search</button>
        </div>
      </div>
    );
  }

  const overallScore = computeOverallScore(player, scoringSystem);
  const platformPts = getScoringProjected(player, scoringSystem);
  const platformStyle = PLATFORM_STYLES[scoringSystem];
  const activePlatform = SCORING_SYSTEMS.find(s => s.id === scoringSystem)!;

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background field-grid">
        {/* ── Nav ─────────────────────────────────────────── */}
        <header className="sticky top-0 z-50 border-b border-border/60 bg-background/90 backdrop-blur-md">
          <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
            <button
              data-testid="back-btn"
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>All Players</span>
            </button>
            <button onClick={() => navigate("/")} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <GridIQLogo size={28} />
              <span className="hidden sm:inline font-display font-bold text-base tracking-wide">GRID<span className="text-primary">IQ</span></span>
            </button>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          {/* ── Hero Card ─────────────────────────────────── */}
          <div className={`relative overflow-hidden rounded-2xl border ${platformStyle.border} bg-card ${platformStyle.glow}`}>
            {/* BG accent */}
            <div className={`absolute inset-0 ${platformStyle.bg} pointer-events-none`} />
            <div className="relative p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                {/* Player info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-bold border ${POSITION_COLORS[player.position] ?? ""}`}>
                      {player.position}
                    </span>
                    <span className="text-sm text-muted-foreground font-medium">{player.team}</span>
                  </div>
                  <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-foreground leading-none mb-3">
                    {player.name.toUpperCase()}
                  </h1>
                  {player.notes && (
                    <p className="text-sm text-muted-foreground leading-relaxed max-w-md">{player.notes}</p>
                  )}
                  {player.carryoverInjury === 1 && (
                    <div className="flex items-center gap-1.5 mt-3 text-orange-400 text-xs font-semibold">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Carryover injury concern
                    </div>
                  )}
                  <div className="mt-4">
                    <AddToHomeScreen />
                  </div>
                </div>

                {/* Score ring */}
                <div className="flex flex-col items-center gap-2">
                  <ScoreRing score={overallScore} size={100} />
                  <span className="text-xs text-muted-foreground font-medium">Overall Score</span>
                </div>
              </div>

              {/* Platform selector + projected */}
              <div className="mt-6 pt-5 border-t border-border/50">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-2">Scoring System</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      {SCORING_SYSTEMS.map((sys) => {
                        const isActive = scoringSystem === sys.id;
                        const s = PLATFORM_STYLES[sys.id];
                        return (
                          <button
                            key={sys.id}
                            data-testid={`detail-platform-${sys.id}`}
                            onClick={() => setScoringSystem(sys.id)}
                            className={`platform-btn px-4 py-2 rounded-lg text-xs font-bold tracking-wide border transition-all ${
                              isActive
                                ? `${s.bg} ${s.text} ${s.border} ${s.glow}`
                                : "border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                            }`}
                          >
                            {sys.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Per-platform projected pts */}
                  <div className={`sm:ml-auto flex items-center gap-3 px-5 py-3 rounded-xl border ${platformStyle.bg} ${platformStyle.border}`}>
                    <div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{activePlatform.label} Season Proj.</div>
                      <div className={`font-display text-3xl font-extrabold ${platformStyle.text}`}>
                        {platformPts.toFixed(0)}
                        <span className="text-sm font-normal ml-1 opacity-70">pts</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* All platform comparison */}
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {SCORING_SYSTEMS.map((sys) => {
                    const pts = getScoringProjected(player, sys.id);
                    const s = PLATFORM_STYLES[sys.id];
                    const isActive = scoringSystem === sys.id;
                    return (
                      <button
                        key={sys.id}
                        data-testid={`scoring-compare-${sys.id}`}
                        onClick={() => setScoringSystem(sys.id)}
                        className={`rounded-lg p-3 border text-center transition-all cursor-pointer ${
                          isActive ? `${s.bg} ${s.border}` : "border-border/50 bg-muted/20 hover:bg-muted/40"
                        }`}
                      >
                        <div className={`text-[10px] font-bold uppercase tracking-widest ${isActive ? s.text : "text-muted-foreground"}`}>
                          {sys.label}
                        </div>
                        <div className={`font-display text-xl font-extrabold mt-0.5 ${isActive ? s.text : "text-foreground"}`}>
                          {pts.toFixed(0)}
                        </div>
                        <div className="text-[9px] text-muted-foreground">proj. pts</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* ── 25 Markers Breakdown ──────────────────────── */}
          <div>
            <h2 className="font-display text-xl font-bold text-foreground mb-4 tracking-wide">
              25 PERFORMANCE MARKERS
            </h2>

            <div className="space-y-5">
              {CATEGORY_ORDER.map((category) => {
                const markers = GROUPED_MARKERS[category];
                if (!markers?.length) return null;
                const catStyle = CATEGORY_COLORS[category] ?? "text-foreground border-border bg-muted";

                return (
                  <div key={category} className="bg-card border border-border rounded-xl overflow-hidden">
                    {/* Category header */}
                    <div className={`px-4 py-2.5 border-b border-border flex items-center gap-2`}>
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${catStyle}`}>
                        {category}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{markers.length} marker{markers.length !== 1 ? "s" : ""}</span>
                    </div>

                    {/* Markers */}
                    <div className="divide-y divide-border/40">
                      {markers.map((marker, idx) => {
                        const value = getMarkerValue(player, marker.key as string, scoringSystem);
                        const pct = getMarkerPercent(player, marker.key as string, scoringSystem);
                        const formatted = formatMarkerValue(marker.key as string, value, scoringSystem);
                        const barColor = getBarColor(pct);
                        const markerNum = MARKERS.findIndex(m => m.key === marker.key) + 1;

                        return (
                          <div
                            key={marker.key as string}
                            data-testid={`marker-row-${marker.key}`}
                            className="px-4 py-3"
                          >
                            <div className="flex items-center justify-between gap-3 mb-1.5">
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="text-[10px] font-mono text-muted-foreground/50 w-5 shrink-0">
                                  {markerNum}
                                </span>
                                <span className="text-sm font-semibold text-foreground truncate">
                                  {marker.label}
                                </span>
                                {marker.systemAware && (
                                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${PLATFORM_STYLES[scoringSystem].bg} ${PLATFORM_STYLES[scoringSystem].text} ${PLATFORM_STYLES[scoringSystem].border}`}>
                                    {activePlatform.label}
                                  </span>
                                )}
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Info className="w-3 h-3 text-muted-foreground/40 hover:text-muted-foreground cursor-help shrink-0" />
                                  </TooltipTrigger>
                                  <TooltipContent side="top" className="max-w-xs text-xs">
                                    {marker.description}
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                              <span className="text-sm font-bold text-foreground shrink-0">{formatted}</span>
                            </div>

                            {/* Progress bar */}
                            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                              <div
                                data-testid={`marker-bar-${marker.key}`}
                                className={`h-full rounded-full marker-bar ${barColor}`}
                                style={{
                                  "--bar-width": `${pct}%`,
                                  width: `${pct}%`,
                                } as any}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
