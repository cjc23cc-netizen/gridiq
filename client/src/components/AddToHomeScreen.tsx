import { useState, useEffect, useRef } from "react";
import { Smartphone, X } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import GridIQLogo from "@/components/GridIQLogo";



function detectPlatform(): "ios" | "android" | "desktop" {
  if (typeof window === "undefined") return "desktop";
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream) return "ios";
  if (/Android/.test(ua)) return "android";
  return "desktop";
}

function isStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as any).standalone === true
  );
}

export default function AddToHomeScreen() {
  const [open, setOpen] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [installState, setInstallState] = useState<"pwa-ready" | "android-manual" | "other">("other");
  const deferredPrompt = useRef<any>(null);
  const platform = detectPlatform();
  // Use current URL for QR — whatever URL this page is loaded at is exactly what Safari should open
  const qrUrl = typeof window !== "undefined" ? window.location.href : "";

  useEffect(() => {
    if (isStandalone()) { setInstalled(true); return; }
    const onPrompt = (e: Event) => {
      e.preventDefault();
      deferredPrompt.current = e;
      setInstallState("pwa-ready");
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    if (platform === "android") {
      const t = setTimeout(() => {
        if (!deferredPrompt.current) setInstallState("android-manual");
      }, 1000);
      return () => { window.removeEventListener("beforeinstallprompt", onPrompt); clearTimeout(t); };
    }
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  async function triggerInstall() {
    const prompt = deferredPrompt.current;
    if (!prompt) return;
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") { setInstalled(true); setOpen(false); }
    deferredPrompt.current = null;
  }

  if (installed) return null;

  return (
    <>
      <button
        data-testid="add-to-home-btn"
        onClick={() => setOpen(true)}
        style={{
          display: "inline-flex", alignItems: "center", gap: "8px",
          padding: "10px 20px", borderRadius: "10px",
          background: "rgba(16,185,129,0.12)", border: "1.5px solid rgba(16,185,129,0.5)",
          color: "#10B981", fontWeight: 700, fontSize: "13px", cursor: "pointer",
          boxShadow: "0 0 14px rgba(16,185,129,0.2)", whiteSpace: "nowrap",
        }}
        aria-label="Add GridIQ to Home Screen"
      >
        <Smartphone style={{ width: 16, height: 16, flexShrink: 0 }} />
        Add to Home Screen
      </button>

      {open && (
        <>
          <div
            style={{ position: "fixed", inset: 0, zIndex: 9998, background: "rgba(0,0,0,0.75)" }}
            onClick={() => setOpen(false)}
          />
          <div
            data-testid="install-drawer"
            style={{
              position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 9999,
              maxHeight: "92dvh", overflowY: "auto",
              paddingBottom: "env(safe-area-inset-bottom, 20px)",
            }}
            className="bg-card border-t border-border rounded-t-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-border" />
            </div>

            <div className="px-5 pt-2 pb-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center">
                    <GridIQLogo size={28} />
                  </div>
                  <div>
                    <div className="font-display font-extrabold text-base text-foreground leading-tight">
                      GRID<span className="text-primary">IQ</span>
                    </div>
                    <div className="text-xs text-muted-foreground">Add to Home Screen</div>
                  </div>
                </div>
                <button onClick={() => setOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* ── iOS ─────────────────────────────────────────────── */}
              {platform === "ios" && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Point your iPhone camera at this QR code — it opens GridIQ directly in Safari where you can add it to your home screen.
                  </p>

                  {/* QR Code */}
                  <div style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 12,
                    padding: "20px",
                    background: "#fff",
                    borderRadius: 16,
                    margin: "0 auto",
                    maxWidth: 240,
                  }}>
                    <QRCodeSVG
                      value={qrUrl}
                      size={180}
                      bgColor="#ffffff"
                      fgColor="#0F1E16"
                      level="M"
                      includeMargin={false}
                    />
                    <p style={{ color: "#0F1E16", fontSize: 11, fontWeight: 600, textAlign: "center", margin: 0 }}>
                      Scan with iPhone Camera
                    </p>
                  </div>

                  {/* Steps after scanning */}
                  <div className="space-y-3 pt-1">
                    <Step num={1}>Open your <strong className="text-foreground">Camera app</strong> and point it at the QR code above — tap the banner that appears</Step>
                    <Step num={2}>In Safari, tap the <strong className="text-foreground">Share icon ⬆</strong> at the bottom center of the screen</Step>
                    <Step num={3}>Tap <strong className="text-foreground">"Add to Home Screen"</strong> → <strong className="text-foreground">Add</strong></Step>
                  </div>
                </div>
              )}

              {/* ── Android native ─────────────────────────────────── */}
              {platform === "android" && installState === "pwa-ready" && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">GridIQ can be installed directly.</p>
                  <button onClick={triggerInstall} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "14px 0", borderRadius: 12, background: "#10B981", color: "#000", fontWeight: 700, fontSize: 15, border: "none", cursor: "pointer" }}>
                    Install GridIQ
                  </button>
                </div>
              )}

              {/* ── Android manual ─────────────────────────────────── */}
              {platform === "android" && installState === "android-manual" && (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground leading-relaxed">Open in Chrome, then:</p>
                  <Step num={1}>Tap the <strong className="text-foreground">⋮ menu</strong> top-right</Step>
                  <Step num={2}>Tap <strong className="text-foreground">"Add to Home screen"</strong></Step>
                  <Step num={3}>Tap <strong className="text-foreground">Add</strong></Step>
                </div>
              )}

              {/* ── Desktop ────────────────────────────────────────── */}
              {platform === "desktop" && (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground leading-relaxed">In Chrome or Edge:</p>
                  <Step num={1}>Look for the <strong className="text-foreground">install icon ⊕</strong> in the address bar</Step>
                  <Step num={2}>Click it and select <strong className="text-foreground">"Install"</strong></Step>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}

function Step({ num, children }: { num: number; children: React.ReactNode }) {
  return (
    <div className="p-4 rounded-xl bg-muted/40 border border-border flex items-start gap-3">
      <span className="w-6 h-6 rounded-full bg-primary/20 border border-primary/40 text-[11px] font-bold text-primary flex items-center justify-center shrink-0 mt-0.5">{num}</span>
      <p className="text-sm text-muted-foreground leading-relaxed flex-1">{children}</p>
    </div>
  );
}
