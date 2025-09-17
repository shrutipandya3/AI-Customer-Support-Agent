import { useState, useRef, useEffect } from "react";
import { Send, Bot } from "lucide-react";
import Button from "../layout/Button";
import useAuthApi from "../../config/authApi";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatAreaProps {
  onNewConversation?: () => void;
  conversationId?: string;
  setConversationId?: (id: string) => void;
}

export default function ChatArea({
  onNewConversation,
  conversationId,
  setConversationId,
}: ChatAreaProps) {
  const api = useAuthApi();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!conversationId) {
      setMessages([]); // clear chat when no conversation selected
      return;
    }

    const fetchConversation = async () => {
      setIsLoading(true);
      try {
        const res = await api.get(`/conversations/${conversationId}`);
        const msgs = res.data.conversation.messages.map((msg: any) => ({
          id: Date.now() + Math.random(), // unique local id
          role: msg.role,
          content: msg.content,
          timestamp: new Date(msg.timestamp || msg.createdAt),
        }));
        setMessages(msgs);
      } catch (err) {
        console.error("Failed to fetch conversation:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversation();
  }, [conversationId, api]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage("");
    setIsLoading(true);

    try {
      const payload: any = { message: userMessage };
      if (conversationId) payload.conversationId = conversationId;

      const { data } = await api.post("/messages", payload);

      // If first message, backend returns new conversationId
      if (!conversationId && setConversationId && data.conversationId) {
        setConversationId(data.conversationId); // triggers useEffect to fetch messages
        setMessages([]); // clear chat for new conversation
        if (onNewConversation) onNewConversation();
      }

      // Add user message
      const newUserMessage: Message = {
        id: Date.now(),
        role: "user",
        content: userMessage,
        timestamp: new Date(),
      };

      // Add AI response
      const aiResponse: Message = {
        id: Date.now() + 1,
        role: "assistant",
        content: data.aiMessage?.content || "No response from server.",
        timestamp: new Date(),
      };

      setMessages([newUserMessage, aiResponse]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Empty state - show greeting in center
  if (messages.length === 0) {
    return (
      <div className="flex flex-col h-full">
        {/* Center greeting area */}
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                Welcome to Customer Support
              </h2>
              <p className="text-gray-600">How can I help you today?</p>
            </div>

            {/* Message input area */}
            <div className="w-full">
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  value={inputMessage}
                  onChange={(e) => {
                    setInputMessage(e.target.value);
                    adjustTextareaHeight();
                  }}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message here..."
                  className="w-full p-4 pr-12 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  variant="primary"
                  className="absolute right-3 bottom-3 w-auto px-3 py-2 rounded-lg"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Chat with messages - show messages and input at bottom
  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`flex max-w-xs md:max-w-md ${
                message.role === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              {/* Message bubble */}
              <div
                className={`px-4 py-2 rounded-lg ${
                  message.role === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-white text-gray-800 border border-gray-200"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <p
                  className={`text-xs mt-1 ${
                    message.role === "user" ? "text-blue-100" : "text-gray-500"
                  }`}
                >
                  {formatTime(message.timestamp)}
                </p>
              </div>
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex mr-3">
              <div className="h-8 w-8 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center">
                <Bot className="h-4 w-4" />
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg px-4 py-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area at bottom */}
      <div className="border-t border-gray-200 bg-white p-4">
        <div className="flex items-end space-x-2">
          <textarea
            ref={textareaRef}
            value={inputMessage}
            onChange={(e) => {
              setInputMessage(e.target.value);
              adjustTextareaHeight();
            }}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent max-h-32"
            rows={1}
            disabled={isLoading}
          />

          <Button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            variant="primary"
            className="!w-auto h-12 px-3 py-2 rounded-lg flex items-center justify-center"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
