"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import Head from 'next/head'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { AnimatedCircle } from "@/components/animated-circle"
import LoadingCircles from "@/components/loading-circles"

interface Round {
  id?: number;
  roundNumber: number;
  title: string;
  subtitle1: string;
  question: string;
  options: string[];
  note: string;
  isActive: boolean;
  timeLeft: number;
  createdAt?: Date;
  updatedAt?: Date;
}

type Status = "waiting" | "voting" | "completed"

export default function VotePage() {
  // Combined loading states
  const [isLoading, setIsLoading] = useState({
    initial: true,
    data: true,
    hasData: false
  })

  // Core state
  const [status, setStatus] = useState<Status>("waiting")

  // Round state
  const [rounds, setRounds] = useState<Round[]>([])
  const [currentRound, setCurrentRound] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [votedRounds, setVotedRounds] = useState<number[]>([])

  // Timer state
  const [timeLeft, setTimeLeft] = useState(0)
  const [initialTime, setInitialTime] = useState(0)

  // Ref so the timer callback always sees the latest selectedOption
  const selectedOptionRef = useRef<number | null>(null)
  useEffect(() => {
    selectedOptionRef.current = selectedOption
  }, [selectedOption])

  const { toast } = useToast()

  // Initialize and poll data — only re-run when status changes, NOT timeLeft
  useEffect(() => {
    fetchData()

    if (status === "waiting" || status === "voting") {
      const interval = setInterval(fetchData, 3000)
      return () => clearInterval(interval)
    }
  }, [status])

  // Timer effect — only start/stop when status changes to/from "voting"
  useEffect(() => {
    if (status !== "voting") return

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          // Use ref to avoid stale closure
          if (selectedOptionRef.current !== null) {
            handleSubmit()
          } else {
            setStatus("waiting")
            toast({
              title: "Time's up!",
              description: "You didn't select an option in time",
              variant: "destructive",
            })
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [status])

  // Fetch competition and rounds data
  const fetchData = async () => {
    try {
      const competitionResponse = await fetch('/api/competition')
      if (!competitionResponse.ok) throw new Error('Failed to fetch competition status')
      const competitionData = await competitionResponse.json()

      if (competitionData.ended) {
        setStatus("completed")
        toast({
          title: "比赛已结束",
          description: "投票已结束，感谢参与",
          variant: "destructive",
        })
        return
      }

      const roundsResponse = await fetch('/api/rounds')
      if (!roundsResponse.ok) throw new Error('Failed to fetch rounds data')
      const roundsData = await roundsResponse.json()

      setRounds(roundsData)
      const activeRound = roundsData.find((round: Round) => round.isActive === true)

      if (activeRound?.isActive) {
        // Check in-memory state first, then fall back to server cookie check
        const alreadyVotedInMemory = votedRounds.includes(activeRound.roundNumber)
        if (alreadyVotedInMemory) {
          setStatus("waiting")
          return
        }

        // Check cookie on the server (survives page refresh)
        const cookieCheckRes = await fetch(`/api/vote-cookies/check?roundId=${activeRound.roundNumber}`)
        if (cookieCheckRes.ok) {
          const { hasVoted } = await cookieCheckRes.json()
          if (hasVoted) {
            // Sync in-memory state so we don't re-check on every poll
            setVotedRounds(prev =>
              prev.includes(activeRound.roundNumber) ? prev : [...prev, activeRound.roundNumber]
            )
            setStatus("waiting")
            return
          }
        }

        // New round started — set time once and begin voting
        if (activeRound.roundNumber !== currentRound) {
          setCurrentRound(activeRound.roundNumber)
          setTimeLeft(activeRound.timeLeft || 0)
          setInitialTime(activeRound.timeLeft || 0)
          setStatus("voting")
          setSelectedOption(null)
          return
        }

        // Same round, already voting — don't overwrite the local countdown
        if (status === "waiting") {
          setTimeLeft(activeRound.timeLeft || 0)
          setInitialTime(activeRound.timeLeft || 0)
          setStatus("voting")
        }
      } else {
        // If no active round, go to waiting state
        setStatus("waiting")
        setTimeLeft(0)
        setSelectedOption(null)
      }

      setIsLoading(prev => ({ ...prev, hasData: true }))
    } catch (error) {
      console.error('Error fetching data:', error)
      toast({
        title: "Error",
        description: "Failed to fetch data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setTimeout(() => {
        setIsLoading(prev => ({ ...prev, initial: false, data: false }))
      }, 1000)
    }
  }

  const handleSubmit = async () => {
    if (selectedOption === null) {
      toast({
        title: "未选择选项",
        description: "请在提交前选择一个选项",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roundId: currentRound,
          optionIndex: selectedOption,
          title: rounds[currentRound].title,
          subtitle1: rounds[currentRound].subtitle1,
          note: rounds[currentRound].note
        }),
      })

      if (response.ok) {
        // Add current round to voted rounds
        setVotedRounds(prev => [...prev, currentRound])

        // Clear the selected option
        setSelectedOption(null)

        // Find the next round that hasn't been voted in
        const nextRound = rounds.find(round =>
          round.roundNumber > currentRound &&
          !votedRounds.includes(round.roundNumber)
        )

        if (nextRound) {
          // If there's a next unvoted round, go to waiting state
          setStatus("waiting")
          toast({
            title: "投票已提交",
            description: "等待下一轮投票开始",
          })
        } else {
          // If no more unvoted rounds, go to completed state
          setStatus("completed")
          toast({
            title: "投票已提交",
            description: "感谢您的投票！",
          })
        }
      } else {
        const errorData = await response.json()
        toast({
          title: "提交失败",
          description: errorData.error || "提交投票时出错",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error submitting vote:', error)
      toast({
        title: "错误",
        description: "提交投票时出错",
        variant: "destructive",
      })
    }
  }

  // Loading screen
  if (isLoading.initial || isLoading.data || !isLoading.hasData) {
    return (
      <>
        <Head>
          <title>午夜分贝 MIDNIGHT DECIBEL | NYU CSSA</title>
          <link rel="icon" href="/cssa logo.png" />
        </Head>

        <div className="h-screen flex flex-col items-center justify-center p-4 relative">
          <AnimatedCircle />
          <Card className="w-full max-w-md p-4 md:p-6 bg-transparent border-none relative z-10">
            <div className="text-center py-8">
              <div className="flex flex-col items-center mb-10">
                <LoadingCircles color="bg-white" size="w-5 h-5" margin="mx-1" />
              </div>
              <h2 className="text-2xl font-semibold text-white mb-2">
                <span>Loading...</span>
                <div className="text-2xl text-white">加载中...</div>
              </h2>
            </div>
          </Card>
        </div>
      </>
    )
  }

  // Main content
  return (
    <>
      <Head>
        <title>午夜分贝 MIDNIGHT DECIBEL | NYU CSSA</title>
        <link rel="icon" href="/cssa-logo.png" />
      </Head>

      <div className="w-screen flex flex-col items-center justify-center p-8 relative overflow-hidden">

        <AnimatedCircle />

        <div className="fixed top-0 left-0 right-0 flex items-center justify-center gap-4 py-4 z-20">
          <img src="/cssa-logo.png" alt="NYU CSSA" className="h-8 w-auto" />
          <h1 className="text-sm font-bold text-violet-500">
            NYUCSSA
          </h1>
        </div>

        <div className="fixed top-10 left-0 right-0 flex items-center justify-center gap-4 py-4 z-20">
          <img src="/ac-logo.png" alt="NYU CSSA" className="h-8 w-auto" />
        </div>


        <Card className="w-full max-w-md md:p-6 bg-transparent border-none relative z-10">
          {status === "waiting" && (
            <div className="text-center py-8">
              <div className="mt-[60%] flex flex-col items-center mb-10">
                <LoadingCircles color="bg-white" size="w-5 h-5" margin="mx-1" />
              </div>
              <h2 className="text-2xl font-semibold text-white mb-2">
                <span>等待投票开始</span>
                <div className="text-2xl text-white">Waiting for voting to start</div>
              </h2>
            </div>
          )}

          {status === "voting" && (
            <div className="space-y-6">
              <div className="mt-12 relative w-full px-8 h-[150px] flex items-center">
                <h2 className="absolute left-0 text-5xl font-bold text-white">
                  <span>{rounds[currentRound]?.title || ""}</span>
                </h2>
                <div className="absolute right-[-40px] bg-transparent rounded-lg p-3">
                  <div className="text-[200px] font-bold text-white/40 leading-none">{timeLeft}</div>
                </div>
              </div>

              <div className="mb-2">
                <h2 className="text-xl font-semibold text-white text-center">
                  <div className="text-white">{rounds[currentRound]?.subtitle1 || ""}</div>
                </h2>

                <div className="mb-2">
                  <h3 className="text-md font-normal text-white text-center">
                    <span>{rounds[currentRound]?.question || ""}</span>
                  </h3>
                </div>

                <div className="mt-2 bg-transparent rounded-lg mb-2">
                  <div className="text-4xl text-center font-bold text-white">
                    <span>{rounds[currentRound].note}</span>
                  </div>
                </div>

                {/* Options */}
                <div className="space-y-3 mt-10 mb-8 font-bold">
                  <div className="flex justify-center space-x-8">
                    {rounds[currentRound]?.options?.map((option, index) => (
                      <div
                        key={index}
                        className={`flex flex-col items-center cursor-pointer transition-all duration-300 ${selectedOption === index ? "scale-150" : "scale-52"
                          }`}
                        onClick={() => setSelectedOption(index)}
                      >
                        <div className={`w-24 h-24 rounded-full border-8 flex items-center justify-center transition-all duration-300 border-transparent ${selectedOption === index ? "bg-white" : "bg-white/70"}`}>

                          <span className="text-orange-600 text-center text-lg px-4">{option}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>


              </div>

              <Button
                onClick={handleSubmit}
                className="w-full bg-white text-orange-600 text-lg font-bold py-6"
                disabled={selectedOption === null || status !== "voting"}
              >
                <span>提交投票</span>
                <div className="text-lg">Submit Vote</div>
              </Button>
            </div>
          )}

        </Card>
      </div>
    </>
  )
}

