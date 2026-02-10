import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // 1. รับข้อความจากหน้าบ้าน
    const { session_id, message } = await req.json();

    // 2. ส่งต่อให้ n8n (Webhook)
    const response = await fetch(process.env.N8N_WEBHOOK_URL!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        session_id: session_id,
        message: message,
      }),
    });

    // 3. รับคำตอบจาก n8n ส่งกลับไปให้หน้าบ้าน
    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", reply: "ระบบขัดข้องชั่วคราว" },
      { status: 500 }
    );
  }
}