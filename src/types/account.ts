export interface AccountSettings {
  buyFeeRate: number // 买入手续费率 (%)
  sellFeeRate: number // 卖出手续费率 (%)
  expandSubTransactions: boolean // 默认展开子交易
  currency: string // 货币单位
}
