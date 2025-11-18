import type { Account, Asset, Transaction } from "@/types/investment"
import { calculateBuyFee, calculateSellFee, calculateProportionalBuyFee } from "./feeService"

/**
 * 创建新的买入交易
 * @param data 交易数据
 * @param account 账户信息（用于计算手续费）
 * @returns 新的交易记录
 */
export function createBuyTransaction(
  data: {
    buyDate: string
    buyQuantity: number
    buyPrice: number
  },
  account: Account
): Transaction {
  const buyFee = calculateBuyFee(data.buyQuantity, account.settings)

  return {
    id: Date.now().toString(),
    buyDate: data.buyDate,
    buyQuantity: data.buyQuantity,
    buyPrice: data.buyPrice,
    buyFee,
    createdAt: new Date().toISOString(),
  }
}

/**
 * 创建卖出交易
 * - 一次性全部卖出：直接更新交易记录，不创建子交易
 * - 分批卖出：创建子交易并添加到 children 数组
 * @param transaction 原交易记录
 * @param sellData 卖出数据
 * @param account 账户信息
 * @returns 更新后的交易
 */
export function createSellTransaction(
  transaction: Transaction,
  sellData: {
    sellDate: string
    sellQuantity: number
    sellPrice: number
  },
  account: Account
): Transaction {
  const { sellDate, sellQuantity, sellPrice } = sellData

  const holdingQuantity = transaction.buyQuantity - (transaction.sellQuantity || 0)

  // 实际卖出数量不能超过持仓数量
  const actualSellQuantity = Math.min(sellQuantity, holdingQuantity)
  const actualSellFee = calculateSellFee(actualSellQuantity, account.settings)

  // 计算这次卖出的成本和收益
  const actualBuyCost = transaction.buyPrice * actualSellQuantity
  const actualBuyFee = calculateProportionalBuyFee(
    transaction.buyFee || 0,
    actualSellQuantity,
    transaction.buyQuantity
  )

  const actualSellRevenue = sellPrice * actualSellQuantity
  const actualProfit = actualSellRevenue - actualSellFee - actualBuyCost - actualBuyFee

  // 一次性全部卖出（没有之前的卖出记录，且卖出数量等于买入数量）
  const isFullSellAtOnce = (transaction.sellQuantity || 0) === 0 && actualSellQuantity === transaction.buyQuantity

  if (isFullSellAtOnce) {
    // 一次性卖出：直接更新交易，不创建子交易
    return {
      ...transaction,
      sellDate,
      sellQuantity: actualSellQuantity,
      sellPrice,
      sellFee: actualSellFee,
      profit: actualProfit,
    }
  } else {
    // 分批卖出：创建子交易
    const subTransaction: Transaction = {
      id: Date.now().toString(),
      buyDate: transaction.buyDate,
      buyQuantity: actualSellQuantity,
      buyPrice: transaction.buyPrice,
      buyFee: actualBuyFee,
      sellDate,
      sellQuantity: actualSellQuantity,
      sellPrice,
      sellFee: actualSellFee,
      profit: actualProfit,
      createdAt: new Date().toISOString(),
    }

    // 获取现有子交易
    const children = transaction.children || []
    const updatedChildren = [...children, subTransaction]

    // 计算所有子交易的卖出单价均值
    const totalSellValue = updatedChildren.reduce((sum, child) => {
      return sum + (child.sellPrice || 0) * (child.sellQuantity || 0)
    }, 0)
    const totalSellQuantity = updatedChildren.reduce((sum, child) => {
      return sum + (child.sellQuantity || 0)
    }, 0)
    const averageSellPrice = totalSellQuantity > 0 ? totalSellValue / totalSellQuantity : undefined

    // 更新主交易
    const updatedTransaction: Transaction = {
      ...transaction,
      sellQuantity: (transaction.sellQuantity || 0) + actualSellQuantity,
      sellFee: (transaction.sellFee || 0) + actualSellFee,
      profit: (transaction.profit || 0) + actualProfit,
      sellPrice: averageSellPrice,
      children: updatedChildren,
    }

    // 如果完全卖出，记录最后的卖出日期
    if (updatedTransaction.sellQuantity === transaction.buyQuantity) {
      updatedTransaction.sellDate = sellDate
    }

    return updatedTransaction
  }
}

/**
 * 在账户中添加资产
 */
export function addAssetToAccount(account: Account, asset: Asset): Account {
  return {
    ...account,
    assets: [...account.assets, asset],
  }
}

/**
 * 在资产中添加交易
 */
export function addTransactionToAsset(
  account: Account,
  assetId: string,
  transaction: Transaction
): Account {
  return {
    ...account,
    assets: account.assets.map((asset) =>
      asset.id === assetId
        ? { ...asset, transactions: [...asset.transactions, transaction] }
        : asset
    ),
  }
}

/**
 * 更新资产中的交易
 */
export function updateTransactionInAsset(
  account: Account,
  assetId: string,
  transactionId: string,
  updatedTransaction: Transaction
): Account {
  return {
    ...account,
    assets: account.assets.map((asset) =>
      asset.id === assetId
        ? {
            ...asset,
            transactions: asset.transactions.map((t) =>
              t.id === transactionId ? updatedTransaction : t
            ),
          }
        : asset
    ),
  }
}

/**
 * 删除资产中的交易
 */
export function deleteTransactionFromAsset(
  account: Account,
  assetId: string,
  transactionId: string
): Account {
  return {
    ...account,
    assets: account.assets.map((asset) =>
      asset.id === assetId
        ? {
            ...asset,
            transactions: asset.transactions.filter((t) => t.id !== transactionId),
          }
        : asset
    ),
  }
}

/**
 * 删除账户中的资产
 */
export function deleteAssetFromAccount(account: Account, assetId: string): Account {
  return {
    ...account,
    assets: account.assets.filter((asset) => asset.id !== assetId),
  }
}
