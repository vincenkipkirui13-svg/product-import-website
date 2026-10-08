import {defineConfig} from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
export default defineConfig([...nextVitals,{ignores:[".next/**","node_modules/**"],rules:{"react-hooks/error-boundaries":"warn","react-hooks/set-state-in-effect":"warn"}}]);