import Dashboard from "./components/Dashboard";

function App() {
  return (
    <div className="min-h-screen bg-space-black font-sans text-slate-100 antialiased relative">
      {/* Sci-Fi backdrop glowing ambient effects */}
      <div className="absolute top-[15%] left-[20%] w-[450px] h-[450px] bg-tau-teal/5 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute bottom-[20%] right-[15%] w-[450px] h-[450px] bg-astrophage/5 rounded-full blur-[140px] pointer-events-none -z-10" />

      <main className="relative z-10">
        <Dashboard />
      </main>
    </div>
  );
}

export default App;
