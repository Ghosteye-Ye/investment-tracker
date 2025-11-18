import { TrendingUp, TrendingDown, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Asset } from "@/types/investment"
import { Link } from "react-router-dom"
import { calculateAssetStats, calculateAssetHolding } from "@/services/calculationService"

interface AssetCardProps {
  asset: Asset
  accountId: string
  accountType: "stock" | "gold"
  currency?: string
}

export function AssetCard({ asset, accountId, accountType, currency = "¥" }: AssetCardProps) {
  const { totalCost, totalProfit, totalReturn } = calculateAssetStats(asset)
  const holdingQuantity = calculateAssetHolding(asset)
  const totalTransactions = asset.transactions.length

  return (
    <Link to={`/asset/${accountId}/${asset.id}`}>
      <div className="group bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] border border-slate-700/50 hover:shadow-[0_12px_40px_0_rgba(0,0,0,0.5)] transition-all duration-300 cursor-pointer hover:scale-[1.02]">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">{asset.name}</h3>
            <p className="text-sm text-slate-400">{asset.symbol}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-full w-8 h-8 p-0 opacity-100 transition-opacity"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation() // 阻止事件冒泡
            }}
          >
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-sm">总成本</span>
            <span className="text-white font-medium">{currency}{totalCost.toLocaleString()}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-sm">已实现收益</span>
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

          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-sm">持有{accountType === "stock" ? "股数" : "克数"}</span>
            <span className="text-white font-medium">
              {holdingQuantity.toLocaleString()} {accountType === "stock" ? "股" : "克"}
            </span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-700/50">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">{totalTransactions} 笔交易</span>
            <span className="text-purple-400 group-hover:text-purple-300 transition-colors">查看详情 →</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
