import { useState, useEffect } from "react"
import { Plus, DollarSign, Download, Upload, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AccountCard } from "@/components/account-card"
import { CreateAccountModal } from "@/components/create-account-modal"
import { StatCard } from "@/components/shared/StatCard"
import { EmptyState } from "@/components/shared/EmptyState"
import type { Account } from "@/types/investment"
import {
  getAllAccounts,
  addAccount,
  deleteAccount,
  exportAccounts,
  importAccounts,
} from "@/hooks/useInvestmentDB"
import { calculateTotalStats } from "@/services/calculationService"
import { DEFAULT_ACCOUNT_SETTINGS } from "@/config/defaults"

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
      settings: DEFAULT_ACCOUNT_SETTINGS[type],
      createdAt: new Date().toISOString(),
    }
    await addAccount(newAccount)
    setAccounts((prev) => [...prev, newAccount])
    setShowCreateModal(false)
  }

  const handleDeleteAccount = async (accountId: string) => {
    await deleteAccount(accountId)
    setAccounts((prev) => prev.filter((a) => a.id !== accountId))
  }

  const handleExport = async () => {
    const json = await exportAccounts()
    const blob = new Blob([json], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "investment-backup.json"
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const text = await file.text()
    await importAccounts(text)
    const all = await getAllAccounts()
    setAccounts(all)
  }

  const { totalCost, totalProfit, totalReturn } = calculateTotalStats(accounts)

  // 获取主要货币符号(使用第一个账户的货币,如果没有账户则默认为¥)
  const mainCurrency = accounts.length > 0 ? accounts[0].settings.currency : "¥"

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-6xl mx-auto">
        {/* Header Card */}
        <div className="mb-8 p-6 bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30 flex items-center justify-center backdrop-blur-sm">
                  <TrendingUp className="w-6 h-6 text-purple-400" />
                </div>
                <h1 className="text-3xl font-bold text-white">investment-tracker</h1>
              </div>
              <p className="text-slate-400 ml-15">管理您的股票和黄金投资</p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={handleExport}
                className="bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/50 hover:border-slate-500/50 text-slate-300 hover:text-white backdrop-blur-sm transition-all duration-200"
              >
                <Download className="w-4 h-4 mr-2" />
                导出数据
              </Button>

              <input
                type="file"
                accept="application/json"
                onChange={handleImport}
                className="hidden"
                id="import-input"
              />
              <Button
                variant="ghost"
                onClick={() => document.getElementById("import-input")?.click()}
                className="bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/50 hover:border-slate-500/50 text-slate-300 hover:text-white backdrop-blur-sm transition-all duration-200"
              >
                <Upload className="w-4 h-4 mr-2" />
                导入数据
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-3">
          <StatCard label="总成本" value={totalCost} icon={DollarSign} currency={mainCurrency} />
          <StatCard
            label="总收益"
            value={totalProfit}
            trend={totalProfit >= 0 ? "up" : "down"}
            currency={mainCurrency}
          />
          <StatCard
            label="总收益率"
            value={`${totalReturn.toFixed(2)}%`}
            trend={totalReturn >= 0 ? "up" : "down"}
          />
        </div>

        {/* Account Section */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">投资账户</h2>
          {accounts.length > 0 && (
            <Button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 hover:border-purple-400/50 backdrop-blur-sm text-purple-100 hover:text-white rounded-full transition-all duration-200"
            >
              <Plus className="w-4 h-4" />
              新建账户
            </Button>
          )}
        </div>

        {accounts.length === 0 ? (
          <EmptyState
            icon={DollarSign}
            title="还没有投资账户"
            description="创建您的第一个投资账户开始记录"
            actionLabel="创建账户"
            onAction={() => setShowCreateModal(true)}
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {accounts
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .map((account) => (
                <AccountCard key={account.id} account={account} onDelete={handleDeleteAccount} />
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
