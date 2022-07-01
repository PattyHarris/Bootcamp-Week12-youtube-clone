export default function Utils() {
  return (
    <div className="mt-10 ml-20">
      <h2 className="mb-10 text-xl">Utils</h2>

      <div className="flex-1 mb-5">
        <button
          className="border px-8 py-2 mt-5 mr-8 font-bold rounded-full color-accent-contrast bg-color-accent hover:bg-blue-100 focus:bg-color-accent-hover-darker focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-100 active:shadow-lg transition duration-150 ease-in-out"
          onClick={async () => {
            await fetch("/api/utils", {
              body: JSON.stringify({
                task: "generate_content",
              }),
              headers: {
                "Content-Type": "application/json",
              },
              method: "POST",
            });
          }}
        >
          Generate content
        </button>
      </div>
      <div className="flex-1 mb-5">
        <button
          className="border px-8 py-2 mt-5 mr-8 font-bold rounded-full color-accent-contrast bg-color-accent hover:bg-blue-100 focus:bg-color-accent-hover-darker focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-100 active:shadow-lg transition duration-150 ease-in-out"
          onClick={async () => {
            await fetch("/api/utils", {
              body: JSON.stringify({
                task: "clean_database",
              }),
              headers: {
                "Content-Type": "application/json",
              },
              method: "POST",
            });
          }}
        >
          Clean database
        </button>
      </div>
    </div>
  );
}
