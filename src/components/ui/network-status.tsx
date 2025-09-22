import React from 'react'
import { useHealthCheck } from '@ppl-coach/api-client'
import { Badge } from './badge'
import { Button } from './button'
import { cn } from '@/lib/utils'
import {
  WifiIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'

interface NetworkStatusProps {
  className?: string
  showDetails?: boolean
  onRetry?: () => void
}

/**
 * Network status indicator component that shows connection and API health
 */
export function NetworkStatus({ className, showDetails = false, onRetry }: NetworkStatusProps) {
  const {
    systemStatus,
    isOnline,
    isApiHealthy,
    consecutiveFailures,
    forceCheck
  } = useHealthCheck()

  const handleRetry = async () => {
    try {
      await forceCheck()
      onRetry?.()
    } catch (error) {
      console.error('Manual health check failed:', error)
    }
  }

  // Determine overall status
  const getStatusInfo = () => {
    if (!isOnline) {
      return {
        status: 'offline',
        color: 'destructive' as const,
        icon: ExclamationTriangleIcon,
        message: 'No internet connection'
      }
    }

    if (!isApiHealthy) {
      return {
        status: 'api-down',
        color: 'destructive' as const,
        icon: ExclamationTriangleIcon,
        message: 'API unavailable'
      }
    }

    if (consecutiveFailures > 0) {
      return {
        status: 'degraded',
        color: 'secondary' as const,
        icon: ExclamationTriangleIcon,
        message: 'Connection issues'
      }
    }

    return {
      status: 'healthy',
      color: 'default' as const,
      icon: CheckCircleIcon,
      message: 'All systems operational'
    }
  }

  const statusInfo = getStatusInfo()
  const StatusIcon = statusInfo.icon

  // Compact view (just a badge)
  if (!showDetails) {
    return (
      <Badge
        variant={statusInfo.color}
        className={cn(
          "flex items-center gap-1 text-xs",
          className
        )}
      >
        <StatusIcon className="w-3 h-3" />
        {isOnline ? (isApiHealthy ? 'Online' : 'API Issues') : 'Offline'}
      </Badge>
    )
  }

  // Detailed view
  return (
    <div className={cn(
      "flex items-center gap-3 p-3 rounded-lg border",
      statusInfo.status === 'healthy' ? 'border-green-200 bg-green-50' :
      statusInfo.status === 'offline' ? 'border-red-200 bg-red-50' :
      'border-yellow-200 bg-yellow-50',
      className
    )}>
      <div className="flex items-center gap-2">
        <StatusIcon
          className={cn(
            "w-5 h-5",
            statusInfo.status === 'healthy' ? 'text-green-600' :
            statusInfo.status === 'offline' ? 'text-red-600' :
            'text-yellow-600'
          )}
        />
        <div className="flex flex-col">
          <span className="text-sm font-medium">
            {statusInfo.message}
          </span>
          {systemStatus.lastChecked && (
            <span className="text-xs text-muted-foreground">
              Last checked: {new Date(systemStatus.lastChecked).toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {/* Connection details */}
      <div className="flex items-center gap-2 ml-auto">
        <div className="flex items-center gap-1">
          <WifiIcon className="w-4 h-4" />
          <Badge variant={isOnline ? 'default' : 'destructive'} className="text-xs">
            {isOnline ? 'Connected' : 'Offline'}
          </Badge>
        </div>

        {systemStatus.apiHealth && (
          <Badge
            variant={isApiHealthy ? 'default' : 'destructive'}
            className="text-xs"
          >
            API: {systemStatus.apiHealth.responseTime}ms
          </Badge>
        )}

        {!isApiHealthy && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleRetry}
            className="h-7 px-2"
          >
            <ArrowPathIcon className="w-3 h-3 mr-1" />
            Retry
          </Button>
        )}
      </div>
    </div>
  )
}

/**
 * Simple network status dot for navigation bars
 */
export function NetworkStatusDot({ className }: { className?: string }) {
  const { isOnline, isApiHealthy } = useHealthCheck()

  const getDotColor = () => {
    if (!isOnline) return 'bg-red-500'
    if (!isApiHealthy) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  return (
    <div
      className={cn(
        "w-2 h-2 rounded-full animate-pulse",
        getDotColor(),
        className
      )}
      title={
        !isOnline ? 'Offline' :
        !isApiHealthy ? 'API Issues' :
        'Online'
      }
    />
  )
}

/**
 * Hook for components that need to respond to network status
 */
export function useNetworkAware() {
  const { isOnline, isApiHealthy, systemStatus } = useHealthCheck()

  return {
    isOnline,
    isApiHealthy,
    canMakeRequests: isOnline && isApiHealthy,
    shouldShowOfflineUI: !isOnline,
    shouldShowDegradedUI: isOnline && !isApiHealthy,
    systemStatus,
  }
}