"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    const authStatus = sessionStorage.getItem("adminAuthenticated")
    if (authStatus === "true") {
      setIsAuthenticated(true)
    }
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-sm bg-black/80 backdrop-blur-sm border-white/10">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-bold text-center text-[#FFB6C1]">
              <span>管理员登录</span>
              <div className="text-sm text-white/40 mt-1">Manager Login</div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#FFB6C1]/50"
                placeholder="Password"
                required
              />
              <Button type="submit" className="w-full bg-[#FFB6C1] hover:bg-[#FFB6C1]/80 text-black font-semibold">
                Login
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#FFB6C1]">Admin Dashboard</h1>
          <p className="text-white/40 text-sm mt-1">管理面板</p>
        </div>

        <div className="space-y-3">
          <Link href="/admin/control">
            <Card className="bg-white/5 border-white/10 hover:border-[#FFB6C1]/40 hover:bg-white/10 transition-all cursor-pointer">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <div className="text-white font-medium">Control Panel</div>
                  <div className="text-white/40 text-sm">控制面板 - Manage rounds & voting</div>
                </div>
                              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/results">
            <Card className="bg-white/5 border-white/10 hover:border-[#FFB6C1]/40 hover:bg-white/10 transition-all cursor-pointer mt-3">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <div className="text-white font-medium">Results</div>
                  <div className="text-white/40 text-sm">投票结果 - View voting results</div>
                </div>
                              </CardContent>
            </Card>
          </Link>

          <Link href="/">
            <Card className="bg-white/5 border-white/10 hover:border-[#FFB6C1]/40 hover:bg-white/10 transition-all cursor-pointer mt-3">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <div className="text-white font-medium">Vote Page</div>
                  <div className="text-white/40 text-sm">投票页面 - View as voter</div>
                </div>
                              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}
