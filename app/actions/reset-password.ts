interface ApiResponse {
  status: boolean;
  msg: string;
}

export async function sendResetCode(formData: FormData) {
  const email = formData.get("email") as string;

  if (!email) {
    return { error: "Email is required" };
  }

  try {
    const response = await fetch("https://n8n-blue.up.railway.app/webhook/ada/api/send-reset-code", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data: ApiResponse = await response.json();

    if (response.status === 201 && data.status) {
      return { success: true, message: data.msg, email };
    } else {
      return { error: data.msg };
    }
  } catch (error) {
    console.error("Error sending reset code:", error);
    return { error: "Failed to send reset code. Please try again." };
  }
}

export async function verifyResetCode(formData: FormData) {
  const email = formData.get("email") as string;
  const code = formData.get("code") as string;

  if (!email || !code) {
    return { error: "Email and code are required" };
  }

  try {
    const response = await fetch("https://n8n-blue.up.railway.app/webhook/ada/api/verify-reset-code", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, code }),
    });

    const data: ApiResponse = await response.json();

    if (response.status === 200 && data.status) {
      return { success: true, message: "Code verified successfully", email };
    } else {
      return { error: data.msg };
    }
  } catch (error) {
    console.error("Error verifying reset code:", error);
    return { error: "Failed to verify code. Please try again." };
  }
}

export async function resetPassword(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!email || !password || !confirmPassword) {
    return { error: "Email and passwords are required" };
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match" };
  }

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(password)) {
    return {
      error:
        "Password must be at least 8 characters long and include 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character",
    };
  }

  try {
    // Use the updated API endpoint for resetting password
    const response = await fetch("https://n8n-blue.up.railway.app/webhook/ada/api/reset/password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data: ApiResponse = await response.json();

    if (data.status) {
      return { success: true, message: "Password reset successfully" };
    } else {
      return { error: data.msg };
    }
  } catch (error) {
    console.error("Error resetting password:", error);
    return { error: "Failed to reset password. Please try again." };
  }
}

export async function resetPasswordWithCode(formData: FormData) {
  const email = formData.get("email") as string;
  const code = formData.get("code") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!email || !code || !password || !confirmPassword) {
    return { error: "All fields are required" };
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match" };
  }

  try {
    // Step 1: Verify the code first
    const verifyResponse = await fetch("https://n8n-blue.up.railway.app/webhook/ada/api/verify-reset-code", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, code }),
    });

    const verifyData: ApiResponse = await verifyResponse.json();
    
    // If code verification fails, return error
    if (!verifyResponse.ok || !verifyData.status) {
      return { error: verifyData.msg || "Invalid verification code. Please try again." };
    }
    
    // Step 2: If code is verified, proceed with password reset using the updated API endpoint
    const resetResponse = await fetch("https://n8n-blue.up.railway.app/webhook/ada/api/reset/password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const resetData: ApiResponse = await resetResponse.json();

    if (resetResponse.ok && resetData.status) {
      return { success: true, message: "Password reset successfully" };
    } else {
      return { error: resetData.msg || "Failed to reset password. Please try again." };
    }
  } catch (error) {
    console.error("Error resetting password:", error);
    return { error: "Failed to reset password. Please try again." };
  }
}
