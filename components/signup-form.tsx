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
import { api } from "@/convex/_generated/api"
import { authClient } from "@/lib/auth-client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "convex/react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import Link from "next/link"
import { useEffect, useState } from "react"

const formSchema = z.object({
  fullName: z.string().min(2, { message: "Full name must be at least 2 characters long" }).max(50, { message: "Full name must be at most 50 characters long" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters long" }),
  confirmPassword: z.string().min(8, { message: "Confirm password must be at least 8 characters long" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

export function SignupForm({ className, ...props }: React.ComponentProps<"div">) {

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
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
          console.log("Social user synced to database")
        } catch (error) {
          console.error("Error syncing social user:", error)
        } finally {
          setIsSyncing(false)
        }
      }
    }

    syncUser()
  }, [session.data?.user?.id, mutation]) // Depend on user.id to trigger once when logged in

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const { data, error } = await authClient.signUp.email({
        name: values.fullName,
        email: values.email,
        password: values.password
      })

      // Check for errors first
      if (error) {
        console.error("Sign up error:", error)
        return
      }

      // Ensure data and user.id exist before proceeding
      if (data?.user?.id) {
        console.log(data)
        await mutation({
          sessionId: data.user.id,
          name: values.fullName,
          email: values.email
        })
      } else {
        console.error("No user ID returned from sign up")
      }
    } catch (error) {
      console.error("Unexpected error:", error)
    }
  }

  async function handleSignUpWithGoogle() {
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/signup", // Redirect back here to trigger the useEffect sync
      })
    } catch (error) {
      console.error("Unexpected error during Google sign in:", error)
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
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">Create your account</h1>
          <p className="text-slate-600">
            Join your team on Slack and start collaborating.
          </p>
        </div>

        <div className="flex flex-col gap-3 pt-4">
          <Button onClick={handleSignUpWithGoogle} variant="outline" className="h-11 text-base font-semibold border-slate-300 hover:bg-slate-50 transition-colors">
            <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Sign up with Google
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
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="Full Name"
                      className="h-12 text-lg border-slate-300 focus-visible:ring-purple-500 transition-all"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="name@work-email.com"
                      className="h-12 text-lg border-slate-300 focus-visible:ring-purple-500 transition-all"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Password"
                      className="h-12 text-lg border-slate-300 focus-visible:ring-purple-500 transition-all"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Confirm Password"
                      className="h-12 text-lg border-slate-300 focus-visible:ring-purple-500 transition-all"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full h-12 text-lg font-bold bg-[#611f69] hover:bg-[#4a154b] text-white transition-all active:scale-[0.98]"
            >
              Create Account
            </Button>
          </form>
        </Form>

        <p className="text-slate-500 text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-sky-600 font-semibold hover:underline">
            Sign in instead
          </Link>
        </p>
      </div>
    </div>
  )
}
