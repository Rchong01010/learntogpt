import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | Learn to GPT",
  description:
    "Sign in or create an account to start learning ChatGPT with interactive lessons, hands-on exercises, and gamified progression.",
  robots: { index: false, follow: true },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Learn to GPT
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Master ChatGPT — from beginner to builder
        </p>
      </div>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
