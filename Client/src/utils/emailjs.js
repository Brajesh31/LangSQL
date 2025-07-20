import emailjs from "@emailjs/browser";

export const sendVerificationEmail = async (email, code, name) => {
  try {
    if (!email) {
      throw new Error("Email address is required");
    }

    const templateParams = {
      name: name || email.split("@")[0], // Fallback to email username if name not provided
      email: email,
      code: code,
    };

    const response = await emailjs.send(
      import.meta.env.VITE_EMAILJS_SERVICE_ID,
      import.meta.env.VITE_EMAILJS_VERIFICATION_TEMPLATE_ID,
      templateParams,
      import.meta.env.VITE_EMAILJS_PUBLIC_KEY
    );

    if (response.status === 200) {
      return { success: true };
    }
    throw new Error("Failed to send email");
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

export const sendWelcomeEmail = async (email, name) => {
  try {
    if (!email) {
      throw new Error("Email address is required");
    }

    const templateParams = {
      name: name || email.split("@")[0], // Fallback to email username if name not provided
      email: email,
    };

    const response = await emailjs.send(
      import.meta.env.VITE_EMAILJS_SERVICE_ID,
      import.meta.env.VITE_EMAILJS_WELCOME_TEMPLATE_ID,
      templateParams,
      import.meta.env.VITE_EMAILJS_PUBLIC_KEY
    );

    if (response.status === 200) {
      return { success: true };
    }
    throw new Error("Failed to send email");
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};
