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
  sellPrice?: number
  sellFee?: number // 卖出手续费
  profit?: number
  annualReturn?: number
  createdAt: string
  parentId?: string // 用于标识子交易
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
