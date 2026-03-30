export function RobotScene() {
  return (
    <div className="w-full h-[400px] md:h-[500px] lg:h-[550px] flex items-center justify-center">
      <img
        src="/images/hero-robot.png"
        alt="AI Robot"
        className="h-full w-auto max-w-full object-contain drop-shadow-[0_0_40px_rgba(124,58,237,0.3)]"
        style={{
          maskImage: 'linear-gradient(to bottom, black 75%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 75%, transparent 100%)',
        }}
      />
    </div>
  )
}
