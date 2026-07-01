import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "vital";

const variantClass: Record<Variant, string> = {
  primary: "btn-signal",
  secondary: "btn-ghost",
  vital: "btn-vital",
};

export function MarketingButton({
  href,
  children,
  variant = "primary",
  showArrow = true,
  className,
  ...props
}: {
  href: string;
  children: ReactNode;
  variant?: Variant;
  showArrow?: boolean;
  className?: string;
} & Omit<ComponentProps<typeof Link>, "href">) {
  return (
    <Link href={href} className={cn(variantClass[variant], "group", className)} {...props}>
      {children}
      {showArrow ? <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /> : null}
    </Link>
  );
}
