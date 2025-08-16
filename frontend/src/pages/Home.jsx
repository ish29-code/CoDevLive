const Home = () => {
  return (
    <section className="w-full flex flex-col items-center justify-center min-h-[85vh] 
      text-[var(--foreground)] text-center px-4
      bg-gradient-to-br from-[var(--gradient-start)] via-[var(--background)] to-[var(--gradient-end)]">
      
      <h1 className="text-4xl md:text-6xl font-bold mb-4">
        Welcome to{" "}
        <span className="text-[var(--accent)]">CoDevLive</span>
      </h1>

      <p className="max-w-2xl text-lg mb-6">
        A platform for real-time coding, AI assistance, and interview preparation — all in one place.
      </p>

      <div className="flex gap-4 flex-wrap justify-center">
        <button className="btn-primary">Get Started</button>
        <button className="btn-outline">Learn More</button>
      </div>
    </section>
  );
};

export default Home;







