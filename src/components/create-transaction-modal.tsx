"use client"

import type React from "react"

import { useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DatePicker } from "@/components/date-picker"

interface CreateTransactionModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (buyDate: string, buyQuantity: number, buyPrice: number) => void
  accountType: "stock" | "gold"
}

export function CreateTransactionModal({ isOpen, onClose, onSubmit, accountType }: CreateTransactionModalProps) {
  const [buyDate, setBuyDate] = useState(new Date().toISOString().split("T")[0])
  const [buyQuantity, setBuyQuantity] = useState("")
  const [buyPrice, setBuyPrice] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const quantity = Number.parseFloat(buyQuantity)
    const price = Number.parseFloat(buyPrice)

    if (quantity > 0 && price > 0) {
      onSubmit(buyDate, quantity, price)
      setBuyQuantity("")
      setBuyPrice("")
      setBuyDate(new Date().toISOString().split("T")[0])
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-md shadow-[0_20px_60px_0_rgba(0,0,0,0.5)] border border-slate-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">添加买入交易</h2>
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
            <Label className="text-slate-300 text-sm font-medium">买入日期</Label>
            <DatePicker
              date={buyDate ? new Date(buyDate) : undefined}
              onDateChange={(date) => setBuyDate(date ? date.toISOString().split("T")[0] : "")}
              placeholder="选择买入日期"
              maxDate={new Date()}
            />
          </div>

          <div>
            <Label htmlFor="buy-quantity" className="text-slate-300 text-sm font-medium">
              买入数量 ({accountType === "stock" ? "股" : "克"})
            </Label>
            <Input
              id="buy-quantity"
              type="number"
              step="0.01"
              min="0.01"
              value={buyQuantity}
              onChange={(e) => {
                const value = Math.max(0.01, Number.parseFloat(e.target.value) || 0)
                setBuyQuantity(value.toString())
              }}
              placeholder="请输入买入数量"
              className="mt-1 bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-purple-500 focus:ring-purple-500/20"
              required
            />
          </div>

          <div>
            <Label htmlFor="buy-price" className="text-slate-300 text-sm font-medium">
              买入单价 (¥)
            </Label>
            <Input
              id="buy-price"
              type="number"
              step="0.01"
              min="0.01"
              value={buyPrice}
              onChange={(e) => {
                const value = Math.max(0.01, Number.parseFloat(e.target.value) || 0)
                setBuyPrice(value.toString())
              }}
              placeholder="请输入买入单价"
              className="mt-1 bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-purple-500 focus:ring-purple-500/20"
              required
            />
          </div>

          {buyQuantity && buyPrice && (
            <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/50">
              <p className="text-slate-400 text-sm mb-1">买入总额</p>
              <p className="text-xl font-bold text-white">
                ¥{(Number.parseFloat(buyQuantity) * Number.parseFloat(buyPrice)).toLocaleString()}
              </p>
            </div>
          )}

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
              添加交易
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
