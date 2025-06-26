"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import type { Account } from "@/types/investment"

export default function AccountSettingsPage() {
  const params = useParams()
  const navigate = useNavigate();
  const [account, setAccount] = useState<Account | null>(null)
  const [settings, setSettings] = useState({
    buyFeeRate: 0.1,
    sellFeeRate: 0.1,
    expandSubTransactions: true,
    currency: "¥",
  })

  useEffect(() => {
    const savedAccounts = localStorage.getItem("investment-accounts")
    if (savedAccounts) {
      const accounts: Account[] = JSON.parse(savedAccounts)
      const foundAccount = accounts.find((acc) => acc.id === params.id)
      if (foundAccount) {
        setAccount(foundAccount)
        setSettings(
          foundAccount.settings || {
            buyFeeRate: 0.1,
            sellFeeRate: 0.1,
            expandSubTransactions: true,
            currency: "¥",
          },
        )
      }
    }
  }, [params.id])

  const handleSave = () => {
    if (!account) return

    const updatedAccount = {
      ...account,
      settings,
    }

    // Update localStorage
    const savedAccounts = localStorage.getItem("investment-accounts")
    if (savedAccounts) {
      const accounts: Account[] = JSON.parse(savedAccounts)
      const updatedAccounts = accounts.map((acc) => (acc.id === account.id ? updatedAccount : acc))
      localStorage.setItem("investment-accounts", JSON.stringify(updatedAccounts))
    }

    navigate(`/account/${account.id}`)
  }

  if (!account) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-2">账户不存在</h2>
          <Button onClick={() => navigate("/")} className="bg-purple-500 hover:bg-purple-600">
            返回首页
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/account/${account.id}`)}
            className="text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-full w-10 h-10 p-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">账户设置</h1>
            <p className="text-slate-400">{account.name}</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* 手续费设置 */}
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
            <CardHeader>
              <CardTitle className="text-white">手续费设置</CardTitle>
              <CardDescription className="text-slate-400">
                设置买入和卖出时的手续费率，将自动计算到收益中
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="buy-fee" className="text-slate-300">
                    买入手续费率 (%)
                  </Label>
                  <Input
                    id="buy-fee"
                    type="number"
                    min="0"
                    step="0.01"
                    value={settings.buyFeeRate}
                    onChange={(e) =>
                      setSettings({ ...settings, buyFeeRate: Math.max(0, Number.parseFloat(e.target.value) || 0) })
                    }
                    className="bg-slate-700/50 border-slate-600 text-white focus:border-purple-500 focus:ring-purple-500/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sell-fee" className="text-slate-300">
                    卖出手续费率 (%)
                  </Label>
                  <Input
                    id="sell-fee"
                    type="number"
                    min="0"
                    step="0.01"
                    value={settings.sellFeeRate}
                    onChange={(e) =>
                      setSettings({ ...settings, sellFeeRate: Math.max(0, Number.parseFloat(e.target.value) || 0) })
                    }
                    className="bg-slate-700/50 border-slate-600 text-white focus:border-purple-500 focus:ring-purple-500/20"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 显示设置 */}
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
            <CardHeader>
              <CardTitle className="text-white">显示设置</CardTitle>
              <CardDescription className="text-slate-400">自定义交易记录的显示方式</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-slate-300">默认展开子交易</Label>
                  <p className="text-sm text-slate-400">部分卖出的交易记录是否默认展开显示</p>
                </div>
                <Switch
                  checked={settings.expandSubTransactions}
                  onCheckedChange={(checked) => setSettings({ ...settings, expandSubTransactions: checked })}
                />
              </div>
            </CardContent>
          </Card>

          {/* 货币设置 */}
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
            <CardHeader>
              <CardTitle className="text-white">货币设置</CardTitle>
              <CardDescription className="text-slate-400">设置显示的货币符号</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="currency" className="text-slate-300">
                  货币符号
                </Label>
                <Input
                  id="currency"
                  type="text"
                  value={settings.currency}
                  onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                  className="bg-slate-700/50 border-slate-600 text-white focus:border-purple-500 focus:ring-purple-500/20"
                  placeholder="¥"
                />
              </div>
            </CardContent>
          </Card>

          {/* 保存按钮 */}
          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-8 py-2 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <Save className="w-4 h-4 mr-2" />
              保存设置
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
