import axios, { AxiosInstance } from 'axios'

export interface LoginCredentials {
    username: string
    password: string
}

export interface LoginResponse {
    token: string
    status: number
}

export interface LogoutResponse {
    status: boolean
}

export interface StartSearchResponse {
    status: boolean
}

export interface CheckMessagesResponse {
    status: boolean
    error?: string
    randomFact?: string
    messages?: any[]
    dialog?: any
    user?: any
    writer?: any
    dialogInformations?: any[]
    website?: any
    templates?: any[]
    favorites?: any[]
    statistic?: any
    messagePrice?: number
    gifts?: any[]
    minCharCount?: number
    logoutTime?: number
}

export class TeddyChatApi {
    private client: AxiosInstance
    private token: string | null = null
    private isLoggedIn: boolean = false

    constructor() {
        this.client = axios.create({
            baseURL: process.env.CHAT_API_BASE_URL || 'https://teddy-mod.de/api',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            timeout: 15000
        })

        this.client.interceptors.request.use(config => {
            if (this.token) {
                config.headers.Authorization = `Bearer ${this.token}`
            }
            return config
        })
    }
    // Testing husky here
    async login(credentials: LoginCredentials): Promise<LoginResponse> {
        try {
            const response = await this.client.post('/login', {
                grant_type: 'password',
                username: credentials.username,
                password: credentials.password
            })

            if (response.status === 200 && response.data.status === 200 && response.data.token) {
                this.token = response.data.token
                this.isLoggedIn = true
                console.log('✅ Login successful!')
                return response.data as LoginResponse
            } else {
                throw new Error('Login failed - Invalid response')
            }
        } catch (error) {
            console.error('❌ Login failed:', error)
            throw error
        }
    }

    async logout(): Promise<LogoutResponse> {
        if (!this.token) {
            throw new Error('Not logged in')
        }

        try {
            // Use the same client and domain as all other requests
            const response = await this.client.get('/v1/user/active/remove')

            if (response.status === 200 && response.data.status === true) {
                this.token = null
                this.isLoggedIn = false
                console.log('✅ Logout successful!')
                return response.data as LogoutResponse
            } else {
                throw new Error(
                    `Logout failed - Status: ${response.status}, Response: ${JSON.stringify(response.data)}`
                )
            }
        } catch (error) {
            console.error('❌ Logout failed:', error)
            throw error
        }
    }

    // Start searching for chats
    async startSearch(): Promise<StartSearchResponse> {
        if (!this.isLoggedIn || !this.token) {
            throw new Error('Not authenticated. Please login first.')
        }

        try {
            const response = await this.client.get('/v1/user/active/set')
            console.log('🔍 Start search response:', response.data)

            // Handle the case where user is already active
            if (response.data.status === false && response.data.error === 'already active') {
                console.log('ℹ️ User is already active, continuing with message checking')
                return { status: true } as StartSearchResponse // Return success to continue flow
            }

            if (response.status === 200 && response.data.status === true) {
                console.log('✅ Started searching for chats!')
                return response.data as StartSearchResponse
            } else {
                throw new Error('Failed to start search')
            }
        } catch (error) {
            console.error('❌ Failed to start search:', error)
            throw error
        }
    }

    // Check if user is already active
    async isUserActive(): Promise<boolean> {
        if (!this.isLoggedIn || !this.token) {
            throw new Error('Not authenticated. Please login first.')
        }

        try {
            const response = await this.client.get('/v1/user/active/check')
            return response.data.status === true && response.data.active === true
        } catch (error) {
            console.error('❌ Failed to check if user is active:', error)
            return false
        }
    }

    // Check for new messages
    async checkMessages(): Promise<CheckMessagesResponse> {
        if (!this.isLoggedIn || !this.token) {
            throw new Error('Not authenticated. Please login first.')
        }

        try {
            const response = await this.client.get('v1/message/check?canAsa=1')
            return response.data as CheckMessagesResponse
        } catch (error) {
            console.error('❌ Failed to check messages:', error)
            throw error
        }
    }

    // Wait for messages with polling, this will keep on trying for  number of attempts even if there is no message or error
    async waitForMessages(
        intervalMs: number = 10000,
        maxAttempts: number = 100
    ): Promise<CheckMessagesResponse> {
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                const messagesResponse = await this.checkMessages()

                if (
                    messagesResponse.status === true &&
                    messagesResponse.messages &&
                    messagesResponse.messages.length > 0
                ) {
                    return messagesResponse
                }

                if (
                    messagesResponse.status === false &&
                    messagesResponse.error === 'Keine Nachricht gefunden'
                ) {
                    console.log(
                        `⏳ No messages found (attempt ${attempt}/${maxAttempts}), waiting ${intervalMs / 1000} seconds...`
                    )
                    await new Promise(resolve => setTimeout(resolve, intervalMs))
                } else {
                    console.log('❓ Unexpected response:', messagesResponse)
                    await new Promise(resolve => setTimeout(resolve, intervalMs))
                }
            } catch (error) {
                console.error(`❌ Error checking messages (attempt ${attempt}):`, error)
                await new Promise(resolve => setTimeout(resolve, intervalMs))
            }
        }

        throw new Error(`No messages found after ${maxAttempts} attempts`)
    }

    // Helper method to check if user is logged in
    getLoginStatus(): boolean {
        return this.isLoggedIn
    }

    // Helper method to get current token
    getToken(): string | null {
        return this.token
    }
}
