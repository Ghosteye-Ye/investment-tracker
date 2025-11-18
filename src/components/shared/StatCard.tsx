import { TrendingUp, TrendingDown, type LucideIcon } from "lucide-react"

interface StatCardProps {
  label: string
  value: string | number
  icon?: LucideIcon
  trend?: "up" | "down" | "neutral"
  currency?: string
}

/**
 * 统计卡片组件 - 用于显示统计数据
 */
export function StatCard({ label, value, icon: Icon, trend = "neutral", currency }: StatCardProps) {
  const getTrendColor = () => {
    if (trend === "up") return "text-green-400"
    if (trend === "down") return "text-red-400"
    return "text-white"
  }

  const getTrendBgColor = () => {
    if (trend === "up") return "bg-green-500/20"
    if (trend === "down") return "bg-red-500/20"
    return "bg-blue-500/20"
  }

  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Icon

  const formattedValue = typeof value === "number"
    ? `${currency || ""}${value.toLocaleString()}`
    : value

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400 mb-1">{label}</p>
          <p className={`text-2xl font-bold ${getTrendColor()}`}>{formattedValue}</p>
        </div>
        {TrendIcon && (
          <div className={`w-12 h-12 ${getTrendBgColor()} rounded-full flex items-center justify-center`}>
            <TrendIcon className={`w-6 h-6 ${getTrendColor()}`} />
          </div>
        )}
      </div>
    </div>
  )
}
