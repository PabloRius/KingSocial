"use server";
import { auth } from "@/auth";
import { SignInWithGoogleButton } from "@/components/sign-in-with-google-button";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }
  return (
    <main className="flex flex-col flex-1 justify-center items-center">
      <div className="max-w-md w-full space-y-8 text-center relative z-10">
        <div className="space-y-2">
          <h1 className="flex justify-center text-5xl font-extrabold tracking-tight">
            <div className="relative flex items-center">
              <span className="py-2 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500 mr-2">
                King
              </span>
              Social
              <div className="absolute -bottom-0 left-0 w-full h-3 bg-gradient-to-r from-pink-500 to-violet-500 opacity-30 rounded-full blur-sm"></div>
            </div>
          </h1>
          <p className="text-lg">
            Live the Uni life you wanted to. Connect your way. ✨
          </p>
        </div>

        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-gray-100 dark:border-gray-700 transform transition-all hover:scale-105">
          <h2 className="text-xl font-bold mb-4">Jump in</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Connect with the Kingston Univeristy community and level up your
            social life.
          </p>
          <SignInWithGoogleButton />
        </div>
        <div className="pt-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            New here?{" "}
            <span className="text-pink-500 font-medium">Join 10M+ users</span>{" "}
            already vibing on KingSocial
          </p>
        </div>
      </div>
    </main>
  );
}
