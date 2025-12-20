"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { authClient } from "@/lib/auth-client"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import Link from "next/link"
import { useState, useEffect } from "react"
import { Info } from "lucide-react"

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, { message: "Password must be at least 8 characters long" }),
})

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {

  const [error, setError] = useState<string | undefined | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onChange", // Enable live validation
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const session = authClient.useSession()
  const mutation = useMutation(api.functions.users.mutations.createUser)
  const [isSyncing, setIsSyncing] = useState(false)

  // Sync user after social login redirect
  useEffect(() => {
    const syncUser = async () => {
      if (session.data?.user && !isSyncing) {
        setIsSyncing(true)
        try {
          await mutation({
            sessionId: session.data.user.id,
            name: session.data.user.name || "User",
            email: session.data.user.email,
          })
          console.log("Social user synced to database from login")
        } catch (error) {
          console.error("Error syncing social user from login:", error)
        } finally {
          setIsSyncing(false)
        }
      }
    }

    syncUser()
  }, [session.data?.user?.id, mutation])

  async function handleSignInWithGoogle() {
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/login", // Redirect back here to trigger sync
      })
    } catch (err) {
      console.error("Google sign in error:", err)
    }
  }

  // Watch form values to clear backend error when user types
  const watchedFields = form.watch()

  useEffect(() => {
    // Clear backend error when user starts typing in any field
    if (error) {
      setError(null)
    }
  }, [watchedFields.email, watchedFields.password])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const { data, error } = await authClient.signIn.email({
        email: values.email,
        password: values.password,
      })

      if (error) {
        setError(error.message)
        console.error("Login error:", error)
        return
      }

      console.log(data)
    } catch (error) {
      console.error("Unexpected error:", error)
    }
  }

  return (
    <div className={cn("flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] w-full max-w-lg mx-auto px-4 py-8", className)} {...props}>
      <div className="w-full space-y-8 text-center">
        <div className="flex justify-center mb-6">
          <svg viewBox="0 0 122.8 122.8" className="h-12 w-12">
            <path d="M25.8 77.6c0 7.1-5.8 12.9-12.9 12.9S0 84.7 0 77.6s5.8-12.9 12.9-12.9h12.9v12.9zm6.4 0c0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9v32.3c0 7.1-5.8 12.9-12.9 12.9s-12.9-5.8-12.9-12.9V77.6z" fill="#e01e5a" />
            <path d="M45.1 25.8c-7.1 0-12.9-5.8-12.9-12.9S38 0 45.1 0s12.9 5.8 12.9 12.9v12.9H45.1zm0 6.4c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9H12.9C5.8 58 0 52.2 0 45.1s5.8-12.9 12.9-12.9h32.2z" fill="#36c5f0" />
            <path d="M97 45.1c0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9-5.8 12.9-12.9 12.9H97V45.1zm-6.4 0c0 7.1-5.8 12.9-12.9 12.9s-12.9-5.8-12.9-12.9V12.9C64.8 5.8 70.6 0 77.7 0s12.9 5.8 12.9 12.9v32.2z" fill="#2eb67d" />
            <path d="M77.7 97c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9-12.9-5.8-12.9-12.9V97h12.9zm0-6.4c-7.1 0-12.9-5.8-12.9-12.9s5.8-12.9 12.9-12.9h32.3c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9H77.7z" fill="#ecb22e" />
          </svg>
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">Sign in to Slack</h1>
          <p className="text-slate-600">
            We suggest using the <span className="font-semibold">email address you use at work.</span>
          </p>
        </div>

        <div className="flex flex-col gap-3 pt-4">
          <Button onClick={handleSignInWithGoogle} variant="outline" className="h-11 text-base font-semibold border-slate-300 hover:bg-slate-50 transition-colors">
            <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Sign in with Google
          </Button>
          <Button variant="outline" className="h-11 text-base font-semibold border-slate-300 hover:bg-slate-50 transition-colors">
            <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.96.95-2.04 1.44-3.23 1.47-1.15.03-2.18-.51-3.32-.51-1.17 0-2.3.51-3.34.54-1.12.03-2.31-.5-3.29-1.47C1.94 18.27.42 14.71.42 11.23c0-3.48 2.14-5.32 4.19-5.32 1.06 0 1.95.42 2.76.42 1.12 0 1.74-.42 3-.42 1.95 0 3.73 1.54 4.54 3.08-3.9 1.72-3.29 7.01.16 8.35-.11.45-.4.89-1 1.47l-.02-.53zM12.03 5.25c.03-2.43 2-4.41 4.38-4.41.03 2.4-1.92 4.49-4.38 4.41z" />
            </svg>
            Sign in with Apple
          </Button>
        </div>

        <div className="flex items-center gap-4 py-2">
          <div className="h-px w-full bg-slate-200" />
          <span className="text-sm font-medium text-slate-500 uppercase">OR</span>
          <div className="h-px w-full bg-slate-200" />
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 text-left">



            <FormField
              control={form.control}
              name="email"
              render={({ field, formState: { errors } }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="name@work-email.com"
                      className="h-12 text-lg border-slate-300 focus-visible:ring-purple-500 transition-all"
                      {...field}
                    />
                  </FormControl>

                  {errors.email && (
                    <div className="flex items-center gap-1.5 text-[13px] leading-relaxed text-red-600 dark:text-red-500">
                      <Info size={16} />
                      <span className="flex-1">{errors.email.message}</span>
                    </div>
                  )}
                  {/* <FormMessage /> */}
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field, formState: { errors } }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="password"
                      className="h-12 text-lg border-slate-300 focus-visible:ring-purple-500 transition-all"
                      {...field}
                    />
                  </FormControl>
                  {error && (
                    <div className="flex items-center gap-1.5 text-[13px] leading-relaxed text-red-600 dark:text-red-500">
                      <Info size={16} />
                      <span className="flex-1">{error}</span>
                    </div>
                  )}
                  {errors.password && (
                    <div className="flex items-center gap-1.5 text-[13px] leading-relaxed text-red-600 dark:text-red-500">
                      <Info size={16} />
                      <span className="flex-1">{errors.password.message}</span>
                    </div>
                  )}
                  {/* <FormMessage /> */}
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full h-12 text-lg font-bold bg-[#611f69] hover:bg-[#4a154b] text-white transition-all active:scale-[0.98]"
            >
              Continue
            </Button>
          </form>
        </Form>

        <p className="text-slate-500 text-sm">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-sky-600 font-semibold hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  )
}