"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import Image from "next/image"

// Hardcoded credentials for testing
const TEST_CREDENTIALS = {
  email: "test@example.com",
  password: "password123",
}

export default function LoginPage() {
  const [email, setEmail] = useState(TEST_CREDENTIALS.email)
  const [password, setPassword] = useState(TEST_CREDENTIALS.password)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Check against hardcoded credentials
      if (email === TEST_CREDENTIALS.email && password === TEST_CREDENTIALS.password) {
        // Set a cookie to simulate authentication
        document.cookie = "auth-token=authenticated; path=/; max-age=86400"

        toast({
          title: "Login successful",
          description: "Welcome to Spotify Clone!",
        })

        router.push("/library")
      } else {
        throw new Error("Invalid credentials")
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: "Please use the test credentials provided.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-4">
      <Card className="w-full max-w-md bg-zinc-900 text-white border-zinc-800">
        <CardHeader className="space-y-4 flex flex-col items-center">
          <div className="w-36 h-36 relative mb-4">
            <Image
              src="/placeholder.svg?height=144&width=144"
              alt="Spotify Logo"
              width={144}
              height={144}
              className="object-contain"
            />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Login to Spotify Clone</CardTitle>
          <CardDescription className="text-zinc-400 text-center">
            Use the pre-filled test credentials to log in
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-300">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="test@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-zinc-800 border-zinc-700 text-white"
              />
              <p className="text-xs text-zinc-500">Test email: {TEST_CREDENTIALS.email}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-zinc-300">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-zinc-800 border-zinc-700 text-white"
              />
              <p className="text-xs text-zinc-500">Test password: {TEST_CREDENTIALS.password}</p>
            </div>
            <Button
              type="submit"
              className="w-full bg-green-500 hover:bg-green-600 text-black font-bold"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Log In"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-zinc-400">
            This is a demo application with hardcoded credentials for testing purposes.
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
