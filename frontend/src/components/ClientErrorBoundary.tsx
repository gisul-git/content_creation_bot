'use client'

import React from 'react';
import ErrorBoundary from './ErrorBoundary';

/**
 * Client-side wrapper for ErrorBoundary.
 * This is needed because ErrorBoundary uses React class components
 * which require client-side rendering.
 */
export default function ClientErrorBoundary({ children }: { children: React.ReactNode }) {
  return <ErrorBoundary>{children}</ErrorBoundary>;
}

