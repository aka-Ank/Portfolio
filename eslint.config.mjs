import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // react-hooks/refs and react-hooks/immutability (from the React
    // Compiler's eslint plugin, bundled via eslint-config-next) flag
    // mutating refs during render and mutating values returned from hooks
    // (e.g. useThree()'s `scene`/`camera`). That's exactly the imperative
    // mutation pattern R3F is built on — useFrame mutating ref.current /
    // scene.fog / camera.position every frame is the documented,
    // recommended-by-pmndrs way to avoid React reconciler overhead in a 3D
    // scene (see docs/00-research-and-stack.md §2). React Compiler isn't
    // even enabled in next.config.ts; scoping this off for the R3F engine
    // layer is a deliberate exception, not a lint bypass.
    files: ["src/world/**/*.{ts,tsx}"],
    rules: {
      "react-hooks/refs": "off",
      "react-hooks/immutability": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
