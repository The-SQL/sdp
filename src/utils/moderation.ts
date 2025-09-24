export const checkProfanity = async (text: string) => {
  try {

    const res = await fetch("/api/moderation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    const contentType = res.headers.get("content-type");

    // Grab raw body to debug (works for both JSON and HTML error pages)
    const rawBody = await res.text();


    if (!contentType || !contentType.includes("application/json")) {
      return { contains_profanity: false, censored_text: text };
    }

    const data = JSON.parse(rawBody);

    return data;
  } catch (error) {
    console.error(" Error checking profanity:", error);
    return { contains_profanity: false, censored_text: text };
  }
};
