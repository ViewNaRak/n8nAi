"use client";

import { useEffect, useRef, useState } from "react";

type Msg = {
  role: "user" | "assistant";
  text: string;
};

export default function Page() {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", text: "สวัสดีครับ พิมพ์ข้อความเพื่อเริ่มแชทได้เลย" },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // สร้าง Session ID ครั้งเดียวเมื่อเปิดหน้าเว็บ
  useEffect(() => {
    setSessionId(crypto.randomUUID());
  }, []);

  // เลื่อนลงล่างสุดเสมอเมื่อมีข้อความใหม่
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send() {
    const text = input.trim();
    if (!text || busy) return;

    // 1. แสดงข้อความเราทันที
    setInput("");
    setBusy(true);
    setMessages((prev) => [...prev, { role: "user", text }]);

    try {
      // 2. ส่งไปหลังบ้าน (API Route)
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          message: text,
        }),
      });

      const data = await res.json();
      
      // 3. แสดงข้อความตอบกลับ
      const reply = data.reply || "ขออภัย ระบบตอบกลับผิดพลาด";
      setMessages((prev) => [...prev, { role: "assistant", text: reply }]);

    } catch (error) {
      setMessages((prev) => [...prev, { role: "assistant", text: "เกิดข้อผิดพลาดในการเชื่อมต่อ" }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-white p-8 font-sans text-gray-900">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <h1 className="mb-4 text-center text-2xl font-bold">
          MVP Web Chat (Next.js → n8n → Gemini)
        </h1>

        {/* Chat Box Border */}
        <div className="overflow-hidden rounded-xl border border-gray-400 bg-white shadow-sm">
          
          {/* Chat History Area */}
          <div className="h-[500px] overflow-y-auto p-6 bg-white">
            <div className="flex flex-col gap-4">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex flex-col ${
                    m.role === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <span className="mb-1 text-xs text-gray-500">{m.role}</span>
                  <div
                    className={`max-w-[80%] rounded-lg border px-4 py-2 ${
                      m.role === "user"
                        ? "border-gray-300 bg-gray-100 text-black" // ฝั่งเรา
                        : "border-gray-400 bg-white text-black"     // ฝั่งบอท (ตามรูปอาจารย์)
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{m.text}</div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-300 p-4">
            <div className="flex gap-2">
              <input
                className="flex-1 rounded border border-gray-300 px-4 py-2 outline-none focus:border-gray-500"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="พิมพ์ข้อความ..."
                disabled={busy}
              />
              <button
                className="rounded bg-gray-600 px-6 py-2 text-white hover:bg-gray-700 disabled:opacity-50"
                onClick={send}
                disabled={busy}
              >
                Send
              </button>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Session: {sessionId}
            </div>
          </div>
          
        </div>
      </div>
    </main>
  );
}