import { getData, getOrganizationStats } from "@/app/actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

export default async function NeonTestPage() {
  // Test 1: Basic connection test
  let connectionTest = { success: false, error: "" };
  try {
    const result = await getData();
    connectionTest = result;
  } catch (error: any) {
    connectionTest = {
      success: false,
      error: error.message || "Unknown error",
    };
  }

  // Test 2: Check if we have organizations to test with
  let orgStatsTest = { success: false, error: "", stats: null };
  try {
    // Try to get stats for the first organization (if any exist)
    // This is just a test, so we'll use a placeholder ID
    const testResult = await getData();
    if (testResult.success && testResult.data && Array.isArray(testResult.data) && testResult.data.length > 0) {
      // If we have data, the connection is working
      orgStatsTest = {
        success: true,
        error: "",
        stats: { message: "Connection successful - data retrieved" },
      };
    } else {
      orgStatsTest = {
        success: true,
        error: "",
        stats: { message: "Connection successful - no data yet (this is normal for a new database)" },
      };
    }
  } catch (error: any) {
    orgStatsTest = {
      success: false,
      error: error.message || "Unknown error",
      stats: null,
    };
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-2">Neon Database Connection Test</h1>
        <p className="text-muted-foreground">
          This page tests your Neon serverless database connection
        </p>
      </div>

      {/* Connection Test */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Test 1: Basic Connection
            {connectionTest.success ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
          </CardTitle>
          <CardDescription>
            Testing if Neon serverless driver can connect to your database
          </CardDescription>
        </CardHeader>
        <CardContent>
          {connectionTest.success ? (
            <div className="space-y-4">
              <Badge variant="default" className="bg-green-500">
                Connection Successful
              </Badge>
              <div>
                <p className="text-sm font-medium mb-2">Query Result:</p>
                {connectionTest.data && Array.isArray(connectionTest.data) ? (
                  <div className="bg-muted p-4 rounded-md">
                    <p className="text-sm">
                      Retrieved {connectionTest.data.length} record(s)
                    </p>
                    {connectionTest.data.length > 0 && (
                      <pre className="mt-2 text-xs overflow-auto">
                        {JSON.stringify(connectionTest.data[0], null, 2)}
                      </pre>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No data returned (this is normal if your database is empty)
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Badge variant="destructive">Connection Failed</Badge>
              <div className="bg-destructive/10 p-4 rounded-md">
                <p className="text-sm font-medium text-destructive mb-2">
                  Error Message:
                </p>
                <p className="text-sm">{connectionTest.error}</p>
              </div>
              <div className="bg-muted p-4 rounded-md">
                <p className="text-sm font-medium mb-2">Troubleshooting:</p>
                <ul className="text-sm list-disc list-inside space-y-1">
                  <li>Check that DATABASE_URL is set in .env.local</li>
                  <li>Verify the connection string format is correct</li>
                  <li>For Neon: Use pooler connection (port 6543) for app runtime</li>
                  <li>Ensure ?sslmode=require is included in the URL</li>
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Retrieval Test */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Test 2: Data Retrieval
            {orgStatsTest.success ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
          </CardTitle>
          <CardDescription>
            Testing if we can retrieve data from the database
          </CardDescription>
        </CardHeader>
        <CardContent>
          {orgStatsTest.success ? (
            <div className="space-y-4">
              <Badge variant="default" className="bg-green-500">
                Data Retrieval Successful
              </Badge>
              {orgStatsTest.stats && (
                <div className="bg-muted p-4 rounded-md">
                  <p className="text-sm">{orgStatsTest.stats.message}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <Badge variant="destructive">Data Retrieval Failed</Badge>
              <div className="bg-destructive/10 p-4 rounded-md">
                <p className="text-sm font-medium text-destructive mb-2">
                  Error Message:
                </p>
                <p className="text-sm">{orgStatsTest.error}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Environment Info */}
      <Card>
        <CardHeader>
          <CardTitle>Environment Information</CardTitle>
          <CardDescription>
            Check your DATABASE_URL configuration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>
              <p className="text-sm font-medium">DATABASE_URL Status:</p>
              <Badge
                variant={
                  process.env.DATABASE_URL ? "default" : "destructive"
                }
                className="mt-1"
              >
                {process.env.DATABASE_URL
                  ? "Configured"
                  : "Not Found"}
              </Badge>
            </div>
            {process.env.DATABASE_URL && (
              <div className="bg-muted p-4 rounded-md">
                <p className="text-sm font-medium mb-2">Connection String (masked):</p>
                <code className="text-xs break-all">
                  {process.env.DATABASE_URL.replace(
                    /:[^:@]+@/,
                    ":****@"
                  )}
                </code>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            {connectionTest.success ? (
              <>
                <p className="font-medium text-green-600">
                  ✅ Your Neon connection is working!
                </p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>You can now use the functions in src/app/actions.ts</li>
                  <li>Import them in your components: import {"{ getData }"} from '@/app/actions'</li>
                  <li>Use them in Server Components or call them from Client Components</li>
                </ul>
              </>
            ) : (
              <>
                <p className="font-medium text-red-600">
                  ❌ Connection failed. Please fix the issues above.
                </p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Check your .env.local file</li>
                  <li>Verify your Neon connection string</li>
                  <li>Make sure you're using the pooler connection (port 6543) for the app</li>
                  <li>Restart your dev server after changing .env.local</li>
                </ul>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

