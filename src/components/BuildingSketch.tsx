import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

const NS = "http://www.w3.org/2000/svg";

/** Moltiplicatore del tempo: >1 disegna piu' in fretta. */
const SPEED = 1.7;

type Step = {
  el: SVGElement;
  start: number;
  dur: number;
  len?: number;
  fade?: boolean;
  label?: string;
};

type Quad = { tl: number[]; tr: number[]; br: number[]; bl: number[] };

type LineOpts = {
  closed?: boolean;
  thin?: boolean;
  dur?: number;
  speed?: number;
  gap?: number;
  label?: string;
};

/**
 * Palazzo disegnato a schizzo: prima si tracciano le linee, poi arrivano i
 * riempimenti e si accende il lampione. Parte quando entra nel viewport.
 */
export function BuildingSketch({ className }: { className?: string }) {
  const linesRef = useRef<SVGGElement>(null);
  const fillsRef = useRef<SVGGElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    const linesG = linesRef.current;
    const fillsG = fillsRef.current;
    const stage = stageRef.current;
    if (!linesG || !fillsG || !stage) return;

    linesG.replaceChildren();
    fillsG.replaceChildren();

    // Facciate come quadrilateri; le finestre sono posizionate in (u,v).
    const L: Quad = { tl: [382, 350], tr: [930, 118], br: [930, 720], bl: [382, 760] };
    const R: Quad = { tl: [930, 118], tr: [1335, 425], br: [1335, 770], bl: [930, 720] };
    const splitL: number[][] = [
      [382, 612],
      [930, 525],
    ];
    const splitR: number[][] = [
      [930, 525],
      [1335, 655],
    ];

    const q = (Q: Quad, u: number, v: number): number[] => [
      (1 - v) * ((1 - u) * Q.tl[0]! + u * Q.tr[0]!) + v * ((1 - u) * Q.bl[0]! + u * Q.br[0]!),
      (1 - v) * ((1 - u) * Q.tl[1]! + u * Q.tr[1]!) + v * ((1 - u) * Q.bl[1]! + u * Q.br[1]!),
    ];
    const P = (a: number[][]) => a.map((p) => p.join(",")).join(" ");

    const seq: Step[] = [];
    let cursor = 0;

    const line = (points: number[][], opts: LineOpts = {}) => {
      const el = document.createElementNS(NS, opts.closed ? "polygon" : "polyline") as SVGGeometryElement;
      el.setAttribute("points", P(points));
      el.setAttribute("class", opts.thin ? "sk-stroke sk-thin" : "sk-stroke");
      linesG.appendChild(el);
      const len = el.getTotalLength();
      el.style.strokeDasharray = String(len);
      el.style.strokeDashoffset = String(len);
      const dur = opts.dur ?? Math.max(120, len * (opts.speed ?? 0.9));
      seq.push({ el, start: cursor, dur, len, ...(opts.label ? { label: opts.label } : {}) });
      cursor += opts.gap ?? dur * 0.85;
    };

    const fill = (points: number[][], color: string, at: number, dur = 600) => {
      const el = document.createElementNS(NS, "polygon");
      el.setAttribute("points", P(points));
      el.setAttribute("fill", color);
      el.setAttribute("class", "sk-fill");
      fillsG.appendChild(el);
      seq.push({ el, start: at, dur, fade: true });
    };

    // 1. il volume
    line([L.tl, L.tr, R.tr, R.br, R.bl, L.bl], { closed: true, label: "Il volume" });
    line([L.tr, L.br], {});
    line([splitL[0]!, splitL[1]!, splitR[1]!], { label: "La fascia chiara" });

    // 2. finestre a nastro, facciata sinistra
    const lu = [0.097, 0.179, 0.266, 0.365, 0.47, 0.59, 0.726, 0.869];
    const segs = [
      [0.11, 0.28],
      [0.3, 0.45],
      [0.47, 0.63],
      [0.66, 0.94],
    ];
    const leftWin: { pts: number[][]; lit: boolean }[] = [];
    lu.forEach((u, i) => {
      const w = 0.022 + i * 0.002;
      segs.forEach((s, k) => {
        const pts = [q(L, u, s[0]!), q(L, u + w, s[0]!), q(L, u + w, s[1]!), q(L, u, s[1]!)];
        line(pts, {
          closed: true,
          speed: 0.5,
          gap: 55,
          ...(k === 0 && i === 0 ? { label: "Le finestre a nastro" } : {}),
        });
        leftWin.push({ pts, lit: k === 3 });
      });
    });

    // 3. finestre a griglia, facciata destra
    const ru = [
      [0.11, 0.12],
      [0.3, 0.1],
      [0.46, 0.085],
      [0.6, 0.075],
      [0.72, 0.065],
      [0.83, 0.06],
      [0.92, 0.055],
    ];
    const rows = [
      [0.14, 0.4],
      [0.44, 0.66],
      [0.72, 0.96],
    ];
    const rightWin: { pts: number[][]; row: number }[] = [];
    rows.forEach((r, ri) =>
      ru.forEach((pair, ci) => {
        const u = pair[0]!;
        const w = pair[1]!;
        const pts = [q(R, u, r[0]!), q(R, u + w, r[0]!), q(R, u + w, r[1]!), q(R, u, r[1]!)];
        line(pts, {
          closed: true,
          speed: 0.5,
          gap: 50,
          ...(ri === 0 && ci === 0 ? { label: "La griglia" } : {}),
        });
        const inset = [
          q(R, u + w * 0.12, r[0]! + 0.03),
          q(R, u + w * 0.88, r[0]! + 0.03),
          q(R, u + w * 0.88, r[1]! - 0.03),
          q(R, u + w * 0.12, r[1]! - 0.03),
        ];
        line(inset, { closed: true, thin: true, speed: 0.4, gap: 20 });
        rightWin.push({ pts: inset, row: ri });
      }),
    );

    // 4. piano terra arretrato
    line(
      [
        [385, 850],
        [860, 862],
        [1265, 832],
      ],
      { label: "Il piano terra" },
    );
    line(
      [
        [385, 846],
        [385, 856],
        [860, 868],
        [1265, 838],
        [1265, 832],
      ],
      { thin: true },
    );
    line(
      [
        [430, 748],
        [430, 848],
      ],
      {},
    );
    line(
      [
        [430, 748],
        [1160, 748],
      ],
      { thin: true },
    );
    line(
      [
        [710, 742],
        [710, 852],
        [860, 862],
        [860, 742],
      ],
      {},
    );
    line(
      [
        [880, 745],
        [880, 855],
        [950, 853],
        [950, 745],
      ],
      {},
    );
    line(
      [
        [905, 800],
        [905, 812],
      ],
      { thin: true },
    );
    line(
      [
        [1035, 748],
        [1035, 838],
      ],
      {},
    );
    line(
      [
        [1160, 748],
        [1160, 836],
      ],
      {},
    );
    line(
      [
        [1265, 760],
        [1265, 832],
      ],
      {},
    );
    line(
      [
        [382, 760],
        [430, 748],
      ],
      { thin: true },
    );
    line(
      [
        [1335, 770],
        [1265, 760],
      ],
      { thin: true },
    );

    // 5. il lampione
    line(
      [
        [502, 905],
        [502, 695],
      ],
      { label: "Il lampione" },
    );
    line(
      [
        [492, 650],
        [512, 650],
        [508, 692],
        [496, 692],
      ],
      { closed: true },
    );
    line(
      [
        [488, 650],
        [516, 650],
      ],
      { thin: true },
    );
    line(
      [
        [499, 643],
        [505, 643],
      ],
      { thin: true },
    );

    // Riempimenti: arrivano dopo le linee.
    const inkEnd = cursor;
    fill([splitL[0]!, splitL[1]!, L.br, L.bl], "var(--sk-band)", inkEnd + 200, 900);
    fill([splitR[0]!, splitR[1]!, R.br, R.bl], "var(--sk-band)", inkEnd + 200, 900);
    leftWin.forEach((w, i) => fill(w.pts, w.lit ? "#ffffff" : "var(--sk-glass)", inkEnd + 900 + i * 12, 400));
    rightWin.forEach((w, i) => fill(w.pts, w.row === 2 ? "#e0dfd9" : "var(--sk-glass)", inkEnd + 900 + i * 18, 400));

    const glow = document.createElementNS(NS, "circle");
    glow.setAttribute("cx", "502");
    glow.setAttribute("cy", "670");
    glow.setAttribute("r", "60");
    glow.setAttribute("fill", "url(#sk-glow)");
    glow.setAttribute("class", "sk-fill");
    fillsG.appendChild(glow);
    seq.push({ el: glow, start: inkEnd + 1700, dur: 700, fade: true, label: "Si accende la luce" });
    fill(
      [
        [493, 652],
        [511, 652],
        [507, 690],
        [497, 690],
      ],
      "var(--sk-lamp)",
      inkEnd + 1700,
      300,
    );

    const total = inkEnd + 2600;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    const ease = (x: number) => 1 - Math.pow(1 - x, 2);

    const render = (t: number) => {
      for (const s of seq) {
        const p = Math.min(1, Math.max(0, (t - s.start) / s.dur));
        if (s.fade) s.el.style.opacity = String(ease(p));
        else s.el.style.strokeDashoffset = String((s.len ?? 0) * (1 - p));
      }
    };

    const play = () => {
      cancelAnimationFrame(raf);
      if (reduced) {
        render(total);
        return;
      }
      const t0 = performance.now();
      const step = (now: number) => {
        const t = (now - t0) * SPEED;
        render(t);
        if (t < total) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };

    render(0);

    // Si ridisegna ogni volta che il blocco rientra nel viewport.
    let visibile = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (!entry.isIntersecting) {
          visibile = false;
          return;
        }
        if (visibile) return;
        visibile = true;
        play();
      },
      { threshold: 0.2 },
    );
    observer.observe(stage);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, []);

  return (
    <div className={cn("sk-root", className)}>
      <div ref={stageRef} className="flex items-center justify-center">
        <svg
          viewBox="0 0 1600 1000"
          xmlns={NS}
          role="img"
          aria-label="Palazzo disegnato a schizzo, linea per linea"
          className="h-auto w-full"
        >
          <defs>
            <radialGradient id="sk-glow">
              <stop offset="0" stopColor="#f5e3a8" stopOpacity=".55" />
              <stop offset="1" stopColor="#f5e3a8" stopOpacity="0" />
            </radialGradient>
          </defs>
          <g ref={fillsRef} />
          <g ref={linesRef} />
        </svg>
      </div>
    </div>
  );
}
