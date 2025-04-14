import { createCookie } from "@remix-run/cloudflare";

interface UserResponse {
  id: number;
  name: string;
  email: string;
  password: string;
  salt: string;
  created_at: string;
  session_token: string;
  plan?: string;
  plan_status?: string;
  role?: string;
}

// Create a cookie instance
export const authCookie = createCookie("authToken", {
  httpOnly: true,
  secure: true,
  path: "/",
  maxAge: 1296000, // 15 days
  sameSite: "lax",
});

export async function loginUser(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  try {
    const response = await fetch("https://n8n-blue.up.railway.app/webhook/ada/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      return { error: "Invalid Credentials" };
    }

    const userData: UserResponse = await response.json();

    // Verify that we have a session token
    if (!userData.session_token) {
      return { error: "Error to proceed to login" };
    }

    // The cookie will be set in the component that calls this function

    // Store user data in localStorage (will be done client-side)
    const userDataForStorage = {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      created_at: userData.created_at,
      plan: userData.plan || 'free',
      plan_status: userData.plan_status || 'active',
      role: userData.role || 'user'
    };

    // Return the user data (excluding sensitive information)
    return {
      success: true,
      user: userDataForStorage,
    };
  } catch (error) {
    console.error("Login error:", error);
    return { error: "Error to proceed to login. Please try again." };
  }
}
