import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'

type Props = {
  children: ReactNode
}

type State = {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, info)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center px-6">
          <div className="w-full max-w-md text-center">
            <p className="mb-2 text-[10px] uppercase tracking-[0.15em] text-neutral-400 dark:text-neutral-600">
              Error
            </p>
            <h1 className="text-2xl font-light tracking-tight text-neutral-900 dark:text-white">
              Something went wrong
            </h1>
            <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-400">
              {this.state.error?.message ?? 'An unexpected error occurred.'}
            </p>
            <button
              type="button"
              onClick={this.handleReset}
              className="mt-8 bg-c-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-c-accent-h focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-c-accent/30"
            >
              Try again
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
