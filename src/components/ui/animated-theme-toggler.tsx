"use client";

import { useCallback, useRef, useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { flushSync } from "react-dom";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

interface AnimatedThemeTogglerProps extends React.ComponentPropsWithoutRef<"button"> {
  duration?: number;
}

export const AnimatedThemeToggler = ({
  className,
  duration = 400,
  ...props
}: AnimatedThemeTogglerProps) => {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Evita hidration mismatch
  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === "dark";

  const toggleTheme = useCallback(async () => {
    if (!buttonRef.current) return;
    const newTheme = isDark ? "light" : "dark";

    // @ts-ignore
    if (!document.startViewTransition) {
      setTheme(newTheme);
      return;
    }

    // @ts-ignore
    await document.startViewTransition(() => {
      flushSync(() => setTheme(newTheme));
    }).ready;

    const { top, left, width, height } = buttonRef.current.getBoundingClientRect();
    const x = left + width / 2;
    const y = top + height / 2;
    const maxRadius = Math.hypot(
      Math.max(left, window.innerWidth - left),
      Math.max(top, window.innerHeight - top),
    );

    document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${maxRadius}px at ${x}px ${y}px)`,
        ],
      },
      {
        duration,
        easing: "ease-in-out",
        pseudoElement: "::view-transition-new(root)",
      },
    );
  }, [isDark, setTheme, duration]);

  // Mientras hidrata, muestra un placeholder para evitar parpadeo
  if (!mounted) {
    return (
      <button
        className={cn(
          "flex items-center justify-center gap-4 px-5 py-3 rounded-full border bg-background",
          className,
        )}
        aria-label="Toggle theme"
      >
        <Sun className="size-5 text-muted-foreground opacity-50" />
        <Moon className="size-5 text-muted-foreground opacity-50" />
      </button>
    );
  }

  return (
    <button
      ref={buttonRef}
      onClick={toggleTheme}
      aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      className={cn(
        "flex items-center justify-center gap-4 px-5 py-3 rounded-full border bg-background transition-all hover:bg-muted/40 active:scale-95",
        className,
      )}
      {...props}
    >
      <Sun
        className={cn(
          "size-5 transition-all",
          !isDark
            ? "text-yellow-500 fill-yellow-500 scale-110"
            : "text-muted-foreground opacity-50 scale-100",
        )}
      />
      <Moon
        className={cn(
          "size-5 transition-all",
          isDark
            ? "text-yellow-100 fill-yellow-100 scale-110"
            : "text-muted-foreground opacity-50 scale-100",
        )}
      />
    </button>
  );
};
