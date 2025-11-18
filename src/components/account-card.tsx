import { MoreVertical, TrendingUp, TrendingDown, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Account } from "@/types/investment"
import { Link } from "react-router-dom"
import { calculateAccountStats } from "@/services/calculationService"

interface AccountCardProps {
  account: Account
  onDelete: (accountId: string) => void
}

export function AccountCard({ account, onDelete }: AccountCardProps) {
  const { totalCost, totalProfit, totalReturn } = calculateAccountStats(account)
  const totalAssets = account.assets.length
  const currency = account.settings.currency

  return (
    <Link to={`/account/${account.id}`}>
      <div className="group bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] border border-slate-700/50 hover:shadow-[0_12px_40px_0_rgba(0,0,0,0.5)] transition-all duration-300 cursor-pointer hover:scale-[1.02]">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">{account.name}</h3>
            <p className="text-sm text-slate-400">
              {account.type === "stock" ? "股票账户" : "黄金账户"} • {totalAssets} 个标的
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
                className="text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-full w-8 h-8 p-0 opacity-100 transition-opacity"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-slate-800 border-slate-700">
              <DropdownMenuItem
                className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onDelete(account.id)
                }}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                删除账户
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-sm">总成本</span>
            <span className="text-white font-medium">{currency}{totalCost.toLocaleString()}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-sm">总收益</span>
            <span className={`font-medium ${totalProfit >= 0 ? "text-green-400" : "text-red-400"}`}>
              {currency}{totalProfit.toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-sm">收益率</span>
            <div className="flex items-center">
              {totalReturn >= 0 ? (
                <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-400 mr-1" />
              )}
              <span className={`font-medium ${totalReturn >= 0 ? "text-green-400" : "text-red-400"}`}>
                {totalReturn.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-700/50">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">创建于 {new Date(account.createdAt).toLocaleDateString()}</span>
            <span className="text-purple-400 group-hover:text-purple-300 transition-colors">查看详情 →</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
