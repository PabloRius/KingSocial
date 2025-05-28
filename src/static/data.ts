export const plans = {
  free: {
    name: "Free Seller",
    price: "$0",
    period: "forever",
    description: "Sell on campus at no cost",
    features: [
      "List up to 5 items per month",
      "3 photos per listing",
      "Listings active for 30 days",
      "Community support",
      "Basic seller profile",
      "Standard search visibility",
    ],
    limitations: [
      "Limited monthly listings",
      "No featured listings",
      "No advanced analytics",
    ],
    buttonText: "Start Selling Free",
    popular: false,
    color: "gray",
  },
  pro: {
    name: "Pro Seller",
    price: "$9.99",
    period: "per month",
    description: "For serious student entrepreneurs",
    features: [
      "Unlimited listings",
      "Premium photos (10 per listing)",
      "Extended listing duration (60 days)",
      "Priority customer support",
      "Enhanced seller profile with verification badge",
      "Featured listings boost",
      "Advanced analytics dashboard",
      "Early access to new features",
      "Bulk listing tools",
      "Custom seller storefront",
    ],
    limitations: [],
    buttonText: "Go Pro",
    popular: true,
    color: "celestial-blue",
  },
};

export const testimonials = [
  {
    name: "Liam Patel",
    role: "Engineering Student",
    avatar: "/placeholder.svg?height=40&width=40",
    content:
      "Started selling my old textbooks for free, and made over $200 in my first month! Super easy to use.",
    rating: 5,
  },
  {
    name: "Sophie Adams",
    role: "Psychology Student",
    avatar: "/placeholder.svg?height=40&width=40",
    content:
      "I love that KingSocial is free—no fees, no stress. It’s the easiest way to sell on campus.",
    rating: 5,
  },
  {
    name: "Daniel Kim",
    role: "Computer Science Student",
    avatar: "/placeholder.svg?height=40&width=40",
    content:
      "Selling for free on KingSocial is awesome! Made some cash and cleared out my dorm room at the same time.",
    rating: 5,
  },
];
