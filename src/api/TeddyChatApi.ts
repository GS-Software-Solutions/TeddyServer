import axios, { AxiosInstance } from "axios";

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  status: number;
}

export interface LogoutResponse {
  status: boolean;
}

export class TeddyChatApi {
  private client: AxiosInstance;
  private token: string | null = null;
  private isLoggedIn: boolean = false;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.CHAT_API_BASE_URL || "https://teddy-mod.de/api",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      timeout: 15000,
    });

    this.client.interceptors.request.use((config) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      return config;
    });
  }

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await this.client.post("/login", {
        grant_type: "password",
        username: credentials.username,
        password: credentials.password,
      });

      if (response.status === 200 && response.data.status === 200 && response.data.token) {
        this.token = response.data.token;
        this.isLoggedIn = true;
        console.log("✅ Login successful!");
        return response.data as LoginResponse;
      } else {
        throw new Error("Login failed - Invalid response");
      }
    } catch (error) {
      console.error("❌ Login failed:", error);
      throw error;
    }
  }

  async logout(): Promise<LogoutResponse> {
    if (!this.token) {
      throw new Error("Not logged in");
    }

    try {
      // Note: The logout endpoint is on a different domain according to the curl command
      const logoutClient = axios.create({
        baseURL: "https://teddy-sys-mod.de/api/v1",
        headers: {
          "Authorization": `Bearer ${this.token}`,
          "Accept": "application/json",
        },
        timeout: 15000,
      });

      const response = await logoutClient.get("/user/active/remove");

      if (response.status === 200 && response.data.status === true) {
        this.token = null;
        this.isLoggedIn = false;
        console.log("✅ Logout successful!");
        return response.data as LogoutResponse;
      } else {
        throw new Error("Logout failed - Invalid response");
      }
    } catch (error) {
      console.error("❌ Logout failed:", error);
      throw error;
    }
  }

  // Helper method to check if user is logged in
  getLoginStatus(): boolean {
    return this.isLoggedIn;
  }

  // Helper method to get current token
  getToken(): string | null {
    return this.token;
  }

  // Generic method to make authenticated API calls
  async makeAuthenticatedRequest(method: 'GET' | 'POST' | 'PUT' | 'DELETE', endpoint: string, data?: any) {
    if (!this.isLoggedIn || !this.token) {
      throw new Error("Not authenticated. Please login first.");
    }

    try {
      const config: any = {
        method: method.toLowerCase(),
        url: endpoint,
      };

      if (data && (method === 'POST' || method === 'PUT')) {
        config.data = data;
      }

      const response = await this.client.request(config);
      return response.data;
    } catch (error) {
      console.error(`❌ API request failed (${method} ${endpoint}):`, error);
      throw error;
    }
  }

  // Convenience methods for different HTTP methods
  async get(endpoint: string) {
    return this.makeAuthenticatedRequest('GET', endpoint);
  }

  async post(endpoint: string, data?: any) {
    return this.makeAuthenticatedRequest('POST', endpoint, data);
  }

  async put(endpoint: string, data?: any) {
    return this.makeAuthenticatedRequest('PUT', endpoint, data);
  }

  async delete(endpoint: string) {
    return this.makeAuthenticatedRequest('DELETE', endpoint);
  }
}

