'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface PositionHistory {
  realized_pnl: string
  symbol_name: string
  created_at: number
  updated_at: number
}

interface TradingPerformanceProps {
  history: PositionHistory[]
}

type TimePeriod = '1w' | '1m' | '3m' | '6m' | '1y'

export function TradingPerformance1W({ history }: TradingPerformanceProps) {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('1w')

  const getTimeRangeInMs = (period: TimePeriod): number => {
    const days: Record<TimePeriod, number> = {
      '1w': 7,
      '1m': 30,
      '3m': 90,
      '6m': 180,
      '1y': 365,
    }
    return days[period] * 24 * 60 * 60 * 1000
  }

  const timeRangeMs = getTimeRangeInMs(timePeriod)
  const cutoffTime = Date.now() - timeRangeMs

  // Filter trades for the selected time period
  // Timestamps are in milliseconds already (not seconds)
  const filteredTrades = history.filter((trade) => {
    const tradeTime = trade.updated_at || trade.created_at
    return tradeTime >= cutoffTime
  })

  // Calculate statistics
  const profitableTrades = filteredTrades.filter((trade) => parseFloat(trade.realized_pnl) > 0)
  const closedPositions = filteredTrades.length

  const winRate = closedPositions > 0 
    ? parseFloat(((profitableTrades.length / closedPositions) * 100).toFixed(2))
    : 0

  // Calculate max drawdown (largest single loss)
  const maxDrawdown = filteredTrades.length > 0
    ? Math.max(
        0,
        Math.abs(
          Math.min(
            ...filteredTrades.map((t) => parseFloat(t.realized_pnl))
          )
        )
      )
    : 0

  const maxDrawdownPercent = filteredTrades.length > 0
    ? ((maxDrawdown / Math.abs(Math.max(...filteredTrades.map((t) => parseFloat(t.realized_pnl)), 1))) * 100).toFixed(2)
    : '0.00'

  const timePeriodLabels: Record<TimePeriod, string> = {
    '1w': '1 Week',
    '1m': '1 Month',
    '3m': '3 Months',
    '6m': '6 Months',
    '1y': '1 Year',
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base sm:text-lg">Trading Performance</CardTitle>
        <div className="flex gap-1 sm:gap-2">
          {(['1w', '1m', '3m', '6m', '1y'] as TimePeriod[]).map((period) => (
            <Button
              key={period}
              variant={timePeriod === period ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimePeriod(period)}
              className="text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3"
            >
              {period.toUpperCase()}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Win Rate */}
          <div className="bg-secondary rounded-lg p-4 space-y-1">
            <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-muted-foreground">Win Rate</p>
            <p className="text-2xl sm:text-3xl font-bold text-foreground">{winRate.toFixed(2)}%</p>
            <p className="text-xs text-muted-foreground">Winning trades ratio</p>
          </div>

          {/* Max Drawdown */}
          <div className="bg-secondary rounded-lg p-4 space-y-1">
            <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-muted-foreground">Max Drawdown</p>
            <p className="text-2xl sm:text-3xl font-bold text-destructive">{maxDrawdownPercent}%</p>
            <p className="text-xs text-muted-foreground">Largest decline</p>
          </div>

          {/* Trades */}
          <div className="bg-secondary rounded-lg p-4 space-y-1">
            <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-muted-foreground">Trades</p>
            <p className="text-2xl sm:text-3xl font-bold text-foreground">{filteredTrades.length}</p>
            <p className="text-xs text-muted-foreground">Total trades</p>
          </div>

          {/* Closed Positions */}
          <div className="bg-secondary rounded-lg p-4 space-y-1">
            <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-muted-foreground">Closed Positions</p>
            <p className="text-2xl sm:text-3xl font-bold text-foreground">{closedPositions}</p>
            <p className="text-xs text-muted-foreground">Closed positions</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
