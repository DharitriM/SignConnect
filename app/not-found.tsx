"use client"

import Link from "next/link"
import { Home, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center shadow-2xl border-0">
        <CardContent className="p-12">
          <div className="mb-8">
            <div className="text-8xl font-bold text-primary mb-4">404</div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Page Not Found</h1>
            <p className="text-muted-foreground">
              The page you're looking for doesn't exist or has been moved to a different location.
            </p>
          </div>

          <div className="space-y-4">
            <Link href="/">
              <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                <Home className="mr-2 h-4 w-4" />
                Go Home
              </Button>
            </Link>

            <Button variant="outline" onClick={() => window.history.back()} className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </div>

          <div className="mt-8 pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground mb-4">Looking for something specific?</p>
            <div className="flex flex-col gap-2 text-sm">
              <Link href="/" className="text-primary hover:underline">
                Start a Video Call
              </Link>
              <Link href="/history" className="text-primary hover:underline">
                View Call History
              </Link>
              <Link href="/guide" className="text-primary hover:underline">
                How to Use Guide
              </Link>
              <Link href="/about" className="text-primary hover:underline">
                About SignConnect
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
