import dotenv from 'dotenv';
import dayjs from 'dayjs';
import { TeddyChatApi } from './api/TeddyChatApi';
import { convertTeddyResponseToSiteInfos } from './utils/teddy-parser';
import { SiteInfos } from './models/site-infos';

// Load environment variables
dotenv.config();

interface Account {
  username: string;
  password: string;
  isLoggedIn: boolean;
}



async function main() {
  const env = process.env.ENVIRONMENT;
  const accounts: Account[] = [];

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
  let api: TeddyChatApi | null = null;
  
  while (true) {
    try {
      console.log(`🚀 Processing account: ${account.username}`);
      
      // Initialize API and login
      api = new TeddyChatApi();
      await api.login({
        username: account.username,
        password: account.password
      });
      
      if (api.getLoginStatus()) {
        account.isLoggedIn = true;
        console.log(`✅ Account ${account.username} logged in successfully`);
        
        let isActive = false;
        try {
          isActive = await api.isUserActive();
          if (isActive) {
            console.log(`ℹ️ Account ${account.username} is already active`);
          }
        } catch (activeCheckError) {
          console.log(`⚠️ Could not check if account is active, continuing with search`);
        }
        
        let canContinue = true;
        if (!isActive) {
          try {
            const searchResponse = await api.startSearch();
            if (!searchResponse.status) {
              console.log("❌ Failed to start search, can't continue");
              canContinue = false;
            } else {
              console.log("🔍 Started searching for chats...");
            }
          } catch (searchError) {
            console.log("⚠️ Error during start search, but will try to check messages anyway");
          }
        }
        
        if (canContinue) {
          try {
            const messagesResponse = await api.waitForMessages(10000, 100); // Check every 10 seconds, max 100 attempts
            console.log("🔍 Messages response:", messagesResponse);
            if (messagesResponse.status && messagesResponse.messages && messagesResponse.messages.length > 0) {

              try {
                const siteInfos: SiteInfos = convertTeddyResponseToSiteInfos(messagesResponse);
                console.log("🔄 SiteInfos:", siteInfos);
                

              } catch (parseError) {
                console.error("❌ Error converting response to SiteInfos:", parseError);
              }
              
              console.log("🎯 Conversation processing completed for this cycle");
            } else {
              console.log("⚠️ No messages found or invalid response format");
            }
          } catch (waitError) {
            console.log("⏰ No messages found within timeout period");
          }
        } else {
          console.log("❌ Cannot continue with message checking due to previous errors");
        }
        
        // Attempt to logout
        try {
          await api.logout();
          account.isLoggedIn = false;
          console.log(`👋 Account ${account.username} logged out`);
        } catch (logoutError) {
          console.error("❌ Error during logout:");
          account.isLoggedIn = false;
        }
        
        // Wait before next cycle
        console.log(`⏳ Waiting for 1 minute before next cycle for account ${account.username}`);
        await new Promise((resolve) => setTimeout(resolve, 60000));
        continue;
      } else {
        console.log(`❌ Failed to login account ${account.username}`);
        // Wait before retrying
        console.log(`⏳ Waiting for 1 minute before retrying account ${account.username}`);
        await new Promise((resolve) => setTimeout(resolve, 60000));
        continue;
      }
    } catch (error) {
      logError(`Error processing account ${account.username}`, error);
      
      // Already created api instance may have a valid token, try to logout with it
      if (api && api.getLoginStatus()) {
        try {
          await api.logout();
          console.log(`👋 Account ${account.username} logged out after error`);
        } catch (logoutError) {
          console.log("❌ Failed to logout after error");
        }
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