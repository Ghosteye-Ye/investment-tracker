"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Plus, TrendingUp, TrendingDown, Calendar, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TransactionCard } from "@/components/transaction-card"
import { CreateTransactionModal } from "@/components/create-transaction-modal"
import type { Account, Asset, Transaction } from "@/types/investment"
import { getAccountById, updateAccount } from "@/hooks/useInvestmentDB"

export default function AssetPage() {
  const { accountId, assetId } = useParams<{ accountId: string; assetId: string }>()
  const navigate = useNavigate()

  const [account, setAccount] = useState<Account | null>(null)
  const [asset, setAsset] = useState<Asset | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    if (!accountId || !assetId) return
    getAccountById(accountId).then((found) => {
      if (found) {
        setAccount(found)
        const a = found.assets.find((a) => a.id === assetId)
        setAsset(a || null)
      }
    })
  }, [accountId, assetId])

  const saveAccount = async (updated: Account) => {
    setAccount(updated)
    await updateAccount(updated)
  }

  const handleCreateTransaction = async (buyDate: string, buyQuantity: number, buyPrice: number) => {
    if (!account || !asset) return

    const buyFee = buyQuantity * buyPrice * (account.settings.buyFeeRate / 100)

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      buyDate,
      buyQuantity,
      buyPrice,
      buyFee,
      createdAt: new Date().toISOString(),
    }

    const updatedAsset = {
      ...asset,
      // transactions: [...asset.transactions, newTransaction],
      transactions: [newTransaction, ...asset.transactions]
    }

    const updatedAccount = {
      ...account,
      assets: account.assets.map((a) => (a.id === asset.id ? updatedAsset : a)),
    }

    setAsset(updatedAsset)
    await saveAccount(updatedAccount)
    setShowCreateModal(false)
  }

  const handleSellTransaction = async (
    transactionId: string,
    sellDate: string,
    sellQuantity: number,
    sellPrice: number
  ) => {
    if (!account || !asset) return

    const transaction = asset.transactions.find((t) => t.id === transactionId)
    if (!transaction) return

    const sellRevenue = sellPrice * sellQuantity
    const sellFee = sellRevenue * (account.settings.sellFeeRate / 100)
    const buyPortionCost = transaction.buyPrice * sellQuantity
    const buyFee = (transaction.buyFee || 0) * (sellQuantity / transaction.buyQuantity)
    const profit = sellRevenue - sellFee - buyPortionCost - buyFee

    const daysDiff = Math.max(
      1,
      Math.ceil((new Date(sellDate).getTime() - new Date(transaction.buyDate).getTime()) / (1000 * 60 * 60 * 24))
    )
    const annualReturn = (profit / (buyPortionCost + buyFee)) * (365 / daysDiff) * 100

    let updatedTransactions: Transaction[] = []

    if (sellQuantity === transaction.buyQuantity) {
      // 完全卖出
      updatedTransactions = asset.transactions.map((t) =>
        t.id === transactionId
          ? {
              ...t,
              sellDate,
              sellQuantity: transaction.buyQuantity,
              sellPrice,
              sellFee,
              profit,
              annualReturn,
            }
          : t
      )
    } else {
      // 部分卖出 → 创建子交易
      const subTransaction: Transaction = {
        id: Date.now().toString(),
        buyDate: transaction.buyDate,
        buyQuantity: sellQuantity,
        buyPrice: transaction.buyPrice,
        buyFee,
        sellDate,
        sellQuantity,
        sellPrice,
        sellFee,
        profit,
        annualReturn,
        parentId: transaction.id,
        createdAt: new Date().toISOString(),
      }

      updatedTransactions = asset.transactions.map((t) =>
        t.id === transactionId
          ? {
              ...t,
              sellQuantity: (t.sellQuantity || 0) + sellQuantity,
            }
          : t
      )

      updatedTransactions.unshift(subTransaction)
    }

    const updatedAsset = {
      ...asset,
      transactions: updatedTransactions,
    }

    const updatedAccount = {
      ...account,
      assets: account.assets.map((a) => (a.id === asset.id ? updatedAsset : a)),
    }

    setAsset(updatedAsset)
    await saveAccount(updatedAccount)
  }

  const getAssetStats = () => {
    if (!asset) return { totalCost: 0, totalProfit: 0, totalReturn: 0, holdingQuantity: 0, avgAnnualReturn: 0 }

    let totalCost = 0
    let totalProfit = 0
    let totalQuantity = 0
    let soldQuantity = 0
    let totalWeightedReturn = 0
    let totalSoldValue = 0

    asset.transactions.forEach((transaction) => {
      totalCost += transaction.buyQuantity * transaction.buyPrice
      totalQuantity += transaction.buyQuantity

      if (transaction.sellPrice && transaction.sellQuantity && transaction.profit && transaction.annualReturn) {
        totalProfit += transaction.profit
        soldQuantity += transaction.sellQuantity
        totalWeightedReturn += transaction.annualReturn * (transaction.sellPrice * transaction.sellQuantity)
        totalSoldValue += transaction.sellPrice * transaction.sellQuantity
      }
    })

    const holdingQuantity = totalQuantity - soldQuantity
    const totalReturn = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0
    const avgAnnualReturn = totalSoldValue > 0 ? totalWeightedReturn / totalSoldValue : 0

    return { totalCost, totalProfit, totalReturn, holdingQuantity, avgAnnualReturn }
  }

  if (!account || !asset) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <h2 className="mb-2 text-xl font-semibold text-white">标的不存在</h2>
          <Button onClick={() => navigate("/")} className="bg-purple-500 hover:bg-purple-600">
            返回首页
          </Button>
        </div>
      </div>
    )
  }

  const { totalCost, totalProfit, totalReturn, holdingQuantity, avgAnnualReturn } = getAssetStats()

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/account/${account.id}`)}
            className="w-10 h-10 p-0 rounded-full text-slate-400 hover:text-white hover:bg-slate-700/50"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">{asset.name}</h1>
            <p className="text-slate-400">
              {asset.symbol} • {account.name}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 mb-8 md:grid-cols-2 lg:grid-cols-4">
          {/* 统计信息略，保持原样 */}
          <StatCard title="总投资" value={`¥${totalCost.toLocaleString()}`} icon={<DollarSign />} />
          <StatCard
            title="已实现收益"
            value={`¥${totalProfit.toLocaleString()}`}
            icon={totalProfit >= 0 ? <TrendingUp /> : <TrendingDown />}
            positive={totalProfit >= 0}
          />
          <StatCard
            title="收益率"
            value={`${totalReturn.toFixed(2)}%`}
            icon={totalReturn >= 0 ? <TrendingUp /> : <TrendingDown />}
            positive={totalReturn >= 0}
          />
          <StatCard
            title={`持有${account.type === "stock" ? "股数" : "克数"}`}
            value={`${holdingQuantity.toLocaleString()} ${account.type === "stock" ? "股" : "克"}`}
            icon={<Calendar />}
          />
        </div>

        {/* Transactions */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">交易记录</h2>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-2 text-white bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            添加交易
          </Button>
        </div>

        {asset.transactions.length === 0 ? (
          <EmptyTransactionPrompt onAdd={() => setShowCreateModal(true)} />
        ) : (
          <div className="space-y-4">
            {asset.transactions
              .filter((t) => !t.parentId)
              // .sort((a, b) => new Date(b.buyDate).getTime() - new Date(a.buyDate).getTime())
              .map((transaction) => {
                const subTransactions = asset.transactions.filter((t) => t.parentId === transaction.id)
                return (
                  <TransactionCard
                    key={transaction.id}
                    transaction={transaction}
                    accountType={account.type}
                    accountSettings={account.settings}
                    onSell={handleSellTransaction}
                    subTransactions={subTransactions}
                  />
                )
              })}
          </div>
        )}

        <CreateTransactionModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateTransaction}
          accountType={account.type}
          accountSettings={account.settings}
        />
      </div>
    </div>
  )
}

// 你可拆出去的辅助 UI 组件
function StatCard({ title, value, icon, positive = true }: { title: string; value: string; icon: React.ReactNode; positive?: boolean }) {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-4 border border-slate-700/50">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400">{title}</p>
          <p className={`text-lg font-bold ${positive ? "text-green-400" : "text-red-400"}`}>{value}</p>
        </div>
        <div className="w-6 h-6 text-purple-400">{icon}</div>
      </div>
    </div>
  )
}

function EmptyTransactionPrompt({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="py-12 text-center">
      <div className="w-24 h-24 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
        <Calendar className="w-12 h-12 text-slate-500" />
      </div>
      <h3 className="mb-2 text-lg font-medium text-white">还没有交易记录</h3>
      <p className="mb-6 text-slate-400">添加您的第一笔交易记录</p>
      <Button
        onClick={onAdd}
        className="px-8 py-3 text-white bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
      >
        <Plus className="w-4 h-4 mr-2" />
        添加交易
      </Button>
    </div>
  )
}
