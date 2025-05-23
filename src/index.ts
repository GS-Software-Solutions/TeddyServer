import dotenv from 'dotenv';
import dayjs from 'dayjs';
import { TeddyChatApi } from './api/TeddyChatApi';

// Load environment variables
dotenv.config();

console.log('Teddy Server starting...');
console.log(`Environment: ${process.env.ENVIRONMENT}`);
console.log(`API URL: ${process.env.API_URL}`);
console.log(`Chat API Base URL: ${process.env.CHAT_API_BASE_URL}`);
console.log(`Extension Version: ${process.env.EXTENSION_VERSION}`);

// Main function to run the server
async function main() {
  try {
    console.log(`Server started at ${dayjs().format('YYYY-MM-DD HH:mm:ss')}`);
    
    // Initialize TeddyChatApi
    const teddyApi = new TeddyChatApi();
    
    // Example usage - you can uncomment and modify as needed
    /*
    await teddyApi.login({
      username: "your-username",
      password: "your-password"
    });
    
    // Your API calls here
    // const data = await teddyApi.get('/some-endpoint');
    
    // Don't forget to logout when done
    // await teddyApi.logout();
    */
    
    console.log('✅ Teddy Server initialized successfully');

  } catch (error) {
    console.error('Error starting server:', error);
  }
}

// Run the main function
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
}); 