/**
 * Button.spec.tsx — Unit tests for the Button component.
 *
 * Tests cover rendering, variant classes, loading state,
 * disabled state, and click interaction.
 */
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Button } from "./Button";

describe("Button", () => {
    // ── Rendering ────────────────────────────────────────────────────────────

    describe("Rendering", () => {
        it("should render without crashing", () => {
            render(<Button>Click me</Button>);
            expect(screen.getByRole("button")).toBeInTheDocument();
        });

        it("should display its children as label", () => {
            render(<Button>Add Pet</Button>);
            expect(screen.getByText("Add Pet")).toBeInTheDocument();
        });
    });

    // ── Props ─────────────────────────────────────────────────────────────────

    describe("Props", () => {
        it("should apply an extra className", () => {
            render(<Button className="extra-class">Test</Button>);
            expect(screen.getByRole("button")).toHaveClass("extra-class");
        });
    });

    // ── Loading State ─────────────────────────────────────────────────────────

    describe("Loading State", () => {
        it("should be disabled when loading is true", () => {
            render(<Button loading>Save</Button>);
            expect(screen.getByRole("button")).toBeDisabled();
        });

        it("should render a spinner when loading is true", () => {
            render(<Button loading>Save</Button>);
            // Spinner is identified by the animate-spin class
            expect(document.querySelector(".animate-spin")).toBeInTheDocument();
        });
    });

    // ── Disabled State ────────────────────────────────────────────────────────

    describe("Disabled State", () => {
        it("should be disabled when disabled prop is set", () => {
            render(<Button disabled>Delete</Button>);
            expect(screen.getByRole("button")).toBeDisabled();
        });
    });

    // ── User Interactions ──────────────────────────────────────────────────────

    describe("User Interactions", () => {
        it("should call onClick when clicked", () => {
            const handleClick = vi.fn();
            render(<Button onClick={handleClick}>Submit</Button>);

            fireEvent.click(screen.getByRole("button"));

            expect(handleClick).toHaveBeenCalledTimes(1);
        });

        it("should not call onClick when disabled", () => {
            const handleClick = vi.fn();
            render(
                <Button disabled onClick={handleClick}>
                    Submit
                </Button>
            );

            fireEvent.click(screen.getByRole("button"));

            expect(handleClick).not.toHaveBeenCalled();
        });
    });
});
