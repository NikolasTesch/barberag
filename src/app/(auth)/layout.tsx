export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-primary flex flex-col items-center justify-center px-4">
      <div className="mb-8 text-center">
        <span className="font-display font-black text-[36px] text-accent tracking-tight">
          BARBERAG
        </span>
        <p className="text-white/50 text-sm mt-1">Authentic Barbershop</p>
      </div>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        {children}
      </div>
    </div>
  )
}
