export interface AccountSettings {
  buyFeeRate: number // 买入手续费率 (%)
  sellFeeRate: number // 卖出手续费率 (%)
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
