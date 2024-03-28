import createJiti from 'jiti'
import { fileURLToPath } from 'node:url'

createJiti(fileURLToPath(import.meta.url))('./src/env.ts')

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    ppr: true,
  },
}

export default nextConfig
