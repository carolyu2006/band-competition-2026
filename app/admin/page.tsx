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

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [currentRound, setCurrentRound] = useState(0)
  const [isVotingActive, setIsVotingActive] = useState(false)
  const [timeLeft, setTimeLeft] = useState(60)
  const [initialTime, setInitialTime] = useState(60)
  const [rounds, setRounds] = useState([
    { question: "Which band do you prefer?", options: ["Band A", "Band B"] },
    { question: "Which band do you prefer?", options: ["Band A", "Band B"] },
    { question: "Which band do you prefer?", options: ["Band A", "Band B"] },
  ])
  const [votes, setVotes] = useState<number[][]>([])
  const [codes, setCodes] = useState<string[]>([])
  const [codesInput, setCodesInput] = useState("")
  const [baseUrl, setBaseUrl] = useState("")
  const [allowCodeReuse, setAllowCodeReuse] = useState(false)
  const [codeStatuses, setCodeStatuses] = useState<{ [key: string]: boolean }>({})
  const { toast } = useToast()

  // Initialize data
  useEffect(() => {
    // Set base URL for QR code
    setBaseUrl(window.location.origin + "/vote")

    // Load any existing votes from localStorage
    const savedVotes = localStorage.getItem("votes")
    if (savedVotes) {
      setVotes(Object.values(JSON.parse(savedVotes)))
    } else {
      // Initialize with 3 rounds of [0,0] votes
      setVotes([
        [0, 0],
        [0, 0],
        [0, 0],
      ])
    }

    // Load saved rounds if they exist
    const savedRounds = localStorage.getItem("rounds")
    if (savedRounds) {
      setRounds(JSON.parse(savedRounds))
    }

    // Load saved codes if they exist
    const savedCodes = localStorage.getItem("codes")
    console.log("Loading saved codes:", savedCodes)
    if (savedCodes) {
      const parsedCodes = JSON.parse(savedCodes)
      console.log("Parsed codes:", parsedCodes)
      setCodes(parsedCodes)
      setCodesInput(parsedCodes.join("\n"))
      
      // Initialize code statuses
      const savedStatuses = localStorage.getItem("codeStatuses")
      console.log("Loading saved statuses:", savedStatuses)
      if (savedStatuses) {
        setCodeStatuses(JSON.parse(savedStatuses))
      } else {
        // Initialize all codes as unused
        const initialStatuses = parsedCodes.reduce((acc: { [key: string]: boolean }, code: string) => {
          acc[code] = false
          return acc
        }, {})
        console.log("Initializing new statuses:", initialStatuses)
        setCodeStatuses(initialStatuses)
        localStorage.setItem("codeStatuses", JSON.stringify(initialStatuses))
      }
    }

    // Load code reuse setting
    const savedReuseSetting = localStorage.getItem("allowCodeReuse")
    if (savedReuseSetting !== null) {
      setAllowCodeReuse(JSON.parse(savedReuseSetting))
    }

    // Check if already authenticated in this session
    const authStatus = sessionStorage.getItem("adminAuthenticated")
    if (authStatus === "true") {
      setIsAuthenticated(true)
    }
  }, [])

  // Save code statuses when they change
  useEffect(() => {
    localStorage.setItem("codeStatuses", JSON.stringify(codeStatuses))
  }, [codeStatuses])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()

    if (password === "Carol2006") {
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
  }

  // Timer effect
  useEffect(() => {
    if (!isVotingActive || timeLeft <= 0) return

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1)

      // Update voting data in localStorage for real-time sync
      localStorage.setItem(
        "votingData",
        JSON.stringify({
          isActive: isVotingActive,
          currentRound,
          question: rounds[currentRound].question,
          options: rounds[currentRound].options,
          timeLeft: timeLeft - 1,
        }),
      )

      if (timeLeft === 1) {
        endVoting()
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [timeLeft, isVotingActive])

  const startVoting = () => {
    setIsVotingActive(true)
    setTimeLeft(initialTime)

    // Update voting data in localStorage for real-time sync
    localStorage.setItem(
      "votingData",
      JSON.stringify({
        isActive: true,
        currentRound,
        question: rounds[currentRound].question,
        options: rounds[currentRound].options,
        timeLeft: initialTime,
      }),
    )

    toast({
      title: "Voting started",
      description: `Round ${currentRound + 1} voting is now active`,
    })
  }

  const endVoting = () => {
    setIsVotingActive(false)

    // Update voting data in localStorage
    localStorage.setItem(
      "votingData",
      JSON.stringify({
        isActive: false,
        currentRound,
        question: rounds[currentRound].question,
        options: rounds[currentRound].options,
        timeLeft: 0,
      }),
    )

    toast({
      title: "Voting ended",
      description: `Round ${currentRound + 1} voting has ended`,
    })
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

    if (currentRound < 2) {
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

  const updateOption = (roundIndex: number, optionIndex: number, value: string) => {
    const newRounds = [...rounds]
    newRounds[roundIndex].options[optionIndex] = value
    setRounds(newRounds)
    localStorage.setItem("rounds", JSON.stringify(newRounds))
  }

  const updateQuestion = (roundIndex: number, value: string) => {
    const newRounds = [...rounds]
    newRounds[roundIndex].question = value
    setRounds(newRounds)
    localStorage.setItem("rounds", JSON.stringify(newRounds))
  }

  const resetVotes = () => {
    if (isVotingActive) {
      toast({
        title: "Cannot reset votes",
        description: "Please end the current voting session first",
        variant: "destructive",
      })
      return
    }

    // Reset votes for current round
    const newVotes = [...votes]
    newVotes[currentRound] = [0, 0]
    setVotes(newVotes)

    // Update in localStorage
    const votesObj: { [key: number]: number[] } = {}
    newVotes.forEach((vote, index) => {
      votesObj[index] = vote
    })
    localStorage.setItem("votes", JSON.stringify(votesObj))

    toast({
      title: "Votes reset",
      description: `Votes for round ${currentRound + 1} have been reset`,
    })
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

  const saveCodes = () => {
    // Split the input by newlines and filter out empty lines
    const codeList = codesInput
      .split("\n")
      .map((code) => code.trim())
      .filter((code) => code.length > 0)

    if (codeList.length === 0) {
      toast({
        title: "No codes provided",
        description: "Please enter at least one code",
        variant: "destructive",
      })
      return
    }

    console.log("Saving codes:", codeList)
    setCodes(codeList)
    localStorage.setItem("codes", JSON.stringify(codeList))

    // Initialize code statuses for new codes
    const newStatuses = codeList.reduce((acc: { [key: string]: boolean }, code: string) => {
      acc[code] = false
      return acc
    }, {})
    setCodeStatuses(newStatuses)
    localStorage.setItem("codeStatuses", JSON.stringify(newStatuses))

    toast({
      title: "Codes saved",
      description: `${codeList.length} voting codes have been saved`,
    })
  }

  // Load votes from localStorage periodically to see real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      const savedVotes = localStorage.getItem("votes")
      if (savedVotes) {
        const parsedVotes = JSON.parse(savedVotes)
        const votesArray = Object.keys(parsedVotes).map((key) => parsedVotes[key])
        setVotes(votesArray)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const toggleCodeStatus = (code: string) => {
    setCodeStatuses(prev => ({
      ...prev,
      [code]: !prev[code]
    }))
  }

  const resetAllCodes = () => {
    const newStatuses = codes.reduce((acc: { [key: string]: boolean }, code: string) => {
      acc[code] = false
      return acc
    }, {})
    setCodeStatuses(newStatuses)
    localStorage.setItem("codeStatuses", JSON.stringify(newStatuses))
    toast({
      title: "Codes reset",
      description: "All codes have been marked as unused",
    })
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md bg-zinc-900 border-purple-700">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center text-purple-400">Manager Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-zinc-300 mb-1">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-zinc-800 border-purple-700 text-white"
                  placeholder="Enter password"
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-purple-700 hover:bg-purple-800 text-white">
                Login
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Button
            onClick={() => window.history.back()}
            variant="outline"
            className="border-purple-700 text-purple-400 hover:bg-purple-900"
          >
            ← Back
          </Button>
          <h1 className="text-3xl font-bold text-purple-400">Band Competition Manager Dashboard</h1>
          <div className="w-20"></div> {/* Spacer for alignment */}
        </div>

        <Tabs defaultValue="control" className="space-y-6">
          <TabsList className="bg-zinc-900 border-b border-purple-700">
            <TabsTrigger value="control" className="data-[state=active]:bg-purple-900 data-[state=active]:text-white">
              Control Panel
            </TabsTrigger>
            <TabsTrigger value="results" className="data-[state=active]:bg-purple-900 data-[state=active]:text-white">
              Results
            </TabsTrigger>
            <TabsTrigger value="codes" className="data-[state=active]:bg-purple-900 data-[state=active]:text-white">
              Voting Codes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="control" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-zinc-900 border-purple-700">
                <CardHeader>
                  <CardTitle className="text-purple-400">Voting Control</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between bg-zinc-800 p-4 rounded-lg">
                    <div>
                      <p className="text-zinc-400 text-sm">Current Round</p>
                      <p className="text-xl font-bold text-white">{currentRound + 1} of 3</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        onClick={previousRound}
                        variant="outline"
                        className="border-purple-700 text-purple-400 hover:bg-purple-900"
                        disabled={currentRound === 0 || isVotingActive}
                      >
                        Previous
                      </Button>
                      <Button
                        onClick={nextRound}
                        variant="outline"
                        className="border-purple-700 text-purple-400 hover:bg-purple-900"
                        disabled={currentRound === 2 || isVotingActive}
                      >
                        Next
                      </Button>
                    </div>
                  </div>

                  <div className="bg-zinc-800 p-4 rounded-lg">
                    <p className="text-zinc-400 text-sm mb-2">Voting Timer (seconds)</p>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="number"
                        value={initialTime}
                        onChange={(e) => setInitialTime(Number.parseInt(e.target.value) || 60)}
                        className="bg-zinc-700 border-purple-700 text-white"
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
                        End Voting
                      </Button>
                    ) : (
                      <Button onClick={startVoting} className="flex-1 bg-purple-700 hover:bg-purple-800 text-white">
                        Start Voting
                      </Button>
                    )}
                    <Button
                      onClick={resetVotes}
                      variant="outline"
                      className="border-red-700 text-red-400 hover:bg-red-900/30"
                      disabled={isVotingActive}
                    >
                      Reset Votes
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900 border-purple-700">
                <CardHeader>
                  <CardTitle className="text-purple-400">Question Setup</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">Question</label>
                    <Input
                      value={rounds[currentRound].question}
                      onChange={(e) => updateQuestion(currentRound, e.target.value)}
                      className="bg-zinc-800 border-purple-700 text-white"
                      placeholder="Enter question"
                      disabled={isVotingActive}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">Option 1</label>
                    <Input
                      value={rounds[currentRound].options[0]}
                      onChange={(e) => updateOption(currentRound, 0, e.target.value)}
                      className="bg-zinc-800 border-purple-700 text-white"
                      placeholder="Enter first option"
                      disabled={isVotingActive}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">Option 2</label>
                    <Input
                      value={rounds[currentRound].options[1]}
                      onChange={(e) => updateOption(currentRound, 1, e.target.value)}
                      className="bg-zinc-800 border-purple-700 text-white"
                      placeholder="Enter second option"
                      disabled={isVotingActive}
                    />
                  </div>

                  <div className="pt-2">
                    <Button
                      onClick={() => {
                        localStorage.setItem(
                          "votingData",
                          JSON.stringify({
                            isActive: isVotingActive,
                            currentRound,
                            question: rounds[currentRound].question,
                            options: rounds[currentRound].options,
                            timeLeft,
                          }),
                        )
                        toast({
                          title: "Question updated",
                          description: "The question and options have been updated",
                        })
                      }}
                      className="w-full bg-purple-700 hover:bg-purple-800 text-white"
                      disabled={isVotingActive}
                    >
                      Update Question
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-zinc-900 border-purple-700">
              <CardHeader>
                <CardTitle className="text-purple-400">QR Code</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <div className="bg-white p-4 rounded-lg mb-4">
                  <QRCodeSVG value={baseUrl} size={200} />
                </div>
                <p className="text-zinc-400 text-sm text-center">Scan this QR code to access the voting page</p>
                <p className="text-purple-400 mt-2 text-center font-mono">{baseUrl}</p>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-purple-700">
              <CardHeader>
                <CardTitle className="text-purple-400">Voting Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-zinc-300">Allow Code Reuse</label>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-zinc-400">{allowCodeReuse ? "Yes" : "No"}</span>
                    <Button
                      onClick={() => setAllowCodeReuse(!allowCodeReuse)}
                      className="bg-purple-700 hover:bg-purple-800 text-white"
                    >
                      {allowCodeReuse ? "Disable" : "Enable"}
                    </Button>
                  </div>
                </div>
                <div className="text-sm text-zinc-400">
                  {allowCodeReuse 
                    ? "Codes can be used multiple times across different rounds" 
                    : "Each code can only be used once per round"}
                </div>

                <div className="pt-4 border-t border-zinc-700 space-y-4">
                  <Button
                    onClick={() => {
                      // Clear all localStorage data
                      localStorage.clear()
                      // Reset code statuses
                      const newStatuses: Record<string, boolean> = {}
                      codes.forEach((code) => {
                        newStatuses[code] = false
                      })
                      localStorage.setItem("codeStatuses", JSON.stringify(newStatuses))
                      // Reset votes
                      localStorage.setItem("votes", JSON.stringify({}))
                      toast({
                        title: "Cache cleared",
                        description: "All data has been reset",
                      })
                    }}
                    variant="outline"
                    className="w-full border-yellow-700 text-yellow-400 hover:bg-yellow-900/30"
                  >
                    Clear All Cache
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="results">
            <Card className="bg-zinc-900 border-purple-700">
              <CardHeader>
                <CardTitle className="text-purple-400">Voting Results</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="round1">
                  <TabsList className="bg-zinc-800 mb-4">
                    <TabsTrigger
                      value="round1"
                      className="data-[state=active]:bg-purple-900 data-[state=active]:text-white"
                    >
                      Round 1
                    </TabsTrigger>
                    <TabsTrigger
                      value="round2"
                      className="data-[state=active]:bg-purple-900 data-[state=active]:text-white"
                    >
                      Round 2
                    </TabsTrigger>
                    <TabsTrigger
                      value="round3"
                      className="data-[state=active]:bg-purple-900 data-[state=active]:text-white"
                    >
                      Round 3
                    </TabsTrigger>
                  </TabsList>

                  {[0, 1, 2].map((round) => (
                    <TabsContent key={round} value={`round${round + 1}`} className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={[
                            {
                              name: rounds[round].options[0] || `Band A`,
                              votes: votes[round] ? votes[round][0] : 0,
                            },
                            {
                              name: rounds[round].options[1] || `Band B`,
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
                          <Bar dataKey="votes" fill="#9333ea" name="Votes" />
                        </BarChart>
                      </ResponsiveContainer>

                      <div className="mt-4 grid grid-cols-2 gap-4">
                        <div className="bg-zinc-800 p-3 rounded-lg">
                          <p className="text-zinc-400 text-sm">Total Votes</p>
                          <p className="text-xl font-bold text-white">
                            {votes[round] ? votes[round][0] + votes[round][1] : 0}
                          </p>
                        </div>
                        <div className="bg-zinc-800 p-3 rounded-lg">
                          <p className="text-zinc-400 text-sm">Leading Option</p>
                          <p className="text-xl font-bold text-purple-400">
                            {votes[round] && votes[round][0] !== votes[round][1]
                              ? votes[round][0] > votes[round][1]
                                ? rounds[round].options[0]
                                : rounds[round].options[1]
                              : "Tie"}
                          </p>
                        </div>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>

                <Button onClick={exportResults} className="mt-32 bg-purple-700 hover:bg-purple-800 text-white">
                  Export Results
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="codes">
            <Card className="bg-zinc-900 border-purple-700">
              <CardHeader>
                <CardTitle className="text-purple-400">Voting Codes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <p className="text-zinc-400 mb-2">
                    Enter your voting codes below, one code per line. You need to save the codes after making changes.
                  </p>

                  <Textarea
                    value={codesInput}
                    onChange={(e) => setCodesInput(e.target.value)}
                    className="bg-zinc-800 border-purple-700 text-white h-40 font-mono"
                    placeholder="Enter voting codes, one per line"
                  />

                  <div className="flex space-x-3 mt-3">
                    <Button onClick={saveCodes} className="bg-purple-700 hover:bg-purple-800 text-white">
                      Save Codes
                    </Button>

                    <Button
                      onClick={() => {
                        // Generate 150 random codes
                        const newCodes = Array.from({ length: 150 }, () =>
                          Math.random().toString(36).substring(2, 8).toUpperCase(),
                        )
                        setCodesInput(newCodes.join("\n"))
                      }}
                      variant="outline"
                      className="border-purple-700 text-purple-400 hover:bg-purple-900"
                    >
                      Generate 150 Random Codes
                    </Button>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-medium text-purple-400">Current Codes ({codes.length})</h3>
                    <Button
                      onClick={resetAllCodes}
                      variant="outline"
                      className="border-purple-700 text-purple-400 hover:bg-purple-900"
                    >
                      Reset All Codes
                    </Button>
                  </div>

                  {codes.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 max-h-60 overflow-y-auto p-2">
                      {codes.map((code, index) => (
                        <div key={index} className="bg-zinc-800 p-2 rounded border border-zinc-700">
                          <div className="flex items-center justify-between">
                            <Input
                              value={code}
                              onChange={(e) => {
                                const newCodes = [...codes]
                                newCodes[index] = e.target.value
                                setCodes(newCodes)
                                setCodesInput(newCodes.join("\n"))
                                localStorage.setItem("codes", JSON.stringify(newCodes))
                              }}
                              className="bg-transparent border-none p-0 h-auto font-mono text-sm text-purple-300 focus-visible:ring-0 focus-visible:ring-offset-0"
                            />
                            <Button
                              onClick={() => toggleCodeStatus(code)}
                              variant="outline"
                              className={`ml-2 px-2 py-1 text-xs ${
                                codeStatuses[code]
                                  ? "border-red-700 text-red-400 hover:bg-red-900/30"
                                  : "border-green-700 text-green-400 hover:bg-green-900/30"
                              }`}
                            >
                              {codeStatuses[code] ? "Used" : "Unused"}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-zinc-500 italic">No codes have been saved yet.</p>
                  )}

                  <Button
                    onClick={() => {
                      if (codes.length === 0) {
                        toast({
                          title: "No codes to copy",
                          description: "Please save some codes first",
                          variant: "destructive",
                        })
                        return
                      }

                      // Copy codes to clipboard
                      navigator.clipboard
                        .writeText(codes.join("\n"))
                        .then(() => {
                          toast({
                            title: "Codes copied",
                            description: "All voting codes have been copied to clipboard",
                          })
                        })
                        .catch(() => {
                          toast({
                            title: "Failed to copy",
                            description: "Could not copy codes to clipboard",
                            variant: "destructive",
                          })
                        })
                    }}
                    className="mt-4 bg-purple-700 hover:bg-purple-800 text-white"
                    disabled={codes.length === 0}
                  >
                    Copy All Codes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

