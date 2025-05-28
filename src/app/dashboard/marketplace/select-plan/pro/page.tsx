"use client";

// import type React from "react";

// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { plans } from "@/static/data";
// import { Check, CreditCard, Loader2, Shield, Star } from "lucide-react";
// import Link from "next/link";
// import { useState } from "react";

// export default function PaymentPage() {
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [consentChecked, setConsentChecked] = useState(false);
//   const [paymentData, setPaymentData] = useState({
//     cardNumber: "",
//     expiryDate: "",
//     cvv: "",
//     cardholderName: "",
//     billingEmail: "",
//   });

//   const selectedPlan = plans.pro;

//   const handleInputChange = (field: string, value: string) => {
//     setPaymentData((prev) => ({ ...prev, [field]: value }));
//   };

//   const formatCardNumber = (value: string) => {
//     // Remove all non-digits
//     const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
//     // Add spaces every 4 digits
//     const matches = v.match(/\d{4,16}/g);
//     const match = (matches && matches[0]) || "";
//     const parts = [];
//     for (let i = 0, len = match.length; i < len; i += 4) {
//       parts.push(match.substring(i, i + 4));
//     }
//     if (parts.length) {
//       return parts.join(" ");
//     } else {
//       return v;
//     }
//   };

//   const formatExpiryDate = (value: string) => {
//     const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
//     if (v.length >= 2) {
//       return v.substring(0, 2) + "/" + v.substring(2, 4);
//     }
//     return v;
//   };

//   const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const formatted = formatCardNumber(e.target.value);
//     handleInputChange("cardNumber", formatted);
//   };

//   const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const formatted = formatExpiryDate(e.target.value);
//     handleInputChange("expiryDate", formatted);
//   };

//   const isFormValid = () => {
//     if (!consentChecked) return false;

//     return (
//       paymentData.cardNumber.replace(/\s/g, "").length === 16 &&
//       paymentData.expiryDate.length === 5 &&
//       paymentData.cvv.length === 3 &&
//       paymentData.cardholderName.trim() &&
//       paymentData.billingEmail.trim()
//     );
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!isFormValid()) return;

//     setIsProcessing(true);

//     // Mock payment processing
//     await new Promise((resolve) => setTimeout(resolve, 3000));

//     // Mock success - redirect to sell page with activated profile
//     window.location.href = `/sell?activated=pro&welcome=true`;
//   };

//   return (
//     <div className="flex flex-col min-h-screen bg-gradient-to-br from-alice-blue-300 via-white to-celestial-blue-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
//       <main className="flex-1 container py-8 mx-auto">
//         <div className="max-w-4xl mx-auto">
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//             {/* Plan Summary */}
//             <div>
//               <h1 className="text-2xl font-bold mb-6">
//                 Complete Your Registration
//               </h1>

//               <Card className="mb-6">
//                 <CardHeader>
//                   <div className="flex items-center justify-between">
//                     <CardTitle className="text-xl">
//                       {selectedPlan.name}
//                     </CardTitle>
//                     <Badge className="bg-gradient-to-r from-celestial-blue-500 to-picton-blue-500 text-white border-none">
//                       Popular
//                     </Badge>
//                   </div>
//                   <CardDescription>{selectedPlan.description}</CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="flex items-baseline gap-1 mb-4">
//                     <span className="text-3xl font-bold">
//                       {selectedPlan.price}
//                     </span>
//                     <span className="text-gray-500 dark:text-gray-400">
//                       /{selectedPlan.period}
//                     </span>
//                   </div>

//                   <div className="space-y-2">
//                     <h4 className="font-semibold text-sm">
//                       {"What's included:"}
//                     </h4>
//                     <ul className="space-y-1">
//                       {selectedPlan.features
//                         .slice(0, 4)
//                         .map((feature, index) => (
//                           <li
//                             key={index}
//                             className="flex items-start gap-2 text-sm"
//                           >
//                             <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
//                             <span>{feature}</span>
//                           </li>
//                         ))}
//                       {selectedPlan.features.length > 4 && (
//                         <li className="text-sm text-gray-500 dark:text-gray-400">
//                           + {selectedPlan.features.length - 4} more features
//                         </li>
//                       )}
//                     </ul>
//                   </div>
//                 </CardContent>
//               </Card>

//               {/* Security & Trust */}
//               <Card>
//                 <CardContent className="p-4">
//                   <div className="flex items-center gap-3 mb-3">
//                     <Shield className="h-5 w-5 text-green-500" />
//                     <span className="font-medium text-sm">
//                       Secure & Trusted
//                     </span>
//                   </div>
//                   <div className="grid grid-cols-2 gap-4 text-xs text-gray-600 dark:text-gray-400">
//                     <div className="flex items-center gap-2">
//                       <div className="w-2 h-2 bg-green-500 rounded-full"></div>
//                       <span>256-bit SSL encryption</span>
//                     </div>
//                     <div className="flex items-center gap-2">
//                       <div className="w-2 h-2 bg-green-500 rounded-full"></div>
//                       <span>Student-verified platform</span>
//                     </div>
//                     <div className="flex items-center gap-2">
//                       <div className="w-2 h-2 bg-green-500 rounded-full"></div>
//                       <span>Cancel anytime</span>
//                     </div>
//                     <div className="flex items-center gap-2">
//                       <div className="w-2 h-2 bg-green-500 rounded-full"></div>
//                       <span>No hidden fees</span>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>
//             </div>

//             {/* Payment Form */}
//             <div>
//               <form onSubmit={handleSubmit} className="space-y-6">
//                 <Card>
//                   <CardHeader>
//                     <CardTitle className="flex items-center gap-2">
//                       <CreditCard className="h-5 w-5" />
//                       Payment Method
//                     </CardTitle>
//                     <CardDescription>
//                       Your payment information is secure and encrypted
//                     </CardDescription>
//                   </CardHeader>
//                   <CardContent className="space-y-4">
//                     <div>
//                       <Label htmlFor="billingEmail">Billing Email</Label>
//                       <Input
//                         id="billingEmail"
//                         type="email"
//                         placeholder="your.email@university.edu"
//                         value={paymentData.billingEmail}
//                         onChange={(e) =>
//                           handleInputChange("billingEmail", e.target.value)
//                         }
//                         className="mt-1"
//                       />
//                     </div>

//                     <div>
//                       <Label htmlFor="cardholderName">Cardholder Name</Label>
//                       <Input
//                         id="cardholderName"
//                         placeholder="John Doe"
//                         value={paymentData.cardholderName}
//                         onChange={(e) =>
//                           handleInputChange("cardholderName", e.target.value)
//                         }
//                         className="mt-1"
//                       />
//                     </div>

//                     <div>
//                       <Label htmlFor="cardNumber">Card Number</Label>
//                       <Input
//                         id="cardNumber"
//                         placeholder="1234 5678 9012 3456"
//                         value={paymentData.cardNumber}
//                         onChange={handleCardNumberChange}
//                         maxLength={19}
//                         className="mt-1"
//                       />
//                     </div>

//                     <div className="grid grid-cols-2 gap-4">
//                       <div>
//                         <Label htmlFor="expiryDate">Expiry Date</Label>
//                         <Input
//                           id="expiryDate"
//                           placeholder="MM/YY"
//                           value={paymentData.expiryDate}
//                           onChange={handleExpiryChange}
//                           maxLength={5}
//                           className="mt-1"
//                         />
//                       </div>
//                       <div>
//                         <Label htmlFor="cvv">CVV</Label>
//                         <Input
//                           id="cvv"
//                           placeholder="123"
//                           value={paymentData.cvv}
//                           onChange={(e) =>
//                             handleInputChange(
//                               "cvv",
//                               e.target.value.replace(/\D/g, "")
//                             )
//                           }
//                           maxLength={3}
//                           className="mt-1"
//                         />
//                       </div>
//                     </div>

//                     <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
//                       <div className="flex items-center justify-between text-sm">
//                         <span>Subtotal</span>
//                         <span>$9.99</span>
//                       </div>
//                       <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
//                         <span>Tax</span>
//                         <span>$0.00</span>
//                       </div>
//                       <div className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2">
//                         <div className="flex items-center justify-between font-semibold">
//                           <span>Total</span>
//                           <span>$9.99/month</span>
//                         </div>
//                       </div>
//                     </div>
//                   </CardContent>
//                 </Card>

//                 {/* Terms and Consent */}
//                 <Card>
//                   <CardHeader>
//                     <CardTitle>Terms & Conditions</CardTitle>
//                   </CardHeader>
//                   <CardContent className="space-y-4">
//                     <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-sm">
//                       <h4 className="font-semibold mb-2">
//                         By activating your seller account, you agree to:
//                       </h4>
//                       <ul className="space-y-1 text-gray-600 dark:text-gray-400 list-disc">
//                         <li>{"Follow KingSocial's community guidelines"}</li>
//                         <li>Provide accurate item descriptions and photos</li>
//                         <li>Respond to buyer inquiries within 24 hours</li>
//                         <li>Complete transactions in a timely manner</li>
//                         <li>Maintain a respectful and professional attitude</li>
//                         <>
//                           <li>Monthly billing will begin immediately</li>
//                           <li>You can cancel your subscription anytime</li>
//                         </>
//                       </ul>
//                     </div>

//                     <div className="flex items-start space-x-2">
//                       <Checkbox
//                         id="consent"
//                         checked={consentChecked}
//                         onCheckedChange={(checked) =>
//                           setConsentChecked(checked as boolean)
//                         }
//                       />
//                       <Label
//                         htmlFor="consent"
//                         className="text-sm leading-relaxed"
//                       >
//                         I agree to the{" "}
//                         <Link
//                           href="/terms"
//                           className="text-celestial-blue-500 hover:underline"
//                         >
//                           Terms of Service
//                         </Link>
//                         ,{" "}
//                         <Link
//                           href="/privacy"
//                           className="text-celestial-blue-500 hover:underline"
//                         >
//                           Privacy Policy
//                         </Link>
//                         , and{" "}
//                         <Link
//                           href="/seller-guidelines"
//                           className="text-celestial-blue-500 hover:underline"
//                         >
//                           Seller Guidelines
//                         </Link>
//                         . I understand that I can cancel my subscription at any
//                         time.
//                       </Label>
//                     </div>
//                   </CardContent>
//                 </Card>

//                 {/* Submit Button */}
//                 <Button
//                   type="submit"
//                   disabled={!isFormValid() || isProcessing}
//                   className="w-full h-12 bg-gradient-to-r from-celestial-blue-500 to-picton-blue-500 hover:from-celestial-blue-600 hover:to-picton-blue-600 text-white rounded-xl font-medium"
//                 >
//                   {isProcessing ? (
//                     <>
//                       <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                       {"Processing Payment..."}
//                     </>
//                   ) : (
//                     <>{`Start Pro Plan - $9.99/month`}</>
//                   )}
//                 </Button>

//                 <p className="text-xs text-center text-gray-500 dark:text-gray-400">
//                   You will be charged $9.99 monthly. Cancel anytime from your
//                   account settings.
//                 </p>
//               </form>
//             </div>
//           </div>

//           {/* Student Testimonial */}
//           <Card className="mt-8 bg-gradient-to-r from-celestial-blue-50 to-picton-blue-50 dark:from-celestial-blue-900/20 dark:to-picton-blue-900/20 border-celestial-blue-200 dark:border-celestial-blue-800">
//             <CardContent className="p-6">
//               <div className="flex items-center gap-4">
//                 <Avatar className="h-12 w-12">
//                   <AvatarImage
//                     src="/placeholder.svg?height=48&width=48"
//                     alt="Student"
//                   />
//                   <AvatarFallback>SC</AvatarFallback>
//                 </Avatar>
//                 <div className="flex-1">
//                   <div className="flex items-center gap-1 mb-1">
//                     {[...Array(5)].map((_, i) => (
//                       <Star
//                         key={i}
//                         className="h-4 w-4 fill-yellow-400 text-yellow-400"
//                       />
//                     ))}
//                   </div>
//                   <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
//                     &quot;Upgraded to Pro after my first week and made back the
//                     subscription cost in 2 days! The featured listings really
//                     work.&quot;
//                   </p>
//                   <p className="text-xs text-gray-500 dark:text-gray-400">
//                     Sarah Chen, Computer Science Student
//                   </p>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </div>
//       </main>
//     </div>
//   );
// }

export default function PaymentPage() {
  return (
    <div className="flex-1 flex justify-center items-center">
      <p className="text-center">{"This plan is not implemented yet :)"}</p>
    </div>
  );
}
