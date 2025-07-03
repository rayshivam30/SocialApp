"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function DebugPage() {
  const [results, setResults] = useState<any>({})
  const [loading, setLoading] = useState(false)

  const testDatabaseConnection = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/debug/db-test")
      const data = await response.json()
      setResults((prev) => ({ ...prev, dbTest: data }))
    } catch (error) {
      setResults((prev) => ({ ...prev, dbTest: { error: error.message } }))
    } finally {
      setLoading(false)
    }
  }

  const createDemoUser = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/create-demo-user", { method: "POST" })
      const data = await response.json()
      setResults((prev) => ({ ...prev, demoUser: data }))
    } catch (error) {
      setResults((prev) => ({ ...prev, demoUser: { error: error.message } }))
    } finally {
      setLoading(false)
    }
  }

  const testLogin = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "demo@example.com", password: "password123" }),
      })
      const data = await response.json()
      setResults((prev) => ({ ...prev, login: data }))
    } catch (error) {
      setResults((prev) => ({ ...prev, login: { error: error.message } }))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Debug Dashboard</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Database Connection Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={testDatabaseConnection} disabled={loading}>
              Test Database Connection
            </Button>
            {results.dbTest && (
              <Alert>
                <AlertDescription>
                  <pre className="text-xs overflow-auto">{JSON.stringify(results.dbTest, null, 2)}</pre>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Create Demo User</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={createDemoUser} disabled={loading}>
              Create Demo User
            </Button>
            {results.demoUser && (
              <Alert>
                <AlertDescription>
                  <pre className="text-xs overflow-auto">{JSON.stringify(results.demoUser, null, 2)}</pre>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Login</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={testLogin} disabled={loading}>
              Test Login (demo@example.com / password123)
            </Button>
            {results.login && (
              <Alert>
                <AlertDescription>
                  <pre className="text-xs overflow-auto">{JSON.stringify(results.login, null, 2)}</pre>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
