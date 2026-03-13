"use client"

import { motion } from "framer-motion"

export default function LoadingCircles({ color = "bg-gray-600", size = "w-3 h-3", margin = "mx-1" }) {
  const circleVariants = {
    initial: {
      y: 0,
    },
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: 0.8,
        repeat: Number.POSITIVE_INFINITY,
        ease: "easeInOut",
      },
    },
  }

  // Create a staggered delay for each circle to create the wave effect
  const containerVariants = {
    animate: {
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  return (
    <div className="flex items-center justify-center" role="status" aria-label="Loading">
      <motion.div className="flex items-center" variants={containerVariants} initial="initial" animate="animate">
        {[0, 1, 2, 3].map((index) => (
          <motion.div key={index} className={`rounded-full ${size} ${color} ${margin}`} variants={circleVariants} />
        ))}
      </motion.div>
      <span className="sr-only">Loading</span>
    </div>
  )
}

