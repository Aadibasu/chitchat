import { useChatStore } from "../store/useChatStore";
import { useState, useEffect } from "react";

import BorderAnimatedContainer from "../components/BorderAnimatedContainer";
import ProfileHeader from "../components/ProfileHeader";
import ActiveTabSwitch from "../components/ActiveTabSwitch";
import ChatsList from "../components/ChatsList";
import ContactList from "../components/ContactList";
import ChatContainer from "../components/ChatContainer";
import NoConversationPlaceholder from "../components/NoConversationPlaceholder";

function ChatPage() {
  const { activeTab, selectedUser, setSelectedUser } = useChatStore();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // if on mobile and a user is selected, hide the sidebar to give full screen to chat
  const showSidebar = !(isMobile && selectedUser);

  return (
    <div className="relative w-full max-w-full md:max-w-6xl h-full md:h-[800px] flex flex-col md:flex-row">
      <BorderAnimatedContainer>
        {showSidebar && (
          <div className="w-full md:w-80 bg-slate-800/50 backdrop-blur-sm flex flex-col">
            <ProfileHeader />
            <ActiveTabSwitch />

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {activeTab === "chats" ? <ChatsList /> : <ContactList />}
            </div>
          </div>
        )}

        <div className="flex-1 flex flex-col bg-slate-900/50 backdrop-blur-sm">
          {isMobile && selectedUser && (
            <button
              className="text-slate-400 m-2"
              onClick={() => setSelectedUser(null)}
            >
              ← Back
            </button>
          )}
          {selectedUser ? <ChatContainer /> : <NoConversationPlaceholder />}
        </div>
      </BorderAnimatedContainer>
    </div>
  );
}
export default ChatPage;