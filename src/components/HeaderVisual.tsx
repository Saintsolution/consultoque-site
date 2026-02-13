export function HeaderVisual() {
  return (
    <header className="w-full overflow-hidden">

      {/* MOBILE */}
      <div className="block md:hidden w-full">
        <img
          src="/banner_cel.png"
          alt="Header Mobile"
          className="w-full h-auto"
        />
      </div>

      {/* DESKTOP */}
      <div className="hidden md:block w-full">
        <img
          src="/banner_desk.png"
          alt="Header Desktop"
          className="w-full h-auto"
        />
      </div>

    </header>
  );
}
