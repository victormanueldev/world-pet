import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config";

/**
 * Vitest configuration, merged with Vite config so aliases and plugins
 * are shared between the dev server and the test runner.
 */
export default mergeConfig(
    viteConfig,
    defineConfig({
        test: {
            // Use jsdom to simulate a browser environment
            environment: "jsdom",
            // Run this file before each test suite to set up jest-dom matchers
            setupFiles: ["./src/setupTests.ts"],
            globals: true,
            coverage: {
                reporter: ["text", "lcov"],
                exclude: [
                    "node_modules/",
                    "src/main.tsx",
                    "src/setupTests.ts",
                    "**/*.d.ts",
                ],
            },
        },
    })
);
