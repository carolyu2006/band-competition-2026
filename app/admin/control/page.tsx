"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import dynamic from "next/dynamic"
const QRCodeSVG = dynamic(() => import("qrcode.react").then(m => m.QRCodeSVG), { ssr: false })
import { Textarea } from "@/components/ui/textarea"

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
  createdAt?: Date
  updatedAt?: Date
}

export default function ControlPage() {
  const [currentRound, setCurrentRound] = useState(0)
  const [isVotingActive, setIsVotingActive] = useState(false)
  const [rounds, setRounds] = useState<Round[]>([
    {
      roundNumber: 0,
      title: "午夜分贝\nMIDNIGHT DECIBEL",
      subtitle1: "二选一\nChoose One",
      question: "给现在或未来的自己唱什么?\nWhat would you sing to your present or future self?",
      options: ["Nihiloom", "Drifter Corp"],
      note: "你的选择将关乎乐队是否能在第二轮演奏，请谨慎考虑！\nYour vote determines whether a band advances to Round 2-choose wisely!",
      isActive: false,
      timeLeft: 0,
    },
    {
      roundNumber: 1,
      title: "午夜分贝\nMIDNIGHT DECIBEL",
      subtitle1: "二选一\nChoose One",
      question: "世界明天毁灭你会唱什么?\nWhat would you sing if the world ends tomorrow?",
      options: ["CHICHICHI", "Moonlight"],
      note: "你的选择将关乎乐队是否能在第二轮演奏，请谨慎考虑！\nYour vote determines whether a band advances to Round 2-choose wisely!",
      isActive: false,
      timeLeft: 0,
    },
    {
      roundNumber: 2,
      title: "午夜分贝\nMIDNIGHT DECIBEL",
      subtitle1: "二选一\nChoose One",
      question: "台下全是前任你会唱什么?\nWhat would you sing if all your exes were in the audience?",
      options: ["S!mons", "余温\nLume"],
      note: "你的选择将关乎乐队是否能在第二轮演奏，请谨慎考虑！\nYour vote determines whether a band advances to Round 2-choose wisely!",
      isActive: false,
      timeLeft: 0,
    },
    {
      roundNumber: 3,
      title: "决赛轮\nFINAL ROUND",
      subtitle1: "你是否想为Drifter Corp.投票\nDo you want to vote for Drifter Corp.?",
      question: "你是否想为Drifter Corp.投票\nDo you want to vote for Drifter Corp.?",
      options: ["为这支乐队投票\nVote for this band"],
      note: "Drifter Corp.",
      isActive: false,
      timeLeft: 0,
    },
    {
      roundNumber: 4,
      title: "决赛轮\nFINAL ROUND",
      subtitle1: "你是否想为Moonlight荷塘小炒投票\nDo you want to vote for Moonlight荷塘小炒?",
      question: "你是否想为Moonlight荷塘小炒投票\nDo you want to vote for Moonlight荷塘小炒?",
      options: ["为这支乐队投票\nVote for this band"],
      note: "Moonlight荷塘小炒",
      isActive: false,
      timeLeft: 0,
    },
    {
      roundNumber: 5,
      title: "决赛轮\nFINAL ROUND",
      subtitle1: "你是否想为余温Lume投票\nDo you want to vote for 余温Lume?",
      question: "你是否想为余温Lume投票\nDo you want to vote for 余温Lume?",
      options: ["为这支乐队投票\nVote for this band"],
      note: "余温Lume",
      isActive: false,
      timeLeft: 0,
    },
  ])
  const [votes, setVotes] = useState<number[][]>([])
  const [baseUrl, setBaseUrl] = useState("")
  const { toast } = useToast()

  // Initialize data
  useEffect(() => {
    setBaseUrl(window.location.origin + "/")

    const initializeRounds = async () => {
      try {
        const response = await fetch("/api/rounds")
        if (response.ok) {
          const roundsData = await response.json()

          if (roundsData.length === 0) {
            const defaultRounds = [
              {
                roundNumber: 0,
                title: "午夜分贝\nMIDNIGHT DECIBEL",
                subtitle1: "二选一\nChoose One",
                question: "给现在或未来的自己唱什么?\nWhat would you sing to your present or future self?",
                options: ["Nihiloom", "Drifter Corp"],
                note: "你的选择将关乎乐队是否能在第二轮演奏，请谨慎考虑！\nYour vote determines whether a band advances to Round 2-choose wisely!",
                isActive: false,
                timeLeft: 0,
              },
              {
                roundNumber: 1,
                title: "午夜分贝\nMIDNIGHT DECIBEL",
                subtitle1: "二选一\nChoose One",
                question: "世界明天毁灭你会唱什么?\nWhat would you sing if the world ends tomorrow?",
                options: ["CHICHICHI", "Moonlight"],
                note: "你的选择将关乎乐队是否能在第二轮演奏，请谨慎考虑！\nYour vote determines whether a band advances to Round 2-choose wisely!",
                isActive: false,
                timeLeft: 0,
              },
              {
                roundNumber: 2,
                title: "午夜分贝\nMIDNIGHT DECIBEL",
                subtitle1: "二选一\nChoose One",
                question: "台下全是前任你会唱什么?\nWhat would you sing if all your exes were in the audience?",
                options: ["S!mons", "余温\nLume"],
                note: "你的选择将关乎乐队是否能在第二轮演奏，请谨慎考虑！\nYour vote determines whether a band advances to Round 2-choose wisely!",
                isActive: false,
                timeLeft: 0,
              },
              {
                roundNumber: 3,
                title: "终章审判\nFINAL JUDGEMENT",
                subtitle1: "你的一票决定今夜王座归属\nYour vote decides tonight's throne!",
                question: "你是否想为这支乐队投票\nDo you want to vote for this band?",
                options: ["为这支乐队投票\nVote for this band"],
                note: "乐队A",
                isActive: false,
                timeLeft: 0,
              },
              {
                roundNumber: 4,
                title: "终章审判\nFINAL JUDGEMENT",
                subtitle1: "你的一票决定今夜王座归属\nYour vote decides tonight's throne!",
                question: "你是否想为这支乐队投票\nDo you want to vote for this band?",
                options: ["为这支乐队投票\nVote for this band"],
                note: "乐队B",
                isActive: false,
                timeLeft: 0,
              },
              {
                roundNumber: 5,
                title: "终章审判\nFINAL JUDGEMENT",
                subtitle1: "你的一票决定今夜王座归属\nYour vote decides tonight's throne!",
                question: "你是否想为这支乐队投票\nDo you want to vote for this band?",
                options: ["为这支乐队投票\nVote for this band"],
                note: "乐队C",
                isActive: false,
                timeLeft: 0,
              },
            ]

            for (const round of defaultRounds) {
              await fetch("/api/rounds", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(round),
              })
            }

            setRounds(defaultRounds)
          } else {
            setRounds(roundsData)
          }
        }
      } catch (error) {
        console.error("Error initializing rounds:", error)
      }
    }

    const fetchVotesFromAPI = async () => {
      try {
        const votesArray: number[][] = Array.from({ length: 6 }, () => [0, 0])
        for (let roundId = 0; roundId < 6; roundId++) {
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

    initializeRounds()
    fetchVotesFromAPI()
  }, [])

  const startVoting = async () => {
    try {
      await fetch("/api/display-result", { method: "DELETE" })

      const response = await fetch("/api/rounds", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roundNumber: currentRound,
          isActive: true,
          timeLeft: 99999,
        }),
      })

      if (response.ok) {
        setIsVotingActive(true)
        toast({ title: "Voting started", description: `Round ${currentRound + 1} is now active` })
      } else {
        toast({ title: "Error", description: "Failed to start voting", variant: "destructive" })
      }
    } catch (error) {
      console.error("Error starting voting:", error)
      toast({ title: "Error", description: "Failed to start voting", variant: "destructive" })
    }
  }

  const endVoting = async () => {
    try {
      const response = await fetch("/api/rounds", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roundNumber: currentRound,
          isActive: false,
          timeLeft: 0,
        }),
      })

      if (response.ok) {
        setIsVotingActive(false)
        toast({ title: "Voting ended", description: `Round ${currentRound + 1} has ended` })

      } else {
        toast({ title: "Error", description: "Failed to end voting", variant: "destructive" })
      }
    } catch (error) {
      console.error("Error ending voting:", error)
      toast({ title: "Error", description: "Failed to end voting", variant: "destructive" })
    }
  }

  const nextRound = () => {
    if (isVotingActive) {
      toast({ title: "Cannot change round", description: "End voting first", variant: "destructive" })
      return
    }
    if (currentRound < 5) {
      setCurrentRound(currentRound + 1)
    }
  }

  const previousRound = () => {
    if (isVotingActive) {
      toast({ title: "Cannot change round", description: "End voting first", variant: "destructive" })
      return
    }
    if (currentRound > 0) {
      setCurrentRound(currentRound - 1)
    }
  }

  const updateOption = async (roundIndex: number, optionIndex: number, value: string) => {
    const newRounds = [...rounds]
    newRounds[roundIndex].options[optionIndex] = value
    setRounds(newRounds)

    try {
      await fetch("/api/rounds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roundNumber: roundIndex,
          title: rounds[roundIndex].title,
          subtitle1: rounds[roundIndex].subtitle1,
          question: rounds[roundIndex].question,
          options: newRounds[roundIndex].options,
          note: rounds[roundIndex].note,
          isActive: !!newRounds[roundIndex].isActive,
          timeLeft: newRounds[roundIndex].timeLeft || 0,
        }),
      })
    } catch (error) {
      console.error("Error updating option:", error)
    }
  }

  const updateQuestion = async (roundIndex: number, value: string) => {
    const newRounds = [...rounds]
    newRounds[roundIndex].question = value
    setRounds(newRounds)

    try {
      await fetch("/api/rounds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roundNumber: roundIndex,
          title: rounds[roundIndex].title,
          subtitle1: rounds[roundIndex].subtitle1,
          question: value,
          options: newRounds[roundIndex].options,
          note: rounds[roundIndex].note,
          isActive: !!newRounds[roundIndex].isActive,
          timeLeft: newRounds[roundIndex].timeLeft || 0,
        }),
      })
    } catch (error) {
      console.error("Error updating question:", error)
    }
  }

  const resetVotes = async () => {
    if (isVotingActive) {
      toast({ title: "Cannot reset", description: "End voting first", variant: "destructive" })
      return
    }

    try {
      const response = await fetch("/api/votes", { method: "DELETE" })

      if (response.ok) {
        const newVotes = [...votes]
        newVotes[currentRound] = [0, 0]
        setVotes(newVotes)
        toast({ title: "Votes reset", description: "All votes have been reset" })
      } else {
        toast({ title: "Error", description: "Failed to reset votes", variant: "destructive" })
      }
    } catch (error) {
      console.error("Error resetting votes:", error)
      toast({ title: "Error", description: "Failed to reset votes", variant: "destructive" })
    }
  }

  const sendResult = async () => {
    const optionA = rounds[currentRound]?.options?.[0] || ""
    const optionB = rounds[currentRound]?.options?.[1] || ""
    const yesIndex = optionA.toLowerCase() === "yes" ? 0 : optionB.toLowerCase() === "yes" ? 1 : 0
    const yesVotes = votes[currentRound]?.[yesIndex] || 0
    const totalVotes = (votes[currentRound]?.[0] || 0) + (votes[currentRound]?.[1] || 0)

    try {
      const response = await fetch("/api/display-result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roundNumber: currentRound,
          yesVotes,
          totalVotes,
        }),
      })

      if (response.ok) {
        toast({ title: "Result sent", description: "Voter screen is now displaying the result" })
      } else {
        toast({ title: "Error", description: "Failed to send result", variant: "destructive" })
      }
    } catch (error) {
      console.error("Error sending result:", error)
      toast({ title: "Error", description: "Failed to send result", variant: "destructive" })
    }
  }

  const hideResult = async () => {
    try {
      const response = await fetch("/api/display-result", { method: "DELETE" })
      if (response.ok) {
        toast({ title: "Result hidden", description: "Voter screen returned to normal flow" })
      } else {
        toast({ title: "Error", description: "Failed to hide result", variant: "destructive" })
      }
    } catch (error) {
      console.error("Error hiding result:", error)
      toast({ title: "Error", description: "Failed to hide result", variant: "destructive" })
    }
  }

  // Fetch votes periodically
  useEffect(() => {
    const fetchVotesFromAPI = async () => {
      try {
        const votesArray: number[][] = Array.from({ length: 6 }, () => [0, 0])
        for (let roundId = 0; roundId < 6; roundId++) {
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

    const interval = setInterval(fetchVotesFromAPI, 1000)
    return () => clearInterval(interval)
  }, [])

  const clearVoteCookiesForThisBrowser = async () => {
    try {
      const response = await fetch("/api/vote-cookies/clear", { method: "POST" })
      if (response.ok) {
        toast({ title: "Cookies cleared", description: "Vote cookies have been cleared" })
      } else {
        toast({ title: "Error", description: "Failed to clear cookies", variant: "destructive" })
      }
    } catch (error) {
      console.error("Error clearing vote cookies:", error)
      toast({ title: "Error", description: "Failed to clear cookies", variant: "destructive" })
    }
  }

  return (
    <div className="min-h-screen">
      {/* Top nav */}
      <nav className="border-b border-white/10 bg-black/50 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="text-white/40 hover:text-white/70 text-sm transition-colors">
              Dashboard
            </Link>
            <span className="text-[#FFB6C1] font-semibold">Control Panel</span>
          </div>
          <Link href="/admin/results">
            <Button variant="ghost" size="sm" className="text-white/50 hover:text-[#FFB6C1] hover:bg-[#FFB6C1]/10">
              Results
            </Button>
          </Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-[180px_1fr_1fr] gap-5">
          {/* Left column: All rounds + Settings */}
          <div className="space-y-6">
            <div className="text-[#FFB6C1] text-xs font-semibold uppercase tracking-wider mb-3">Rounds</div>
            <div className="space-y-1.5">
              {rounds.map((round, i) => {
                const total = (votes[i]?.[0] || 0) + (votes[i]?.[1] || 0)
                return (
                  <button
                    key={i}
                    onClick={() => {
                      if (!isVotingActive) setCurrentRound(i)
                    }}
                    disabled={isVotingActive}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-all text-sm ${
                      i === currentRound
                        ? "bg-[#FFB6C1]/15 border border-[#FFB6C1]/30"
                        : "bg-white/5 border border-transparent hover:bg-white/10"
                    } ${isVotingActive ? "cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-white/70 font-medium">R{i + 1}</span>
                      <span className="text-white/30 text-xs">{total}</span>
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="border-t border-white/10 pt-4 space-y-1.5">
              <Button
                onClick={clearVoteCookiesForThisBrowser}
                variant="ghost"
                size="sm"
                className="w-full text-white/40 hover:text-white hover:bg-white/10 justify-start text-xs"
              >
                Clear Cookies
              </Button>
              <Button
                onClick={() => {
                  fetch("/api/reset", { method: "POST" })
                    .then((response) => {
                      if (response.ok) {
                        setVotes(Array.from({ length: 6 }, () => [0, 0]))
                        toast({ title: "Reset complete", description: "All data has been reset" })
                      }
                    })
                    .catch((error) => {
                      console.error("Error resetting data:", error)
                      toast({ title: "Error", description: "Failed to reset", variant: "destructive" })
                    })
                }}
                variant="ghost"
                size="sm"
                className="w-full text-red-400/50 hover:text-red-400 hover:bg-red-400/10 justify-start text-xs"
              >
                Reset All Data
              </Button>
              <Button
                onClick={() => {
                  fetch("/api/rounds", { method: "PUT" })
                    .then((response) => {
                      if (response.ok) {
                        window.location.reload()
                        toast({ title: "Rounds reinitialized", description: "Round config reset to defaults" })
                      }
                    })
                    .catch((error) => {
                      console.error("Error reinitializing rounds:", error)
                      toast({ title: "Error", description: "Failed to reinitialize rounds", variant: "destructive" })
                    })
                }}
                variant="ghost"
                size="sm"
                className="w-full text-orange-400/50 hover:text-orange-400 hover:bg-orange-400/10 justify-start text-xs"
              >
                Reinitialize Round Config
              </Button>
            </div>
          </div>

          {/* Middle column: Voting control + Live Votes + QR */}
          <div className="space-y-6">
            {/* Voting control */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-[#FFB6C1] text-lg">Voting Control</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  {isVotingActive ? (
                    <Button onClick={endVoting} className="flex-1 bg-red-500/80 hover:bg-red-500 text-white">
                      End Voting
                    </Button>
                  ) : (
                    <Button onClick={startVoting} className="flex-1 bg-[#FFB6C1] hover:bg-[#FFB6C1]/80 text-black font-semibold">
                      Start Voting
                    </Button>
                  )}
                </div>

                <Button
                  onClick={resetVotes}
                  variant="ghost"
                  size="sm"
                  className="w-full text-red-400/60 hover:text-red-400 hover:bg-red-400/10"
                  disabled={isVotingActive}
                >
                  Reset All Votes
                </Button>

                <Button
                  onClick={sendResult}
                  className="w-full bg-[#FFB6C1] hover:bg-[#FFB6C1]/80 text-black font-semibold"
                  disabled={isVotingActive}
                >
                  Send Result
                </Button>

                <Button
                  onClick={hideResult}
                  variant="ghost"
                  size="sm"
                  className="w-full text-white/60 hover:text-white hover:bg-white/10"
                >
                  Hide Result
                </Button>
              </CardContent>
            </Card>

            {/* Live votes */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-[#FFB6C1] text-lg">Live Votes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {rounds[currentRound]?.options?.map((option, i) => {
                  const total = (votes[currentRound]?.[0] || 0) + (votes[currentRound]?.[1] || 0)
                  const count = votes[currentRound]?.[i] || 0
                  const pct = total > 0 ? Math.round((count / total) * 100) : 0
                  return (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-white/70">{option}</span>
                        <span className="text-white font-medium">{count} ({pct}%)</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#FFB6C1] rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
                <div className="text-white/30 text-xs text-center pt-1">
                  Total: {(votes[currentRound]?.[0] || 0) + (votes[currentRound]?.[1] || 0)} votes
                </div>
              </CardContent>
            </Card>

            {/* QR Code */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-[#FFB6C1] text-lg">QR Code</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <div className="bg-white p-3 rounded-lg mb-3">
                  <QRCodeSVG value={baseUrl} size={160} />
                </div>
                <p className="text-white/30 text-xs font-mono">{baseUrl}</p>
              </CardContent>
            </Card>
          </div>

          {/* Middle column: Question setup */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-[#FFB6C1] text-lg">
                Round {currentRound + 1} Setup
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-white/40 mb-1">Title</label>
                <Input
                  value={rounds[currentRound].title}
                  onChange={(e) => {
                    const updatedRounds = [...rounds]
                    updatedRounds[currentRound].title = e.target.value
                    setRounds(updatedRounds)
                  }}
                  className="bg-white/5 border-white/10 text-white"
                  disabled={isVotingActive}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white/40 mb-1">Subtitle</label>
                <Input
                  value={rounds[currentRound].subtitle1}
                  onChange={(e) => {
                    const updatedRounds = [...rounds]
                    updatedRounds[currentRound].subtitle1 = e.target.value
                    setRounds(updatedRounds)
                  }}
                  className="bg-white/5 border-white/10 text-white"
                  disabled={isVotingActive}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white/40 mb-1">Question</label>
                <Input
                  value={rounds[currentRound].question}
                  onChange={(e) => updateQuestion(currentRound, e.target.value)}
                  className="bg-white/5 border-white/10 text-white"
                  disabled={isVotingActive}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-white/40 mb-1">Option A</label>
                  <Input
                    value={rounds[currentRound].options[0]}
                    onChange={(e) => updateOption(currentRound, 0, e.target.value)}
                    className="bg-white/5 border-white/10 text-white"
                    disabled={isVotingActive}
                  />
                </div>
                {rounds[currentRound].options.length > 1 && (
                  <div>
                    <label className="block text-xs font-medium text-white/40 mb-1">Option B</label>
                    <Input
                      value={rounds[currentRound].options[1]}
                      onChange={(e) => updateOption(currentRound, 1, e.target.value)}
                      className="bg-white/5 border-white/10 text-white"
                      disabled={isVotingActive}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-white/40 mb-1">Note</label>
                <Textarea
                  value={rounds[currentRound].note}
                  onChange={(e) => {
                    const updatedRounds = [...rounds]
                    updatedRounds[currentRound].note = e.target.value
                    if (currentRound >= 3) {
                      const bandName = e.target.value
                      const generated = `你是否想为${bandName}投票\nDo you want to vote for ${bandName}?`
                      updatedRounds[currentRound].question = generated
                      updatedRounds[currentRound].subtitle1 = generated
                    }
                    setRounds(updatedRounds)
                  }}
                  className="bg-white/5 border-white/10 text-white min-h-[80px]"
                  disabled={isVotingActive}
                />
              </div>

              <Button
                onClick={() => {
                  fetch("/api/rounds", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      roundNumber: currentRound,
                      title: rounds[currentRound].title,
                      subtitle1: rounds[currentRound].subtitle1,
                      question: rounds[currentRound].question,
                      options: rounds[currentRound].options,
                      note: rounds[currentRound].note,
                      isActive: isVotingActive,
                      timeLeft: isVotingActive ? 99999 : 0,
                    }),
                  })
                    .then((response) => {
                      if (response.ok) {
                        toast({ title: "Saved", description: "Round settings updated" })
                      }
                    })
                    .catch((error) => {
                      console.error("Error updating question:", error)
                      toast({ title: "Error", description: "Failed to save", variant: "destructive" })
                    })
                }}
                className="w-full bg-[#FFB6C1] hover:bg-[#FFB6C1]/80 text-black font-semibold"
                disabled={isVotingActive}
              >
                Save Changes
              </Button>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}
