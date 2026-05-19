import { Outlet, useLocation, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "motion/react"
import { slideInFromRight } from "@/lib/animations"

const STEPS = [
  { path: "/onboarding/brand-kit",    label: "Brand Kit",   step: 1 },
  { path: "/onboarding/style",        label: "Your Style",  step: 2 },
  { path: "/onboarding/preferences",  label: "Preferences", step: 3 },
]

export default function OnboardingLayout() {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  const currentStep = STEPS.find((s) => pathname.startsWith(s.path))?.step ?? 1
  const pct = (currentStep / STEPS.length) * 100

  return (
    <div className="min-h-screen bg-[#121212] flex flex-col">
      {/* Top bar */}
      <header className="px-6 py-5 flex items-center justify-between border-b border-[#2A2A2A]">
        <span className="font-heading text-base font-bold text-[#F9FAFB]">TheVideoJanitors</span>
        <span className="text-xs text-[#9CA3AF]">Step {currentStep} of {STEPS.length}</span>
      </header>

      {/* Progress bar */}
      <div className="h-0.5 bg-[#2A2A2A]">
        <motion.div
          className="h-full bg-[#FF5F15]"
          animate={{ width: `${pct}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        />
      </div>

      {/* Step labels */}
      <div className="flex px-6 pt-4 gap-0">
        {STEPS.map((s) => (
          <button
            key={s.path}
            onClick={() => s.step < currentStep && navigate(s.path)}
            className={`flex-1 text-center text-xs font-medium transition-colors ${
              s.step === currentStep ? "text-[#FF5F15]"
              : s.step < currentStep ? "text-[#9CA3AF] cursor-pointer hover:text-[#F9FAFB]"
              : "text-[#404040] cursor-default"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Step content with AnimatePresence transition */}
      <div className="flex-1 flex items-start justify-center pt-8 px-4 overflow-hidden">
        <div className="w-full max-w-lg">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              variants={slideInFromRight}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
