import { fileURLToPath } from 'node:url'
import createJiti from 'jiti'

createJiti(fileURLToPath(import.meta.url))('./src/env.ts')

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    ppr: true,
  },
}

export default nextConfig
