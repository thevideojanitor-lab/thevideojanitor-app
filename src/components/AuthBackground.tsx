import { motion } from "motion/react"

interface Frame {
  w: number
  h: number
  x: number
  y: number
  dur: number
  dx: number
  dy: number
  rot: number
}

const FRAMES: Frame[] = [
  { w: 240, h: 135, x:  5, y:  8, dur: 28, dx:  30, dy:  20, rot:  1.0 },
  { w:  88, h: 156, x: 72, y:  4, dur: 35, dx: -20, dy:  30, rot: -2.0 },
  { w: 156, h:  88, x: 50, y: 68, dur: 22, dx:  25, dy: -25, rot:  2.0 },
  { w: 130, h: 130, x: 12, y: 58, dur: 38, dx:  15, dy:  25, rot: -1.0 },
  { w: 200, h:  84, x: 28, y: 83, dur: 30, dx: -30, dy: -15, rot:  1.5 },
  { w:  80, h: 107, x: 82, y: 48, dur: 24, dx: -25, dy:  20, rot: -3.0 },
  { w: 300, h: 169, x: -4, y: 38, dur: 40, dx:  20, dy: -20, rot:  0.5 },
  { w:  60, h: 107, x: 44, y: 12, dur: 20, dx:  35, dy:  25, rot:  2.5 },
  { w: 180, h: 135, x: 62, y: 28, dur: 32, dx: -15, dy:  30, rot: -1.5 },
  { w: 120, h:  68, x: 18, y: 88, dur: 26, dx:  20, dy: -30, rot:  2.0 },
  { w:  72, h: 128, x: 90, y: 22, dur: 36, dx: -18, dy:  22, rot:  3.0 },
  { w: 220, h: 123, x: 38, y: 50, dur: 42, dx:  18, dy: -18, rot: -1.0 },
]

export default function AuthBackground() {
  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none">
      {FRAMES.map((f, i) => (
        <motion.div
          key={i}
          style={{
            position: "absolute",
            left: `${f.x}%`,
            top: `${f.y}%`,
            width: f.w,
            height: f.h,
            borderRadius: 3,
            border: "1px solid rgba(255,95,21,0.10)",
            backgroundColor: "rgba(255,95,21,0.04)",
            willChange: "transform",
          }}
          animate={{
            x: [0, f.dx, f.dx * 0.5, -f.dx * 0.3, 0],
            y: [0, f.dy * 0.4, f.dy, f.dy * 0.6, 0],
            rotate: [0, f.rot, f.rot * 0.3, -f.rot * 0.5, 0],
          }}
          transition={{
            duration: f.dur,
            repeat: Infinity,
            repeatType: "loop",
            ease: [0.45, 0, 0.55, 1],
          }}
        />
      ))}
    </div>
  )
}
