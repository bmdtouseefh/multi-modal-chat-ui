import { Form, useActionData, useNavigation } from "@remix-run/react";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { json } from "@remix-run/react";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { ScrollArea } from "~/components/ui/scroll-area";
import { useState, useEffect } from "react";
import { ArrowBigRight } from "lucide-react";

export async function action({ request }: { request: Request }) {
  const formData = await request.formData();
  const message = formData.get("message") as string;

  const response = await fetch("http://localhost:8000/text", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({ message }),
  });
  const data = await response.json();
  let aiResponse = data;
  if (Array.isArray(data)) {
    const strings = data.filter((item) => typeof item === "string");
    if (strings.length > 0) {
      aiResponse = strings[strings.length - 1].trim(); // Get the last string and trim whitespace
    }
  }

  return json({ message, response: aiResponse });
}

interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: string;
}

export default function Chat() {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const actionData = useActionData<typeof action>();
  //why
  useEffect(() => {
    if (
      actionData?.message &&
      actionData?.response &&
      !messages.find((m) => m.content === actionData.message)
    ) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          content: actionData.message,
          sender: "user",
          timestamp: new Date().toISOString(),
        },
        {
          id: (Date.now() + 1).toString(),
          content: actionData.response,
          sender: "ai",
          timestamp: new Date().toISOString(),
        },
      ]);
      setInput("");
    }
  }, [actionData, messages]);
  return (
    <div className="w-full mx-auto p-4 h-screen flex flex-col bg-slate-300">
      <Card className="flex-1 flex flex-col">
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
                      <p className=" text-2xl">{message.content}</p>
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
            <Input
              name="message"
              value={input}
              className="flex-1 placeholder:text-3xl h-24 rounded-xl"
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything"
              //why and how
              disabled={isSubmitting}
            ></Input>
            <Button
              type="submit"
              className="h-12 rounded-sm"
              variant="secondary"
              disabled={isSubmitting || !input.trim()}
            >
              Send
            </Button>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
