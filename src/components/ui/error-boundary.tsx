import * as React from "react"
import { ErrorBoundary as ReactErrorBoundary } from "react-error-boundary"
import { AlertCircle, RefreshCw, ArrowLeft, Bug } from "lucide-react"
import { Button } from "./button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card"
import { Badge } from "./badge"

interface ErrorInfo {
  componentStack: string
  errorBoundary?: string | null
}

interface ErrorFallbackProps {
  error: Error
  resetErrorBoundary: () => void
  resetKeys?: Array<string | number>
}

/**
 * Beautiful error fallback component with actionable recovery options
 */
export function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  const [showDetails, setShowDetails] = React.useState(false)
  const [isRefreshing, setIsRefreshing] = React.useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Add a small delay for UX
    await new Promise(resolve => setTimeout(resolve, 1000))
    resetErrorBoundary()
    setIsRefreshing(false)
  }

  const handleGoBack = () => {
    window.history.back()
  }

  const handleReload = () => {
    window.location.reload()
  }

  // Check if it's a network error
  const isNetworkError = error.message.toLowerCase().includes('fetch') ||
                        error.message.toLowerCase().includes('network') ||
                        error.name === 'TypeError'

  // Check if it's a component error
  const isComponentError = error.componentStack ||
                          error.message.includes('Cannot read') ||
                          error.message.includes('undefined')

  return (
    <div className="min-h-[400px] flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-destructive" />
          </div>
          <CardTitle className="text-xl">Something went wrong</CardTitle>
          <CardDescription>
            {isNetworkError
              ? "We're having trouble connecting to our servers"
              : "An unexpected error occurred while loading this page"
            }
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Error Type Badge */}
          <div className="flex justify-center">
            <Badge variant={isNetworkError ? "destructive" : "secondary"}>
              {isNetworkError ? "Network Error" : "Application Error"}
            </Badge>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Retrying...' : 'Try Again'}
            </Button>

            <Button
              variant="outline"
              onClick={handleGoBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </Button>

            {isNetworkError && (
              <Button
                variant="outline"
                onClick={handleReload}
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Reload Page
              </Button>
            )}
          </div>

          {/* Error Details Toggle */}
          <div className="text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
              className="text-muted-foreground flex items-center gap-2"
            >
              <Bug className="w-4 h-4" />
              {showDetails ? 'Hide' : 'Show'} Error Details
            </Button>
          </div>

          {/* Error Details */}
          {showDetails && (
            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <div className="text-sm space-y-2">
                <div>
                  <strong className="text-foreground">Error:</strong>
                  <p className="text-muted-foreground font-mono text-xs break-all">
                    {error.name}: {error.message}
                  </p>
                </div>

                {error.stack && (
                  <div>
                    <strong className="text-foreground">Stack Trace:</strong>
                    <pre className="text-muted-foreground font-mono text-xs overflow-auto max-h-32 whitespace-pre-wrap">
                      {error.stack}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Help Text */}
          <div className="text-center text-sm text-muted-foreground">
            {isNetworkError ? (
              <p>Please check your internet connection and try again.</p>
            ) : (
              <p>If this problem persists, please refresh the page or contact support.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Lightweight error fallback for smaller components
 */
export function MinimalErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <div className="flex items-center justify-center p-4 border border-destructive/20 rounded-lg bg-destructive/5">
      <div className="text-center space-y-2">
        <AlertCircle className="w-5 h-5 text-destructive mx-auto" />
        <p className="text-sm text-muted-foreground">Something went wrong</p>
        <Button size="sm" variant="outline" onClick={resetErrorBoundary}>
          Try again
        </Button>
      </div>
    </div>
  )
}

/**
 * Enhanced Error Boundary component with logging and recovery
 */
interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<ErrorFallbackProps>
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  resetKeys?: Array<string | number>
  resetOnPropsChange?: boolean
  isolate?: boolean
  name?: string
}

export function ErrorBoundary({
  children,
  fallback: FallbackComponent = ErrorFallback,
  onError,
  resetKeys,
  resetOnPropsChange = true,
  isolate = false,
  name
}: ErrorBoundaryProps) {
  const handleError = React.useCallback((error: Error, errorInfo: ErrorInfo) => {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group(`🚨 Error Boundary: ${name || 'Unknown'}`)
      console.error('Error:', error)
      console.error('Error Info:', errorInfo)
      console.groupEnd()
    }

    // Call custom error handler
    onError?.(error, errorInfo)

    // In production, you might want to send to error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error, { contexts: { errorInfo } })
    }
  }, [onError, name])

  return (
    <ReactErrorBoundary
      FallbackComponent={FallbackComponent}
      onError={handleError}
      resetKeys={resetKeys}
      resetOnPropsChange={resetOnPropsChange}
      isolate={isolate}
    >
      {children}
    </ReactErrorBoundary>
  )
}

/**
 * HOC to wrap components with error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  return WrappedComponent
}

/**
 * Pre-configured error boundaries for common use cases
 */
export const PageErrorBoundary = ({ children }: { children: React.ReactNode }) => (
  <ErrorBoundary
    name="Page"
    fallback={ErrorFallback}
    resetOnPropsChange={true}
  >
    {children}
  </ErrorBoundary>
)

export const ComponentErrorBoundary = ({ children }: { children: React.ReactNode }) => (
  <ErrorBoundary
    name="Component"
    fallback={MinimalErrorFallback}
    isolate={true}
  >
    {children}
  </ErrorBoundary>
)

export const FormErrorBoundary = ({ children }: { children: React.ReactNode }) => (
  <ErrorBoundary
    name="Form"
    fallback={MinimalErrorFallback}
    resetOnPropsChange={false}
  >
    {children}
  </ErrorBoundary>
)