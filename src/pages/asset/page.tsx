"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, TrendingUp, TrendingDown, Calendar, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TransactionCard } from "@/components/transaction-card"
import { CreateTransactionModal } from "@/components/create-transaction-modal"
import type { Account, Asset, Transaction } from "@/types/investment"

export default function AssetPage() {
  const params = useParams()
  const navigate = useNavigate();
  const [account, setAccount] = useState<Account | null>(null)
  const [asset, setAsset] = useState<Asset | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    const savedAccounts = localStorage.getItem("investment-accounts")
    if (savedAccounts) {
      const accounts: Account[] = JSON.parse(savedAccounts)
      const foundAccount = accounts.find((acc) => acc.id === params.accountId)
      if (foundAccount) {
        setAccount(foundAccount)
        const foundAsset = foundAccount.assets.find((asset) => asset.id === params.assetId)
        setAsset(foundAsset || null)
      }
    }
  }, [params.accountId, params.assetId])

  const handleCreateTransaction = (buyDate: string, buyQuantity: number, buyPrice: number) => {
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
      transactions: [...asset.transactions, newTransaction],
    }

    const updatedAccount = {
      ...account,
      assets: account.assets.map((a) => (a.id === asset.id ? updatedAsset : a)),
    }

    setAsset(updatedAsset)
    setAccount(updatedAccount)

    // Update localStorage
    const savedAccounts = localStorage.getItem("investment-accounts")
    if (savedAccounts) {
      const accounts: Account[] = JSON.parse(savedAccounts)
      const updatedAccounts = accounts.map((acc) => (acc.id === account.id ? updatedAccount : acc))
      localStorage.setItem("investment-accounts", JSON.stringify(updatedAccounts))
    }

    setShowCreateModal(false)
  }

  const handleSellTransaction = (transactionId: string, sellDate: string, sellQuantity: number, sellPrice: number) => {
    if (!account || !asset) return

    const sellRevenue = sellPrice * sellQuantity
    const sellFee = sellRevenue * (account.settings.sellFeeRate / 100)
    const transaction = asset.transactions.find((t) => t.id === transactionId)

    if (!transaction) return

    const buyPortionCost = transaction.buyPrice * sellQuantity
    const buyFee = (transaction.buyFee || 0) * (sellQuantity / transaction.buyQuantity)
    const profit = sellRevenue - sellFee - buyPortionCost - buyFee

    const daysDiff = Math.max(
      1,
      Math.ceil((new Date(sellDate).getTime() - new Date(transaction.buyDate).getTime()) / (1000 * 60 * 60 * 24)),
    )
    const annualReturn = (profit / (buyPortionCost + buyFee)) * (365 / daysDiff) * 100

    const remainingQuantity = transaction.buyQuantity - (transaction.sellQuantity || 0)

    // 如果是完整卖出（卖出数量等于剩余数量）
    if (sellQuantity === remainingQuantity) {
      const updatedTransactions = asset.transactions.map((t) => {
        if (t.id === transactionId) {
          return {
            ...t,
            sellDate,
            sellQuantity: transaction.buyQuantity, // 设置为总买入数量
            sellPrice,
            sellFee,
            profit,
            annualReturn,
          }
        }
        return t
      })

      const updatedAsset = {
        ...asset,
        transactions: updatedTransactions,
      }

      const updatedAccount = {
        ...account,
        assets: account.assets.map((a) => (a.id === asset.id ? updatedAsset : a)),
      }

      setAsset(updatedAsset)
      setAccount(updatedAccount)

      // Update localStorage
      const savedAccounts = localStorage.getItem("investment-accounts")
      if (savedAccounts) {
        const accounts: Account[] = JSON.parse(savedAccounts)
        const updatedAccounts = accounts.map((acc) => (acc.id === account.id ? updatedAccount : acc))
        localStorage.setItem("investment-accounts", JSON.stringify(updatedAccounts))
      }
    } else {
      // 部分卖出，创建子交易
      const subTransaction: Transaction = {
        id: Date.now().toString(),
        buyDate: transaction.buyDate,
        buyQuantity: sellQuantity,
        buyPrice: transaction.buyPrice,
        buyFee: buyFee,
        sellDate,
        sellQuantity,
        sellPrice,
        sellFee,
        profit,
        annualReturn,
        parentId: transaction.id,
        createdAt: new Date().toISOString(),
      }

      const updatedTransactions = asset.transactions.map((t) => {
        if (t.id === transactionId) {
          return {
            ...t,
            sellQuantity: (t.sellQuantity || 0) + sellQuantity,
          }
        }
        return t
      })

      updatedTransactions.push(subTransaction)

      const updatedAsset = {
        ...asset,
        transactions: updatedTransactions,
      }

      const updatedAccount = {
        ...account,
        assets: account.assets.map((a) => (a.id === asset.id ? updatedAsset : a)),
      }

      setAsset(updatedAsset)
      setAccount(updatedAccount)

      // Update localStorage
      const savedAccounts = localStorage.getItem("investment-accounts")
      if (savedAccounts) {
        const accounts: Account[] = JSON.parse(savedAccounts)
        const updatedAccounts = accounts.map((acc) => (acc.id === account.id ? updatedAccount : acc))
        localStorage.setItem("investment-accounts", JSON.stringify(updatedAccounts))
      }
    }
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
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-4 shadow-[inset_0_1px_0_0_rgba(148,163,184,0.1)] border border-slate-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">总投资</p>
                <p className="text-lg font-bold text-white">¥{totalCost.toLocaleString()}</p>
              </div>
              <DollarSign className="w-6 h-6 text-blue-400" />
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-4 shadow-[inset_0_1px_0_0_rgba(148,163,184,0.1)] border border-slate-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">已实现收益</p>
                <p className={`text-lg font-bold ${totalProfit >= 0 ? "text-green-400" : "text-red-400"}`}>
                  ¥{totalProfit.toLocaleString()}
                </p>
              </div>
              {totalProfit >= 0 ? (
                <TrendingUp className="w-6 h-6 text-green-400" />
              ) : (
                <TrendingDown className="w-6 h-6 text-red-400" />
              )}
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-4 shadow-[inset_0_1px_0_0_rgba(148,163,184,0.1)] border border-slate-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">收益率</p>
                <p className={`text-lg font-bold ${totalReturn >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {totalReturn.toFixed(2)}%
                </p>
              </div>
              {totalReturn >= 0 ? (
                <TrendingUp className="w-6 h-6 text-green-400" />
              ) : (
                <TrendingDown className="w-6 h-6 text-red-400" />
              )}
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-4 shadow-[inset_0_1px_0_0_rgba(148,163,184,0.1)] border border-slate-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">持有{account.type === "stock" ? "股数" : "克数"}</p>
                <p className="text-lg font-bold text-white">
                  {holdingQuantity.toLocaleString()} {account.type === "stock" ? "股" : "克"}
                </p>
              </div>
              <Calendar className="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </div>

        {/* Transactions Section */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">交易记录</h2>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-2 text-white transition-all duration-300 transform rounded-full shadow-lg bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 hover:shadow-xl hover:scale-105"
          >
            <Plus className="w-4 h-4 mr-2" />
            添加交易
          </Button>
        </div>

        {/* Transactions List */}
        {asset.transactions.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-24 h-24 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.3)]">
              <Calendar className="w-12 h-12 text-slate-500" />
            </div>
            <h3 className="mb-2 text-lg font-medium text-white">还没有交易记录</h3>
            <p className="mb-6 text-slate-400">添加您的第一笔交易记录</p>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="px-8 py-3 text-white transition-all duration-300 transform rounded-full shadow-lg bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 hover:shadow-xl hover:scale-105"
            >
              <Plus className="w-4 h-4 mr-2" />
              添加交易
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {asset.transactions
              .filter((t) => !t.parentId) // Only show parent transactions
              .sort((a, b) => new Date(b.buyDate).getTime() - new Date(a.buyDate).getTime())
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

        {/* Create Transaction Modal */}
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
