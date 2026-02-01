'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

interface AccountBalanceProps {
  perpetualBalance: string | number
  spotBalance: string | number
}

export function AccountBalance({ perpetualBalance, spotBalance }: AccountBalanceProps) {
  const perpsVal = parseFloat(String(perpetualBalance))
  const spotVal = parseFloat(String(spotBalance))
  const totalBalance = perpsVal + spotVal

  const data = [
    { name: 'Perpetual', value: perpsVal },
    { name: 'Spot', value: spotVal },
  ]

  const COLORS = ['#3b82f6', '#10b981']

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">Account Total Value</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left side - Chart */}
          <div className="w-full md:w-1/2 flex justify-center">
            <div className="w-48 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Right side - Values */}
          <div className="w-full md:w-1/2 space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Balance</p>
              <p className="text-3xl sm:text-4xl font-bold text-foreground">${totalBalance.toFixed(2)}</p>
            </div>

            {/* Balance breakdown */}
            <div className="space-y-2 pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#3b82f6' }} />
                  <p className="text-sm text-muted-foreground">Perpetual</p>
                </div>
                <p className="text-sm font-semibold text-foreground">${perpsVal.toFixed(2)}</p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#10b981' }} />
                  <p className="text-sm text-muted-foreground">Spot</p>
                </div>
                <p className="text-sm font-semibold text-foreground">${spotVal.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
