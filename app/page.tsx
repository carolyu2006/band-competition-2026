"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { AnimatedCircle } from "@/components/animated-circle"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative">
      {/* <AnimatedCircle /> */}
      <Card className="w-full max-w-md bg-zinc-900/80 backdrop-blur-sm border-orange-700 shadow-lg p-4 md:p-6 z-10">
        <h1 className="text-xl md:text-2xl font-bold text-center text-orange-400 mb-4 md:mb-6">
          <span>乐队比赛投票系统</span>
          <div className="text-base md:text-lg text-zinc-400">Band Competition Voting System</div>
        </h1>

        <div className="space-y-4">
          
          <div className="text-center">
            <div className="text-zinc-400 mb-2">
              <span>请选择您的角色</span>
              <div className="text-sm">Please select your role</div>
            </div>
          </div>

          <div className="grid gap-4">
            <Link href="/admin">
              <Button className="w-full bg-orange-700 hover:bg-orange-800 text-white py-6">
                <span>管理员登录</span>
                <div className="text-sm">Manager Login</div>
              </Button>
            </Link>

            <Link href="/vote">
              <Button className="w-full bg-orange-700 hover:bg-orange-800 text-white py-6">
                <span>投票者入口</span>
                <div className="text-sm">Voter Entry</div>
              </Button>
            </Link>
          </div>

          <div className="text-center mt-6">
            <div className="text-zinc-400 text-sm">
              <span>扫描二维码或点击按钮进入相应页面</span>
              <div className="text-xs">Scan QR code or click button to enter respective page</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

