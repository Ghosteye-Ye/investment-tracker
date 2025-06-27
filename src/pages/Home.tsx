"use client"

import { useState, useEffect } from "react"
import { Plus, TrendingUp, TrendingDown, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AccountCard } from "@/components/account-card"
import { CreateAccountModal } from "@/components/create-account-modal"
import type { Account } from "@/types/investment"
import {
  getAllAccounts,
  addAccount,
  updateAccount,
  deleteAccount,
  exportAccounts,
  importAccounts,
} from "@/hooks/useInvestmentDB"

export default function HomePage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    getAllAccounts().then(setAccounts)
  }, [])

  const handleCreateAccount = async (name: string, type: "stock" | "gold") => {
    const newAccount: Account = {
      id: Date.now().toString(),
      name,
      type,
      assets: [],
      settings: {
        buyFeeRate: 0.1,
        sellFeeRate: 0.1,
        expandSubTransactions: true,
        currency: "¥",
      },
      createdAt: new Date().toISOString(),
    }
    await addAccount(newAccount)
    setAccounts((prev) => [...prev, newAccount])
    setShowCreateModal(false)
  }

  const handleUpdateAccount = async (updatedAccount: Account) => {
    await updateAccount(updatedAccount)
    setAccounts((prev) => prev.map((a) => (a.id === updatedAccount.id ? updatedAccount : a)))
  }

  const handleDeleteAccount = async (accountId: string) => {
    await deleteAccount(accountId)
    setAccounts((prev) => prev.filter((a) => a.id !== accountId))
  }

  const getTotalStats = () => {
    let totalCost = 0
    let totalProfit = 0

    accounts.forEach((account) => {
      account.assets.forEach((asset) => {
        asset.transactions.forEach((transaction) => {
          const buyCost = transaction.buyQuantity * transaction.buyPrice + (transaction.buyFee || 0)
          totalCost += buyCost
          if (transaction.sellPrice && transaction.sellQuantity) {
            const sellRevenue = transaction.sellPrice * transaction.sellQuantity - (transaction.sellFee || 0)
            const buyPortionCost =
              transaction.buyPrice * transaction.sellQuantity +
              (transaction.buyFee || 0) * (transaction.sellQuantity / transaction.buyQuantity)
            totalProfit += sellRevenue - buyPortionCost
          }
        })
      })
    })

    return { totalCost, totalProfit }
  }

  const { totalCost, totalProfit } = getTotalStats()
  const totalReturn = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-4">
          <h1 className="mb-2 text-3xl font-bold text-white">投资记录助手</h1>
          <p className="text-slate-400">管理您的股票和黄金投资</p>
        </div>

        {/* Export / Import */}
        <div className="flex gap-4 mb-6">
          <Button
            variant="outline"
            onClick={async () => {
              const json = await exportAccounts()
              const blob = new Blob([json], { type: "application/json" })
              const url = URL.createObjectURL(blob)
              const a = document.createElement("a")
              a.href = url
              a.download = "investment-backup.json"
              a.click()
              URL.revokeObjectURL(url)
            }}
          >
            导出数据
          </Button>

          <input
            type="file"
            accept="application/json"
            onChange={async (e) => {
              const file = e.target.files?.[0]
              if (!file) return
              const text = await file.text()
              await importAccounts(text)
              const all = await getAllAccounts()
              setAccounts(all)
            }}
            className="hidden"
            id="import-input"
          />
          <Button variant="outline" onClick={() => document.getElementById("import-input")?.click()}>
            导入数据
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-3">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">总投资</p>
                <p className="text-2xl font-bold text-white">¥{totalCost.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">总收益</p>
                <p className={`text-2xl font-bold ${totalProfit >= 0 ? "text-green-400" : "text-red-400"}`}>
                  ¥{totalProfit.toLocaleString()}
                </p>
              </div>
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  totalProfit >= 0 ? "bg-green-500/20" : "bg-red-500/20"
                }`}
              >
                {totalProfit >= 0 ? (
                  <TrendingUp className="w-6 h-6 text-green-400" />
                ) : (
                  <TrendingDown className="w-6 h-6 text-red-400" />
                )}
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">总收益率</p>
                <p className={`text-2xl font-bold ${totalReturn >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {totalReturn.toFixed(2)}%
                </p>
              </div>
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  totalReturn >= 0 ? "bg-green-500/20" : "bg-red-500/20"
                }`}
              >
                {totalReturn >= 0 ? (
                  <TrendingUp className="w-6 h-6 text-green-400" />
                ) : (
                  <TrendingDown className="w-6 h-6 text-red-400" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Account Section */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">投资账户</h2>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-2 text-white bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            新建账户
          </Button>
        </div>

        {accounts.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-24 h-24 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <DollarSign className="w-12 h-12 text-slate-500" />
            </div>
            <h3 className="mb-2 text-lg font-medium text-white">还没有投资账户</h3>
            <p className="mb-6 text-slate-400">创建您的第一个投资账户开始记录</p>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="px-8 py-3 text-white bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              创建账户
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {accounts.map((account) => (
              <AccountCard
                key={account.id}
                account={account}
                onUpdate={handleUpdateAccount}
                onDelete={handleDeleteAccount}
              />
            ))}
          </div>
        )}

        <CreateAccountModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateAccount}
        />
      </div>
    </div>
  )
}
