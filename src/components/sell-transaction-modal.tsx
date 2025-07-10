"use client"

import type React from "react"
import type { AccountSettings } from "@/types/investment" // Import AccountSettings type
import { useState } from "react"
import { X, TrendingUp, TrendingDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Transaction } from "@/types/investment"
import { DatePicker } from "@/components/date-picker"

// Add accountSettings prop to the interface:
interface SellTransactionModalProps {
  isOpen: boolean
  onClose: () => void
  transaction: Transaction
  accountType: "stock" | "gold"
  accountSettings: AccountSettings
  onSubmit: (transactionId: string, sellDate: string, sellQuantity: number, sellPrice: number) => void
}

export function SellTransactionModal({
  isOpen,
  onClose,
  transaction,
  accountType,
  accountSettings,
  onSubmit,
}: SellTransactionModalProps) {
  const [sellDate, setSellDate] = useState(new Date().toISOString().split("T")[0])
  const [sellQuantity, setSellQuantity] = useState(
    (transaction.buyQuantity - (transaction.sellQuantity || 0)).toString(),
  )
  const [sellPrice, setSellPrice] = useState("")

  const remainingQuantity = transaction.buyQuantity - (transaction.sellQuantity || 0)

  const calculateProfit = () => {
    const quantity = Number.parseFloat(sellQuantity)
    const price = Number.parseFloat(sellPrice)
    if (quantity > 0 && price > 0) {
      const sellRevenue = price * quantity
      const sellFee = Math.max(quantity * accountSettings.sellFeePerUnit, accountSettings.minSellFee)
      const buyPortionCost = transaction.buyPrice * quantity
      const buyFee = (transaction.buyFee || 0) * (quantity / transaction.buyQuantity)
      return sellRevenue - sellFee - buyPortionCost - buyFee
    }
    return 0
  }

  const calculateAnnualReturn = () => {
    const profit = calculateProfit()
    const quantity = Number.parseFloat(sellQuantity)
    const price = Number.parseFloat(sellPrice)

    if (quantity > 0 && price > 0) {
      const daysDiff = Math.max(
        1,
        Math.ceil((new Date(sellDate).getTime() - new Date(transaction.buyDate).getTime()) / (1000 * 60 * 60 * 24)),
      )
      return (profit / (transaction.buyPrice * quantity)) * (365 / daysDiff) * 100
    }
    return 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const quantity = Number.parseFloat(sellQuantity)
    const price = Number.parseFloat(sellPrice)

    if (quantity > 0 && price > 0 && quantity <= remainingQuantity) {
      onSubmit(transaction.id, sellDate, quantity, price)
      setSellQuantity("")
      setSellPrice("")
      setSellDate(new Date().toISOString().split("T")[0])
      onClose()
    }
  }

  if (!isOpen) return null

  const profit = calculateProfit()
  const annualReturn = calculateAnnualReturn()

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-md shadow-[0_20px_60px_0_rgba(0,0,0,0.5)] border border-slate-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">卖出交易</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-full w-8 h-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="mb-4 p-4 bg-slate-700/30 rounded-xl border border-slate-600/50">
          <p className="text-slate-400 text-sm mb-2">原始交易信息</p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-400">买入日期</p>
              <p className="text-white">{new Date(transaction.buyDate).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-slate-400">买入单价</p>
              <p className="text-white">
                {accountSettings.currency}
                {transaction.buyPrice.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-slate-400">可卖数量</p>
              <p className="text-white">
                {remainingQuantity} {accountType === "stock" ? "股" : "克"}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-slate-300 text-sm font-medium">卖出日期</Label>
            <DatePicker
              date={sellDate ? new Date(sellDate) : undefined}
              onDateChange={(date) => setSellDate(date ? date.toISOString().split("T")[0] : "")}
              placeholder="选择卖出日期"
              minDate={new Date(transaction.buyDate)}
              maxDate={new Date()}
            />
          </div>

          <div>
            <Label htmlFor="sell-quantity" className="text-slate-300 text-sm font-medium">
              卖出数量 ({accountType === "stock" ? "股" : "克"})
            </Label>
            <Input
              id="sell-quantity"
              type="number"
              step="0.01"
              min="0.01"
              max={remainingQuantity}
              value={sellQuantity}
              onChange={(e) => {
                const value = Math.min(remainingQuantity, Math.max(0.01, Number.parseFloat(e.target.value) || 0))
                setSellQuantity(value.toString())
              }}
              placeholder="请输入卖出数量"
              className="mt-1 bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-purple-500 focus:ring-purple-500/20"
              required
            />
          </div>

          <div>
            <Label htmlFor="sell-price" className="text-slate-300 text-sm font-medium">
              卖出单价 ({accountSettings.currency})
            </Label>
            <Input
              id="sell-price"
              type="number"
              step="0.01"
              min="0.01"
              value={sellPrice}
              onChange={(e) => {
                const value = Math.max(0.01, Number.parseFloat(e.target.value) || 0)
                setSellPrice(value.toString())
              }}
              placeholder="请输入卖出单价"
              className="mt-1 bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-purple-500 focus:ring-purple-500/20"
              required
            />
          </div>

          {sellQuantity && sellPrice && (
            <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/50">
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <p className="text-slate-400 text-sm">卖出总额</p>
                  <p className="text-lg font-bold text-white">
                    {accountSettings.currency}
                    {(Number.parseFloat(sellQuantity) * Number.parseFloat(sellPrice)).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">卖出手续费</p>
                  <p className="text-white">
                    {accountSettings.currency}
                    {Math.max(
                      Number.parseFloat(sellQuantity) * accountSettings.sellFeePerUnit,
                      accountSettings.minSellFee
                    ).toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-400 text-sm">预计收益</p>
                  <div className="flex items-center">
                    {profit >= 0 ? (
                      <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-400 mr-1" />
                    )}
                    <p className={`text-lg font-bold ${profit >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {accountSettings.currency}
                      {profit.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">年化收益率</p>
                  <p className={`text-lg font-bold ${annualReturn >= 0 ? "text-green-400" : "text-red-400"}`}>
                    {annualReturn.toFixed(2)}%
                  </p>
                </div>
              </div>
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
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg"
            >
              确认卖出
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
