export const DashboardFeatured = () => {
  return (
    <div className="mt-12 bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
      <h2 className="text-xl font-bold mb-4">Trending Now 🔥</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          "Music Festival",
          "Sneaker Drop",
          "Gaming Tournament",
          "Art Collab",
        ].map((trend, index) => (
          <div
            key={index}
            className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 hover:bg-pink-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
          >
            <p className="font-medium">#{trend.replace(" ", "")}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {1000 + index * 234} posts
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
