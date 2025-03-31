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

  // Simulate checking if voting is active
  useEffect(() => {
    const checkVotingStatus = () => {
      // In a real app, this would be a server call or websocket connection
      const votingData = localStorage.getItem("votingData")

      if (votingData) {
        const data = JSON.parse(votingData)
        setCurrentRound(data.currentRound)
        setQuestion(data.question)
        setOptions(data.options)

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
        // Auto-submit when time runs out
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

    // In a real app, this would validate against a server
    if (code.length < 3) {
      toast({
        title: "Invalid code",
        description: "Please enter a valid voting code",
        variant: "destructive",
      })
      return
    }

    // Check if code exists in the predefined list
    const savedCodes = localStorage.getItem("codes")
    const validCodes = savedCodes ? JSON.parse(savedCodes) : []

    if (!validCodes.includes(code)) {
      toast({
        title: "Invalid code",
        description: "This code is not recognized",
        variant: "destructive",
      })
      return
    }

    // Check if code was already used for this round
    const usedCodes = JSON.parse(localStorage.getItem("usedCodes") || "{}")
    if (usedCodes[code] && usedCodes[code].includes(currentRound)) {
      toast({
        title: "Code already used",
        description: "This code has already been used for this round",
        variant: "destructive",
      })
      return
    }

    setStatus("waiting")
    toast({
      title: "Code accepted",
      description: "Waiting for voting to start",
    })

    // Check if voting is already active
    const votingData = localStorage.getItem("votingData")
    if (votingData) {
      const data = JSON.parse(votingData)
      if (data.isActive) {
        setStatus("voting")
        setTimeLeft(data.timeLeft)
      }
    }
  }

  const handleSubmit = () => {
    if (selectedOption === null) {
      toast({
        title: "No selection made",
        description: "Please select an option before submitting",
        variant: "destructive",
      })
      return
    }

    // Record vote in localStorage (in a real app, this would be a server call)
    const votes = JSON.parse(localStorage.getItem("votes") || "{}")
    if (!votes[currentRound]) votes[currentRound] = [0, 0]
    votes[currentRound][selectedOption]++
    localStorage.setItem("votes", JSON.stringify(votes))

    // Mark code as used for this round
    const usedCodes = JSON.parse(localStorage.getItem("usedCodes") || "{}")
    if (!usedCodes[code]) usedCodes[code] = []
    usedCodes[code].push(currentRound)
    localStorage.setItem("usedCodes", JSON.stringify(usedCodes))

    setStatus("completed")
    toast({
      title: "Vote submitted",
      description: "Thank you for voting!",
    })
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md bg-zinc-900 border-purple-700 shadow-lg p-6">
        <h1 className="text-2xl font-bold text-center text-purple-400 mb-6">Band Competition Voting</h1>

        {status === "login" && (
          <form onSubmit={handleCodeSubmit} className="space-y-4">
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-zinc-300 mb-1">
                Enter your voting code
              </label>
              <Input
                id="code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="bg-zinc-800 border-purple-700 text-white"
                placeholder="Enter your code"
                required
              />
            </div>
            <Button type="submit" className="w-full bg-purple-700 hover:bg-purple-800 text-white">
              Submit Code
            </Button>
          </form>
        )}

        {status === "waiting" && (
          <div className="text-center py-8">
            <div className="animate-pulse mb-4">
              <div className="h-12 w-12 rounded-full bg-purple-700 mx-auto"></div>
            </div>
            <h2 className="text-xl font-semibold text-purple-400 mb-2">Waiting for voting to start</h2>
            <p className="text-zinc-400">The manager will start the next round soon</p>
          </div>
        )}

        {status === "voting" && (
          <div className="space-y-6">
            <div className="bg-purple-900/50 rounded-lg p-3 text-center">
              <div className="text-sm text-purple-300 mb-1">Time Remaining</div>
              <div className="text-2xl font-bold text-white">{timeLeft} seconds</div>
            </div>

            <div className="mb-4">
              <h2 className="text-xl font-semibold text-purple-400 mb-3">
                Round {currentRound + 1}: {question}
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
                        className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                          selectedOption === index ? "border-purple-500" : "border-zinc-500"
                        }`}
                      >
                        {selectedOption === index && <div className="w-3 h-3 rounded-full bg-purple-500"></div>}
                      </div>
                      <span className="text-white">{option}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              className="w-full bg-purple-700 hover:bg-purple-800 text-white py-3 h-auto"
              disabled={selectedOption === null}
            >
              Submit Vote
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
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-purple-400 mb-2">Vote Submitted!</h2>
            <p className="text-zinc-400 mb-6">Thank you for voting. Waiting for the next round.</p>
            <Button
              onClick={() => setStatus("waiting")}
              variant="outline"
              className="border-purple-700 text-purple-400 hover:bg-purple-900"
            >
              Continue to Next Round
            </Button>
          </div>
        )}
      </Card>
    </div>
  )
}

