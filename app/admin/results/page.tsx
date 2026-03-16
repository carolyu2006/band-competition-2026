"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "@/components/ui/chart"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface Round {
  id?: number
  roundNumber: number
  title: string
  subtitle1: string
  question: string
  options: string[]
  note: string
  isActive: boolean
  timeLeft: number
}

export default function ResultsPage() {
  const [rounds, setRounds] = useState<Round[]>([])
  const [votes, setVotes] = useState<number[][]>([])
  const [selectedRound, setSelectedRound] = useState(0)

  useEffect(() => {
    const fetchRounds = async () => {
      try {
        const response = await fetch("/api/rounds")
        if (response.ok) {
          const data = await response.json()
          setRounds(data)
        }
      } catch (error) {
        console.error("Error fetching rounds:", error)
      }
    }

    fetchRounds()
  }, [])

  useEffect(() => {
    const fetchVotes = async () => {
      try {
        const votesArray: number[][] = Array.from({ length: 9 }, () => [0, 0])
        for (let roundId = 0; roundId < 9; roundId++) {
          const response = await fetch(`/api/votes/${roundId}`)
          if (response.ok) {
            const data = await response.json()
            if (data.results) {
              votesArray[roundId] = [data.results[0] || 0, data.results[1] || 0]
            }
          }
        }
        setVotes(votesArray)
      } catch (error) {
        console.error("Error fetching votes:", error)
      }
    }

    const interval = setInterval(fetchVotes, 1000)
    fetchVotes()
    return () => clearInterval(interval)
  }, [])

  const round = selectedRound
  const total = votes[round] ? votes[round][0] + votes[round][1] : 0
  const optA = rounds[round]?.options?.[0] || "Option A"
  const optB = rounds[round]?.options?.[1] || "Option B"
  const votesA = votes[round]?.[0] || 0
  const votesB = votes[round]?.[1] || 0
  const pctA = total > 0 ? Math.round((votesA / total) * 100) : 0
  const pctB = total > 0 ? Math.round((votesB / total) * 100) : 0
  const leader = votesA === votesB ? "Tie" : votesA > votesB ? optA : optB

  return (
    <div className="min-h-screen">
      {/* Top nav */}
      <nav className="border-b border-white/10 bg-black/50 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="text-white/40 hover:text-white/70 text-sm transition-colors">
              Dashboard
            </Link>
            <span className="text-[#FFB6C1] font-semibold">Results</span>
          </div>
          <Link href="/admin/control">
            <Button variant="ghost" size="sm" className="text-white/50 hover:text-[#FFB6C1] hover:bg-[#FFB6C1]/10">
              Control Panel
            </Button>
          </Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto p-6">
        <div className="flex gap-6">
          {/* Left sidebar: round selector */}
          <div className="flex flex-col gap-4 w-16 shrink-0">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <button
                key={i}
                onClick={() => setSelectedRound(i)}
                className={`py-3 px-2 rounded-lg text-sm font-medium transition-all ${
                  i === selectedRound
                    ? "bg-[#FFB6C1]/20 text-[#FFB6C1] border border-[#FFB6C1]/30"
                    : "bg-white/5 text-white/40 border border-transparent hover:bg-white/10 hover:text-white/60"
                }`}
              >
                R{i + 1}
              </button>
            ))}
          </div>

          {/* Right content: results for selected round */}
          <div className="flex-1 space-y-6">
            {/* Round info */}
            <div>
              <h2 className="text-xl font-bold text-white">
                {rounds[round]?.subtitle1 || ""}
              </h2>
              <div className="text-white/40 text-sm mt-1">
                {optA} vs {optB}
              </div>
            </div>

            {/* Chart */}
            <div className="h-[500px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { name: optA, votes: votesA },
                    { name: optB, votes: votesB },
                  ]}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                  <XAxis dataKey="name" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#111", borderColor: "#333", borderRadius: "8px" }}
                    labelStyle={{ color: "#fff" }}
                  />
                  <Bar dataKey="votes" fill="#FFB6C1" name="Votes" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 p-3 rounded-lg">
                <div className="text-white/40 text-xs">Total Votes</div>
                <p className="text-xl font-bold text-white">{total}</p>
              </div>
              <div className="bg-white/5 p-3 rounded-lg">
                <div className="text-white/40 text-xs">Leading</div>
                <p className="text-xl font-bold text-[#FFB6C1]">{leader}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
