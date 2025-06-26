"use client"

import { useState } from "react"
import { TrendingUp, TrendingDown, ChevronDown, ChevronRight, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { SellTransactionModal } from "@/components/sell-transaction-modal"
import type { Transaction, AccountSettings } from "@/types/investment"

interface TransactionCardProps {
  transaction: Transaction
  accountType: "stock" | "gold"
  accountSettings: AccountSettings
  onSell: (transactionId: string, sellDate: string, sellQuantity: number, sellPrice: number) => void
  subTransactions?: Transaction[]
}

export function TransactionCard({
  transaction,
  accountType,
  accountSettings,
  onSell,
  subTransactions = [],
}: TransactionCardProps) {
  const [showSellModal, setShowSellModal] = useState(false)
  const [isExpanded, setIsExpanded] = useState(accountSettings.expandSubTransactions)

  const remainingQuantity = transaction.buyQuantity - (transaction.sellQuantity || 0)
  const hasSubTransactions = subTransactions.length > 0
  const canSell = remainingQuantity > 0
  const isFullySold = remainingQuantity === 0
  const isPartiallySold = (transaction.sellQuantity || 0) > 0 && remainingQuantity > 0

  // 计算总实现收益（包括所有子交易）
  const getTotalProfit = () => {
    let totalProfit = 0
    if (transaction.profit) {
      totalProfit += transaction.profit
    }
    subTransactions.forEach((sub) => {
      if (sub.profit) {
        totalProfit += sub.profit
      }
    })
    return totalProfit
  }

  // 计算总收益率
  const getTotalReturnRate = () => {
    const totalProfit = getTotalProfit()
    const totalSoldQuantity = transaction.sellQuantity || 0
    if (totalSoldQuantity > 0) {
      return (totalProfit / (totalSoldQuantity * transaction.buyPrice)) * 100
    }
    return 0
  }

  return (
    <>
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.3)] ${
                  isFullySold ? "bg-green-500/20" : isPartiallySold ? "bg-yellow-500/20" : "bg-blue-500/20"
                }`}
              >
                {isFullySold ? (
                  <TrendingUp className="w-6 h-6 text-green-400" />
                ) : isPartiallySold ? (
                  <TrendingDown className="w-6 h-6 text-yellow-400" />
                ) : (
                  <ShoppingCart className="w-6 h-6 text-blue-400" />
                )}
              </div>
              <div>
                <p className="text-white font-medium">
                  {isFullySold ? "已卖出" : isPartiallySold ? "部分卖出" : "买入交易"}
                </p>
                <p className="text-slate-400 text-sm">{new Date(transaction.buyDate).toLocaleDateString()}</p>
              </div>
              {hasSubTransactions && (
                <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-full w-8 h-8 p-0"
                    >
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </Button>
                  </CollapsibleTrigger>
                </Collapsible>
              )}
            </div>
            {canSell && (
              <Button
                onClick={() => setShowSellModal(true)}
                size="sm"
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-full px-4 py-2 shadow-lg"
              >
                卖出
              </Button>
            )}
          </div>

          {/* 买入信息 - 始终显示 */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <p className="text-slate-400 text-sm">买入时间</p>
              <p className="text-white font-medium">{new Date(transaction.buyDate).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm">买入数量</p>
              <p className="text-white font-medium">
                {transaction.buyQuantity.toLocaleString()} {accountType === "stock" ? "股" : "克"}
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-sm">买入单价</p>
              <p className="text-white font-medium">
                {accountSettings.currency}
                {transaction.buyPrice.toFixed(2)}
              </p>
            </div>
          </div>

          {/* 卖出信息 - 仅在已卖出时显示 */}
          {isFullySold && (
            <div className="mt-4 pt-4 border-t border-slate-700/50">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-400 text-sm">实现收益</p>
                  <p className={`font-medium ${getTotalProfit() >= 0 ? "text-green-400" : "text-red-400"}`}>
                    {accountSettings.currency}
                    {getTotalProfit().toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">单笔收益率</p>
                  <p className={`font-medium ${getTotalReturnRate() >= 0 ? "text-green-400" : "text-red-400"}`}>
                    {getTotalReturnRate().toFixed(2)}%
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 单笔完整卖出信息 */}
          {isFullySold && !hasSubTransactions && transaction.sellDate && (
            <div className="mt-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-400 text-sm">卖出时间</p>
                  <p className="text-white font-medium">{new Date(transaction.sellDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">卖出单价</p>
                  <p className="text-white font-medium">
                    {accountSettings.currency}
                    {transaction.sellPrice?.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 子交易列表 */}
          {hasSubTransactions && (
            <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
              <CollapsibleContent className="mt-4 space-y-3">
                {subTransactions.map((subTransaction) => (
                  <div key={subTransaction.id} className="ml-6 pl-4 border-l-2 border-slate-600/50">
                    <div className="bg-slate-700/30 rounded-xl p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.3)]">
                          <TrendingUp className="w-3 h-3 text-green-400" />
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">卖出记录</p>
                          <p className="text-slate-400 text-xs">
                            {subTransaction.sellDate && new Date(subTransaction.sellDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-slate-400 text-xs">卖出时间</p>
                          <p className="text-white">
                            {subTransaction.sellDate && new Date(subTransaction.sellDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-400 text-xs">卖出数量</p>
                          <p className="text-white">
                            {subTransaction.sellQuantity?.toLocaleString()} {accountType === "stock" ? "股" : "克"}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-400 text-xs">卖出单价</p>
                          <p className="text-white">
                            {accountSettings.currency}
                            {subTransaction.sellPrice?.toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-400 text-xs">实现收益</p>
                          <p className={`${(subTransaction.profit || 0) >= 0 ? "text-green-400" : "text-red-400"}`}>
                            {accountSettings.currency}
                            {subTransaction.profit?.toLocaleString()}
                          </p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-slate-400 text-xs">单笔收益率</p>
                          <p
                            className={`${
                              ((subTransaction.profit || 0) /
                                ((subTransaction.sellQuantity || 0) * transaction.buyPrice)) *
                                100 >=
                              0
                                ? "text-green-400"
                                : "text-red-400"
                            }`}
                          >
                            {(
                              ((subTransaction.profit || 0) /
                                ((subTransaction.sellQuantity || 0) * transaction.buyPrice)) *
                              100
                            ).toFixed(2)}
                            %
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>
          )}
        </CardContent>
      </Card>

      <SellTransactionModal
        isOpen={showSellModal}
        onClose={() => setShowSellModal(false)}
        transaction={transaction}
        accountType={accountType}
        accountSettings={accountSettings}
        onSubmit={onSell}
      />
    </>
  )
}
