'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Position {
  symbol: string
  positionId: string
  positionType: string
  positionSide: string
  positionSize: string
  entryPrice: string
  liquidationPrice: string
  isolatedMargin: string
  unrealizedProfit: string
  leverage: number
}

interface PositionsOverviewProps {
  positions: Position[]
  perpBalance: string
}

const formatNumber = (num: string | number) => {
  const parsed = parseFloat(String(num))
  if (isNaN(parsed)) return '0.00'
  if (parsed >= 1000000) return (parsed / 1000000).toFixed(2) + 'M'
  if (parsed >= 1000) return (parsed / 1000).toFixed(2) + 'K'
  return parsed.toFixed(2)
}

export function PositionsOverview({ positions, perpBalance }: PositionsOverviewProps) {
  // Calculate metrics from open positions
  const totalUPnL = positions.reduce((sum, pos) => sum + parseFloat(pos.unrealizedProfit || '0'), 0)
  
  const longPositions = positions.filter(p => p.positionSide === 'LONG')
  const shortPositions = positions.filter(p => p.positionSide === 'SHORT')
  
  const longExposureValue = longPositions.reduce((sum, pos) => {
    return sum + (parseFloat(pos.positionSize || '0') * parseFloat(pos.entryPrice || '0'))
  }, 0)
  
  const shortExposureValue = shortPositions.reduce((sum, pos) => {
    return sum + (parseFloat(pos.positionSize || '0') * parseFloat(pos.entryPrice || '0'))
  }, 0)
  
  const totalMarginUsed = positions.reduce((sum, pos) => sum + parseFloat(pos.isolatedMargin || '0'), 0)
  const availableMargin = Math.max(0, parseFloat(perpBalance) - totalMarginUsed)
  const marginUsageRatio = parseFloat(perpBalance) > 0 ? (totalMarginUsed / parseFloat(perpBalance)) * 100 : 0
  
  // Determine direction bias
  let directionBias = 'Neutral'
  if (longExposureValue > shortExposureValue * 1.2) {
    directionBias = 'Long Bias'
  } else if (shortExposureValue > longExposureValue * 1.2) {
    directionBias = 'Short Bias'
  }
  
  // Calculate ROE (Return on Equity)
  const roe = totalMarginUsed > 0 ? ((totalUPnL / totalMarginUsed) * 100).toFixed(2) : '0.00'
  
  // Calculate long and short exposure percentages
  const totalExposure = longExposureValue + shortExposureValue
  const longExposurePercent = totalExposure > 0 ? ((longExposureValue / totalExposure) * 100).toFixed(1) : '0.0'
  const shortExposurePercent = totalExposure > 0 ? ((shortExposureValue / totalExposure) * 100).toFixed(1) : '0.0'

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">Open Positions Overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Top Section - Perp Total Value & Current Positions */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-secondary rounded-lg p-4 space-y-1">
            <p className="text-xs sm:text-sm text-muted-foreground">Perp Total Value</p>
            <p className="text-2xl sm:text-3xl font-bold text-foreground">${formatNumber(perpBalance)}</p>
          </div>
          <div className="bg-secondary rounded-lg p-4 space-y-1">
            <p className="text-xs sm:text-sm text-muted-foreground">Current Positions</p>
            <p className="text-2xl sm:text-3xl font-bold text-foreground">{positions.length}</p>
          </div>
        </div>

        {/* Average Margin Used Ratio */}
        <div className="bg-secondary rounded-lg p-4 space-y-2">
          <div className="flex justify-between items-center">
            <p className="text-xs sm:text-sm text-muted-foreground">Average Margin Used Ratio</p>
            <p className="text-base sm:text-lg font-bold text-foreground">{marginUsageRatio.toFixed(1)}%</p>
          </div>
          <div className="w-full bg-background rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300" 
              style={{ width: `${Math.min(marginUsageRatio, 100)}%` }}
            />
          </div>
        </div>

        {/* Direction Bias */}
        <div className="bg-secondary rounded-lg p-4 space-y-1">
          <p className="text-xs sm:text-sm text-muted-foreground">Direction Bias</p>
          <p className="text-base sm:text-lg font-semibold text-foreground">{directionBias}</p>
        </div>

        {/* Exposure Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-secondary rounded-lg p-4 space-y-1">
            <p className="text-xs sm:text-sm text-muted-foreground">Long Exposure</p>
            <p className="text-lg sm:text-xl font-bold text-success">{longExposurePercent}%</p>
          </div>
          <div className="bg-secondary rounded-lg p-4 space-y-1">
            <p className="text-xs sm:text-sm text-muted-foreground">Short Exposure</p>
            <p className="text-lg sm:text-xl font-bold text-destructive">{shortExposurePercent}%</p>
          </div>
        </div>

        {/* Position Distribution */}
        <div className="space-y-2">
          <p className="text-xs sm:text-sm font-semibold text-muted-foreground">Position Distribution</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-secondary rounded-lg p-4 space-y-1">
              <p className="text-xs text-muted-foreground">Long Value</p>
              <p className="text-lg sm:text-xl font-bold text-success">${formatNumber(longExposureValue)}</p>
            </div>
            <div className="bg-secondary rounded-lg p-4 space-y-1">
              <p className="text-xs text-muted-foreground">Short Value</p>
              <p className="text-lg sm:text-xl font-bold text-destructive">${formatNumber(shortExposureValue)}</p>
            </div>
          </div>
        </div>

        {/* ROE & uPnL */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-secondary rounded-lg p-4 space-y-1">
            <p className="text-xs sm:text-sm text-muted-foreground">ROE</p>
            <p className={`text-lg sm:text-xl font-bold ${parseFloat(roe) >= 0 ? 'text-success' : 'text-destructive'}`}>{roe}%</p>
          </div>
          <div className="bg-secondary rounded-lg p-4 space-y-1">
            <p className="text-xs sm:text-sm text-muted-foreground">uPnL</p>
            <p className={`text-lg sm:text-xl font-bold ${totalUPnL >= 0 ? 'text-success' : 'text-destructive'}`}>${formatNumber(totalUPnL)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
