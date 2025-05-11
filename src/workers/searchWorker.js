// import Fuse from "fuse.js";

// let fuse;

// self.onmessage = (e) => {
//   const { action, data, options, query } = e.data;

//   if (action === "initialize") {
//     // Initialize Fuse.js with data and options
//     fuse = new Fuse(data, options);
//   } else if (action === "search") {
//     // Perform the search and send back the results
//     const results = fuse.search(query).slice(0, 30); // Limit to top 30 results
//     // const results = fuse.search(query);
//     self.postMessage(results);
//   }
// };

import Fuse from "fuse.js";

let fuse;

// console.log("🔥 Worker script loaded!"); // Check if the worker script is executed

self.onmessage = (e) => {
  // console.log("📩 Message received in worker:", e.data); // Log every message received

  const { action, data, options, query } = e.data;

  if (action === "initialize") {
    // console.log("🚀 Initializing Fuse.js in worker...");
    fuse = new Fuse(data, options);
    self.postMessage("initialized");
  } else if (action === "search") {
    if (!fuse) {
      // console.log("❌ Worker not initialized yet!");
      self.postMessage([]);
      return;
    }

    // console.log(`🔎 Searching for: "${query}"`);
    const results = fuse.search(query);
    self.postMessage(results);
  }
};
