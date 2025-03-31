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
    if (savedCodes) {
      const parsedCodes = JSON.parse(savedCodes)
      setCodes(parsedCodes)
      setCodesInput(parsedCodes.join("\n"))

      // Initialize code statuses
      const savedStatuses = localStorage.getItem("codeStatuses")
      if (savedStatuses) {
        setCodeStatuses(JSON.parse(savedStatuses))
      } else {
        // Initialize all codes as unused
        const initialStatuses = parsedCodes.reduce((acc: { [key: string]: boolean }, code: string) => {
          acc[code] = false
          return acc
        }, {})
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

    setCodes(codeList)
    localStorage.setItem("codes", JSON.stringify(codeList))

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
            <CardTitle className="text-2xl font-bold text-center text-purple-400">
              <div>管理员登录</div>
              <div className="text-lg text-zinc-400">Manager Login</div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-zinc-300 mb-1">
                  <div>密码</div>
                  <div className="text-xs text-zinc-400">Password</div>
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-zinc-800 border-purple-700 text-white"
                  placeholder="输入密码"
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-purple-700 hover:bg-purple-800 text-white">
                <div>登录</div>
                <div className="text-sm">Login</div>
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
            <div>返回</div>
            <div className="text-sm">← Back</div>
          </Button>
          <h1 className="text-3xl font-bold text-purple-400">
            <div>乐队比赛管理面板</div>
            <div className="text-lg text-zinc-400">Band Competition Manager Dashboard</div>
          </h1>
          <div className="w-20"></div>
        </div>

        <Tabs defaultValue="control" className="space-y-6">
          <TabsList className="bg-zinc-900 border-b border-purple-700">
            <TabsTrigger value="control" className="data-[state=active]:bg-purple-900 data-[state=active]:text-white">
              <div>控制面板</div>
              <div className="text-sm">Control Panel</div>
            </TabsTrigger>
            <TabsTrigger value="results" className="data-[state=active]:bg-purple-900 data-[state=active]:text-white">
              <div>结果</div>
              <div className="text-sm">Results</div>
            </TabsTrigger>
            <TabsTrigger value="codes" className="data-[state=active]:bg-purple-900 data-[state=active]:text-white">
              <div>投票码</div>
              <div className="text-sm">Voting Codes</div>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="control" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-zinc-900 border-purple-700">
                <CardHeader>
                  <CardTitle className="text-purple-400">
                    <div>投票控制</div>
                    <div className="text-lg text-zinc-400">Voting Control</div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between bg-zinc-800 p-4 rounded-lg">
                    <div>
                      <p className="text-zinc-400 text-sm">
                        <div>当前轮次</div>
                        <div className="text-xs">Current Round</div>
                      </p>
                      <p className="text-xl font-bold text-white">{currentRound + 1} of 3</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        onClick={previousRound}
                        variant="outline"
                        className="border-purple-700 text-purple-400 hover:bg-purple-900"
                        disabled={currentRound === 0 || isVotingActive}
                      >
                        <div>上一轮</div>
                        <div className="text-sm">Previous</div>
                      </Button>
                      <Button
                        onClick={nextRound}
                        variant="outline"
                        className="border-purple-700 text-purple-400 hover:bg-purple-900"
                        disabled={currentRound === 2 || isVotingActive}
                      >
                        <div>下一轮</div>
                        <div className="text-sm">Next</div>
                      </Button>
                    </div>
                  </div>

                  <div className="bg-zinc-800 p-4 rounded-lg">
                    <p className="text-zinc-400 text-sm mb-2">
                      <div>投票计时器（秒）</div>
                      <div className="text-xs">Voting Timer (seconds)</div>
                    </p>
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
                        <div>结束投票</div>
                        <div className="text-sm">End Voting</div>
                      </Button>
                    ) : (
                      <Button onClick={startVoting} className="flex-1 bg-purple-700 hover:bg-purple-800 text-white">
                        <div>开始投票</div>
                        <div className="text-sm">Start Voting</div>
                      </Button>
                    )}
                    <Button
                      onClick={resetVotes}
                      variant="outline"
                      className="border-red-700 text-red-400 hover:bg-red-900/30"
                      disabled={isVotingActive}
                    >
                      <div>重置投票</div>
                      <div className="text-sm">Reset Votes</div>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900 border-purple-700">
                <CardHeader>
                  <CardTitle className="text-purple-400">
                    <div>问题设置</div>
                    <div className="text-lg text-zinc-400">Question Setup</div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">
                      <div>问题</div>
                      <div className="text-xs">Question</div>
                    </label>
                    <Input
                      value={rounds[currentRound].question}
                      onChange={(e) => updateQuestion(currentRound, e.target.value)}
                      className="bg-zinc-800 border-purple-700 text-white"
                      placeholder="输入问题"
                      disabled={isVotingActive}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">
                      <div>选项 1</div>
                      <div className="text-xs">Option 1</div>
                    </label>
                    <Input
                      value={rounds[currentRound].options[0]}
                      onChange={(e) => updateOption(currentRound, 0, e.target.value)}
                      className="bg-zinc-800 border-purple-700 text-white"
                      placeholder="输入第一个选项"
                      disabled={isVotingActive}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">
                      <div>选项 2</div>
                      <div className="text-xs">Option 2</div>
                    </label>
                    <Input
                      value={rounds[currentRound].options[1]}
                      onChange={(e) => updateOption(currentRound, 1, e.target.value)}
                      className="bg-zinc-800 border-purple-700 text-white"
                      placeholder="输入第二个选项"
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
                          title: "问题已更新",
                          description: "问题和选项已更新",
                        })
                      }}
                      className="w-full bg-purple-700 hover:bg-purple-800 text-white"
                      disabled={isVotingActive}
                    >
                      <div>更新问题</div>
                      <div className="text-sm">Update Question</div>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-zinc-900 border-purple-700">
              <CardHeader>
                <CardTitle className="text-purple-400">
                  <div>二维码</div>
                  <div className="text-lg text-zinc-400">QR Code</div>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <div className="bg-white p-4 rounded-lg mb-4">
                  <QRCodeSVG value={baseUrl} size={200} />
                </div>
                <p className="text-zinc-400 text-sm text-center">
                  <div>扫描此二维码访问投票页面</div>
                  <div className="text-xs">Scan this QR code to access the voting page</div>
                </p>
                <p className="text-purple-400 mt-2 text-center font-mono">{baseUrl}</p>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-purple-700">
              <CardHeader>
                <CardTitle className="text-purple-400">
                  <div>投票设置</div>
                  <div className="text-lg text-zinc-400">Voting Settings</div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-zinc-300">
                    <div>允许代码重用</div>
                    <div className="text-xs text-zinc-400">Allow Code Reuse</div>
                  </label>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-zinc-400">{allowCodeReuse ? "是" : "否"}</span>
                    <Button
                      onClick={() => setAllowCodeReuse(!allowCodeReuse)}
                      className="bg-purple-700 hover:bg-purple-800 text-white"
                    >
                      {allowCodeReuse ? "禁用" : "启用"}
                    </Button>
                  </div>
                </div>
                <div className="text-sm text-zinc-400">
                  <div>
                    {allowCodeReuse
                      ? "代码可以在不同轮次中多次使用"
                      : "每个代码在每轮中只能使用一次"}
                  </div>
                  <div className="text-xs">
                    {allowCodeReuse
                      ? "Codes can be used multiple times across different rounds"
                      : "Each code can only be used once per round"}
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-700 space-y-4">

                  <Button
                    onClick={() => {
                      localStorage.clear()
                      const newStatuses: Record<string, boolean> = {}
                      codes.forEach((code) => {
                        newStatuses[code] = false
                      })
                      localStorage.setItem("codeStatuses", JSON.stringify(newStatuses))
                      localStorage.setItem("votes", JSON.stringify({}))
                      toast({
                        title: "缓存已清除",
                        description: "所有数据已重置",
                      })
                    }}
                    variant="outline"
                    className="w-full border-yellow-700 text-yellow-400 hover:bg-yellow-900/30"
                  >
                    <div>清除所有缓存</div>
                    <div className="text-sm">Clear All Cache</div>
                  </Button>


                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="results">
            <Card className="bg-zinc-900 border-purple-700">
              <CardHeader>
                <CardTitle className="text-purple-400">
                  <div>投票结果</div>
                  <div className="text-lg text-zinc-400">Voting Results</div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="round1">
                  <TabsList className="bg-zinc-800 mb-4">
                    <TabsTrigger
                      value="round1"
                      className="data-[state=active]:bg-purple-900 data-[state=active]:text-white"
                    >
                      <div>第一轮</div>
                      <div className="text-sm">Round 1</div>
                    </TabsTrigger>
                    <TabsTrigger
                      value="round2"
                      className="data-[state=active]:bg-purple-900 data-[state=active]:text-white"
                    >
                      <div>第二轮</div>
                      <div className="text-sm">Round 2</div>
                    </TabsTrigger>
                    <TabsTrigger
                      value="round3"
                      className="data-[state=active]:bg-purple-900 data-[state=active]:text-white"
                    >
                      <div>第三轮</div>
                      <div className="text-sm">Round 3</div>
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
                          <p className="text-zinc-400 text-sm">
                            <div>总投票数</div>
                            <div className="text-xs">Total Votes</div>
                          </p>
                          <p className="text-xl font-bold text-white">
                            {votes[round] ? votes[round][0] + votes[round][1] : 0}
                          </p>
                        </div>
                        <div className="bg-zinc-800 p-3 rounded-lg">
                          <p className="text-zinc-400 text-sm">
                            <div>领先选项</div>
                            <div className="text-xs">Leading Option</div>
                          </p>
                          <p className="text-xl font-bold text-purple-400">
                            {votes[round] && votes[round][0] !== votes[round][1]
                              ? votes[round][0] > votes[round][1]
                                ? rounds[round].options[0]
                                : rounds[round].options[1]
                              : "平局"}
                          </p>
                        </div>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>

                <Button onClick={exportResults} className="mt-32 bg-purple-700 hover:bg-purple-800 text-white">
                  <div>导出结果</div>
                  <div className="text-sm">Export Results</div>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="codes">
            <Card className="bg-zinc-900 border-purple-700">
              <CardHeader>
                <CardTitle className="text-purple-400">
                  <div>投票码</div>
                  <div className="text-lg text-zinc-400">Voting Codes</div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <p className="text-zinc-400 mb-2">
                    <div>在下方输入投票码，每行一个。更改后需要保存。</div>
                    <div className="text-sm">Enter your voting codes below, one code per line. You need to save the codes after making changes.</div>
                  </p>

                  <Textarea
                    value={codesInput}
                    onChange={(e) => setCodesInput(e.target.value)}
                    className="bg-zinc-800 border-purple-700 text-white h-40 font-mono"
                    placeholder="输入投票码，每行一个"
                  />

                  <div className="flex space-x-3 mt-3">
                    <Button onClick={saveCodes} className="bg-purple-700 hover:bg-purple-800 text-white">
                      <div>保存代码</div>
                      <div className="text-sm">Save Codes</div>
                    </Button>

                    <Button
                      onClick={() => {
                        const newCodes = Array.from({ length: 150 }, () =>
                          Math.random().toString(36).substring(2, 8).toUpperCase(),
                        )
                        setCodesInput(newCodes.join("\n"))
                      }}
                      variant="outline"
                      className="border-purple-700 text-purple-400 hover:bg-purple-900"
                    >
                      <div>生成150个随机代码</div>
                      <div className="text-sm">Generate 150 Random Codes</div>
                    </Button>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-medium text-purple-400">
                      <div>当前代码 ({codes.length})</div>
                      <div className="text-sm text-zinc-400">Current Codes ({codes.length})</div>
                    </h3>
                    <Button
                      onClick={resetAllCodes}
                      variant="outline"
                      className="border-purple-700 text-purple-400 hover:bg-purple-900"
                    >
                      <div>重置所有代码</div>
                      <div className="text-sm">Reset All Codes</div>
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
                              className={`ml-2 px-2 py-1 text-xs ${codeStatuses[code]
                                ? "border-red-700 text-red-400 hover:bg-red-900/30"
                                : "border-green-700 text-green-400 hover:bg-green-900/30"
                                }`}
                            >
                              {codeStatuses[code] ? "已使用" : "未使用"}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-zinc-500 italic">
                      <div>尚未保存任何代码</div>
                      <div className="text-sm">No codes have been saved yet</div>
                    </p>
                  )}

                  <Button
                    onClick={() => {
                      if (codes.length === 0) {
                        toast({
                          title: "没有可复制的代码",
                          description: "请先保存一些代码",
                          variant: "destructive",
                        })
                        return
                      }

                      navigator.clipboard
                        .writeText(codes.join("\n"))
                        .then(() => {
                          toast({
                            title: "代码已复制",
                            description: "所有投票码已复制到剪贴板",
                          })
                        })
                        .catch(() => {
                          toast({
                            title: "复制失败",
                            description: "无法复制代码到剪贴板",
                            variant: "destructive",
                          })
                        })
                    }}
                    className="mt-4 bg-purple-700 hover:bg-purple-800 text-white"
                    disabled={codes.length === 0}
                  >
                    <div>复制所有代码</div>
                    <div className="text-sm">Copy All Codes</div>
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

