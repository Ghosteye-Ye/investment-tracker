import { type LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  actionLabel: string
  onAction: () => void
}

/**
 * 空状态组件 - 用于显示没有数据时的提示
 */
export function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="py-12 text-center">
      <div className="w-24 h-24 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
        <Icon className="w-12 h-12 text-slate-500" />
      </div>
      <h3 className="text-lg font-medium text-white mb-2">{title}</h3>
      <p className="text-slate-400 mb-6">{description}</p>
      <Button
        onClick={onAction}
        className="px-8 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full"
      >
        {actionLabel}
      </Button>
    </div>
  )
}
