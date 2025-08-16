export function DegenGradient() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-purple-900" />

      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 20%, rgba(88, 28, 135, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(30, 41, 59, 0.2) 0%, transparent 50%),
            radial-gradient(circle at 40% 60%, rgba(71, 85, 105, 0.18) 0%, transparent 50%)
          `,
        }}
      />

      <div className="absolute top-20 left-1/4 w-64 h-64 bg-slate-700 rounded-full opacity-30" />
      <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-purple-800 rounded-full opacity-25" />
      <div className="absolute bottom-1/4 left-1/3 w-56 h-56 bg-indigo-800 rounded-full opacity-20" />
      <div className="absolute bottom-20 right-1/3 w-40 h-40 bg-slate-600 rounded-full opacity-15" />

      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(rgba(148, 163, 184, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(148, 163, 184, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      <div className="absolute inset-0">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-purple-600 rounded-full opacity-40"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${4 + Math.random() * 2}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 4}s`,
            }}
          />
        ))}
      </div>
    </div>
  )
}

export default DegenGradient
