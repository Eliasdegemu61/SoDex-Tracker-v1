'use client'

import { useState, useMemo, useEffect } from 'react'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  TooltipProps,
} from 'recharts'
import { useIsMobile } from '@/hooks/use-mobile'

interface PositionHistory {
  position_id: string
  symbol_name: string
  realized_pnl: string
  created_at: number
  updated_at: number
}

interface PnLOverTimeProps {
  history: PositionHistory[]
}

interface ChartDataPoint {
  date: string
  fullDate: string
  dailyPnL: number
  cumulativePnL: number
}

type TimeRange = '1W' | '1M' | '3M' | 'ALL'

const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (active && payload && payload.length > 0) {
    const data = payload[0].payload as ChartDataPoint
    const dailyPnL = data.dailyPnL
    const cumulativePnL = data.cumulativePnL

    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
        <p className="text-xs text-muted-foreground">{data.fullDate}</p>
        <p className={`text-sm font-semibold ${dailyPnL >= 0 ? 'text-emerald-500' : 'text-red-600'}`}>
          Daily: ${dailyPnL.toFixed(2)}
        </p>
        <p className="text-sm font-semibold text-purple-400">
          Total: ${cumulativePnL.toFixed(2)}
        </p>
      </div>
    )
  }
  return null
}

export function PnLOverTime({ history }: PnLOverTimeProps) {
  const isMobile = useIsMobile()
  const [showBars, setShowBars] = useState(true)
  const [showLine, setShowLine] = useState(true)
  const [timeRange, setTimeRange] = useState<TimeRange>('ALL')
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    // Check if dark mode is enabled
    const darkModeEnabled = document.documentElement.classList.contains('dark')
    setIsDarkMode(darkModeEnabled)

    // Watch for theme changes
    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains('dark')
      setIsDarkMode(isDark)
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })

    return () => observer.disconnect()
  }, [])

  const sortedHistory = [...history].sort((a, b) => a.updated_at - b.updated_at)

  const dailyData: Record<string, number> = {}
  sortedHistory.forEach((trade) => {
    const date = new Date(trade.updated_at)
    const dayKey = date.toLocaleDateString('en-US')
    dailyData[dayKey] = (dailyData[dayKey] || 0) + parseFloat(trade.realized_pnl || '0')
  })

  let cumulativePnL = 0
  const chartData: ChartDataPoint[] = Object.entries(dailyData)
    .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
    .map(([dayKey, dailyPnL]) => {
      cumulativePnL += dailyPnL
      const date = new Date(dayKey)
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        fullDate: date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
        dailyPnL: Math.round(dailyPnL * 100) / 100,
        cumulativePnL: Math.round(cumulativePnL * 100) / 100,
      }
    })

  const filteredData = useMemo(() => {
    const now = new Date()
    let cutoffDate = new Date()

    switch (timeRange) {
      case '1W':
        cutoffDate.setDate(now.getDate() - 7)
        break
      case '1M':
        cutoffDate.setMonth(now.getMonth() - 1)
        break
      case '3M':
        cutoffDate.setMonth(now.getMonth() - 3)
        break
      case 'ALL':
        return chartData
    }

    return chartData.filter((item) => new Date(item.fullDate) >= cutoffDate)
  }, [chartData, timeRange])

  // Calculate Y-axis domains for responsive scaling
  const dailyPnLValues = filteredData.map((d) => d.dailyPnL)
  const cumulativePnLValues = filteredData.map((d) => d.cumulativePnL)

  const minDailyPnL = Math.min(...dailyPnLValues, 0)
  const maxDailyPnL = Math.max(...dailyPnLValues, 0)
  const dailyPnLPadding = Math.abs(maxDailyPnL - minDailyPnL) * 0.1 || 1

  const minCumulativePnL = Math.min(...cumulativePnLValues)
  const maxCumulativePnL = Math.max(...cumulativePnLValues)
  const cumulativePnLPadding = Math.abs(maxCumulativePnL - minCumulativePnL) * 0.1 || 1

  // Calculate proportional y-axis interval based on account size
  const accountSize = Math.abs(maxCumulativePnL)
  let yAxisInterval = 0
  let tickCount = 5

  if (accountSize > 0) {
    if (accountSize < 1000) {
      yAxisInterval = Math.ceil(accountSize / 300)
    } else if (accountSize < 10000) {
      yAxisInterval = Math.ceil(accountSize / 500)
    } else if (accountSize < 100000) {
      yAxisInterval = Math.ceil(accountSize / 1000)
    } else {
      yAxisInterval = Math.ceil(accountSize / 2000)
    }
  }

  const tickColor = isDarkMode ? '#ffffff' : 'hsl(var(--foreground))'

  // Y-axis formatter to remove decimals or use 1 decimal max
  const formatYAxisTick = (value: number) => {
    if (Math.abs(value) < 1) {
      return value.toFixed(1)
    }
    return Math.round(value).toString()
  }

  return (
    <section className="space-y-6">
      <div className="border-b border-border/30 pb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <h2 className="text-xl font-semibold text-foreground">PNL</h2>

          {/* Time Range Filters */}
          <div className="flex gap-2">
            {(['1W', '1M', '3M', 'ALL'] as TimeRange[]).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange(range)}
                className="text-xs"
              >
                {range}
              </Button>
            ))}
          </div>
        </div>

        {/* Chart Display Selector */}
        <div className="flex gap-3 items-center">
          <span className="text-sm text-muted-foreground">Display:</span>
          <Select
            value={`${showBars ? 'bars' : ''}${showBars && showLine ? '+' : ''}${showLine ? 'line' : ''}`}
            onValueChange={(value) => {
              if (value === 'bars') {
                setShowBars(true)
                setShowLine(false)
              } else if (value === 'line') {
                setShowBars(false)
                setShowLine(true)
              } else if (value === 'bars+line') {
                setShowBars(true)
                setShowLine(true)
              }
            }}
          >
            <SelectTrigger className="w-fit gap-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bars">Daily PnL Bars</SelectItem>
              <SelectItem value="line">Cumulative Line</SelectItem>
              <SelectItem value="bars+line">Both</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div 
        className="w-full select-none outline-none"
        style={{
          WebkitTapHighlightColor: 'transparent',
          WebkitUserSelect: 'none',
          WebkitTouchCallout: 'none',
          outline: 'none',
          userSelect: 'none',
          height: isMobile ? '320px' : '500px'
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart 
            data={filteredData} 
            margin={{ 
              top: 20, 
              right: isMobile ? 40 : 60, 
              left: isMobile ? 30 : 0, 
              bottom: isMobile ? 10 : 20 
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground) / 0.15)" vertical={false} pointerEvents="none" />

            {/* Left Y-Axis for Daily PnL */}
            <YAxis
              yAxisId="left"
              domain={[minDailyPnL - dailyPnLPadding, maxDailyPnL + dailyPnLPadding]}
              tick={{ fontSize: isMobile ? 10 : 11, fill: tickColor }}
              stroke="hsl(var(--muted-foreground) / 0.7)"
              width={isMobile ? 35 : 50}
              interval={yAxisInterval}
              tickFormatter={formatYAxisTick}
            />

            {/* Right Y-Axis for Cumulative PnL */}
            <YAxis
              yAxisId="right"
              orientation="right"
              domain={[minCumulativePnL - cumulativePnLPadding, maxCumulativePnL + cumulativePnLPadding]}
              tick={{ fontSize: isMobile ? 10 : 11, fill: tickColor }}
              stroke="hsl(var(--muted-foreground) / 0.7)"
              width={isMobile ? 35 : 50}
              interval={yAxisInterval}
              tickFormatter={formatYAxisTick}
            />

            <XAxis
              dataKey="date"
              tick={{ fontSize: isMobile ? 9 : 11, fill: tickColor }}
              stroke="hsl(var(--muted-foreground) / 0.7)"
              tickCount={isMobile ? 4 : 8}
            />

            <Tooltip 
              content={<CustomTooltip />} 
              trigger={isMobile ? 'click' : 'hover'}
              cursor={isMobile ? false : { fill: 'hsl(var(--muted) / 0.1)' }}
              isAnimationActive={false}
              contentStyle={{ pointerEvents: 'auto' }}
            />

            {/* Daily PnL Bars - Emerald green for gains, Crimson for losses */}
            {showBars && (
              <Bar
                yAxisId="left"
                dataKey="dailyPnL"
                radius={[4, 4, 0, 0]}
                isAnimationActive={false}
                shape={(props) => {
                  const { x = 0, y = 0, width = 0, height = 0, payload } = props as any
                  if (!payload) return null

                  const isGain = payload.dailyPnL >= 0
                  const barColor = isGain ? '#10b981' : '#dc2626'

                  return (
                    <rect
                      x={Number(x) + width * 0.2}
                      y={isGain ? Number(y) : Number(y) + Number(height)}
                      width={width * 0.6}
                      height={Math.abs(Number(height))}
                      fill={barColor}
                      style={{ pointerEvents: 'none' }}
                    />
                  )
                }}
              />
            )}

            {/* Cumulative PnL Line - Neon pink/red */}
            {showLine && (
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="cumulativePnL"
                stroke="#ff006e"
                strokeWidth={3}
                dot={false}
                isAnimationActive={false}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
