"use client"

import type React from "react"

import { useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface CreateAccountModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (name: string, type: "stock" | "gold") => void
}

export function CreateAccountModal({ isOpen, onClose, onSubmit }: CreateAccountModalProps) {
  const [name, setName] = useState("")
  const [type, setType] = useState<"stock" | "gold">("stock")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      onSubmit(name.trim(), type)
      setName("")
      setType("stock")
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-md shadow-[0_20px_60px_0_rgba(0,0,0,0.5)] border border-slate-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">创建新账户</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-full w-8 h-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="account-name" className="text-slate-300 text-sm font-medium">
              账户名称
            </Label>
            <Input
              id="account-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：中行纸黄金、雪球股票账户"
              className="mt-1 bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-purple-500 focus:ring-purple-500/20"
              required
            />
          </div>

          <div>
            <Label className="text-slate-300 text-sm font-medium">账户类型</Label>
            <div className="mt-2 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setType("stock")}
                className={`p-3 rounded-xl border transition-all ${
                  type === "stock"
                    ? "bg-purple-500/20 border-purple-500 text-purple-300"
                    : "bg-slate-700/50 border-slate-600 text-slate-300 hover:border-slate-500"
                }`}
              >
                股票账户
              </button>
              <button
                type="button"
                onClick={() => setType("gold")}
                className={`p-3 rounded-xl border transition-all ${
                  type === "gold"
                    ? "bg-purple-500/20 border-purple-500 text-purple-300"
                    : "bg-slate-700/50 border-slate-600 text-slate-300 hover:border-slate-500"
                }`}
              >
                黄金账户
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600 hover:text-white"
            >
              取消
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 hover:border-purple-400/50 backdrop-blur-sm text-purple-100 hover:text-white transition-all duration-200"
            >
              创建账户
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
