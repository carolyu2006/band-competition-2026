"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "@/components/ui/chart"
import { QRCodeSVG } from "qrcode.react"
import { Textarea } from "@/components/ui/textarea"
import { LayoutDashboard, List } from "lucide-react"

// Define interfaces for our data types
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

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [currentRound, setCurrentRound] = useState(0)
  const [isVotingActive, setIsVotingActive] = useState(false)
  const [timeLeft, setTimeLeft] = useState(60)
  const [initialTime, setInitialTime] = useState(60)
  const [rounds, setRounds] = useState<Round[]>([
    {
      roundNumber: 0,
      title: "午夜分贝 MIDNIGHT DECIBEL",
      subtitle1: "二选一•Choose One",
      question: "你更喜欢谁的演出？\nWhich performance do you prefer?",
      options: ["余温乐队 Yuwen", "Moonlight"],
      note: "你的选择将关乎乐队是否能在第二轮演奏，请谨慎考虑！\nYour vote determines whether a band advances to Round 2-choose wisely!",
      isActive: false,
      timeLeft: 0,
    },
    {
      roundNumber: 1,
      title: "午夜分贝 MIDNIGHT DECIBEL",
      subtitle1: "二选一•Choose One",
      question: "你更喜欢谁的演出？\nWhich performance do you prefer?",
      options: ["蓝色渐进 Asym-bLu", "Accord"],
      note: "你的选择将关乎乐队是否能在第二轮演奏，请谨慎考虑！\nYour vote determines whether a band advances to Round 2-choose wisely!",
      isActive: false,
      timeLeft: 0,
    },
    {
      roundNumber: 2,
      title: "午夜分贝 MIDNIGHT DECIBEL",
      subtitle1: "二选一•Choose One",
      question: "你更喜欢谁的演出？\nWhich performance do you prefer?",
      options: ["余温乐队 Yuwen", "蓝色渐进 Asym-bLu"],
      note: "你的选择将关乎乐队是否能在第二轮演奏，请谨慎考虑！\nYour vote determines whether a band advances to Round 2-choose wisely!",
      isActive: false,
      timeLeft: 0,
    },
    {
      roundNumber: 3,
      title: "午夜分贝 MIDNIGHT DECIBEL",
      subtitle1: "二选一•Choose One",
      question: "你更喜欢谁的演出？\nWhich performance do you prefer?",
      options: ["Moonlight", "Accord"],
      note: "你的选择将关乎乐队是否能在第二轮演奏，请谨慎考虑！\nYour vote determines whether a band advances to Round 2-choose wisely!",
      isActive: false,
      timeLeft: 0,
    },
    {
      roundNumber: 4,
      title: "午夜分贝 MIDNIGHT DECIBEL",
      subtitle1: "二选一•Choose One",
      question: "你更喜欢谁的演出？\nWhich performance do you prefer?",
      options: ["余温乐队 Yuwen", "Accord"],
      note: "你的选择将关乎乐队是否能在第二轮演奏，请谨慎考虑！\nYour vote determines whether a band advances to Round 2-choose wisely!",
      isActive: false,
      timeLeft: 0,
    },
    {
      roundNumber: 5,
      title: "午夜分贝 MIDNIGHT DECIBEL",
      subtitle1: "二选一•Choose One",
      question: "你更喜欢谁的演出？\nWhich performance do you prefer?",
      options: ["Moonlight", "蓝色渐进 Asym-bLu"],
      note: "你的选择将关乎乐队是否能在第二轮演奏，请谨慎考虑！\nYour vote determines whether a band advances to Round 2-choose wisely!",
      isActive: false,
      timeLeft: 0,
    },
    {
      roundNumber: 6,
      title: "终章审判 FINAL JUDGEMENT",
      subtitle1: "你的YES or NO决定今夜王座归属\nYour YES or NO Decides Tonight's Throne！",
      question: "你是否要为乐队投上一票？\nDo you want to vote for the band?",
      options: ["Yes", "No"],
      note: "",
      isActive: false,
      timeLeft: 0,
    },
    {
      roundNumber: 7,
      title: "终章审判 FINAL JUDGEMENT",
      subtitle1: "你的YES or NO决定今夜王座归属\nYour YES or NO Decides Tonight's Throne！",
      question: "你是否要为乐队投上一票？\nDo you want to vote for the band?",
      options: ["Yes", "No"],
      note: "",
      isActive: false,
      timeLeft: 0,
    },
    {
      roundNumber: 8,
      title: "终章审判 FINAL JUDGEMENT",
      subtitle1: "你的YES or NO决定今夜王座归属\nYour YES or NO Decides Tonight's Throne！",
      question: "你是否要为乐队投上一票？\nDo you want to vote for the band?",
      options: ["Yes", "No"],
      note: "",
      isActive: false,
      timeLeft: 0,
    },
  ])
  const [votes, setVotes] = useState<number[][]>([])
  const [baseUrl, setBaseUrl] = useState("")
  const { toast } = useToast()
    ; <style jsx global>{`
    .writing-mode-vertical {
      writing-mode: vertical-lr;
      text-orientation: upright;
    }
  `}</style>

  // Initialize data
  useEffect(() => {
    // Set base URL for QR code
    setBaseUrl(window.location.origin + "/vote")

    // Check if already authenticated in this session
    const authStatus = sessionStorage.getItem("adminAuthenticated")
    if (authStatus === "true") {
      setIsAuthenticated(true)
    }

    // Initialize rounds in database if needed
    const initializeRounds = async () => {
      try {
        const response = await fetch("/api/rounds")
        if (response.ok) {
          const roundsData = await response.json()

          // If no rounds exist, create the default ones
          if (roundsData.length === 0) {
            const defaultRounds = [
              {
                roundNumber: 0,
                title: "午夜分贝 MIDNIGHT DECIBEL",
                subtitle1: "二选一•Choose One",
                question: "你更喜欢谁的演出？\nWhich performance do you prefer?",
                options: ["余温乐队 Yuwen", "Moonlight"],
                note: "你的选择将关乎乐队是否能在第二轮演奏，请谨慎考虑！\nYour vote determines whether a band advances to Round 2-choose wisely!",
                isActive: false,
                timeLeft: 0,
              },
              {
                roundNumber: 1,
                title: "午夜分贝 MIDNIGHT DECIBEL",
                subtitle1: "二选一•Choose One",
                question: "你更喜欢谁的演出？\nWhich performance do you prefer?",
                options: ["蓝色渐进 Asym-bLu", "Accord"],
                note: "你的选择将关乎乐队是否能在第二轮演奏，请谨慎考虑！\nYour vote determines whether a band advances to Round 2-choose wisely!",
                isActive: false,
                timeLeft: 0,
              },
              {
                roundNumber: 2,
                title: "午夜分贝 MIDNIGHT DECIBEL",
                subtitle1: "二选一•Choose One",
                question: "你更喜欢谁的演出？\nWhich performance do you prefer?",
                options: ["余温乐队 Yuwen", "蓝色渐进 Asym-bLu"],
                note: "你的选择将关乎乐队是否能在第二轮演奏，请谨慎考虑！\nYour vote determines whether a band advances to Round 2-choose wisely!",
                isActive: false,
                timeLeft: 0,
              },
              {
                roundNumber: 3,
                title: "午夜分贝 MIDNIGHT DECIBEL",
                subtitle1: "二选一•Choose One",
                question: "你更喜欢谁的演出？\nWhich performance do you prefer?",
                options: ["Moonlight", "Accord"],
                note: "你的选择将关乎乐队是否能在第二轮演奏，请谨慎考虑！\nYour vote determines whether a band advances to Round 2-choose wisely!",
                isActive: false,
                timeLeft: 0,
              },
              {
                roundNumber: 4,
                title: "午夜分贝 MIDNIGHT DECIBEL",
                subtitle1: "二选一•Choose One",
                question: "你更喜欢谁的演出？\nWhich performance do you prefer?",
                options: ["余温乐队 Yuwen", "Accord"],
                note: "你的选择将关乎乐队是否能在第二轮演奏，请谨慎考虑！\nYour vote determines whether a band advances to Round 2-choose wisely!",
                isActive: false,
                timeLeft: 0,
              },
              {
                roundNumber: 5,
                title: "午夜分贝 MIDNIGHT DECIBEL",
                subtitle1: "二选一•Choose One",
                question: "你更喜欢谁的演出？\nWhich performance do you prefer?",
                options: ["Moonlight", "蓝色渐进 Asym-bLu"],
                note: "你的选择将关乎乐队是否能在第二轮演奏，请谨慎考虑！\nYour vote determines whether a band advances to Round 2-choose wisely!",
                isActive: false,
                timeLeft: 0,
              },
              {
                roundNumber: 6,
                title: "终章审判 FINAL JUDGEMENT",
                subtitle1: "你的YES or NO决定今夜王座归属\nYour YES or NO Decides Tonight's Throne！",
                question: "你是否要为乐队投上一票？\nDo you want to vote for the band?",
                options: ["Yes", "No"],
                note: "",
                isActive: false,
                timeLeft: 0,
              },
              {
                roundNumber: 7,
                title: "终章审判 FINAL JUDGEMENT",
                subtitle1: "你的YES or NO决定今夜王座归属\nYour YES or NO Decides Tonight's Throne！",
                question: "你是否要为乐队投上一票？\nDo you want to vote for the band?",
                options: ["Yes", "No"],
                note: "",
                isActive: false,
                timeLeft: 0,
              },
              {
                roundNumber: 8,
                title: "终章审判 FINAL JUDGEMENT",
                subtitle1: "你的YES or NO决定今夜王座归属\nYour YES or NO Decides Tonight's Throne！",
                question: "你是否要为乐队投上一票？\nDo you want to vote for the band?",
                options: ["Yes", "No"],
                note: "",
                isActive: false,
                timeLeft: 0,
              },
            ]

            // Create each round
            for (const round of defaultRounds) {
              await fetch("/api/rounds", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(round),
              })
            }

            // Set the rounds state
            setRounds(defaultRounds)
          } else {
            // Set state from existing rounds
            setRounds(roundsData)
          }
        }
      } catch (error) {
        console.error("Error initializing rounds:", error)
      }
    }

    // Fetch votes from the API for all rounds
    const fetchVotesFromAPI = async () => {
      try {
        const votesArray: number[][] = [
          [0, 0],
          [0, 0],
          [0, 0],
          [0, 0],
          [0, 0],
          [0, 0],
          [0, 0],
          [0, 0],
          [0, 0],
        ]

        // Fetch votes for each round
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

    // Execute all fetch operations
    initializeRounds()
    fetchVotesFromAPI()
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      })

      const data = await response.json()

      if (data.success) {
        setIsAuthenticated(true)
        sessionStorage.setItem("adminAuthenticated", "true")
        toast({
          title: "Login successful",
          description: "Welcome to the manager dashboard",
        })
      } else {
        toast({
          title: "Login failed",
          description: "Incorrect password",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Login error:", error)
      toast({
        title: "Login error",
        description: "An error occurred during login",
        variant: "destructive",
      })
    }
  }

  // Timer effect
  useEffect(() => {
    if (!isVotingActive || timeLeft <= 0) return

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1)

      // Update round status in API
      fetch("/api/rounds", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roundNumber: currentRound,
          isActive: isVotingActive,
          timeLeft: timeLeft - 1,
        }),
      }).catch((error) => console.error("Error updating round:", error))

      if (timeLeft === 1) {
        endVoting()
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [timeLeft, isVotingActive, currentRound])

  const startVoting = async () => {
    try {
      // Update round status in API
      const response = await fetch("/api/rounds", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roundNumber: currentRound,
          isActive: true,
          timeLeft: initialTime,
        }),
      })

      if (response.ok) {
        setIsVotingActive(true)
        setTimeLeft(initialTime)

        toast({
          title: "Voting started",
          description: `Round ${currentRound + 1} voting is now active`,
        })
      } else {
        toast({
          title: "Error starting voting",
          description: "There was an error starting the voting session",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error starting voting:", error)
      toast({
        title: "Error starting voting",
        description: "There was an error starting the voting session",
        variant: "destructive",
      })
    }
  }

  const endVoting = async () => {
    try {
      // Update round status in API
      const response = await fetch("/api/rounds", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roundNumber: currentRound,
          isActive: false,
          timeLeft: 0,
        }),
      })

      if (response.ok) {
        setIsVotingActive(false)

        toast({
          title: "Voting ended",
          description: `Round ${currentRound + 1} voting has ended`,
        })
      } else {
        toast({
          title: "Error ending voting",
          description: "There was an error ending the voting session",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error ending voting:", error)
      toast({
        title: "Error ending voting",
        description: "There was an error ending the voting session",
        variant: "destructive",
      })
    }
  }

  const nextRound = () => {
    if (isVotingActive) {
      toast({
        title: "Cannot change round",
        description: "Please end the current voting session first",
        variant: "destructive",
      })
      return
    }

    if (currentRound < 8) {
      setCurrentRound(currentRound + 1)
      toast({
        title: "Round advanced",
        description: `Now on round ${currentRound + 2}`,
      })
    } else {
      toast({
        title: "Final round reached",
        description: "This is the last round of voting",
      })
    }
  }

  const previousRound = () => {
    if (isVotingActive) {
      toast({
        title: "Cannot change round",
        description: "Please end the current voting session first",
        variant: "destructive",
      })
      return
    }

    if (currentRound > 0) {
      setCurrentRound(currentRound - 1)
      toast({
        title: "Round changed",
        description: `Now on round ${currentRound}`,
      })
    } else {
      toast({
        title: "First round reached",
        description: "This is the first round of voting",
      })
    }
  }

  const updateOption = async (roundIndex: number, optionIndex: number, value: string) => {
    const newRounds = [...rounds]
    const currentRoundData = newRounds[roundIndex]
    newRounds[roundIndex].options[optionIndex] = value
    setRounds(newRounds)

    try {
      // Update options in API
      await fetch("/api/rounds", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roundNumber: roundIndex,
          title: rounds[roundIndex].title,
          subtitle1: rounds[roundIndex].subtitle1,
          question: rounds[roundIndex].question,
          options: currentRoundData.options,
          note: rounds[roundIndex].note,
          isActive: !!currentRoundData.isActive,
          timeLeft: currentRoundData.timeLeft || 0,
        }),
      })
    } catch (error) {
      console.error("Error updating option:", error)
    }
  }

  const updateQuestion = async (roundIndex: number, value: string) => {
    const newRounds = [...rounds]
    const currentRoundData = newRounds[roundIndex]
    newRounds[roundIndex].question = value
    setRounds(newRounds)

    try {
      // Update question in API
      await fetch("/api/rounds", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roundNumber: roundIndex,
          title: rounds[roundIndex].title,
          subtitle1: rounds[roundIndex].subtitle1,
          question: value,
          options: currentRoundData.options,
          note: rounds[roundIndex].note,
          isActive: !!currentRoundData.isActive,
          timeLeft: currentRoundData.timeLeft || 0,
        }),
      })
    } catch (error) {
      console.error("Error updating question:", error)
    }
  }

  const resetVotes = async () => {
    if (isVotingActive) {
      toast({
        title: "Cannot reset votes",
        description: "Please end the current voting session first",
        variant: "destructive",
      })
      return
    }

    try {
      // Delete votes for the current round via API
      const response = await fetch("/api/votes", {
        method: "DELETE",
      })

      if (response.ok) {
        // Reset votes for current round in local state
        const newVotes = [...votes]
        newVotes[currentRound] = [0, 0]
        setVotes(newVotes)

        toast({
          title: "Votes reset",
          description: `Votes have been reset for all rounds`,
        })
      } else {
        toast({
          title: "Error resetting votes",
          description: "There was an error resetting the votes",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error resetting votes:", error)
      toast({
        title: "Error resetting votes",
        description: "There was an error resetting the votes",
        variant: "destructive",
      })
    }
  }

  const exportResults = () => {
    // Create a results object with all the voting data
    const resultsData = {
      rounds: [
        {
          question: rounds[0].question,
          options: rounds[0].options,
          votes: votes[0] || [0, 0],
        },
        {
          question: rounds[1].question,
          options: rounds[1].options,
          votes: votes[1] || [0, 0],
        },
        {
          question: rounds[2].question,
          options: rounds[2].options,
          votes: votes[2] || [0, 0],
        },
        {
          question: rounds[3].question,
          options: rounds[3].options,
          votes: votes[3] || [0, 0],
        },
        {
          question: rounds[4].question,
          options: rounds[4].options,
          votes: votes[4] || [0, 0],
        },
        {
          question: rounds[5].question,
          options: rounds[5].options,
          votes: votes[5] || [0, 0],
        },
        {
          question: rounds[6].question,
          options: rounds[6].options,
          votes: votes[6] || [0, 0],
        },
        {
          question: rounds[7].question,
          options: rounds[7].options,
          votes: votes[7] || [0, 0],
        },
        {
          question: rounds[8].question,
          options: rounds[8].options,
          votes: votes[8] || [0, 0],
        },
      ],
      timestamp: new Date().toISOString(),
      totalVotes: votes.reduce((sum, roundVotes) => sum + (roundVotes ? roundVotes[0] + roundVotes[1] : 0), 0),
    }

    // Convert to JSON string
    const jsonString = JSON.stringify(resultsData, null, 2)

    // Create a blob and download link
    const blob = new Blob([jsonString], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `band-competition-results-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Results exported",
      description: "The voting results have been downloaded as a JSON file",
    })
  }

  // Fetch votes from API periodically
  useEffect(() => {
    const fetchVotesFromAPI = async () => {
      try {
        // Fetch votes for each round
        const votesArray: number[][] = [
          [0, 0],
          [0, 0],
          [0, 0],
          [0, 0],
          [0, 0],
          [0, 0],
          [0, 0],
          [0, 0],
          [0, 0],
        ]

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

    const interval = setInterval(fetchVotesFromAPI, 1000)
    return () => clearInterval(interval)
  }, [])

  const clearVoteCookiesForThisBrowser = async () => {
    try {
      const response = await fetch("/api/vote-cookies/clear", {
        method: "POST",
      })

      if (response.ok) {
        toast({
          title: "Cookies cleared",
          description: "Vote cookies have been cleared for this browser",
        })
      } else {
        toast({
          title: "Error clearing cookies",
          description: "There was an error clearing vote cookies",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error clearing vote cookies:", error)
      toast({
        title: "Error clearing cookies",
        description: "There was an error clearing vote cookies",
        variant: "destructive",
      })
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 relative">
        {/* <AnimatedCircle /> */}

        <Card className="w-full max-w-md bg-zinc-900/80 backdrop-blur-sm border-transparent z-10">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center text-orange-400">
              <span>管理员登录</span>
              <div className="text-lg text-zinc-400">Manager Login</div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-zinc-300 mb-1">
                  <span>密码</span>
                  <div className="text-xs text-zinc-400">Password</div>
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-zinc-800 border-transparent text-white"
                  placeholder="输入密码"
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-orange-700 hover:bg-orange-800 text-white">
                <span>登录</span>
                <div className="text-sm">Login</div>
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8 relative ml-24">
      {/* <AnimatedCircle /> */}

      {/* Replace the commented-out heading section with this */}
      {/* <div className="fixed left-0 top-0 h-full flex flex-col items-center justify-center z-20 bg-zinc-900 border-r border-zinc-800 px-4 py-8">
        <h1 className="text-3xl font-bold text-orange-400 writing-mode-vertical whitespace-nowrap">
          <span className="block mb-4">乐队比赛管理面板</span>
          <div className="text-lg text-zinc-400">Band Competition Manager Dashboard</div>
        </h1>
        <Button
          onClick={() => window.history.back()}
          variant="outline"
          className="mt-8 border-transparent text-orange-400"
        >
          <span>返回</span>
          <div className="text-sm">← Back</div>
        </Button>
      </div> */}

      <div className="max-w-7xl mx-auto z-10">
        {/* heading */}
        {/* <div className="flex items-center justify-between mb-8 z-10">
          <Button
            onClick={() => window.history.back()}
            variant="outline"
            className="border-transparent text-orange-400"
          >
            <span>返回</span>
            <div className="text-sm">← Back</div>
          </Button>
          <h1 className="text-3xl font-bold text-orange-400">
            <span>乐队比赛管理面板</span>
            <div className="text-lg text-zinc-400">Band Competition Manager Dashboard</div>
          </h1>
          <div className="w-20"></div>
        </div> */}

        <Tabs defaultValue="control" className="gap-6 overflow-hidden relative">
          <TabsList className="fixed left-0 top-0 h-full flex flex-col items-center justify-start z-20 bg-zinc-900 border-r border-zinc-800 px-4 py-8 w-80">

            <div className="flex flex-col items-center mb-8">
              <div className="w-16 flex items-center justify-center mb-4">
                <img src="/cssa logo.png" alt="CSSA Logo" className="w-12 h-12" />
                <span className="text-2xl text-violet-500">CSSA</span>
              </div>

              <h1 className="text-3xl font-bold text-orange-400 text-center mt-40">
                <span className="text-white">Midnight Decibel</span>
                <div className="text-xl text-white">管理面板</div>
              </h1>
            </div>

            <div className="h-full flex flex-col gap-4 text-left w-60 mt-12">
              <TabsTrigger value="control" className="text-lg data-[state=active]:bg-orange-900 data-[state=active]:text-white w-full justify-start">
                <span>控制面板</span>
                <div>Control Panel</div>
              </TabsTrigger>

              <TabsTrigger value="results" className="text-lg data-[state=active]:bg-orange-900 data-[state=active]:text-white w-full justify-start">
                <span>结果</span>
                <div>Results</div>
              </TabsTrigger>

            </div>
          </TabsList>

          <div className="ml-48 flex-1 p-8">
            <TabsContent value="control" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <div className="fle space-y-6">
                  <Card className="bg-zinc-900 border-transparent">

                    <CardHeader>
                      <CardTitle className="text-orange-400">
                        <span>投票控制</span>
                        <div className="text-lg text-zinc-400">Voting Control</div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between bg-zinc-800 p-4 rounded-lg">
                        <div>
                          <div className="text-zinc-400 text-sm">
                            <span>当前轮次</span>
                            <div className="text-xs">Current Round</div>
                          </div>
                          <p className="text-xl font-bold text-white">{currentRound + 1} of 9</p>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            onClick={previousRound}
                            variant="outline"
                            className="border-transparent text-orange-400 hover:bg-orange-900"
                            disabled={currentRound === 0 || isVotingActive}
                          >
                            <span>上一轮</span>
                            <div className="text-sm">Previous</div>
                          </Button>
                          <Button
                            onClick={nextRound}
                            variant="outline"
                            className="border-transparent text-orange-400 hover:bg-orange-900"
                            disabled={currentRound === 8 || isVotingActive}
                          >
                            <span>下一轮</span>
                            <div className="text-sm">Next</div>
                          </Button>
                        </div>
                      </div>

                      <div className="bg-zinc-800 p-4 rounded-lg">
                        <div className="text-zinc-400 text-sm mb-2">
                          <span>投票计时器（秒）</span>
                          <div className="text-xs">Voting Timer (seconds)</div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Input
                            type="number"
                            value={initialTime}
                            onChange={(e) => setInitialTime(Number.parseInt(e.target.value) || 60)}
                            className="bg-zinc-700 border-transparent text-white"
                            min="10"
                            max="300"
                            disabled={isVotingActive}
                          />
                          <div className="text-xl font-bold text-white min-w-16 text-center">{timeLeft}s</div>
                        </div>
                      </div>

                      <div className="flex space-x-3">
                        {isVotingActive ? (
                          <Button onClick={endVoting} className="flex-1 bg-red-700 hover:bg-red-800 text-white">
                            <span>结束投票</span>
                            <div className="text-sm">End Voting</div>
                          </Button>
                        ) : (
                          <Button onClick={startVoting} className="flex-1 bg-orange-700 hover:bg-orange-800 text-white">
                            <span>开始投票</span>
                            <div className="text-sm">Start Voting</div>
                          </Button>
                        )}
                        <Button
                          onClick={resetVotes}
                          variant="outline"
                          className="border-red-700 text-red-400 hover:bg-red-900/30"
                          disabled={isVotingActive}
                        >
                          <span>重置投票</span>
                          <div className="text-sm">Reset Votes</div>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-zinc-900 border-transparent">
                    <CardHeader>
                      <CardTitle className="text-orange-400">
                        <span>二维码</span>
                        <div className="text-lg text-zinc-400">QR Code</div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center">
                      <div className="bg-white p-4 rounded-lg mb-4">
                        <QRCodeSVG value={baseUrl} size={200} />
                      </div>
                      <div className="text-zinc-400 text-sm text-center">
                        <span>扫描此二维码访问投票页面</span>
                        <div className="text-xs">Scan this QR code to access the voting page</div>
                      </div>
                      <p className="text-orange-400 mt-2 text-center font-mono">{baseUrl}</p>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-zinc-900 border-transparent">
                  <CardHeader>
                    <CardTitle className="text-orange-400">
                      <span>问题设置</span>
                      <div className="text-lg text-zinc-400">Question Setup</div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-400 mb-1">
                        <span>标题</span>
                        <div className="text-xs">Title</div>
                      </label>
                      <Input
                        value={rounds[currentRound].title}
                        onChange={(e) => {
                          const updatedRounds = [...rounds]
                          updatedRounds[currentRound].title = e.target.value
                          setRounds(updatedRounds)
                        }}
                        className="bg-zinc-800 border-transparent text-white"
                        placeholder="输入标题"
                        disabled={isVotingActive}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-zinc-400 mb-1">
                        <span>副标题</span>
                        <div className="text-xs">Subtitle</div>
                      </label>
                      <Input
                        value={rounds[currentRound].subtitle1}
                        onChange={(e) => {
                          const updatedRounds = [...rounds]
                          updatedRounds[currentRound].subtitle1 = e.target.value
                          setRounds(updatedRounds)
                        }}
                        className="bg-zinc-800 border-transparent text-white"
                        placeholder="输入副标题"
                        disabled={isVotingActive}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-zinc-400 mb-1">
                        <span>问题</span>
                        <div className="text-xs">Question</div>
                      </label>
                      <Input
                        value={rounds[currentRound].question}
                        onChange={(e) => updateQuestion(currentRound, e.target.value)}
                        className="bg-zinc-800 border-transparent text-white"
                        placeholder="输入问题"
                        disabled={isVotingActive}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-zinc-400 mb-1">
                        <span>选项 1</span>
                        <div className="text-xs">Option 1</div>
                      </label>
                      <Input
                        value={rounds[currentRound].options[0]}
                        onChange={(e) => updateOption(currentRound, 0, e.target.value)}
                        className="bg-zinc-800 border-transparent text-white"
                        placeholder="输入第一个选项"
                        disabled={isVotingActive}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-zinc-400 mb-1">
                        <span>选项 2</span>
                        <div className="text-xs">Option 2</div>
                      </label>
                      <Input
                        value={rounds[currentRound].options[1]}
                        onChange={(e) => updateOption(currentRound, 1, e.target.value)}
                        className="bg-zinc-800 border-transparent text-white"
                        placeholder="输入第二个选项"
                        disabled={isVotingActive}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-zinc-400 mb-1">
                        <span>备注</span>
                        <div className="text-xs">Note</div>
                      </label>
                      <Textarea
                        value={rounds[currentRound].note}
                        onChange={(e) => {
                          const updatedRounds = [...rounds]
                          updatedRounds[currentRound].note = e.target.value
                          setRounds(updatedRounds)
                        }}
                        className="bg-zinc-800 border-transparent text-white"
                        placeholder="输入备注"
                        disabled={isVotingActive}
                      />
                    </div>

                    <div className="pt-2">
                      <Button
                        onClick={() => {
                          // Update API instead of using localStorage
                          fetch("/api/rounds", {
                            method: "POST",
                            headers: {
                              "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                              roundNumber: currentRound,
                              title: rounds[currentRound].title,
                              subtitle1: rounds[currentRound].subtitle1,
                              question: rounds[currentRound].question,
                              options: rounds[currentRound].options,
                              note: rounds[currentRound].note,
                              isActive: isVotingActive,
                              timeLeft: timeLeft,
                            }),
                          })
                            .then((response) => {
                              if (response.ok) {
                                toast({
                                  title: "问题已更新",
                                  description: "问题和选项已更新",
                                })
                              }
                            })
                            .catch((error) => {
                              console.error("Error updating question:", error)
                              toast({
                                title: "更新失败",
                                description: "更新问题时出错",
                                variant: "destructive",
                              })
                            })
                        }}
                        className="w-full bg-orange-700 hover:bg-orange-800 text-white"
                        disabled={isVotingActive}
                      >
                        <span>更新问题</span>
                        <div className="text-sm">Update Question</div>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-zinc-900 border-transparent">
                <CardHeader>
                  <CardTitle className="text-orange-400">
                    <span>投票设置</span>
                    <div className="text-lg text-zinc-400">Voting Settings</div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="pt-4 space-y-4">
                    <Button
                      onClick={clearVoteCookiesForThisBrowser}
                      variant="outline"
                      className="w-full border-zinc-600 text-zinc-300 hover:bg-zinc-800"
                    >
                      <span>清除本浏览器的投票Cookie</span>
                      <div className="text-sm">Clear Vote Cookies (This Browser)</div>
                    </Button>

                    <Button
                      onClick={() => {
                        // Reset all data in the API
                        fetch("/api/reset", {
                          method: "POST",
                        })
                          .then((response) => {
                            if (response.ok) {
                              // Reset local state
                              setVotes([
                                [0, 0],
                                [0, 0],
                                [0, 0],
                                [0, 0],
                                [0, 0],
                                [0, 0],
                                [0, 0],
                                [0, 0],
                                [0, 0],
                              ])

                              toast({
                                title: "数据已重置",
                                description: "所有数据已重置",
                              })
                            }
                          })
                          .catch((error) => {
                            console.error("Error resetting data:", error)
                            toast({
                              title: "重置失败",
                              description: "重置数据时出错",
                              variant: "destructive",
                            })
                          })
                      }}
                      variant="outline"
                      className="w-full border-orange-600 text-orange-400 hover:bg-orange-600"
                    >
                      <span>重置所有数据</span>
                      <div className="text-sm">Reset All Data</div>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="results">
              <Card className="bg-zinc-900 border-transparent">
                <CardHeader>
                  <CardTitle className="text-orange-400">
                    <span>投票结果</span>
                    <div className="text-lg text-white">Voting Results</div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="round1">
                    <TabsList className="bg-zinc-800 mb-4 grid text-zinc-500 grid-cols-6 gap-2">
                      <TabsTrigger
                        value="round1"
                        className="data-[state=active]:bg-orange-900 data-[state=active]:text-white"
                      >
                        <span>第一轮</span>
                        <div className="text-sm">Round 1</div>
                      </TabsTrigger>
                      <TabsTrigger
                        value="round2"
                        className="data-[state=active]:bg-orange-900 data-[state=active]:text-white"
                      >
                        <span>第二轮</span>
                        <div className="text-sm">Round 2</div>
                      </TabsTrigger>
                      <TabsTrigger
                        value="round3"
                        className="data-[state=active]:bg-orange-900 data-[state=active]:text-white"
                      >
                        <span>第三轮</span>
                        <div className="text-sm">Round 3</div>
                      </TabsTrigger>
                      <TabsTrigger
                        value="round4"
                        className="data-[state=active]:bg-orange-900 data-[state=active]:text-white"
                      >
                        <span>第四轮</span>
                        <div className="text-sm">Round 4</div>
                      </TabsTrigger>
                      <TabsTrigger
                        value="round5"
                        className="data-[state=active]:bg-orange-900 data-[state=active]:text-white"
                      >
                        <span>第五轮</span>
                        <div className="text-sm">Round 5</div>
                      </TabsTrigger>
                      <TabsTrigger
                        value="round6"
                        className="data-[state=active]:bg-orange-900 data-[state=active]:text-white"
                      >
                        <span>第六轮</span>
                        <div className="text-sm">Round 6</div>
                      </TabsTrigger>
                      <TabsTrigger
                        value="round7"
                        className="data-[state=active]:bg-orange-900 data-[state=active]:text-white col-start-2"
                      >
                        <span>第七轮</span>
                        <div className="text-sm">Round 7</div>
                      </TabsTrigger>
                      <TabsTrigger
                        value="round8"
                        className="data-[state=active]:bg-orange-900 data-[state=active]:text-white"
                      >
                        <span>第八轮</span>
                        <div className="text-sm">Round 8</div>
                      </TabsTrigger>
                      <TabsTrigger
                        value="round9"
                        className="data-[state=active]:bg-orange-900 data-[state=active]:text-white"
                      >
                        <span>第九轮</span>
                        <div className="text-sm">Round 9</div>
                      </TabsTrigger>
                    </TabsList>

                    {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((round) => (
                      <TabsContent key={round} value={`round${round + 1}`} className="mt-12 h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={[
                              {
                                name: rounds[round]?.options?.[0] || `Band A`,
                                votes: votes[round] ? votes[round][0] : 0,
                              },
                              {
                                name: rounds[round]?.options?.[1] || `Band B`,
                                votes: votes[round] ? votes[round][1] : 0,
                              },
                            ]}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                            <XAxis dataKey="name" stroke="#aaa" />
                            <YAxis stroke="#aaa" />
                            <Tooltip
                              contentStyle={{ backgroundColor: "#333", borderColor: "#666" }}
                              labelStyle={{ color: "#fff" }}
                            />
                            <Legend />
                            <Bar dataKey="votes" fill="#ea580c" name="Votes" />
                          </BarChart>
                        </ResponsiveContainer>

                        <div className="mt-4 grid grid-cols-2 gap-4">
                          <div className="bg-zinc-800 p-3 rounded-lg">
                            <div className="text-zinc-400 text-sm">
                              <span>总投票数</span>
                              <div className="text-xs">Total Votes</div>
                            </div>
                            <p className="text-xl font-bold text-white">
                              {votes[round] ? votes[round][0] + votes[round][1] : 0}
                            </p>
                          </div>
                          <div className="bg-zinc-800 p-3 rounded-lg">
                            <div className="text-zinc-400 text-sm">
                              <span>领先选项</span>
                              <div className="text-xs">Leading Option</div>
                            </div>
                            <p className="text-xl font-bold text-orange-400">
                              {votes[round] && votes[round][0] !== votes[round][1]
                                ? votes[round][0] > votes[round][1]
                                  ? rounds[round]?.options?.[0] || "Band A"
                                  : rounds[round]?.options?.[1] || "Band B"
                                : "平局"}
                            </p>
                          </div>
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>

                  <Button onClick={exportResults} className="mt-32 bg-orange-700 hover:bg-orange-800 text-white">
                    <span>导出结果</span>
                    <div className="text-sm">Export Results</div>
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

          </div>
        </Tabs>
      </div>
    </div>
  )
}

