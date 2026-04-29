import { aiGenerateReceipt } from './app/actions/acts';

async function test() {
  try {
    console.log("Calling aiGenerateReceipt...");
    const res = await aiGenerateReceipt("Me", "My Ex", "12", "Romantic", "Toxic", "Pizza");
    console.log("Success:", res);
  } catch (err) {
    console.error("Error occurred:", err);
  }
}

test();
