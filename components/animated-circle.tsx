import React from 'react'

interface AnimatedCircleProps {
  className?: string
}

export function AnimatedCircle({ className = '' }: AnimatedCircleProps) {
  return (
    <div className="fixed inset-0 overflow-hidden z-[-1] pointer-events-none">
      {/* First circle - moves in a circular pattern */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-orange-600/80 blur-3xl animate-float-1" style={{ left: '20%', top: '30%' }}>
        <style jsx>{`
          @keyframes float1 {
            0% {
              transform: translate(0, 0) rotate(0deg);
            }
            25% {
              transform: translate(200px, 50px) rotate(90deg);
            }
            50% {
              transform: translate(400px, 0) rotate(180deg);
            }
            75% {
              transform: translate(200px, -50px) rotate(270deg);
            }
            100% {
              transform: translate(0, 0) rotate(360deg);
            }
          }
          .animate-float-1 {
            animation: float1 20s infinite ease-in-out;
          }
        `}</style>
      </div>

      {/* Second circle - moves in a figure-8 pattern */}
      <div className="absolute w-[400px] h-[400px] rounded-full bg-orange-600/80 blur-3xl animate-float-2" style={{ left: '80%', top: '10%' }}>
        <style jsx>{`
          @keyframes float2 {
            0% {
              transform: translate(0, 0) rotate(0deg);
            }
            25% {
              transform: translate(-300px, -50px) rotate(90deg);
            }
            50% {
              transform: translate(-600px, 0) rotate(180deg);
            }
            75% {
              transform: translate(-300px, 50px) rotate(270deg);
            }
            100% {
              transform: translate(0, 0) rotate(360deg);
            }
          }
          .animate-float-2 {
            animation: float2 15s infinite ease-in-out;
          }
        `}</style>
      </div>

      {/* Third circle - moves in a wave pattern */}
      <div className="absolute w-[400px] h-[400px] rounded-full bg-yellow-500/70 blur-3xl animate-float-3" style={{ left: '60%', top: '40%' }}>
        <style jsx>{`
          @keyframes float3 {
            0% {
              transform: translate(0, 0) rotate(0deg);
            }
            25% {
              transform: translate(200px, -50px) rotate(90deg);
            }
            50% {
              transform: translate(400px, 0) rotate(180deg);
            }
            75% {
              transform: translate(200px, 50px) rotate(270deg);
            }
            100% {
              transform: translate(0, 0) rotate(360deg);
            }
          }
          .animate-float-3 {
            animation: float3 20s infinite ease-in-out;
          }
        `}</style>
      </div>

      {/* Fourth circle - moves in a spiral pattern */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-amber-400/60 blur-3xl animate-float-4" style={{ left: '30%', top: '10%' }}>
        <style jsx>{`
          @keyframes float4 {
            0% {
              transform: translate(0, 0) rotate(0deg) scale(1);
            }
            25% {
              transform: translate(300px, -50px) rotate(90deg) scale(1.2);
            }
            50% {
              transform: translate(600px, 0) rotate(180deg) scale(1);
            }
            75% {
              transform: translate(300px, 50px) rotate(270deg) scale(0.8);
            }
            100% {
              transform: translate(0, 0) rotate(360deg) scale(1);
            }
          }
          .animate-float-4 {
            animation: float4 10s infinite ease-in-out;
          }
        `}</style>
      </div>
    </div>
  )
} 