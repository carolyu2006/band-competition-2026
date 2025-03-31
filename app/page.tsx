import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md bg-zinc-900 border-purple-700 shadow-lg p-4 md:p-6">
        <h1 className="text-xl md:text-2xl font-bold text-center text-purple-400 mb-4 md:mb-6">
          <div>乐队比赛投票系统</div>
          <div className="text-base md:text-lg text-zinc-400">Band Competition Voting System</div>
        </h1>

        <div className="space-y-4">
          <div className="text-center">
            <p className="text-zinc-400 mb-2">
              <div>请选择您的角色</div>
              <div className="text-sm">Please select your role</div>
            </p>
          </div>

          <div className="grid gap-4">
            <Link href="/admin">
              <Button className="w-full bg-purple-700 hover:bg-purple-800 text-white py-6">
                <div>管理员登录</div>
                <div className="text-sm">Manager Login</div>
              </Button>
            </Link>

            <Link href="/vote">
              <Button className="w-full bg-purple-700 hover:bg-purple-800 text-white py-6">
                <div>投票者入口</div>
                <div className="text-sm">Voter Entry</div>
              </Button>
            </Link>
          </div>

          <div className="text-center mt-6">
            <p className="text-zinc-400 text-sm">
              <div>扫描二维码或点击按钮进入相应页面</div>
              <div className="text-xs">Scan QR code or click button to enter respective page</div>
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}

