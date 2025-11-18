import type { AccountSettings } from "@/types/investment"

/**
 * 默认账户设置配置
 */
export const DEFAULT_ACCOUNT_SETTINGS: Record<"stock" | "gold", AccountSettings> = {
  stock: {
    buyFeePerUnit: 0.0035,
    sellFeePerUnit: 0.0035,
    minBuyFee: 0.35,
    minSellFee: 0.35,
    expandSubTransactions: true,
    currency: "$",
  },
  gold: {
    buyFeePerUnit: 0,
    sellFeePerUnit: 4,
    minBuyFee: 0,
    minSellFee: 4,
    expandSubTransactions: true,
    currency: "¥",
  },
}

/**
 * 常量定义
 */
export const CONSTANTS = {
  MS_PER_DAY: 1000 * 60 * 60 * 24,
  DAYS_PER_YEAR: 365,
} as const
