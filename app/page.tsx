import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-zinc-900 rounded-lg shadow-lg p-6 border border-purple-700">
        <h1 className="text-3xl font-bold text-center text-purple-400 mb-8">Band Competition Voting</h1>

        <div className="space-y-6">
          <Link href="/vote" className="w-full block">
            <Button className="w-full bg-purple-700 hover:bg-purple-800 text-white py-3 h-auto">
              Enter Voting Area
            </Button>
          </Link>

          <Link href="/admin" className="w-full block">
            <Button
              variant="outline"
              className="w-full border-purple-700 text-purple-400 hover:bg-purple-900 py-3 h-auto"
            >
              Manager Dashboard
            </Button>
          </Link>
        </div>

        <p className="mt-8 text-center text-zinc-400 text-sm">
          Scan the QR code or enter your voting code to participate
        </p>
      </div>
    </div>
  )
}

