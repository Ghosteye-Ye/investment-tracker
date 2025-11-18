"use client"

import { useState } from "react"
import { TrendingUp, TrendingDown, ChevronDown, ChevronRight, ShoppingCart, MoreVertical, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { SellTransactionModal } from "@/components/sell-transaction-modal"
import type { Transaction, AccountSettings } from "@/types/investment"

/**
 * 格式化日期时间，显示完整的时分秒
 */
const formatDateTime = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })
}

interface TransactionCardProps {
  transaction: Transaction
  accountType: "stock" | "gold"
  accountSettings: AccountSettings
  onSell: (transactionId: string, sellDate: string, sellQuantity: number, sellPrice: number) => void
  onDelete: (transactionId: string) => void
}

export function TransactionCard({
  transaction,
  accountType,
  accountSettings,
  onSell,
  onDelete,
}: TransactionCardProps) {
  const [showSellModal, setShowSellModal] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isExpanded, setIsExpanded] = useState(accountSettings.expandSubTransactions)

  const remainingQuantity = transaction.buyQuantity - (transaction.sellQuantity || 0)
  const subTransactions = transaction.children || []
  const hasSubTransactions = subTransactions.length > 0
  const canSell = remainingQuantity > 0
  const isFullySold = remainingQuantity === 0
  const isPartiallySold = (transaction.sellQuantity || 0) > 0 && remainingQuantity > 0

  // 父级交易的 profit 已经累计了所有子交易的收益
  const totalProfit = transaction.profit || 0

  // 计算总收益率
  const getTotalReturnRate = () => {
    const totalSoldQuantity = transaction.sellQuantity || 0
    if (totalSoldQuantity > 0) {
      return (totalProfit / (totalSoldQuantity * transaction.buyPrice)) * 100
    }
    return 0
  }

  const handleDelete = () => {
    onDelete(transaction.id)
    setShowDeleteDialog(false)
  }

  return (
    <>
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
        <CardContent className="p-6">
          <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3 flex-1">
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
                  <p className="text-slate-400 text-sm">{formatDateTime(transaction.buyDate)}</p>
                </div>
                {hasSubTransactions && (
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-full w-8 h-8 p-0"
                    >
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </Button>
                  </CollapsibleTrigger>
                )}
              </div>
              <div className="flex items-center gap-2">
                {canSell && (
                  <Button
                    onClick={() => setShowSellModal(true)}
                    size="sm"
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-full px-4 py-2 shadow-lg"
                  >
                    卖出
                  </Button>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-full w-8 h-8 p-0"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                    <DropdownMenuItem
                      className="text-red-400 focus:text-red-300 focus:bg-slate-700/50 cursor-pointer"
                      onClick={() => setShowDeleteDialog(true)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      删除交易
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* 买入信息 - 始终显示 */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-slate-400 text-sm">买入时间</p>
                <p className="text-white font-medium text-sm">{formatDateTime(transaction.buyDate)}</p>
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
                    <p className={`font-medium ${totalProfit >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {accountSettings.currency}
                      {totalProfit.toLocaleString()}
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
                    <p className="text-white font-medium text-sm">{formatDateTime(transaction.sellDate)}</p>
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
                            {subTransaction.sellDate && formatDateTime(subTransaction.sellDate)}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-slate-400 text-xs">卖出时间</p>
                          <p className="text-white text-xs">
                            {subTransaction.sellDate && formatDateTime(subTransaction.sellDate)}
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
            )}
          </Collapsible>
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

      {/* 删除确认对话框 */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-slate-800 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">确认删除交易</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              {isFullySold && (
                <>
                  你确定要删除这笔已实现收益为{" "}
                  <span className="text-white font-medium">
                    {accountSettings.currency}
                    {totalProfit.toLocaleString()}
                  </span>{" "}
                  的交易吗？
                </>
              )}
              {!isFullySold && !isPartiallySold && <>你确定要删除这笔买入交易吗？</>}
              {isPartiallySold && (
                <>
                  此交易包含 <span className="text-white font-medium">{subTransactions.length}</span> 条卖出记录，删除后所有相关数据都将被删除。
                </>
              )}
              <br />
              <br />
              <span className="text-red-400 font-medium">此操作无法恢复，请谨慎操作！</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-700 text-white hover:bg-slate-600 border-slate-600">
              取消
            </AlertDialogCancel>
            <AlertDialogAction className="bg-red-500 text-white hover:bg-red-600" onClick={handleDelete}>
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
