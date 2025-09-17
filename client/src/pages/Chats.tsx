import { useState } from "react";
import ChatArea from "../components/chats/ChatArea";
import Sidebar from "../components/chats/Sidebar";

export default function Chats() {
  const [conversationId, setConversationId] = useState<string>();
  const [refreshSidebar, setRefreshSidebar] = useState(0); // triggers sidebar refresh

  // callback to refresh sidebar after first message
  const handleNewConversation = () => {
    setRefreshSidebar((prev) => prev + 1);
  };

  return (
    <div className="grid grid-cols-[1fr_4fr]">
      {/* Left Panel - Sidebar */}
      <div className="p-4">
        <Sidebar refreshKey={refreshSidebar} setConversationId={setConversationId}/>
      </div>

      {/* Right Panel - Chat Area */}
      <div className="p-4">
        <ChatArea
          conversationId={conversationId}
          setConversationId={setConversationId}
          onNewConversation={handleNewConversation}
        />
      </div>
    </div>
  );
}
