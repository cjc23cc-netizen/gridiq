import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Search, SlidersHorizontal, X, TrendingUp } from "lucide-react";
import AddToHomeScreen from "@/components/AddToHomeScreen";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import GridIQLogo from "@/components/GridIQLogo";
import ScoreRing from "@/components/ScoreRing";
import { SCORING_SYSTEMS, type ScoringSystem } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

const POSITIONS = ["All", "QB", "RB", "WR", "TE", "K", "DST"];

const POSITION_COLORS: Record<string, string> = {
  QB: "bg-red-500/15 text-red-400 border-red-500/30",
  RB: "bg-green-500/15 text-green-400 border-green-500/30",
  WR: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  TE: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  K:  "bg-purple-500/15 text-purple-400 border-purple-500/30",
  DST:"bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
};

const PLATFORM_STYLES: Record<ScoringSystem, { bg: string; text: string; border: string; glow: string }> = {
  espn:        { bg: "bg-[#CC0000]/20", text: "text-[#ff4444]", border: "border-[#CC0000]/60", glow: "shadow-[0_0_14px_#CC000066]" },
  yahoo:       { bg: "bg-[#6001D2]/20", text: "text-[#a855f7]", border: "border-[#6001D2]/60", glow: "shadow-[0_0_14px_#6001D266]" },
  draftkings:  { bg: "bg-[#53D337]/20", text: "text-[#53D337]", border: "border-[#53D337]/60", glow: "shadow-[0_0_14px_#53D33766]" },
  standard:    { bg: "bg-[#F5A623]/20", text: "text-[#F5A623]", border: "border-[#F5A623]/60", glow: "shadow-[0_0_14px_#F5A62366]" },
};

function getScoreColor(score: number) {
  if (score >= 80) return "text-emerald-400";
  if (score >= 65) return "text-green-400";
  if (score >= 50) return "text-yellow-400";
  if (score >= 35) return "text-orange-400";
  return "text-red-400";
}

function getScoreLabel(score: number) {
  if (score >= 80) return "Elite";
  if (score >= 65) return "Great";
  if (score >= 50) return "Good";
  if (score >= 35) return "Average";
  return "Below Avg";
}

export default function Home() {
  const [, navigate] = useLocation();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [position, setPosition] = useState("All");
  const [scoringSystem, setScoringSystem] = useState<ScoringSystem>("espn");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 280);
    return () => clearTimeout(t);
  }, [search]);

  const { data: players = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/players", debouncedSearch, position],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set("q", debouncedSearch);
      if (position !== "All") params.set("position", position);
      const res = await apiRequest("GET", `/api/players?${params}`);
      return res.json();
    },
  });

  const platformStyle = PLATFORM_STYLES[scoringSystem];
  const activePlatform = SCORING_SYSTEMS.find(s => s.id === scoringSystem)!;

  return (
    <div className="min-h-screen bg-background field-grid">
      {/* ── Header ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <button
            data-testid="logo-home"
            onClick={() => navigate("/")}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <GridIQLogo size={38} />
            <div className="hidden sm:block">
              <div className="font-display text-xl font-bold tracking-wide text-foreground leading-none">
                GRID<span className="text-primary">IQ</span>
              </div>
              <div className="text-[10px] text-muted-foreground tracking-widest uppercase leading-none mt-0.5">
                Fantasy Analyzer
              </div>
            </div>
          </button>

          {/* Right side: scoring system selector only — Install button moved to hero */}
          <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-card border border-border rounded-lg p-1">
            {SCORING_SYSTEMS.map((sys) => {
              const isActive = scoringSystem === sys.id;
              const style = PLATFORM_STYLES[sys.id];
              return (
                <button
                  key={sys.id}
                  data-testid={`platform-btn-${sys.id}`}
                  onClick={() => setScoringSystem(sys.id)}
                  title={sys.description}
                  className={`platform-btn px-3 py-1.5 rounded-md text-xs font-bold tracking-wide border transition-all ${
                    isActive
                      ? `${style.bg} ${style.text} ${style.border} ${style.glow}`
                      : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {sys.label}
                </button>
              );
            })}
          </div>
          </div>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────── */}
      <div className="hero-gradient border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold text-primary tracking-widest uppercase">
                25 Performance Markers
              </span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-foreground mb-2 leading-none">
              FIND YOUR <span className="text-primary">BEST</span><br />FANTASY PICKS
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-4">
              Search any NFL player to get a full data breakdown across{" "}
              <span className="text-foreground font-medium">ESPN, Yahoo, DraftKings,</span> and{" "}
              <span className="text-foreground font-medium">Standard</span> scoring systems.
            </p>

            {/* Add to Home Screen — always visible in hero */}
            <div className="mb-5">
              <AddToHomeScreen />
            </div>

            {/* Search bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                data-testid="player-search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search player name or team (e.g. Lamar Jackson, DET...)"
                className="pl-12 pr-12 h-12 text-base bg-card border-border focus:border-primary/60 focus:ring-primary/20 rounded-xl"
              />
              {search && (
                <button
                  data-testid="search-clear"
                  onClick={() => setSearch("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Filters & active platform banner ───────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">

          {/* Position filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <SlidersHorizontal className="w-4 h-4 text-muted-foreground shrink-0" />
            {POSITIONS.map((pos) => (
              <button
                key={pos}
                data-testid={`pos-filter-${pos}`}
                onClick={() => setPosition(pos)}
                className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                  position === pos
                    ? "bg-primary/15 text-primary border-primary/50"
                    : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
                }`}
              >
                {pos}
              </button>
            ))}
          </div>

          {/* Active platform indicator */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold ${platformStyle.bg} ${platformStyle.text} ${platformStyle.border}`}>
            <span>Scoring:</span>
            <span className="font-bold">{activePlatform.label}</span>
            <span className="hidden sm:inline text-[10px] font-normal opacity-70">— {activePlatform.description.split(" —")[0]}</span>
          </div>
        </div>
      </div>

      {/* ── Results ────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-xl bg-card" />
            ))}
          </div>
        ) : players.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Search className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <p className="text-lg font-display font-bold text-muted-foreground">No players found</p>
            <p className="text-sm text-muted-foreground mt-1">Try a different name or remove filters</p>
          </div>
        ) : (
          <>
            <p className="text-xs text-muted-foreground mb-4">
              {players.length} player{players.length !== 1 ? "s" : ""} · sorted by composite score (25-marker analysis,{" "}
              <span className={platformStyle.text}>{activePlatform.label}</span> platform active)
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {players.map((player: any) => {
                const platformPts = player[`${scoringSystem}Projected`] ?? player.projectedPoints;
                const score = player.overallScore ?? 0;
                return (
                  <button
                    key={player.id}
                    data-testid={`player-card-${player.id}`}
                    onClick={() => navigate(`/player/${player.id}?scoring=${scoringSystem}`)}
                    className="player-card text-left bg-card border border-border rounded-xl p-4 flex flex-col gap-3 cursor-pointer"
                  >
                    {/* Top row: position badge + score ring */}
                    <div className="flex items-start justify-between">
                      <div>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${POSITION_COLORS[player.position] ?? "bg-muted text-muted-foreground border-border"}`}>
                          {player.position}
                        </span>
                        <div className="mt-2">
                          <div className="font-display text-lg font-extrabold text-foreground leading-tight">
                            {player.name}
                          </div>
                          <div className="text-xs text-muted-foreground font-medium">{player.team}</div>
                        </div>
                      </div>
                      <ScoreRing score={score} size={56} />
                    </div>

                    {/* Platform projected points */}
                    <div className={`flex items-center justify-between px-3 py-2 rounded-lg border ${platformStyle.bg} ${platformStyle.border}`}>
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                        {activePlatform.label} Proj.
                      </span>
                      <span className={`text-sm font-bold font-display ${platformStyle.text}`}>
                        {platformPts.toFixed(0)} pts
                      </span>
                    </div>

                    {/* Key stats row */}
                    <div className="grid grid-cols-3 gap-1 text-center">
                      {[
                        { label: "Pts/G", value: player.pointsPerGame?.toFixed(1) },
                        { label: "Boom%", value: `${player.boomRate?.toFixed(0)}%` },
                        { label: "ADP", value: player.adp?.toFixed(0) },
                      ].map(({ label, value }) => (
                        <div key={label} className="bg-muted/40 rounded-md py-1.5">
                          <div className="text-[9px] text-muted-foreground uppercase tracking-wide font-medium">{label}</div>
                          <div className="text-xs font-bold text-foreground">{value}</div>
                        </div>
                      ))}
                    </div>

                    {/* Score label */}
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold ${getScoreColor(score)}`}>
                        {getScoreLabel(score)}
                      </span>
                      <span className="text-[10px] text-muted-foreground">View full breakdown →</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
