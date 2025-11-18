import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Plus, Calendar, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TransactionCard } from "@/components/transaction-card"
import { CreateTransactionModal } from "@/components/create-transaction-modal"
import { StatCard } from "@/components/shared/StatCard"
import { EmptyState } from "@/components/shared/EmptyState"
import type { Asset } from "@/types/investment"
import { useAccountData } from "@/hooks/useAccountData"
import { calculateAssetStats, calculateAssetHolding } from "@/services/calculationService"
import { createBuyTransaction, createSellTransaction, addTransactionToAsset } from "@/services/transactionService"

export default function AssetPage() {
  const { accountId, assetId } = useParams<{ accountId: string; assetId: string }>()
  const navigate = useNavigate()

  const { account, loading, saveAccount } = useAccountData(accountId)
  const [asset, setAsset] = useState<Asset | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    if (!account || !assetId) return
    const foundAsset = account.assets.find((a) => a.id === assetId)
    setAsset(foundAsset || null)
  }, [account, assetId])

  const handleCreateTransaction = async (buyDate: string, buyQuantity: number, buyPrice: number) => {
    if (!account || !asset) return

    const newTransaction = createBuyTransaction({ buyDate, buyQuantity, buyPrice }, account)
    const updatedAccount = addTransactionToAsset(account, asset.id, newTransaction)

    const updatedAsset = updatedAccount.assets.find((a) => a.id === asset.id)
    if (updatedAsset) setAsset(updatedAsset)

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

    const { updatedTransaction, subTransaction } = createSellTransaction(
      transaction,
      { sellDate, sellQuantity, sellPrice },
      account
    )

    let updatedTransactions = asset.transactions.map((t) =>
      t.id === transaction.id ? updatedTransaction : t
    )

    // 如果有子交易,添加到列表开头
    if (subTransaction) {
      updatedTransactions = [subTransaction, ...updatedTransactions]
    }

    const updatedAsset: Asset = {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-white">加载中...</div>
      </div>
    )
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

  const { totalCost, totalProfit, totalReturn } = calculateAssetStats(asset)
  const holdingQuantity = calculateAssetHolding(asset)
  const currency = account.settings.currency

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
          <StatCard label="总成本" value={totalCost} icon={DollarSign} currency={currency} />
          <StatCard
            label="已实现收益"
            value={totalProfit}
            trend={totalProfit >= 0 ? "up" : "down"}
            currency={currency}
          />
          <StatCard
            label="收益率"
            value={`${totalReturn.toFixed(2)}%`}
            trend={totalReturn >= 0 ? "up" : "down"}
          />
          <StatCard
            label={`持有${account.type === "stock" ? "股数" : "克数"}`}
            value={`${holdingQuantity.toLocaleString()} ${account.type === "stock" ? "股" : "克"}`}
            icon={Calendar}
          />
        </div>

        {/* Transactions */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">交易记录</h2>
          {asset.transactions.length > 0 && (
            <Button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-2 text-white bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              添加交易
            </Button>
          )}
        </div>

        {asset.transactions.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="还没有交易记录"
            description="添加您的第一笔交易记录"
            actionLabel="添加交易"
            onAction={() => setShowCreateModal(true)}
          />
        ) : (
          <div className="space-y-4">
            {asset.transactions
              .filter((t) => !t.parentId)
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
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
          currency={currency}
          accountSettings={account.settings}
        />
      </div>
    </div>
  )
}
