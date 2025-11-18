import { useState } from "react"
import { TrendingUp, TrendingDown, MoreVertical, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
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
import type { Asset } from "@/types/investment"
import { Link } from "react-router-dom"
import { calculateAssetStats, calculateAssetHolding, calculateAssetAveragePrice, calculateAssetHoldingCost } from "@/services/calculationService"

interface AssetCardProps {
  asset: Asset
  accountId: string
  accountType: "stock" | "gold"
  currency?: string
  onDelete?: (assetId: string) => void
}

export function AssetCard({ asset, accountId, accountType, currency = "¥", onDelete }: AssetCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  // 优先使用缓存的统计数据，如果不存在则实时计算
  const totalProfit = asset.stats?.totalProfit ?? calculateAssetStats(asset).totalProfit
  const totalReturn = asset.stats?.totalReturn ?? calculateAssetStats(asset).totalReturn
  const holdingQuantity = asset.stats?.holdingQuantity ?? calculateAssetHolding(asset)
  const averagePrice = asset.stats?.averagePrice ?? calculateAssetAveragePrice(asset)
  const holdingCost = asset.stats?.holdingCost ?? calculateAssetHoldingCost(asset)
  const totalTransactions = asset.transactions.length

  const handleDelete = () => {
    if (onDelete) {
      onDelete(asset.id)
    }
    setShowDeleteDialog(false)
  }

  return (
    <>
      <div className="group bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] border border-slate-700/50 hover:shadow-[0_12px_40px_0_rgba(0,0,0,0.5)] transition-all duration-300">
        <div className="flex items-start justify-between mb-4">
          <Link to={`/asset/${accountId}/${asset.id}`} className="flex-1">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-purple-300 transition-colors">
                {asset.name}
              </h3>
              <p className="text-sm text-slate-400">{asset.symbol}</p>
            </div>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-full w-8 h-8 p-0"
                onClick={(e) => {
                  e.stopPropagation()
                }}
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
              <DropdownMenuItem
                className="text-red-400 focus:text-red-300 focus:bg-slate-700/50 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowDeleteDialog(true)
                }}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                删除标的
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Link to={`/asset/${accountId}/${asset.id}`} className="block">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-sm">持有{accountType === "stock" ? "股数" : "克数"}</span>
              <span className="text-white font-medium">
                {holdingQuantity.toLocaleString()} {accountType === "stock" ? "股" : "克"}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-sm">买入均价</span>
              <span className="text-white font-medium">{currency}{averagePrice.toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-sm">持有成本</span>
              <span className="text-white font-medium">{currency}{holdingCost.toLocaleString()}</span>
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
          </div>

          <div className="mt-4 pt-4 border-t border-slate-700/50">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">{totalTransactions} 笔交易</span>
              <span className="text-purple-400 group-hover:text-purple-300 transition-colors">查看详情 →</span>
            </div>
          </div>
        </Link>
      </div>

      {/* 删除确认对话框 */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-slate-800 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">确认删除标的</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              你确定要删除 <span className="text-white font-medium">{asset.name}</span> ({asset.symbol}) 吗？
              <br />
              <br />
              此操作将删除该标的的所有交易记录（共 {totalTransactions} 笔），且无法恢复。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-700 text-white hover:bg-slate-600 border-slate-600">
              取消
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 text-white hover:bg-red-600"
              onClick={handleDelete}
            >
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
