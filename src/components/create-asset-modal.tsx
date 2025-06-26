"use client"

import type React from "react"

import { useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface CreateAssetModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (name: string, symbol: string) => void
  accountType: "stock" | "gold"
}

export function CreateAssetModal({ isOpen, onClose, onSubmit, accountType }: CreateAssetModalProps) {
  const [name, setName] = useState("")
  const [symbol, setSymbol] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim() && symbol.trim()) {
      onSubmit(name.trim(), symbol.trim())
      setName("")
      setSymbol("")
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-md shadow-[0_20px_60px_0_rgba(0,0,0,0.5)] border border-slate-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">添加{accountType === "stock" ? "股票" : "黄金"}标的</h2>
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
            <Label htmlFor="asset-name" className="text-slate-300 text-sm font-medium">
              {accountType === "stock" ? "股票名称" : "黄金名称"}
            </Label>
            <Input
              id="asset-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={accountType === "stock" ? "例如：苹果公司" : "例如：AU9999"}
              className="mt-1 bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-purple-500 focus:ring-purple-500/20"
              required
            />
          </div>

          <div>
            <Label htmlFor="asset-symbol" className="text-slate-300 text-sm font-medium">
              {accountType === "stock" ? "股票代码" : "黄金代码"}
            </Label>
            <Input
              id="asset-symbol"
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              placeholder={accountType === "stock" ? "例如：AAPL" : "例如：AU9999"}
              className="mt-1 bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-purple-500 focus:ring-purple-500/20"
              required
            />
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
              className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg"
            >
              添加标的
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
