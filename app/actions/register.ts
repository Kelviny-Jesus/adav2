interface ApiResponse {
  status: boolean;
  msg: string;
}

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

export async function registerUser(formData: FormData) {
  if (!formData) {
    return { error: "No form data received" };
  }

  const name = formData.get("name") as string | null;
  const email = formData.get("email") as string | null;
  const password = formData.get("password") as string | null;

  if (!name || !email || !password) {
    return { error: "All fields are required" };
  }

  if (!passwordRegex.test(password)) {
    return { error: "Password does not meet complexity requirements" };
  }

  try {
    const response = await fetch("https://n8n-blue.up.railway.app/webhook/ada/api/create/user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password }),
    });

    const data: ApiResponse = await response.json();

    if (data.status) {
      console.log("User registered successfully:", data.msg);
      return { success: true, message: "Account created successfully. Please log in." };
    } else {
      console.error("Error registering user:", data.msg);
      return { error: data.msg };
    }
  } catch (error) {
    console.error("Error registering user:", error);
    return { error: "Failed to register user. Please try again." };
  }
}
