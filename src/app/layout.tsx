import { Theme } from '@radix-ui/themes'
import { GeistSans } from 'geist/font/sans'
import { Github } from 'lucide-react'
import type { Metadata } from 'next'
import { Toaster } from 'sonner'
import './globals.css'
import '@radix-ui/themes/styles.css'

export const metadata: Metadata = {
  title: 'Trellix tRPC',
  description:
    'A trellix clone using tRPC and Next.js with experimental RSC and action primitives',
}

declare module 'react' {
  // eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
  interface CSSProperties {
    // Allow CSS custom properties - why is this not in the default types?
    [key: `--${string}`]: string | number
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <Theme asChild radius="full">
        <body
          className={[
            GeistSans.variable,
            'h-[100dvh] bg-slate-100 text-slate-900',
          ].join(' ')}
        >
          <div className="flex h-full min-h-0 flex-col">
            <Nav />
            {children}
          </div>
        </body>
      </Theme>
      <Toaster />
    </html>
  )
}

function Nav() {
  return (
    <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 py-4 px-8">
      <div className="block leading-3">
        <div className="text-2xl font-black text-white">Trellix-tRPC</div>
        <div className="text-slate-500">
          with experimental RSC and action primitives
        </div>
      </div>
      <div className="flex items-center gap-6">
        <a
          href="https://github.com/juliusmarminge/trellix-trpc"
          className="flex flex-col items-center justify-center text-center text-xs font-bold uppercase text-slate-500"
        >
          <Github className="size-8 stroke-slate-200" />
          <span className="mt-2 block">Source</span>
        </a>
        <a
          href="https://trpc.io"
          className="flex flex-col items-center justify-center text-center text-xs font-bold uppercase text-slate-500"
        >
          <svg
            className="size-8 rounded fill-slate-200"
            viewBox="0 0 512 512"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="512" height="512" rx="150" fill="#398CCB" />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M255.446 75L326.523 116.008V138.556L412.554 188.238V273.224L435.631 286.546V368.608L364.6 409.615L333.065 391.378L256.392 435.646L180.178 391.634L149.085 409.615L78.0538 368.538V286.546L100.231 273.743V188.238L184.415 139.638L184.462 139.636V116.008L255.446 75ZM326.523 159.879V198.023L255.492 239.031L184.462 198.023V160.936L184.415 160.938L118.692 198.9V263.084L149.085 245.538L220.115 286.546V368.538L198.626 380.965L256.392 414.323L314.618 380.712L293.569 368.538V286.546L364.6 245.538L394.092 262.565V198.9L326.523 159.879ZM312.031 357.969V307.915L355.369 332.931V382.985L312.031 357.969ZM417.169 307.846L373.831 332.862V382.985L417.169 357.9V307.846ZM96.5154 357.9V307.846L139.854 332.862V382.915L96.5154 357.9ZM201.654 307.846L158.315 332.862V382.915L201.654 357.9V307.846ZM321.262 291.923L364.6 266.908L407.938 291.923L364.6 316.962L321.262 291.923ZM149.085 266.838L105.746 291.923L149.085 316.892L192.423 291.923L149.085 266.838ZM202.923 187.362V137.308L246.215 162.346V212.377L202.923 187.362ZM308.015 137.308L264.723 162.346V212.354L308.015 187.362V137.308ZM212.154 121.338L255.446 96.3231L298.785 121.338L255.446 146.354L212.154 121.338Z"
            />
          </svg>
          <span className="mt-2 block">Docs</span>
        </a>
      </div>
    </div>
  )
}
