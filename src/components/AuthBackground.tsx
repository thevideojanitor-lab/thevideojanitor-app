import { motion } from "motion/react"

type Tier = "near" | "mid" | "far"

interface Orb {
  size: number
  x: number
  y: number
  dur: number
  delay: number
  dx: number
  dy: number
  tier: Tier
}

const ORBS: Orb[] = [
  // Near — large, bright, strong glow
  { size: 30, x:  8, y: 12, dur:  9, delay:   0, dx:  14, dy:  16, tier: "near" },
  { size: 26, x: 78, y: 68, dur: 11, delay:  -3, dx: -12, dy: -14, tier: "near" },
  { size: 22, x: 14, y: 55, dur:  8, delay:  -2, dx:  16, dy: -12, tier: "near" },
  { size: 28, x: 84, y: 20, dur: 13, delay:  -5, dx: -10, dy:  14, tier: "near" },
  { size: 24, x: 48, y: 84, dur: 10, delay:  -7, dx:  12, dy: -16, tier: "near" },

  // Mid — medium, moderate glow
  { size: 14, x: 35, y: 18, dur: 15, delay:  -1, dx:  -8, dy:  10, tier: "mid" },
  { size: 12, x: 68, y: 42, dur: 12, delay:  -6, dx:  10, dy:  -8, tier: "mid" },
  { size: 16, x: 22, y: 78, dur: 17, delay:  -4, dx:  -6, dy: -10, tier: "mid" },
  { size: 10, x: 90, y: 55, dur: 13, delay:  -8, dx: -12, dy:   8, tier: "mid" },
  { size: 14, x: 55, y: 35, dur: 16, delay:  -2, dx:   8, dy:  12, tier: "mid" },
  { size: 12, x:  5, y: 38, dur: 14, delay:  -9, dx:  10, dy:  -6, tier: "mid" },
  { size: 16, x: 72, y: 87, dur: 11, delay:  -3, dx:  -8, dy: -10, tier: "mid" },
  { size: 11, x: 42, y:  6, dur: 19, delay: -12, dx:   6, dy:  10, tier: "mid" },

  // Far — tiny dots, barely there
  { size:  5, x: 25, y: 25, dur: 20, delay:  -2, dx:   6, dy:  -8, tier: "far" },
  { size:  4, x: 48, y: 52, dur: 18, delay:  -8, dx:  -6, dy:   6, tier: "far" },
  { size:  6, x: 88, y: 78, dur: 22, delay:  -3, dx:  -8, dy:  -6, tier: "far" },
  { size:  5, x: 62, y:  8, dur: 25, delay: -11, dx:   4, dy:   8, tier: "far" },
  { size:  3, x: 40, y: 72, dur: 19, delay:  -6, dx:   8, dy:  -4, tier: "far" },
  { size:  4, x: 15, y: 90, dur: 16, delay:  -9, dx:  -4, dy:   6, tier: "far" },
  { size:  6, x: 92, y: 14, dur: 21, delay: -14, dx:  -6, dy:   6, tier: "far" },
  { size:  5, x: 30, y: 45, dur: 17, delay:  -4, dx:   6, dy:   8, tier: "far" },
  { size:  4, x: 58, y: 92, dur: 23, delay:  -7, dx:  -8, dy:  -4, tier: "far" },
  { size:  3, x: 75, y: 30, dur: 24, delay: -16, dx:   6, dy:  -6, tier: "far" },
]

export default function AuthBackground() {
  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none">
      {ORBS.map((orb, i) => (
        <motion.div
          key={i}
          className={`bokeh-orb bokeh-${orb.tier}`}
          style={{
            position: "absolute",
            left: `${orb.x}%`,
            top: `${orb.y}%`,
            width: orb.size,
            height: orb.size,
            borderRadius: "50%",
            willChange: "transform",
          }}
          animate={{
            x: [0, orb.dx, orb.dx * 0.4, -orb.dx * 0.3, 0],
            y: [0, orb.dy * 0.5, orb.dy, orb.dy * 0.3, 0],
          }}
          transition={{
            duration: orb.dur,
            delay: orb.delay,
            repeat: Infinity,
            repeatType: "loop",
            ease: [0.45, 0, 0.55, 1],
          }}
        />
      ))}
    </div>
  )
}
