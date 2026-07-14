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

    // Mapping dictionaries for Japanese labels
    const TOPIC_MAP: Record<string, string> = {
      website: "ホームページ制作",
      lp: "LP制作",
      design: "デザイン制作",
      app: "アプリ開発",
      maintenance: "保守・運用",
      undecided: "まだ決まっていない",
    };

    const BUDGET_MAP: Record<string, string> = {
      under5: "～5万円",
      "5to10": "5〜10万円",
      "10to30": "10〜30万円",
      over30: "30万円以上",
      "budget-undecided": "まだ決まっていない",
    };

    const TIMELINE_MAP: Record<string, string> = {
      asap: "できるだけ早く",
      "1-2months": "1〜2ヶ月以内",
      halfyear: "半年以内",
      "timeline-undecided": "未定",
    };

    // Construct Email Content
    const topicText = topics.map((t) => TOPIC_MAP[t] || t).join("、");
    const budgetText = budget ? (BUDGET_MAP[budget] || budget) : "未選択";
    const timelineText = timeline ? (TIMELINE_MAP[timeline] || timeline) : "未選択";

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
        from: "AINO creator <contact@send.ainocreator.jp>",
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
