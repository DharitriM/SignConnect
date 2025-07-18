"use client"

import { useState } from "react"
import { User, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface UserInfoModalProps {
  isOpen: boolean
  onSubmit: (userInfo: { name: string; email: string }) => void
}

export function UserInfoModal({ isOpen, onSubmit }: UserInfoModalProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")

  const handleSubmit = () => {
    if (name.trim() && email.trim() && email.includes("@")) {
      onSubmit({
        name: name.trim(),
        email: email.trim(),
      })
    }
  }

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Join Video Call</DialogTitle>
          <DialogDescription>Please provide your details to join the call</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="name"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Button
            onClick={handleSubmit}
            disabled={!name.trim() || !email.trim() || !email.includes("@")}
            className="w-full"
          >
            Join Call
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
