import { useState } from "react"
import { MoreVertical, TrendingUp, TrendingDown, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
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
import type { Account } from "@/types/investment"
import { Link } from "react-router-dom"
import { calculateAccountStats } from "@/services/calculationService"

interface AccountCardProps {
  account: Account
  onDelete: (accountId: string) => void
}

export function AccountCard({ account, onDelete }: AccountCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const { totalCost, totalProfit, totalReturn } = calculateAccountStats(account)
  const totalAssets = account.assets.length
  const currency = account.settings.currency

  // 计算总交易数
  const totalTransactions = account.assets.reduce((sum, asset) => sum + asset.transactions.length, 0)

  const handleDelete = () => {
    onDelete(account.id)
    setShowDeleteDialog(false)
  }

  return (
    <>
      <div className="group bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] border border-slate-700/50 hover:shadow-[0_12px_40px_0_rgba(0,0,0,0.5)] transition-all duration-300">
        <div className="flex items-start justify-between mb-4">
          <Link to={`/account/${account.id}`} className="flex-1">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-purple-300 transition-colors">
                {account.name}
              </h3>
              <p className="text-sm text-slate-400">
                {account.type === "stock" ? "股票账户" : "黄金账户"} • {totalAssets} 个标的
              </p>
            </div>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
                className="text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-full w-8 h-8 p-0"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
              <DropdownMenuItem
                className="text-red-400 focus:text-red-300 focus:bg-slate-700/50 cursor-pointer"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setShowDeleteDialog(true)
                }}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                删除账户
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Link to={`/account/${account.id}`} className="block">
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
        </Link>
      </div>

      {/* 删除确认对话框 */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-slate-800 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">确认删除账户</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              你确定要删除账户 <span className="text-white font-medium">{account.name}</span> 吗？
              <br />
              <br />
              此操作将删除该账户下的所有数据：
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>{totalAssets} 个投资标的</li>
                <li>{totalTransactions} 笔交易记录</li>
              </ul>
              <br />
              <span className="text-red-400 font-medium">此操作无法恢复，请谨慎操作！</span>
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
