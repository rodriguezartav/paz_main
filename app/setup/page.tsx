'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { setupDefaultAdmin } from './actions'
import { CheckCircle2, Loader2 } from 'lucide-react'

export default function SetupPage() {
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleSetup = () => {
    startTransition(async () => {
      const res = await setupDefaultAdmin()
      setResult(res)
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Initial Setup</CardTitle>
          <CardDescription>
            Create the default admin user to get started
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {result?.success ? (
            <div className="text-center space-y-4">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
              <div>
                <p className="font-medium text-green-700">{result.message}</p>
                <div className="mt-4 p-4 bg-muted rounded-lg text-left">
                  <p className="text-sm"><strong>Username:</strong> admin</p>
                  <p className="text-sm"><strong>Password:</strong> admin123</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Please change this password after logging in!
                  </p>
                </div>
              </div>
              <Button asChild className="w-full">
                <a href="/login">Go to Login</a>
              </Button>
            </div>
          ) : result ? (
            <div className="text-center">
              <p className="text-red-600">{result.message}</p>
              <Button onClick={handleSetup} className="mt-4" disabled={isPending}>
                Try Again
              </Button>
            </div>
          ) : (
            <Button onClick={handleSetup} className="w-full" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Admin User...
                </>
              ) : (
                'Create Default Admin User'
              )}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
