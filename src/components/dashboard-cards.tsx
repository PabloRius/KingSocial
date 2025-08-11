"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils"; // if you’re using clsx or similar utility
import { ArrowRight, ShoppingBag, UserSearch } from "lucide-react";
import Link from "next/link";

export const DashboardCards = () => {
  const services = [
    {
      title: "Marketplace",
      icon: <ShoppingBag className="h-6 w-6 text-white" />,
      description: "Buy and sell items with other students.",
      details:
        "Browse listings, post your own, and connect with people buying and selling at Kingston.",
      href: "/dashboard/marketplace",
      buttonText: "Go to Marketplace",
      gradient: "from-[#6366f1] to-[#8b5cf6]",
    },
    {
      title: "Event Finder",
      icon: <UserSearch className="h-6 w-6 text-white" />,
      description: "Discover and join campus events.",
      details:
        "Search events by name, location, or interest. Join in and meet your people.",
      href: "/events",
      buttonText: "Find Events",
      gradient: "from-[#34d399] to-[#10b981]",
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {services.map((service, idx) => (
        <Card
          key={idx}
          className={cn(
            "relative overflow-hidden hover:shadow-xl transition-all duration-300 border-none bg-background",
            "hover:scale-[1.02]"
          )}
        >
          <div
            className={cn(
              "absolute inset-0 z-0 opacity-30 blur-2xl",
              `bg-gradient-to-br ${service.gradient}`
            )}
          />
          <div className="relative z-10 p-6 flex flex-col h-full justify-between">
            <div>
              <div
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center mb-4 shadow-md",
                  `bg-gradient-to-br ${service.gradient}`
                )}
              >
                {service.icon}
              </div>
              <h3 className="text-xl font-semibold mb-1">{service.title}</h3>
              <p className="text-sm text-muted-foreground mb-3">
                {service.description}
              </p>
              <p className="text-sm text-muted-foreground">{service.details}</p>
            </div>

            <div className="mt-6">
              <Button
                variant="ghost"
                className="w-full justify-between"
                asChild
              >
                <Link href={service.href}>
                  {service.buttonText}
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
