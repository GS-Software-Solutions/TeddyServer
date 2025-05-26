import dotenv from 'dotenv'
import { TeddyChatApi } from './api/TeddyChatApi'
import { convertTeddyResponseToSiteInfos } from './utils/teddy-parser'
import { SiteInfos } from './models/site-infos'
import { GSApi } from './api/GSApi'
dotenv.config()

interface Account {
    username: string
    password: string
}

async function main() {
    const env = process.env.ENVIRONMENT
    const accounts: Account[] = []

    if (env === 'development') {
        accounts.push({
            username: '029bi@d2c.de',
            password: 'ftghg4fhtgd75fhtgd'
        })
    }

    await processAccountsWithStaggeredStart(accounts)
}

async function processAccountsWithStaggeredStart(accounts: Account[]) {
    const accountPromises = accounts.map((account, index) => {
        const delay = index * 20000 // 20 second delay between accounts
        return new Promise(resolve => {
            setTimeout(() => {
                console.log(`🚀 Starting account ${account.username}`)
                processAccount(account)
            }, delay)
        })
    })

    await Promise.all(accountPromises)
}

async function processAccount(account: Account) {
    while (true) {
        const api = new TeddyChatApi()

        try {
            console.log(`🔑 Logging in account: ${account.username}`)
            await api.login({
                username: account.username,
                password: account.password
            })
            console.log(`✅ Login successful for ${account.username}`)

            console.log(`🔍 Starting search for ${account.username}`)
            await api.startSearch()
            console.log(`✅ Search started for ${account.username}`)

            // Step 3: Wait for messages
            console.log(`⏳ Waiting for messages for ${account.username}`)
            const messagesResponse = await api.waitForMessages(10000, 100)
            console.log(`✅ Messages received for ${account.username}, ${messagesResponse}`)

            // Step 4: Process messages if found
            if (messagesResponse.status && messagesResponse.messages) {
                const siteInfos: SiteInfos = convertTeddyResponseToSiteInfos(messagesResponse)
                console.log(
                    `🎯 Messages processed successfully for ${account.username}:`,
                    siteInfos
                )
                const gsApi = new GSApi(siteInfos)
                const gsResponse = await gsApi.chatCompletion()
                console.log(`✅ GS response:`, gsResponse) // Implement message sending and notes updating here
            }

            await safeLogout(api, account.username)
        } catch (error) {
            console.error(`❌ Error for account ${account.username}:`, getErrorMessage(error))

            // Only attempt logout if we're logged in
            if (api.getLoginStatus()) {
                await safeLogout(api, account.username)
            }
        }

        // Wait before next cycle
        console.log(`⏳ Waiting 1 minute before next cycle for ${account.username}`)
        await sleep(60000)
    }
}

async function safeLogout(api: TeddyChatApi, username: string): Promise<void> {
    try {
        console.log(`👋 Logging out ${username}`)
        await api.logout()
        console.log(`✅ Logout successful for ${username}`)
    } catch (logoutError) {
        console.error(`❌ Logout failed for ${username}:`, getErrorMessage(logoutError))
    }
}

function getErrorMessage(error: any): string {
    if (error?.message) return error.message
    if (typeof error === 'string') return error
    return 'Unknown error occurred'
}

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
}

main().catch(error => {
    console.error('💥 Fatal error:', getErrorMessage(error))
    process.exit(1)
})
