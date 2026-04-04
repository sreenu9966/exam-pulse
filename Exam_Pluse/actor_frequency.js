/**
 * Solution for the JSON Action Frequency Challenge
 * Calculates the count of actions for each actor.
 */

const calculateActionFrequency = (jsonInput) => {
  try {
    const data = JSON.parse(jsonInput);
    const counts = {};

    data.forEach(item => {
      if (item.actor) {
        counts[item.actor] = (counts[item.actor] || 0) + 1;
      }
    });

    // Output results as individual JSON objects per line
    Object.keys(counts).forEach(actor => {
      console.log(JSON.stringify({ actor, count: counts[actor] }));
    });
  } catch (error) {
    console.error("Invalid JSON input data.");
  }
};

// Example usage:
const sampleInput = `[
  {"actor": "A", "action": "greet"},
  {"actor": "B", "action": "greet"},
  {"actor": "A", "action": "logout"}
]`;

calculateActionFrequency(sampleInput);
