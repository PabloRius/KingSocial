import Link from "next/link";

export const Footer = () => {
  return (
    <footer className="border-t">
      <div className="container py-6 mx-auto">
        <div className="flex flex-col md:flex-row justify-center items-center gap-4 text-sm text-muted-foreground">
          <Link href="/about" className="hover:underline">
            About Us
          </Link>
          <span className="hidden md:inline">•</span>
          <Link href="/terms" className="hover:underline">
            Terms of Service
          </Link>
          <span className="hidden md:inline">•</span>
          <Link href="/privacy" className="hover:underline">
            Privacy Policy
          </Link>
          <span className="hidden md:inline">•</span>
          <Link href="/contact" className="hover:underline">
            Contact
          </Link>
        </div>
        <div className="text-center mt-4 text-xs text-muted-foreground">
          © {new Date().getFullYear()} KingSocial. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
