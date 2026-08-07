import { config } from "dotenv"

// override: true is required because Vitest (via Vite) auto-loads ".env" into
// process.env before this setup file runs, which would otherwise take
// precedence over ".env.test" and point tests at the dev database.
config({ path: ".env.test", override: true })
