"use client";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import tmi from "tmi.js";

type Message = {
  username: string;
  message: string;
};

export default function Home() {
  const router = useRouter();
  const pathname = usePathname();

  // get channel from url params
  const searchParams = useSearchParams();
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams);
      params.set(name, value);

      return params.toString();
    },
    [searchParams]
  );

  const channel = searchParams.get("channel");
  if (!channel) {
    router.push(pathname + "?" + createQueryString("channel", "ml7support"));
  }
  const [messages, setMessages] = useState<Message[]>([]);
  const client = useMemo(
    () =>
      new tmi.Client({
        channels: [channel || "ml7support"],
      }),
    [channel]
  );

  useEffect(() => {
    const handleNewMessage = (channel: any, tags: any, message: any) => {
      setMessages((prevMessages) => [
        {
          username: tags.username || "Unknown user",
          message: message,
        },
        ...prevMessages,
      ]);
    };

    console.log("connecting");
    client.connect();
    client.on("message", handleNewMessage);

    return () => {
      console.log("disconnecting");
      client.disconnect();
      client.removeAllListeners(); // Remove the event listener
    };
  }, [client]);

  return (
    <main className="flex min-h-screen flex-col items-start p-24">
      <h1 className="text-4xl font-bold mb-4">
        Twitch Chat from <span className="text-purple-400">{channel}</span>
      </h1>
      <div className="overflow-auto max-h-screen">
        {messages.map((message) => (
          <div key={message.message}>
            <div>
              <span className="text-xl font-bold text-purple-400">
                {message.username}:{" "}
              </span>
              <span className="text-xl">{message.message}</span>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
