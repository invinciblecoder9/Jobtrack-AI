"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";

const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormData = z.infer<typeof schema>;

export default function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });
  const router = useRouter();

  const onSubmit = async (data: FormData) => {
    try {
      const res = await api.post("/users/login", data);
      localStorage.setItem("token", res.data.access_token);
      toast.success("Welcome back!");
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center px-6">
      {/* Left Side — App Branding (visible on desktop) */}
      <div className="hidden lg:flex lg:w-1/2 h-screen items-center justify-center bg-gradient-to-br from-purple-900 via-pink-900 to-blue-900">
        <div className="text-center">
          <div className="flex items-center gap-4 justify-center mb-8">
            <Sparkles className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl">
              <Sparkles className="w-10 h-10 text-white" />
            </Sparkles>
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            JobTrack AI
          </h1>
          <p className="text-xl text-gray-300">Your AI-powered job hunting co-pilot</p>
        </div>
      </div>

      {/* Right Side — Login Form */}
      <div className="w-full lg:w-1/2 max-w-md px-8">
        <div className="mb-12">
          {/* Mobile Logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <Sparkles className="w-10 h-10 text-purple-400" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              JobTrack AI
            </h1>
          </div>

          <h2 className="text-3xl font-bold mb-2">Welcome back</h2>
          <p className="text-gray-400">Sign in to continue your job hunt</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Label htmlFor="email" className="text-gray-300">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              {...register("email")}
              className="mt-2 bg-gray-900 border-gray-800 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-purple-500"
            />
            {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <Label htmlFor="password" className="text-gray-300">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              {...register("password")}
              className="mt-2 bg-gray-900 border-gray-800 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-purple-500"
            />
            {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password.message}</p>}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gray-800 hover:bg-gray-700 text-white font-medium py-6 rounded-xl transition-all"
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-400">
            Don't have an account?{" "}
            <Link href="/signup" className="text-purple-400 hover:text-purple-300 font-medium">
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}