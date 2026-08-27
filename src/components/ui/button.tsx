import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-black text-white hover:bg-ash-800 focus-visible:outline-gold",
        secondary:
          "bg-ash-800 text-white hover:bg-black focus-visible:outline-gold",
        outline:
          "border border-ash-800 bg-transparent text-black hover:border-gold hover:bg-gold-soft/40",
        ghost: "text-black hover:bg-ash-100",
        gold: "bg-gold text-black hover:bg-gold-bright focus-visible:outline-gold-deep",
        danger: "bg-danger text-white hover:bg-danger/90",
        link: "h-auto rounded-none px-0 text-gold-deep underline-offset-4 hover:text-gold hover:underline",
      },
      size: {
        sm: "h-9 px-3 text-sm",
        md: "h-11 px-4 text-sm",
        lg: "h-12 px-5 text-[15px]",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export type ButtonProps = ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}
