"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, TrendingUp, TrendingDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AssetCard } from "@/components/asset-card"
import { CreateAssetModal } from "@/components/create-asset-modal"
import type { Account } from "@/types/investment"

export default function AccountPage() {
  const params = useParams()
  const navigate = useNavigate();
  const [account, setAccount] = useState<Account | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    const savedAccounts = localStorage.getItem("investment-accounts")
    if (savedAccounts) {
      const accounts: Account[] = JSON.parse(savedAccounts)
      const foundAccount = accounts.find((acc) => acc.id === params.accountId)
      setAccount(foundAccount || null)
    }
  }, [params.accountId])

  const handleCreateAsset = (name: string, symbol: string) => {
    if (!account) return

    const newAsset = {
      id: Date.now().toString(),
      name,
      symbol,
      transactions: [],
      createdAt: new Date().toISOString(),
    }

    const updatedAccount = {
      ...account,
      assets: [...account.assets, newAsset],
    }

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

  const getAccountStats = () => {
    if (!account) return { totalCost: 0, totalProfit: 0, totalReturn: 0 }

    let totalCost = 0
    let totalProfit = 0

    account.assets.forEach((asset) => {
      asset.transactions.forEach((transaction) => {
        totalCost += transaction.buyQuantity * transaction.buyPrice
        if (transaction.sellPrice && transaction.sellQuantity) {
          totalProfit += (transaction.sellPrice - transaction.buyPrice) * transaction.sellQuantity
        }
      })
    })

    const totalReturn = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0
    return { totalCost, totalProfit, totalReturn }
  }

  if (!account) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <h2 className="mb-2 text-xl font-semibold text-white">账户不存在</h2>
          <Button onClick={() => navigate("/")} className="bg-purple-500 hover:bg-purple-600">
            返回首页
          </Button>
        </div>
      </div>
    )
  }

  const { totalCost, totalProfit, totalReturn } = getAccountStats()

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="w-10 h-10 p-0 rounded-full text-slate-400 hover:text-white hover:bg-slate-700/50"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">{account.name}</h1>
            <p className="text-slate-400">
              {account.type === "stock" ? "股票账户" : "黄金账户"} • {account.assets.length} 个标的
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-3">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 shadow-[inset_0_1px_0_0_rgba(148,163,184,0.1)] border border-slate-700/50">
            <p className="mb-1 text-sm text-slate-400">总投资</p>
            <p className="text-2xl font-bold text-white">¥{totalCost.toLocaleString()}</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 shadow-[inset_0_1px_0_0_rgba(148,163,184,0.1)] border border-slate-700/50">
            <p className="mb-1 text-sm text-slate-400">总收益</p>
            <p className={`text-2xl font-bold ${totalProfit >= 0 ? "text-green-400" : "text-red-400"}`}>
              ¥{totalProfit.toLocaleString()}
            </p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 shadow-[inset_0_1px_0_0_rgba(148,163,184,0.1)] border border-slate-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-1 text-sm text-slate-400">收益率</p>
                <p className={`text-2xl font-bold ${totalReturn >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {totalReturn.toFixed(2)}%
                </p>
              </div>
              {totalReturn >= 0 ? (
                <TrendingUp className="w-8 h-8 text-green-400" />
              ) : (
                <TrendingDown className="w-8 h-8 text-red-400" />
              )}
            </div>
          </div>
        </div>

        {/* Assets Section */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">投资标的</h2>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-2 text-white transition-all duration-300 transform rounded-full shadow-lg bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 hover:shadow-xl hover:scale-105"
          >
            <Plus className="w-4 h-4 mr-2" />
            添加标的
          </Button>
        </div>

        {/* Assets Grid */}
        {account.assets.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-24 h-24 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.3)]">
              <TrendingUp className="w-12 h-12 text-slate-500" />
            </div>
            <h3 className="mb-2 text-lg font-medium text-white">还没有投资标的</h3>
            <p className="mb-6 text-slate-400">添加您的第一个{account.type === "stock" ? "股票" : "黄金"}标的</p>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="px-8 py-3 text-white transition-all duration-300 transform rounded-full shadow-lg bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 hover:shadow-xl hover:scale-105"
            >
              <Plus className="w-4 h-4 mr-2" />
              添加标的
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {account.assets.map((asset) => (
              <AssetCard key={asset.id} asset={asset} accountId={account.id} accountType={account.type} />
            ))}
          </div>
        )}

        {/* Create Asset Modal */}
        <CreateAssetModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateAsset}
          accountType={account.type}
        />
      </div>
    </div>
  )
}
