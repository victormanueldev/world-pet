/**
 * Button — primary interactive element.
 *
 * Supports multiple visual variants and sizes, with subtle
 * Framer Motion spring animations on hover and tap.
 */
import { motion, type HTMLMotionProps } from "framer-motion";
import { clsx } from "clsx";
import { type ReactNode } from "react";

// ----- Types ---------------------------------------------------------------

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

/**
 * Extend HTMLMotionProps so all Framer Motion and HTML button
 * props are accepted without type conflicts.
 */
interface ButtonProps extends HTMLMotionProps<"button"> {
    /** Visual style of the button */
    variant?: ButtonVariant;
    /** Size of the button */
    size?: ButtonSize;
    /** Whether the button is in a loading state */
    loading?: boolean;
    /** Optional leading icon */
    leftIcon?: ReactNode;
    /** Optional trailing icon */
    rightIcon?: ReactNode;
    children: ReactNode;
}

// ----- Style Maps ----------------------------------------------------------

const variantStyles: Record<ButtonVariant, string> = {
    primary:
        "bg-brand hover:bg-brand-hover text-white shadow-glow hover:shadow-glow-lg",
    secondary:
        "glass border border-white/10 text-white/90 hover:bg-white/10 hover:border-white/20",
    ghost: "text-text-secondary hover:text-white hover:bg-white/5",
    danger: "bg-status-error hover:bg-red-500 text-white",
};

const sizeStyles: Record<ButtonSize, string> = {
    sm: "h-8 px-3 text-xs gap-1.5",
    md: "h-10 px-4 text-sm gap-2",
    lg: "h-12 px-6 text-base gap-2.5",
};

// ----- Component -----------------------------------------------------------

/**
 * Button component
 *
 * @example
 * <Button variant="primary" size="md" leftIcon={<Plus size={16} />}>
 *   Add Pet
 * </Button>
 */
export function Button({
    variant = "primary",
    size = "md",
    loading = false,
    leftIcon,
    rightIcon,
    disabled,
    className,
    children,
    ...props
}: ButtonProps) {
    const isDisabled = disabled || loading;

    return (
        <motion.button
            whileHover={isDisabled ? {} : { scale: 1.02 }}
            whileTap={isDisabled ? {} : { scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            disabled={isDisabled}
            className={clsx(
                // Base
                "inline-flex items-center justify-center rounded font-medium",
                "transition-colors duration-150 cursor-pointer",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                // Variant + Size
                variantStyles[variant],
                sizeStyles[size],
                className
            )}
            {...props}
        >
            {/* Leading icon / spinner */}
            {loading ? (
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
                leftIcon
            )}

            {children}

            {/* Trailing icon */}
            {!loading && rightIcon}
        </motion.button>
    );
}
