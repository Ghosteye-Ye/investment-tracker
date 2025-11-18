import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Plus, TrendingUp, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AssetCard } from "@/components/asset-card"
import { CreateAssetModal } from "@/components/create-asset-modal"
import { StatCard } from "@/components/shared/StatCard"
import { EmptyState } from "@/components/shared/EmptyState"
import type { Asset } from "@/types/investment"
import { useAccountData } from "@/hooks/useAccountData"
import { calculateAccountStats } from "@/services/calculationService"
import { addAssetToAccount } from "@/services/transactionService"

export default function AccountPage() {
  const { accountId } = useParams<{ accountId: string }>()
  const navigate = useNavigate()

  const { account, loading, saveAccount } = useAccountData(accountId)
  const [showCreateModal, setShowCreateModal] = useState(false)

  const handleCreateAsset = async (name: string, symbol: string) => {
    if (!account) return

    const newAsset: Asset = {
      id: Date.now().toString(),
      name,
      symbol,
      transactions: [],
      createdAt: new Date().toISOString(),
    }

    const updatedAccount = addAssetToAccount(account, newAsset)
    await saveAccount(updatedAccount)
    setShowCreateModal(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-white">加载中...</div>
      </div>
    )
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

  const { totalCost, totalProfit, totalReturn } = calculateAccountStats(account)
  const currency = account.settings.currency

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
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
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/account/${account.id}/settings`)}
            className="text-slate-400 hover:text-white hover:bg-slate-700/50"
          >
            <Settings className="w-5 h-5 mr-2" />
            账户设置
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-3">
          <StatCard label="总成本" value={totalCost} currency={currency} />
          <StatCard
            label="总收益"
            value={totalProfit}
            trend={totalProfit >= 0 ? "up" : "down"}
            currency={currency}
          />
          <StatCard
            label="收益率"
            value={`${totalReturn.toFixed(2)}%`}
            trend={totalReturn >= 0 ? "up" : "down"}
          />
        </div>

        {/* Assets Section */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">投资标的</h2>
          {account.assets.length > 0 && (
            <Button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-2 text-white bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              添加标的
            </Button>
          )}
        </div>

        {account.assets.length === 0 ? (
          <EmptyState
            icon={TrendingUp}
            title="还没有投资标的"
            description={`添加您的第一个${account.type === "stock" ? "股票" : "黄金"}标的`}
            actionLabel="添加标的"
            onAction={() => setShowCreateModal(true)}
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {account.assets
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .map((asset) => (
                <AssetCard
                  key={asset.id}
                  asset={asset}
                  accountId={account.id}
                  accountType={account.type}
                  currency={currency}
                />
              ))}
          </div>
        )}

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
