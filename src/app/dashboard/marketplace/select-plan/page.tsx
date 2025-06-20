"use client";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSession } from "@/context/session-context";
import { plans, testimonials } from "@/static/data";
import { AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import {
  Badge,
  Check,
  Shield,
  ShoppingBag,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";
import { toast } from "sonner";
// import Link from "next/link";

export default function SelectPlanPage() {
  const {
    handlers: { reload },
  } = useSession();
  const activateMarketplacePlan = async (plan: string) => {
    try {
      const response = await fetch("/api/seller", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plan }),
      });

      if (response.ok) {
        toast("Seller profile created successfully!");
        reload();
      } else {
        const data = await response.json();
        toast.error(`Error: ${data.message || "Failed to activate plan"}`);
      }
    } catch (error) {
      console.error(error);
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <main className="flex-1 container py-8 px-2 mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-celestial-blue-100 dark:bg-celestial-blue-900/30 text-celestial-blue-700 dark:text-celestial-blue-300 px-4 py-2 rounded-full text-sm font-medium mb-4">
          <ShoppingBag className="h-4 w-4" />
          Become a Seller
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Start Your{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-celestial-blue-500 to-picton-blue-500">
            Student Business
          </span>
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Join thousands of students making money by selling textbooks,
          electronics, and more on KingSocial Marketplace
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="text-center">
          <div className="text-3xl font-bold text-celestial-blue-500 mb-2">
            10,000+
          </div>
          <div className="text-gray-600 dark:text-gray-400">
            Active Student Sellers
          </div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-celestial-blue-500 mb-2">
            $2.5M+
          </div>
          <div className="text-gray-600 dark:text-gray-400">
            Total Sales This Year
          </div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-celestial-blue-500 mb-2">
            4.9★
          </div>
          <div className="text-gray-600 dark:text-gray-400">
            Average Seller Rating
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div
        className={`flex flex-col md:flex-row flex-wrap justify-center gap-8 max-w-5xl mx-auto mb-12`}
      >
        {/* {Object.entries(plans).map(([id, tier]) => { */}
        {Object.entries({ free: plans.free }).map(([id, tier]) => {
          return (
            <Card
              key={tier.name}
              className={`relative overflow-hidden rounded-2xl border-2 transition-all hover:shadow-lg ${
                tier.popular
                  ? "border-celestial-blue-500 shadow-celestial-blue-100 dark:shadow-celestial-blue-900/20"
                  : "border-gray-200 dark:border-gray-800"
              }`}
            >
              {tier.popular && (
                <div className="absolute top-0 left-0 right-0">
                  <div className="bg-gradient-to-r from-celestial-blue-500 to-picton-blue-500 text-white text-center py-2 text-sm font-medium">
                    🔥 Most Popular Choice
                  </div>
                </div>
              )}

              <CardHeader className={tier.popular ? "pt-12" : "pt-6"}>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl">{tier.name}</CardTitle>
                  {tier.popular && (
                    <Badge className="bg-gradient-to-r from-celestial-blue-500 to-picton-blue-500 text-white border-none">
                      Popular
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-base">
                  {tier.description}
                </CardDescription>
                <div className="flex items-baseline gap-1 mt-4">
                  <span className="text-4xl font-bold">{tier.price}</span>
                  <span className="text-gray-500 dark:text-gray-400">
                    /{tier.period}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    {"What's included:"}
                  </h4>
                  <ul className="space-y-2 grid md:grid-cols-2 gap-x-2">
                    {tier.features.map((feature, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-sm"
                      >
                        <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {tier.limitations.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3 text-gray-600 dark:text-gray-400">
                      Limitations:
                    </h4>
                    <ul className="space-y-2">
                      {tier.limitations.map((limitation, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-2 text-sm text-gray-500 dark:text-gray-400"
                        >
                          <span className="w-4 h-4 mt-0.5 flex-shrink-0">
                            •
                          </span>
                          <span>{limitation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>

              <CardFooter>
                <Button
                  className={`w-full h-12 rounded-xl font-medium transition-all ${
                    tier.popular
                      ? "bg-gradient-to-r from-celestial-blue-500 to-picton-blue-500 hover:from-celestial-blue-600 hover:to-picton-blue-600 text-white shadow-md hover:shadow-lg"
                      : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100"
                  }`}
                  onClick={() => {
                    activateMarketplacePlan(id);
                  }}
                >
                  {tier.buttonText}
                  {/* <Link href={`select-plan/${id}`}>{tier.buttonText}</Link> */}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Benefits Section */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 mb-12 border border-gray-200 dark:border-gray-800">
        <h2 className="text-2xl font-bold text-center mb-8">
          Why Students Love Selling on KingSocial
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-celestial-blue-500/10 to-picton-blue-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="h-6 w-6 text-celestial-blue-500" />
            </div>
            <h3 className="font-semibold mb-2">Free to Sell</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              List your items for free—no hidden fees or commissions.
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-celestial-blue-500/10 to-picton-blue-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Shield className="h-6 w-6 text-celestial-blue-500" />
            </div>
            <h3 className="font-semibold mb-2">Safe & Secure</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Sell within your student community with verified profiles and
              campus meetups.
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-celestial-blue-500/10 to-picton-blue-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Users className="h-6 w-6 text-celestial-blue-500" />
            </div>
            <h3 className="font-semibold mb-2">Campus Connections</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Build a reputation, meet new friends, and make extra cash—all on
              campus.
            </p>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-center mb-8">
          What Student Sellers Say
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="border border-gray-200 dark:border-gray-800"
            >
              <CardContent className="px-6">
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  &quot;{testimonial.content}&quot;
                </p>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={testimonial.avatar || "/placeholder.svg"}
                      alt={testimonial.name}
                    />
                    <AvatarFallback>
                      {testimonial.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{testimonial.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-800">
        <h2 className="text-2xl font-bold text-center mb-8">
          Frequently Asked Questions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-2">Is it really free?</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Absolutely! You can list up to 5 items per month, completely free.
              No fees or hidden charges.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">How do I get paid?</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Payments are arranged directly with the buyer. We recommend secure
              campus meetups or your preferred method.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">What can I sell?</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Textbooks, gadgets, furniture, clothes, and more—basically,
              anything your fellow students might want.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">
              Do I need any special account?
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Nope! Just sign up as a student and start listing your items. It’s
              that simple.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
