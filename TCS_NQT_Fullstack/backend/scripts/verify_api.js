const axios = require('axios');

async function test() {
  const baseURL = 'http://localhost:5001/api';

  try {
    console.log("--- Testing /api/questions/configs ---");
    const configsRes = await axios.get(`${baseURL}/questions/configs`);
    console.log("Configs keys:", configsRes.data.map(c => c.key));

    console.log("\n--- Testing /api/questions?examType=SSC_CGL ---");
    const questionsRes = await axios.get(`${baseURL}/questions?examType=SSC_CGL`);
    console.log("Total Questions fetched for SSC CGL:", questionsRes.data.length);
    if (questionsRes.data.length > 0) {
      const sections = [...new Set(questionsRes.data.map(q => q.s))];
      console.log("Fetched Sections Setup:", sections);
      console.log("Example item:", questionsRes.data[0]);
    } else {
      console.log("No questions found, as expected if data hasn't been uploaded yet.");
    }
    
  } catch (err) {
    console.error("Test Failed:", err.message);
  }
}

test();
