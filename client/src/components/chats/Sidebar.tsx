import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Menu } from "lucide-react";
import Button from "../layout/Button";
import useAuthApi from "../../config/authApi";

interface Conversation {
  id: string;
  title: string;
}

interface SidebarProps {
  refreshKey?: number; // increment to refresh conversations
  setConversationId?: (id: string) => void;
}

export default function Sidebar({
  refreshKey,
  setConversationId,
}: SidebarProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const api = useAuthApi();

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const res = await api.get("/conversations");
      setConversations(res.data.conversations || []);
    } catch (err) {
      console.error("Failed to fetch conversations:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations(); // fetch on load and when refreshKey changes
  }, [api, refreshKey]);

  return (
    <motion.aside
      className="fixed top-16 left-0 h-[calc(100vh-4rem)] bg-[#c8e6f0] border-r border-[#b5dce9] shadow-2xl backdrop-blur-lg flex flex-col z-40"
      animate={{ width: isExpanded ? 256 : 64 }}
      transition={{ type: "spring", stiffness: 200, damping: 24 }}
    >
      {/* Toggle button */}
      <div className="p-2 md:hidden">
        <Button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-center w-full"
        >
          <Menu className="w-6 h-6" />
        </Button>
      </div>

      {/* History Section */}
      <div className="flex-1 mt-4">
        {isExpanded && (
          <h3 className="px-3 py-2 text-sm font-semibold text-gray-600 uppercase tracking-wide underline">
            History
          </h3>
        )}

        <nav className="space-y-2">
          {loading ? (
            <p className="px-3 text-gray-500">Loading...</p>
          ) : conversations.length === 0 ? (
            <p className="px-3 text-gray-500">No conversations</p>
          ) : (
            conversations.map((conv, index) => (
              <motion.button
                key={conv.id}
                onClick={() => {
                  setSelectedId(conv.id); // highlight in sidebar
                  if (setConversationId) setConversationId(conv.id); // trigger ChatArea fetch
                }}
                className={`flex items-center gap-3 w-full px-3 py-3 rounded-lg text-gray-800 hover:bg-white/40 transition-all duration-200 ${
                  selectedId === conv.id ? "bg-white/50" : ""
                }`}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
              >
                {isExpanded && (
                  <span className="font-medium">{conv.title}</span>
                )}
              </motion.button>
            ))
          )}
        </nav>
      </div>
    </motion.aside>
  );
}
