import { AuthState } from './components/AuthState'

export default async function Home() {
  return (
    <main className="flex h-[calc(100dvh-88px)] flex-col items-center justify-center gap-4 p-16">
      <AuthState />
    </main>
  )
}
