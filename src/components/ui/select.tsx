import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function NativeSelect({
  className,
  children,
  ...props
}: ComponentProps<"select">) {
  return (
    <select
      className={cn(
        "h-11 w-full rounded-md border border-border bg-white px-3.5 text-[15px] text-fg outline-none",
        "focus-visible:border-blue disabled:opacity-60",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export function CheckboxField({
  id,
  name,
  label,
  defaultChecked,
  checked,
  onCheckedChange,
}: {
  id: string;
  name: string;
  label: string;
  defaultChecked?: boolean;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-center gap-2.5 text-sm text-navy">
      <input
        id={id}
        name={name}
        type="checkbox"
        value="1"
        defaultChecked={checked === undefined ? defaultChecked : undefined}
        checked={checked}
        onChange={
          onCheckedChange
            ? (event) => onCheckedChange(event.target.checked)
            : undefined
        }
        className="size-4 rounded border-border text-blue accent-blue"
      />
      {label}
    </label>
  );
}
