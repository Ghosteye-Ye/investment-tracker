import type { AccountSettings } from "@/types/investment"

/**
 * 计算买入手续费
 * @param quantity 买入数量
 * @param settings 账户设置
 * @returns 手续费金额
 */
export function calculateBuyFee(quantity: number, settings: AccountSettings): number {
  return Math.max(quantity * settings.buyFeePerUnit, settings.minBuyFee)
}

/**
 * 计算卖出手续费
 * @param quantity 卖出数量
 * @param settings 账户设置
 * @returns 手续费金额
 */
export function calculateSellFee(quantity: number, settings: AccountSettings): number {
  return Math.max(quantity * settings.sellFeePerUnit, settings.minSellFee)
}

/**
 * 计算按比例分摊的买入手续费（用于部分卖出）
 * @param originalBuyFee 原始买入手续费
 * @param sellQuantity 卖出数量
 * @param buyQuantity 买入数量
 * @returns 分摊后的手续费
 */
export function calculateProportionalBuyFee(
  originalBuyFee: number,
  sellQuantity: number,
  buyQuantity: number
): number {
  return originalBuyFee * (sellQuantity / buyQuantity)
}
