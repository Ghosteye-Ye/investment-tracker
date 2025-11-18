import { TrendingUp, TrendingDown, type LucideIcon } from "lucide-react"

interface StatItem {
  label: string
  value: string | number
  currency?: string
  highlight?: boolean
}

interface MultiStatCardProps {
  title: string
  icon?: LucideIcon
  trend?: "up" | "down" | "neutral"
  stats: StatItem[]
}

/**
 * 多数据统计卡片组件 - 在一个卡片中显示多个相关统计数据
 */
export function MultiStatCard({ title, icon: Icon, trend = "neutral", stats }: MultiStatCardProps) {
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

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-slate-300">{title}</h3>
        {TrendIcon && (
          <div className={`w-10 h-10 ${getTrendBgColor()} rounded-full flex items-center justify-center`}>
            <TrendIcon className={`w-5 h-5 ${getTrendColor()}`} />
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="space-y-3">
        {stats.map((stat, index) => {
          const formattedValue =
            typeof stat.value === "number"
              ? `${stat.currency || ""}${stat.value.toLocaleString()}`
              : stat.value

          return (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm text-slate-400">{stat.label}</span>
              <span
                className={`font-semibold ${
                  stat.highlight ? getTrendColor() : "text-white"
                }`}
              >
                {formattedValue}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
