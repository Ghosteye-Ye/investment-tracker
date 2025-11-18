export interface AccountSettings {
  buyFeePerUnit: number // 每股/克买入手续费
  sellFeePerUnit: number // 每股/克卖出手续费
  minBuyFee: number // 最低买入手续费
  minSellFee: number // 最低卖出手续费
  expandSubTransactions: boolean // 默认展开子交易
  currency: string // 货币单位
}

export interface Transaction {
  id: string
  buyDate: string
  buyQuantity: number
  buyPrice: number
  buyFee?: number // 买入手续费
  sellDate?: string
  sellQuantity?: number
  sellPrice?: number // 分批卖出时为所有子交易卖出单价的均值
  sellFee?: number // 卖出手续费
  profit?: number // 已实现收益
  createdAt: string
  children?: Transaction[] // 子交易数组（分批卖出时使用）
}

export interface Asset {
  id: string
  name: string
  symbol: string
  transactions: Transaction[]
  createdAt: string
}

export interface Account {
  id: string
  name: string
  type: "stock" | "gold"
  assets: Asset[]
  settings: AccountSettings
  createdAt: string
}
