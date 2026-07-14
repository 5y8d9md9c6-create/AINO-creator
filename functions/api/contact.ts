export const onRequestPost: PagesFunction<{ RESEND_API_KEY: string }> = async (context) => {
  try {
    const data = await context.request.json() as {
      name?: string;
      email?: string;
      topics?: string[];
      message?: string;
      budget?: string | null;
      timeline?: string | null;
      website?: string;
    };

    const { name, email, topics, message, budget, timeline, website } = data;

    // 1. Honeypot check
    if (website) {
      // Return 200 mock success to prevent bots from knowing they failed
      return new Response(JSON.stringify({ success: true, message: "Sent successfully" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 2. Validation
    if (!name || !email || !message || !topics || topics.length === 0) {
      return new Response(JSON.stringify({ success: false, message: "必須項目を入力してください。" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({ success: false, message: "有効なメールアドレスを入力してください。" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 3. Environment Variable check
    const apiKey = context.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error("RESEND_API_KEY is not configured.");
      return new Response(JSON.stringify({ success: false, message: "送信用のAPIキーが設定されていません。" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Construct Email Content
    const topicText = topics.join("、");
    const budgetText = budget || "未選択";
    const timelineText = timeline || "未選択";

    const emailBody = `
AINO creator お問い合わせフォームより新しいお便りが届きました。

お名前: ${name}
メールアドレス: ${email}

【ご相談内容】
${topicText}

【ご予算】
${budgetText}

【希望時期】
${timelineText}

【メッセージ】
${message}
`.trim();

    // 4. Send to Resend API
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "hello@ainocreator.jp",
        to: "hello@ainocreator.jp",
        subject: `【お問い合わせ】${name}様より`,
        text: emailBody,
        reply_to: email,
      }),
    });

    if (!res.ok) {
      const errDetails = await res.text();
      console.error("Resend API error:", errDetails);
      return new Response(JSON.stringify({ success: false, message: "メールの送信に失敗しました。" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, message: "Sent successfully" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Server error:", error);
    return new Response(JSON.stringify({ success: false, message: "サーバーエラーが発生しました。" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
