import { Outlet, useLocation, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "motion/react"
import { slideInFromRight } from "@/lib/animations"

const STEPS = [
  { path: "/editor/onboarding/profile",     label: "Profile",     step: 1 },
  { path: "/editor/onboarding/specialties", label: "Specialties", step: 2 },
  { path: "/editor/onboarding/launch",      label: "Launch",      step: 3 },
]

export default function EditorOnboardingLayout() {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  const currentStep = STEPS.find((s) => pathname.startsWith(s.path))?.step ?? 1
  const pct = ((currentStep - 1) / (STEPS.length - 1)) * 100

  return (
    <div className="min-h-screen bg-[#121212] flex flex-col">
      <header className="px-6 py-5 flex items-center justify-between border-b border-[#2A2A2A]">
        <span className="font-heading text-base font-bold text-[#F9FAFB]">TheVideoJanitors</span>
        <span className="text-xs text-[#9CA3AF]">Step {currentStep} of {STEPS.length}</span>
      </header>

      <div className="h-0.5 bg-[#2A2A2A]">
        <motion.div
          className="h-full bg-[#FF5F15]"
          animate={{ width: `${pct}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        />
      </div>

      <div className="flex px-6 pt-4">
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
