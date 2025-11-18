import { useState, useEffect, useCallback } from "react"
import type { Account } from "@/types/investment"
import { getAccountById, updateAccount } from "./useInvestmentDB"

/**
 * 管理单个账户数据的 Hook
 * @param accountId 账户 ID
 * @returns 账户数据、加载状态和更新函数
 */
export function useAccountData(accountId: string | undefined) {
  const [account, setAccount] = useState<Account | null>(null)
  const [loading, setLoading] = useState(true)

  // 加载账户数据
  useEffect(() => {
    if (!accountId) {
      setLoading(false)
      return
    }

    setLoading(true)
    getAccountById(accountId)
      .then((data) => {
        setAccount(data || null)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [accountId])

  // 更新账户数据（同时更新本地状态和数据库）
  const saveAccount = useCallback(async (updatedAccount: Account) => {
    setAccount(updatedAccount)
    await updateAccount(updatedAccount)
  }, [])

  return { account, loading, saveAccount, setAccount }
}
