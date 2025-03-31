"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

export default function VotePage() {
  const [code, setCode] = useState("")
  const [status, setStatus] = useState("login") // login, waiting, voting, completed
  const [currentRound, setCurrentRound] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const [question, setQuestion] = useState("")
  const [options, setOptions] = useState(["", ""])
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const { toast } = useToast()

  // Initialize voting data
  useEffect(() => {
    const votingData = localStorage.getItem("votingData")
    if (votingData) {
      const data = JSON.parse(votingData)
      setCurrentRound(data.currentRound)
      setQuestion(data.question || "Which band do you prefer?")
      setOptions(data.options || ["Band A", "Band B"])
    }

    // Check if there's a saved code and if it's used
    const savedCode = localStorage.getItem("currentCode")
    if (savedCode) {
      const savedStatuses = localStorage.getItem("codeStatuses")
      const codeStatuses = savedStatuses ? JSON.parse(savedStatuses) : {}
      
      if (codeStatuses[savedCode]) {
        setStatus("completed")
        toast({
          title: "Code already used",
          description: "This code has already been used in this round",
          variant: "destructive",
        })
      } else {
        setCode(savedCode)
        setStatus("waiting")
      }
    }
  }, [toast])

  // Check voting status
  useEffect(() => {
    const checkVotingStatus = () => {
      const votingData = localStorage.getItem("votingData")
      if (votingData) {
        const data = JSON.parse(votingData)
        setCurrentRound(data.currentRound)
        setQuestion(data.question || "Which band do you prefer?")
        setOptions(data.options || ["Band A", "Band B"])

        if (data.isActive && status === "waiting") {
          setStatus("voting")
          setTimeLeft(data.timeLeft)
        } else if (!data.isActive && status === "voting") {
          setStatus("waiting")
          toast({
            title: "Voting completed",
            description: "Waiting for the next round to start",
          })
        }
      }
    }

    const interval = setInterval(checkVotingStatus, 1000)
    return () => clearInterval(interval)
  }, [status, toast])

  // Countdown timer
  useEffect(() => {
    if (status !== "voting" || timeLeft <= 0) return

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1)
      if (timeLeft === 1) {
        if (selectedOption !== null) {
          handleSubmit()
        } else {
          setStatus("waiting")
          toast({
            title: "Time's up!",
            description: "You didn't select an option in time",
            variant: "destructive",
          })
        }
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [timeLeft, status, selectedOption])

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const codeInput = code.trim().toUpperCase()

    // Get code statuses from localStorage
    const savedStatuses = localStorage.getItem("codeStatuses")
    const codeStatuses = savedStatuses ? JSON.parse(savedStatuses) : {}

    // Check if code exists and is valid
    const savedCodes = localStorage.getItem("codes")
    const codes = savedCodes ? JSON.parse(savedCodes) : []
    const codeIndex = codes.indexOf(codeInput)

    if (codeIndex === -1) {
      toast({
        title: "无效代码",
        description: "请输入有效的投票码",
        variant: "destructive",
      })
      return
    }

    // Check if code is already used
    if (codeStatuses[codeInput]) {
      toast({
        title: "代码已使用",
        description: "此代码已在本轮中使用过",
        variant: "destructive",
      })
      return
    }

    // Save the current code
    localStorage.setItem("currentCode", codeInput)
    setStatus("waiting")
    
    toast({
      title: "代码已接受",
      description: "等待投票开始",
    })
  }

  const handleSubmit = () => {
    if (selectedOption === null) {
      toast({
        title: "未选择选项",
        description: "请在提交前选择一个选项",
        variant: "destructive",
      })
      return
    }

    // Get current votes
    const savedVotes = localStorage.getItem("votes")
    const votes = savedVotes ? JSON.parse(savedVotes) : {}

    // Update votes
    if (!votes[currentRound]) {
      votes[currentRound] = [0, 0]
    }

    // Update the vote count
    votes[currentRound][selectedOption]++

    // Save updated votes
    localStorage.setItem("votes", JSON.stringify(votes))

    // Mark code as used
    const savedCode = localStorage.getItem("currentCode")
    if (savedCode) {
      const savedStatuses = localStorage.getItem("codeStatuses")
      const codeStatuses = savedStatuses ? JSON.parse(savedStatuses) : {}
      codeStatuses[savedCode] = true
      localStorage.setItem("codeStatuses", JSON.stringify(codeStatuses))
    }

    setStatus("completed")
    toast({
      title: "投票已提交",
      description: "感谢您的投票！",
    })
  }

  // Check for competition end
  useEffect(() => {
    const competitionEnded = localStorage.getItem("competitionEnded")
    if (competitionEnded === "true") {
      localStorage.removeItem("currentCode")
      setStatus("login")
      setCode("")
      toast({
        title: "比赛已结束",
        description: "投票已结束，感谢参与",
        variant: "destructive",
      })
    }
  }, [])

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md bg-zinc-900 border-purple-700 shadow-lg p-4 md:p-6">
        <h1 className="text-xl md:text-2xl font-bold text-center text-purple-400 mb-4 md:mb-6">
          <div>乐队比赛投票</div>
          <div className="text-base md:text-lg text-zinc-400">Band Competition Voting</div>
        </h1>

        {status === "login" && (
          <form onSubmit={handleCodeSubmit} className="space-y-4">
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-zinc-300 mb-1">
                <div>输入投票码</div>
                <div className="text-xs text-zinc-400">Enter your voting code</div>
              </label>
              <Input
                id="code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="bg-zinc-800 border-purple-700 text-white text-lg tracking-wider"
                placeholder="输入您的代码"
                required
                autoCapitalize="characters"
                autoComplete="off"
              />
            </div>
            <Button type="submit" className="w-full bg-purple-700 hover:bg-purple-800 text-white py-6">
              <div>提交代码</div>
              <div className="text-sm">Submit Code</div>
            </Button>
          </form>
        )}

        {status === "waiting" && (
          <div className="text-center py-8">
            <div className="animate-pulse mb-4">
              <div className="h-12 w-12 rounded-full bg-purple-700 mx-auto"></div>
            </div>
            <h2 className="text-lg md:text-xl font-semibold text-purple-400 mb-2">
              <div>等待投票开始</div>
              <div className="text-sm text-zinc-400">Waiting for voting to start</div>
            </h2>
            <p className="text-zinc-400">
              <div>管理员将很快开始下一轮</div>
              <div className="text-sm">The manager will start the next round soon</div>
            </p>
          </div>
        )}

        {status === "voting" && (
          <div className="space-y-6">
            <div className="bg-purple-900/50 rounded-lg p-3 text-center">
              <div className="text-sm text-purple-300 mb-1">
                <div>剩余时间</div>
                <div className="text-xs">Time Remaining</div>
              </div>
              <div className="text-2xl font-bold text-white">{timeLeft} seconds</div>
            </div>

            <div className="mb-4">
              <h2 className="text-lg md:text-xl font-semibold text-purple-400 mb-3">
                <div>第 {currentRound + 1} 轮: {question}</div>
                <div className="text-sm text-zinc-400">Round {currentRound + 1}: {question}</div>
              </h2>

              <div className="space-y-3 mt-4">
                {options.map((option, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedOption === index
                        ? "border-purple-500 bg-purple-900/30"
                        : "border-zinc-700 bg-zinc-800 hover:border-purple-700"
                    }`}
                    onClick={() => setSelectedOption(index)}
                  >
                    <div className="flex items-center">
                      <div
                        className={`w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center ${
                          selectedOption === index ? "border-purple-500" : "border-zinc-500"
                        }`}
                      >
                        {selectedOption === index && <div className="w-4 h-4 rounded-full bg-purple-500"></div>}
                      </div>
                      <span className="text-white text-lg">{option}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              className="w-full bg-purple-700 hover:bg-purple-800 text-white py-6 h-auto"
              disabled={selectedOption === null}
            >
              <div>提交投票</div>
              <div className="text-sm">Submit Vote</div>
            </Button>
          </div>
        )}

        {status === "completed" && (
          <div className="text-center py-8">
            <div className="mb-4 text-green-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mx-auto"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <h2 className="text-lg md:text-xl font-semibold text-purple-400 mb-2">
              <div>投票已提交！</div>
              <div className="text-sm text-zinc-400">Vote Submitted!</div>
            </h2>
            <p className="text-zinc-400">
              <div>感谢您参与投票</div>
              <div className="text-sm">Thank you for participating in the voting</div>
            </p>
          </div>
        )}
      </Card>
    </div>
  )
}

