import type { Transaction, Asset, Account } from "@/types/investment"
import { calculateProportionalBuyFee } from "./feeService"

export interface TransactionStats {
  totalCost: number
  totalProfit: number
  totalReturn: number
}

/**
 * 计算单笔交易的买入金额（不含手续费）
 */
export function calculateTransactionBuyAmount(transaction: Transaction): number {
  return transaction.buyQuantity * transaction.buyPrice
}

/**
 * 计算单笔已卖出交易的收益
 * @param transaction 交易记录
 * @returns 收益金额（可能为负）
 */
export function calculateTransactionProfit(transaction: Transaction): number {
  if (!transaction.sellPrice || !transaction.sellQuantity) {
    return 0
  }

  const sellRevenue = transaction.sellPrice * transaction.sellQuantity
  const sellFee = transaction.sellFee || 0

  const buyPortionCost = transaction.buyPrice * transaction.sellQuantity
  const buyFee = calculateProportionalBuyFee(
    transaction.buyFee || 0,
    transaction.sellQuantity,
    transaction.buyQuantity
  )

  return sellRevenue - sellFee - buyPortionCost - buyFee
}

/**
 * 计算资产的统计数据
 * @param asset 资产
 * @returns 统计数据
 */
export function calculateAssetStats(asset: Asset): TransactionStats {
  let totalCost = 0
  let totalProfit = 0

  asset.transactions.forEach((transaction) => {
    totalCost += calculateTransactionBuyAmount(transaction)
    totalProfit += calculateTransactionProfit(transaction)
  })

  const totalReturn = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0

  return { totalCost, totalProfit, totalReturn }
}

/**
 * 计算账户的统计数据
 * @param account 账户
 * @returns 统计数据
 */
export function calculateAccountStats(account: Account): TransactionStats {
  let totalCost = 0
  let totalProfit = 0

  account.assets.forEach((asset) => {
    const assetStats = calculateAssetStats(asset)
    totalCost += assetStats.totalCost
    totalProfit += assetStats.totalProfit
  })

  const totalReturn = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0

  return { totalCost, totalProfit, totalReturn }
}

/**
 * 计算多个账户的总统计数据
 * @param accounts 账户列表
 * @returns 统计数据
 */
export function calculateTotalStats(accounts: Account[]): TransactionStats {
  let totalCost = 0
  let totalProfit = 0

  accounts.forEach((account) => {
    const accountStats = calculateAccountStats(account)
    totalCost += accountStats.totalCost
    totalProfit += accountStats.totalProfit
  })

  const totalReturn = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0

  return { totalCost, totalProfit, totalReturn }
}

/**
 * 计算持仓数量（未卖出的数量）
 * @param transaction 交易记录
 * @returns 持仓数量
 */
export function calculateHoldingQuantity(transaction: Transaction): number {
  return transaction.buyQuantity - (transaction.sellQuantity || 0)
}

/**
 * 计算资产的总持仓数量
 * @param asset 资产
 * @returns 总持仓数量
 */
export function calculateAssetHolding(asset: Asset): number {
  return asset.transactions.reduce((total, transaction) => {
    return total + calculateHoldingQuantity(transaction)
  }, 0)
}

/**
 * 计算资产的持仓均价（仅计算未卖出部分，不含手续费）
 * @param asset 资产
 * @returns 持仓均价（不含手续费）
 */
export function calculateAssetAveragePrice(asset: Asset): number {
  let totalHoldingCost = 0 // 持仓部分的总成本（不含手续费）
  let totalHoldingQuantity = 0 // 总持仓数量

  asset.transactions.forEach((transaction) => {
    const holdingQuantity = calculateHoldingQuantity(transaction)

    if (holdingQuantity > 0) {
      // 计算这笔交易中未卖出部分的成本（不含手续费）
      const holdingCost = transaction.buyPrice * holdingQuantity

      totalHoldingCost += holdingCost
      totalHoldingQuantity += holdingQuantity
    }
  })

  return totalHoldingQuantity > 0 ? totalHoldingCost / totalHoldingQuantity : 0
}
