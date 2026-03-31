"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
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

type Status = "waiting" | "voting" | "displaying" | "completed"

export default function VotePage() {
  // Cookie support check
  const [cookiesEnabled, setCookiesEnabled] = useState(true)

  useEffect(() => {
    try {
      document.cookie = "__cookie_test=1; SameSite=Lax"
      const hasCookie = document.cookie.indexOf("__cookie_test") !== -1
      document.cookie = "__cookie_test=1; expires=Thu, 01 Jan 1970 00:00:00 GMT"
      setCookiesEnabled(hasCookie)
    } catch {
      setCookiesEnabled(false)
    }
  }, [])

  // Combined loading states
  const [isLoading, setIsLoading] = useState({
    initial: true,
    data: true,
    hasData: false
  })

  // Core state
  const [status, setStatus] = useState<Status>("waiting")
  const [displayResult, setDisplayResult] = useState({
    roundNumber: 0,
    yesVotes: 0,
    totalVotes: 0,
  })

  // Round state
  const [rounds, setRounds] = useState<Round[]>([])
  const [currentRound, setCurrentRound] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [votedRounds, setVotedRounds] = useState<number[]>([])

  // Derived display values
  const isEarlyRound = displayResult.roundNumber < 3
  const displayWinnerIndex = displayResult.yesVotes >= (displayResult.totalVotes - displayResult.yesVotes) ? 0 : 1
  const displayWinnerName = rounds[displayResult.roundNumber]?.options?.[displayWinnerIndex] || ""

  // Ref so the timer callback always sees the latest selectedOption
  const selectedOptionRef = useRef<number | null>(null)
  const currentRoundRef = useRef(currentRound)
  const statusRef = useRef(status)
  const votedRoundsRef = useRef<number[]>(votedRounds)
  const roundsRef = useRef<Round[]>(rounds)
  useEffect(() => {
    selectedOptionRef.current = selectedOption
  }, [selectedOption])
  useEffect(() => {
    currentRoundRef.current = currentRound
  }, [currentRound])
  useEffect(() => {
    statusRef.current = status
  }, [status])
  useEffect(() => {
    votedRoundsRef.current = votedRounds
  }, [votedRounds])
  useEffect(() => {
    roundsRef.current = rounds
  }, [rounds])

  const { toast } = useToast()

  // Initialize and poll data in all states so result pushes appear without refresh
  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 1000)
    return () => clearInterval(interval)
  }, [])

  // Fetch competition and rounds data
  const fetchData = async () => {
    try {
      const competitionResponse = await fetch('/api/competition')
      if (!competitionResponse.ok) throw new Error('Failed to fetch competition status')
      const competitionData = await competitionResponse.json()

      const roundsResponse = await fetch('/api/rounds')
      if (!roundsResponse.ok) throw new Error('Failed to fetch rounds data')
      const roundsData = await roundsResponse.json()
      setRounds(roundsData)

      if (competitionData.displayingResult) {
        setDisplayResult({
          roundNumber: competitionData.displayRound || 0,
          yesVotes: competitionData.displayYesVotes || 0,
          totalVotes: competitionData.displayTotalVotes || 0,
        })
        setStatus("displaying")
        setIsLoading(prev => ({ ...prev, hasData: true }))
        return
      }

      if (competitionData.ended) {
        setStatus("completed")
        toast({
          title: "比赛已结束",
          description: "投票已结束，感谢参与",
          variant: "destructive",
        })
        return
      }

      const activeRound = roundsData.find((round: Round) => round.isActive === true)

      if (activeRound?.isActive) {
        // Check in-memory state first, then fall back to server cookie check
        const alreadyVotedInMemory = votedRoundsRef.current.includes(activeRound.roundNumber)
        if (alreadyVotedInMemory) {
          setStatus("completed")
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
            setStatus("completed")
            return
          }
        }

        // Don't enter voting if admin hasn't opened it
        if (!activeRound.timeLeft || activeRound.timeLeft <= 0) {
          setStatus("waiting")
          return
        }

        // New round started — begin voting
        if (activeRound.roundNumber !== currentRoundRef.current) {
          setCurrentRound(activeRound.roundNumber)
          setStatus("voting")
          setSelectedOption(null)
          return
        }

        // Same round, already voting
        if (statusRef.current === "waiting") {
          setStatus("voting")
        }
      } else {
        // If no active round, go to waiting state
        setStatus("waiting")
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

  const handleSubmit = async (optionOverride?: number) => {
    const option = optionOverride !== undefined ? optionOverride : selectedOption
    if (option === null) {
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
          optionIndex: option,
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

  // Cookie check screen
  if (!cookiesEnabled) {
    return (
      <div className="h-screen flex flex-col items-center justify-center p-4 relative">
        <Card className="w-full max-w-md p-6 bg-black/80 backdrop-blur-sm border-white/20 relative z-10">
          <div className="text-center py-8">
            <h2 className="text-2xl font-semibold text-white mb-4">
              <span>请使用 Chrome 或 Safari 浏览器打开</span>
              <div className="text-lg text-white/60 mt-2">Please open with Chrome or Safari</div>
            </h2>
            <p className="text-white/50 mt-4">
              <span>必须允许 Cookie 才能投票</span>
              <div className="text-sm mt-1">Cookies must be enabled to vote</div>
            </p>
          </div>
        </Card>
      </div>
    )
  }

  // Loading screen
  if (isLoading.initial || isLoading.data || !isLoading.hasData) {
    return (
      <>
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


        <Card className="w-full max-w-md md:p-6 bg-transparent border-none relative z-10 mt-16">
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

          {status === "completed" && (
            <div className="text-center py-8">
              <div className="mt-[60%] flex flex-col items-center mb-10" />
              <h2 className="text-2xl font-semibold text-white mb-2">
                <span>感谢你的投票</span>
                <div className="text-2xl text-white">Thank you for your vote</div>
              </h2>
            </div>
          )}

          {status === "voting" && (
            <div className="space-y-6">
              <div className="mt-12 relative w-full px-8 h-[150px] flex items-center">
                <h2 className="absolute left-0 text-5xl font-bold text-white whitespace-pre-line">
                  <span>{rounds[currentRound]?.title || ""}</span>
                </h2>
              </div>

              <div className="mb-2">
                {currentRound < 3 && (
                  <h2 className="text-xl font-semibold text-white text-center whitespace-pre-line">
                    <div className="text-white">{rounds[currentRound]?.subtitle1 || ""}</div>
                  </h2>
                )}

                <div className="mt-3 mb-4">
                  <h3 className="text-2xl font-bold text-white text-center whitespace-pre-line">
                    <span>{rounds[currentRound]?.question || ""}</span>
                  </h3>
                </div>

                {/* Options */}
                {rounds[currentRound]?.options?.length === 1 ? (
                  /* Single-button round: one button, click = instant vote */
                  <div className="flex flex-col items-center mt-14 mb-4">
                    <div
                      className="flex flex-col items-center cursor-pointer active:scale-95"
                      onClick={() => handleSubmit(0)}
                    >
                      <div className={`w-44 h-44 rounded-full border-8 border-transparent flex items-center justify-center animate-breathe ${currentRound >= 3 ? "bg-[#FFB6C1]" : "bg-white"}`}>
                        <span className="text-black text-center text-base font-bold px-6 leading-snug whitespace-pre-line">
                          {rounds[currentRound].options[0]}
                        </span>
                      </div>
                    </div>
                    <p className="text-white/50 text-sm text-center mt-6">
                      <span>按下即投票，不按则跳过</span>
                      <div>Press to vote, or skip by waiting</div>
                    </p>
                  </div>
                ) : (
                  /* Two-option round: select then submit */
                  <>
                    <div className="space-y-3 mt-14 mb-10 font-bold">
                      <div className="flex justify-center space-x-8">
                        {rounds[currentRound]?.options?.map((option, index) => (
                          <div
                            key={index}
                            className={`flex flex-col items-center cursor-pointer transition-all duration-300 ${selectedOption === index ? "scale-150" : "scale-52"}`}
                            onClick={() => setSelectedOption(index)}
                          >
                            <div className={`w-32 h-32 rounded-full border-8 flex items-center justify-center transition-all duration-300 border-transparent ${selectedOption === index ? "bg-white" : "bg-white/70"}`}>
                              <span className="text-black text-center text-lg px-4 whitespace-pre-line">{option}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Button
                      onClick={() => handleSubmit()}
                      className="w-full bg-[#FFB6C1] hover:bg-[#FFB6C1]/80 text-black text-lg font-bold py-6"
                      disabled={selectedOption === null || status !== "voting"}
                    >
                      <span>提交投票</span>
                      <div className="text-lg">Submit Vote</div>
                    </Button>

                    {rounds[currentRound]?.note ? (
                      <div className="mt-4 text-white/40 text-xs text-center whitespace-pre-line">
                        {rounds[currentRound].note}
                      </div>
                    ) : null}
                  </>
                )}
              </div>
            </div>
          )}

          {status === "displaying" && (
            <div className="text-center py-8 flex flex-col items-center justify-center min-h-[60vh]">
              {!isEarlyRound && (
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                  <span>{rounds[displayResult.roundNumber]?.note}</span>
                </h2>
              )}

              {isEarlyRound && (
                <>
                  <h3 className="text-2xl font-bold text-white mb-8 whitespace-pre-line text-center">
                    {rounds[displayResult.roundNumber]?.question}
                  </h3>
                  <h2 className="text-xl font-semibold text-white/70 mb-1">
                    <span>获胜的是</span>
                  </h2>
                  <h2 className="text-xl font-semibold text-white/70 mb-6">
                    <span>the winner is</span>
                  </h2>
                  <div className="text-[4rem] md:text-[5rem] font-bold text-[#FFB6C1] leading-none mb-6 whitespace-pre-line text-center">
                    {displayWinnerName}
                  </div>
                </>
              )}

              {!isEarlyRound && (
                <>
                  <h2 className="text-2xl font-semibold text-white">
                    <span>获得的总票数是 </span>
                  </h2>
                  <h2 className="text-2xl font-semibold text-white mb-16">
                    <span>Receive total votes of </span>
                  </h2>
                  <div className="text-[10rem] md:text-[14rem] font-bold text-[#FFB6C1] leading-none mb-6">
                    {displayResult.totalVotes}
                  </div>
                </>
              )}
            </div>
          )}

        </Card>
      </div>
    </>
  )
}

