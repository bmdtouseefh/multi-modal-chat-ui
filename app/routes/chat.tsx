import { Form, useActionData, useNavigation } from "@remix-run/react";
import { json } from "@remix-run/react";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { ScrollArea } from "~/components/ui/scroll-area";
import { useState, useEffect } from "react";
import { ChatInput } from "~/components/chat-input";
import Markdown from "react-markdown";
import ReactMarkdown from "react-markdown";
// import SpeechToText from "~/components/stt";

export async function action({ request }: { request: Request }) {
  const formData = await request.formData();
  const message = formData.get("message") as string;

  return json({ message });
}

interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: string;
  streaming?: boolean;
}

export default function Chat() {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const [stream, setStream] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [base64, setBase64] = useState([]);

  const actionData = useActionData<typeof action>();

  //fetch msgs.
  useEffect(() => {
    if (
      actionData?.message &&
      !messages.find((m) => m.content === actionData.message)
    ) {
      const userMessageId = `user-${Date.now()}`;
      const aiMessageId = `ai-${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        {
          id: userMessageId,
          content: actionData.message,
          sender: "user",
          timestamp: new Date().toISOString(),
        },
        {
          id: aiMessageId,
          content: "loading",
          sender: "ai",
          timestamp: new Date().toISOString(),
          streaming: true,
        },
      ]);
      setInput("");
      // streamer(actionData.message);
      nonStreamer(actionData.message, aiMessageId);
    }
  }, [actionData, messages]);

  const nonStreamer = async (text: string, aiMessageId: string) => {
    const response = await fetch("http://localhost:8000/image", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ message: text, files: base64 }),
    });
    if (!response.body) return;
    const data = await response.json();
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === aiMessageId
          ? {
              ...msg,
              content: data.message || data, // Adjust based on your API response structure
              streaming: false,
            }
          : msg
      )
    );
  };

  const streamer = async (message: string) => {
    const response = await fetch("http://localhost:8000/text", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ message: message, files: base64 }),
    });
    if (!response.body) return;

    const reader = response.body.getReader();
    if (!reader) return;

    let resultText = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const decoder = new TextDecoder();

      const chunk = decoder.decode(value, { stream: true });
      resultText += chunk;
      setMessages((prev) =>
        prev.map((msg) =>
          msg.streaming ? { ...msg, content: resultText } : msg
        )
      );
    }

    // Mark as complete
    setMessages((prev) =>
      prev.map((msg) => (msg.streaming ? { ...msg, streaming: false } : msg))
    );
  };

  return (
    <div className="w-full mx-auto h-screen flex flex-col bg-slate-300">
      <Card className="flex-1 flex flex-col mx-36">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Chat</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col space-y-2">
          {messages?.length === 0 ? (
            <h1 className="text-3xl flex justify-center items-center h-full font-bold">
              Welcome bro.
            </h1>
          ) : (
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender === "user"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.sender === "user"
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      <p className=" text-lg">{message.content}</p>
                    </div>
                  </div>
                ))}
                {isSubmitting && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-900 p-3 rounded-lg">
                      <p className="text-sm">Typing...</p>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
          <Form method="post" className="flex items-center space-x-2">
            <ChatInput
              input={input}
              setInput={setInput}
              isSubmitting={isSubmitting}
              base64={base64}
              setBase64={setBase64}
            ></ChatInput>
            {/* <SpeechToText input={input} setInput={setInput}></SpeechToText> */}
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
