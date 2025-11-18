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
 * 创建卖出交易(更新现有交易或创建子交易)
 * @param transaction 原交易记录
 * @param sellData 卖出数据
 * @param account 账户信息
 * @returns 更新后的交易和可能的子交易
 */
export function createSellTransaction(
  transaction: Transaction,
  sellData: {
    sellDate: string
    sellQuantity: number
    sellPrice: number
  },
  account: Account
): { updatedTransaction: Transaction; subTransaction?: Transaction } {
  const { sellDate, sellQuantity, sellPrice } = sellData
  const sellFee = calculateSellFee(sellQuantity, account.settings)

  const holdingQuantity = transaction.buyQuantity - (transaction.sellQuantity || 0)

  // 计算收益
  const buyCost = transaction.buyPrice * sellQuantity
  const buyFee = calculateProportionalBuyFee(transaction.buyFee || 0, sellQuantity, transaction.buyQuantity)
  const sellRevenue = sellPrice * sellQuantity
  const profit = sellRevenue - sellFee - buyCost - buyFee

  // 完全卖出
  if (sellQuantity >= holdingQuantity) {
    const actualSellQuantity = holdingQuantity
    const actualSellFee = calculateSellFee(actualSellQuantity, account.settings)

    const actualBuyCost = transaction.buyPrice * actualSellQuantity
    const actualBuyFee = calculateProportionalBuyFee(
      transaction.buyFee || 0,
      actualSellQuantity,
      transaction.buyQuantity
    )

    const actualSellRevenue = sellPrice * actualSellQuantity
    const actualProfit = actualSellRevenue - actualSellFee - actualBuyCost - actualBuyFee

    const updatedTransaction: Transaction = {
      ...transaction,
      sellDate,
      sellQuantity: transaction.buyQuantity,
      sellPrice,
      sellFee: (transaction.sellFee || 0) + actualSellFee,
      profit: (transaction.profit || 0) + actualProfit,
    }

    return { updatedTransaction }
  } else {
    // 部分卖出 - 创建子交易
    const subTransaction: Transaction = {
      id: Date.now().toString(),
      buyDate: transaction.buyDate,
      buyQuantity: sellQuantity,
      buyPrice: transaction.buyPrice,
      buyFee,
      sellDate,
      sellQuantity,
      sellPrice,
      sellFee,
      profit,
      parentId: transaction.id,
      createdAt: new Date().toISOString(),
    }

    // 更新原交易的卖出数量
    const updatedTransaction: Transaction = {
      ...transaction,
      sellQuantity: (transaction.sellQuantity || 0) + sellQuantity,
    }

    return { updatedTransaction, subTransaction }
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
            transactions: asset.transactions.filter((t) => t.id !== transactionId && t.parentId !== transactionId),
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
