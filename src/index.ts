import dotenv from 'dotenv';
import dayjs from 'dayjs';
import { TeddyChatApi } from './api/TeddyChatApi';

// Load environment variables
dotenv.config();

interface Account {
  username: string;
  password: string;
  isLoggedIn: boolean;
}

console.log('Teddy Server starting...');
console.log(`Environment: ${process.env.ENVIRONMENT}`);
console.log(`API URL: ${process.env.API_URL}`);
console.log(`Chat API Base URL: ${process.env.CHAT_API_BASE_URL}`);
console.log(`Extension Version: ${process.env.EXTENSION_VERSION}`);

async function main() {
  const env = process.env.ENVIRONMENT;
  const accounts: Account[] = [];
  console.log(`Starting server in ${env} environment`);

  if (env === "development") {
    accounts.push({
      username: "029bi@d2c.de",
      password: "ftghg4fhtgd75fhtgd",
      isLoggedIn: false,
    });
  }

  // Start processing all accounts with staggered delays
  await processAccountsWithStaggeredStart(accounts);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

async function processAccountsWithStaggeredStart(accounts: Account[]) {
  const accountPromises = accounts.map((account, index) => {
    const delay = index * 20000; // 20 second delay between accounts
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`Starting account ${account.username}`);
        processAccount(account);
      }, delay);
    });
  });
  await Promise.all(accountPromises);
}

async function processAccount(account: Account) {
  while (true) {
    try {
      console.log(`🚀 Processing account: ${account.username}`);
      
      // Initialize API and login
      const api = new TeddyChatApi();
      await api.login({
        username: account.username,
        password: account.password
      });
      
      if (api.getLoginStatus()) {
        account.isLoggedIn = true;
        console.log(`✅ Account ${account.username} logged in successfully`);
        
        // Start searching for chats
        const searchResponse = await api.startSearch();
        if (searchResponse.status) {
          console.log("🔍 Started searching for chats...");
          
          // Wait for messages
          try {
            const messagesResponse = await api.waitForMessages(10000, 100); // Check every 10 seconds, max 100 attempts
            
            if (messagesResponse.status && messagesResponse.messages && messagesResponse.messages.length > 0) {
              console.log("📨 Found conversation with messages!");
              console.log(`Dialog ID: ${messagesResponse.dialog?.id}`);
              console.log(`User: ${messagesResponse.user?.name} (ID: ${messagesResponse.user?.id})`);
              console.log(`Writer: ${messagesResponse.writer?.name} (ID: ${messagesResponse.writer?.id})`);
              console.log(`Message count: ${messagesResponse.messages.length}`);
              
              // Log the conversation data for debugging
              console.log("📋 Conversation data:", {
                dialogId: messagesResponse.dialog?.id,
                messageCount: messagesResponse.dialog?.message_count,
                user: {
                  id: messagesResponse.user?.id,
                  name: messagesResponse.user?.name,
                  age: messagesResponse.user?.age,
                  coins: messagesResponse.user?.coins?.amount
                },
                writer: {
                  id: messagesResponse.writer?.id,
                  name: messagesResponse.writer?.name,
                  age: messagesResponse.writer?.age
                },
                lastMessage: messagesResponse.messages[messagesResponse.messages.length - 1]
              });
              
              // TODO: Add your conversation processing logic here
              // This is where you would:
              // 1. Transform the conversation data
              // 2. Call your AI/chat completion service
              // 3. Send response messages
              // 4. Update notes
              
              console.log("🎯 Conversation processing completed for this cycle");
            }
          } catch (waitError) {
            console.log("⏰ No messages found within timeout period");
          }
        } else {
          console.log("❌ Failed to start search");
        }
        
        // Logout
        await api.logout();
        account.isLoggedIn = false;
        console.log(`👋 Account ${account.username} logged out`);
        
        // Break the loop for now (you can modify this based on your needs)
        break;
      } else {
        console.log(`❌ Failed to login account ${account.username}`);
        break;
      }
    } catch (error) {
      logError(`Error processing account ${account.username}`, error);
      
      // Attempt to logout in case of error
      try {
        const api = new TeddyChatApi();
        await api.logout();
      } catch (logoutError) {
        console.log("Failed to logout after error");
      }
      
      account.isLoggedIn = false;
      console.log(`⏳ Waiting for 1 minute before retrying account ${account.username}`);
      
      // Wait 1 minute before retrying
      await new Promise((resolve) => setTimeout(resolve, 60000));
      continue;
    }
  }
}

// Centralized error logging function
function logError(context: string, error: any) {
  const message = error?.message || error?.toString() || "Unknown error";
  const stack = error?.stack ? `\nStack: ${error.stack}` : "";
  const cause = error?.cause ? `\nCause: ${JSON.stringify(error.cause)}` : "";
  console.error(`[${context}] ${message}${cause}${stack}`);
} 