"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowRight, ShoppingBag, UserSearch } from "lucide-react";
import Link from "next/link";

export const DashboardCards = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {/* Marketplace */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
            <ShoppingBag className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>Marketplace</CardTitle>
          <CardDescription>Buy and sell items with other users</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm">
            Browse listings, create your own, and connect with people buying and
            selling in Kingston Univeristy.
          </p>
        </CardContent>
        <CardFooter>
          <Button variant="ghost" className="w-full justify-between" asChild>
            <Link href="/dashboard/marketplace">
              Go to Marketplace
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardFooter>
      </Card>

      {/* Events */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
            <UserSearch className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>Event Finder</CardTitle>
          <CardDescription>Connect with friends and colleagues</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm">
            Search events by name, location, or interests. Expand your network
            and make new friends.
          </p>
        </CardContent>
        <CardFooter>
          <Button variant="ghost" className="w-full justify-between" asChild>
            <Link href="/events">
              Find Events
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
