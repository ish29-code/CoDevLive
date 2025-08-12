const Home = () => {
  return (
    <section className="flex flex-col items-center justify-center min-h-[80vh] bg-yellow-50 dark:bg-gray-900 dark:text-white text-center px-4">
      <h1 className="text-4xl md:text-6xl font-bold mb-4">
        Welcome to <span className="text-yellow-500 dark:text-pink-400">CodevLive</span>
      </h1>
      <p className="max-w-2xl text-lg mb-6">
        A platform for real-time coding, AI assistance, and interview preparation — all in one place.
      </p>
      <div className="flex gap-4">
        <button className="bg-yellow-500 text-white px-6 py-3 rounded-lg text-lg dark:bg-pink-500">
          Get Started
        </button>
        <button className="border border-yellow-500 text-yellow-500 px-6 py-3 rounded-lg text-lg dark:border-pink-500 dark:text-pink-400">
          Learn More
        </button>
      </div>
    </section>
  );
};

export default Home;
