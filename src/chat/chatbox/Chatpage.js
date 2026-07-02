import  { useRef, useState, useMemo, useEffect } from "react";
import { UserSkeleton } from "./UserSkeleton";
import { useAuth } from "../../layout/AuthProvider";
import api from "../../Api/axios";
import ChatComponent from "./ChatComponent";
import { decryptMessage } from "../../utils/encryption";
import { useSearchParams } from "react-router-dom";


export default function ChatPage({
  chats,
  setChats,
  activeChat,
  setActiveChat,
  messagesMap, setMessagesMap, setMessages,
  setUiMode, uiMode, showSettings, setShowSettings, incomingCall, setIncomingCall,
  callMode, setCallMode, meetingData, setMeetingData
}) {
  const { user: authUser } = useAuth();



  const [chatFilter, setChatFilter] = useState("all");
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [toast, setToast] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [showList, setShowList] = useState(true);
  const [showProfile, setShowProfile] = useState(false);

  const chatId = activeChat?.id;
  const messagesEndRef = useRef(null);
  const messageRefs = useRef({});

  //latestMessage
  const [lastReadMessageId, setLastReadMessageId] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const [mobileView, setMobileView] = useState(window.innerWidth >= 768 ? "messages" : "chatlist");


  const [isMinimized, setIsMinimized] = useState(false);

  const messages = Array.isArray(messagesMap[activeChat?.id])
    ? messagesMap[activeChat?.id]
    : [];

    const hasLoaded = useRef(false);
      const communitiesCache = useRef([]);
    
      const [exploreCommunities, setExploreCommunities] = useState([]);
     
      const [loadingExploring, setLoadingExploring] = useState(false)
    
      const [loading, setLoading] = useState(true);
      const [communities, setCommunities] = useState([]);
    
      const [mobileViewCommunity, setMobileViewCommunity] = useState(window.innerWidth >= 768 ? "communityMessages" : "sidebarCommunitys");
    
  const [activeCommunity,
    setActiveCommunity] =
    useState(null);


    const [
  loadingMessagesCommunity,
  setLoadingMessagesCommunity
  ] = useState(false);
  const [communityMessages,
  setCommunityMessages] =
    useState([]);
  const communitiesCacheRef = useRef({});
  const lastOpenedCommunity = useRef(null);

    const unreadDividerRef =
  useRef(null);

  const communityContainerRef =
  useRef(null);
  const messageCommunityRefs = useRef({});
  const messagesCommunityEndRef = useRef(null);
  const communityMessagesCache = useRef({});

   const [
  firstUnreadMessageId,
  setFirstUnreadMessageId,
] = useState(null);
  
      const openedCommunitiesRef = useRef({});

      const hasUnreadCommunity = communities.some(
        community => community.unread_count > 0
      );

    useEffect(() => {

      if (!communityMessages.length) {
        return;
      }

      const container =
        communityContainerRef.current;

      if (!container) {
        return;
      }

      requestAnimationFrame(() => {

        // first open
        if (firstUnreadMessageId) {

          const el =
            messageCommunityRefs.current[
              firstUnreadMessageId
            ];

          if (el) {

            el.scrollIntoView({
              behavior: "auto",
              block: "center",
            });

            return;
          }
        }

        // reopen
        container.scrollTop =
          container.scrollHeight;

      });

    }, [
      communityMessages,
      firstUnreadMessageId,
    ]);

        
        const openCommunity = async (
        community,
        skipMobile = false,
        forceRefresh = false
      ) => {
      
         const sameCommunity =
        activeCommunity?.id === community.id;
        
        const cached =
          communityMessagesCache.current[
            community.id
          ];

        if (!cached || forceRefresh) {
          // setCommunityMessages([]);
          setFirstUnreadMessageId(null);
        }

        setActiveChat(null); 
      
        setActiveCommunity(community);
      
        lastOpenedCommunity.current = community;
      
        if (window.innerWidth >= 768) {
          setMobileViewCommunity("communityMessages");
        } else if (!skipMobile) {
          setMobileViewCommunity("communityMessages");
        }
       
      
        if (cached && !forceRefresh && cached.messages?.length > 0) {
      
          setCommunityMessages(
            cached.messages
          );
      
          setFirstUnreadMessageId(
            sameCommunity
              ? null
              : cached.firstUnreadMessageId
          );
      
           openedCommunitiesRef.current[
              community.id
            ] = true;

      
          setCommunities(prev =>
            prev.map(c =>
              c.id === community.id
                ? {
                    ...c,
                    unread_count: 0,
                  }
                : c
            )
          );

      
            requestAnimationFrame(() => {

              const container =
                communityContainerRef.current;

              if (
                sameCommunity &&
                container
              ) {

                container.scrollTop =
                  container.scrollHeight;

              }

            });


          if (
            cached.messages.length > 0
          ) {
            api.post(
              `/api/communities/${community.id}/mark-read`
            ).catch(() => {});
          }
      
          return; // 🚀 NO LOADING
        }
      
        setLoadingMessagesCommunity(
          true
        );
      
        try {
      
          const res =
            await api.get(
              `/api/community/${community.id}/messages`
            );
      
          const msgs =
            res.data.messages || [];
      
          const firstUnreadId =
            res.data
              .first_unread_message_id;
      
          /* SAVE CACHE */
      
          communityMessagesCache.current[
            community.id
          ] = {
            messages: msgs,
            firstUnreadMessageId:
              firstUnreadId,
          };
      
          setCommunityMessages(
            msgs
          );
      
          setFirstUnreadMessageId(
            sameCommunity
              ? null
              : firstUnreadId
          );
      

           openedCommunitiesRef.current[
              community.id
            ] = true;

      
          setCommunities(prev => {
      
            const updated =
              prev.map(c =>
                c.id === community.id
                  ? {
                      ...c,
                      unread_count: 0,
                    }
                  : c
              );
      
            communitiesCache.current =
              updated;
      
            return updated;
          });
      
          if (msgs.length > 0) {
      
            api.post(
              `/api/communities/${community.id}/mark-read`
            ).catch(() => {});
          }
      
        } catch (err) {
      
          console.log(err);
      
        } finally {
      
          setLoadingMessagesCommunity(
            false
          );
        }
      }


      useEffect(() => {
    
        fetchCommunities();
        fetchExploreCommunities();
      }, []);
    
    
      const fetchExploreCommunities = async () => {
          setLoadingExploring(true)

        try {
    
          const res = await api.get(
            "/api/communities/explore"
          );
    
          setExploreCommunities(
            res.data.communities || []
          );
    
        } catch (err) {
    
          console.log(err);
    
        }
        finally{
          setLoadingExploring(false)
        }
      };
    
      const fetchCommunities = async () => {
          
      if (
        hasLoaded.current &&
        communitiesCacheRef.current.length
      ) {
        const sorted = [...communitiesCacheRef.current].sort(
          (a, b) =>
            new Date(b.last_activity_at || b.created_at || 0) -
            new Date(a.last_activity_at || a.created_at || 0)
        );

        setCommunities(sorted);
        setLoading(false);

        const lastId = localStorage.getItem("last_opened_community");

        if (
          uiMode === "full" &&
          lastId &&
          window.innerWidth >= 768
        ) {
          const found = sorted.find(
            c => Number(c.id) === Number(lastId)
          );

          if (found) {
            openCommunity(found, true);
          }
        }

        return;
      }
    
      try {
    
        setLoading(true);
    
        const res =
          await api.get(
            "/api/communities"
          );
    
        const data =
          res.data.communities || [];
    
        communitiesCacheRef.current =
          data;
    
        hasLoaded.current = true;
    
        const sorted = [...data].sort(
            (a, b) =>
              new Date(b.last_activity_at || 0) -
              new Date(a.last_activity_at || 0)
          );

          communitiesCacheRef.current = sorted;
          setCommunities(sorted);
    
      } catch (err) {
    
        console.log(err);
    
      } finally {
    
        setLoading(false);
      }
    };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };


  const fetchChats = async () => {

  if (!authUser) return;

  try {

    setLoadingChats(true);

    const res = await api.get("/api/chats");

    const normalized = await Promise.all(

      res.data.map(async (chat) => {

        let latestMessage =
          chat.latest_message || null;

        // ✅ decrypt latest message
        if (
          latestMessage?.message &&
          latestMessage?.iv
        ) {

          try {

            // get chat key
            const chatKey =
              localStorage.getItem(
                `chat_key_${chat.id}`
              );

            if (chatKey) {

              // decrypt
              const decrypted =
                await decryptMessage(
                  latestMessage.message,
                  latestMessage.iv,
                  chatKey
                );

              latestMessage = {
                ...latestMessage,
                message: decrypted,
              };
            }

          } catch (err) {

            console.error(
              "Decrypt latest message failed",
              err
            );

            latestMessage = {
              ...latestMessage,
              message: "Encrypted message",
            };
          }
        }

        return {
          ...chat,

          unread_count: Number(
            chat.unread_count || 0
          ),

          latest_message: latestMessage,

          block_info: chat.block_info
            ? {
                ...chat.block_info,

                blocked_by_me:
                  chat.block_info.blocker_id ===
                  authUser.id,

                blocked_me:
                  chat.block_info.blocked_id ===
                  authUser.id,
              }
            : null,
        };
      })
    );

    const sorted = [...normalized].sort((a, b) => {
      const aTime =
        a.latest_message?.created_at ||
        a.created_at ||
        0;

      const bTime =
        b.latest_message?.created_at ||
        b.created_at ||
        0;

      return new Date(bTime) - new Date(aTime);
    });

    setChats(sorted);
    
  } catch (err) {

    console.error(err);

  } finally {

    setLoadingChats(false);
  }
};

useEffect(() => {

  if (!authUser) return;

  fetchChats();

}, [authUser]);

useEffect(() => {

  if (
    uiMode !== "full" ||
    chats.length === 0
  ) {
    return;
  }

  const lastChatId = localStorage.getItem(
    "last_opened_chat"
  );

  if (!lastChatId) return;

  const foundChat = chats.find(
    chat =>
      Number(chat.id) ===
      Number(lastChatId)
  );

  if (foundChat && !activeChat) {
    openChat(foundChat, false);
  }

}, [chats, uiMode]);


  const [isLargeScreen, setIsLargeScreen] = useState(
    window.innerWidth >= 1024
  );

  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);



const decryptMessages = async (incoming, chatId) => {

  const chatKey = localStorage.getItem(`chat_key_${chatId}`);

  return Promise.all(
    incoming.map(async (msg) => {

      let decrypted = msg;

      // decrypt main message
      if (msg.message && msg.iv) {
        try {
          msg.message = await decryptMessage(
            msg.message,
            msg.iv,
            chatKey
          );
        } catch {}
      }

      // 🔥 decrypt reply message too
      if (msg.replied_to?.message && msg.replied_to?.iv) {
        try {
          msg.replied_to.message = await decryptMessage(
            msg.replied_to.message,
            msg.replied_to.iv,
            chatKey
          );
        } catch {}
      }

      return msg;
    })
  );
};


const messagesCacheRef = useRef({});
const loadingChatRef = useRef(null);
const openedChatsRef = useRef({});

const scrollToMessage = (
  messages,
  lastReadId
) => {

  requestAnimationFrame(() => {

    requestAnimationFrame(() => {

      const container =
        messagesEndRef.current?.parentElement;

      if (!container) return;

      // NO READ ID
      if (!lastReadId) {

        container.scrollTop =
          container.scrollHeight;

        return;
      }

      const firstUnread =
        messages.find(
          msg =>
            Number(msg.id) >
            Number(lastReadId)
        );

      if (
        firstUnread &&
        messageRefs.current[firstUnread.id]
      ) {

        messageRefs.current[
          firstUnread.id
        ].scrollIntoView({
          behavior: "auto",
          block: "center",
        });

        return;
      }

      container.scrollTop =
        container.scrollHeight;

    });

  });

};


const openChat = async (
  chat,
  userTriggered = false,
  forceRefresh = false
) => {

  if (loadingChatRef.current && loadingChatRef.current !== chat.id) {
        loadingChatRef.current = null;
      }

  if (
        loadingChatRef.current === chat.id
      ) {
        return;
      }


    if (isLargeScreen) {
      setMobileView("messages");
    }
    else if (userTriggered) {
      setMobileView("messages");
    }

  const cached =
  messagesCacheRef.current[chat.id];

if (cached && !forceRefresh) {

  setLoadingMessages(false);
  setActiveChat(chat);

  openedChatsRef.current[chat.id] = true;

  if (!isLargeScreen) {
    setShowList(false);
  }

  setMessages(cached);

    localStorage.setItem(
      "last_opened_chat",
      String(chat.id)
    );
    setChats(prev =>
      prev.map(c =>
        c.id === chat.id
          ? {
              ...c,
              unread_count: 0,
            }
          : c
      )
    );
    setLastReadMessageId(
      chat.last_read_message_id ||
      null
    );
    setUnreadCount(
      chat.unread_count || 0
    );
    requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      scrollToMessage(cached, chat.last_read_message_id);
    });
  });
    api.post(
      `/api/chats/${chat.id}/read`
    ).catch(() => {});

    return;
  }
  loadingChatRef.current =
    chat.id;
  setLoadingMessages(true);
  setMessages([]);

  setActiveChat(chat);
  
  if (!isLargeScreen) {
    setShowList(false);
  }
  localStorage.setItem(
  "last_opened_chat",
  String(chat.id)
);
  setChats(prev =>
    prev.map(c =>
      c.id === chat.id
        ? {
            ...c,
            unread_count: 0,
          }
        : c
    )
  );
  try {
    const res = await api.get(
      `/api/chats/${chat.id}/messages`
    );

    if (res.data.chat_key) {
      localStorage.setItem(
        `chat_key_${chat.id}`,
        res.data.chat_key
      );
    }
    const msgs = (
      res.data.messages || []
    ).sort(
      (a, b) => a.id - b.id
    );

    const decrypted =
      await decryptMessages(
        msgs,
        chat.id,
      );

    messagesCacheRef.current[
      chat.id
    ] = decrypted;

    setMessagesMap(prev => ({
      ...prev,
      [chat.id]: decrypted,
    }));

    
    setMessages(decrypted);
    setLastReadMessageId(
      res.data.last_read_message_id
    );
    setUnreadCount(
      res.data.unread_count || 0
    );

    openedChatsRef.current[chat.id] = true;

    scrollToMessage(decrypted, res.data.last_read_message_id);

      setTimeout(() => {

        api.post(
          `/api/chats/${chat.id}/read`
        ).catch(() => {});

      }, 500);

  } catch (err) {
    showToast(
      "Failed to load messages"
    );

  } finally {
    loadingChatRef.current =
      null;
    setLoadingMessages(false);
  }

  
};

  const isNavigatingRef = useRef(false);


useEffect(() => {
  if (!messages.length) return;

  // 🔥 CASE 1: There are unread messages
  if (unreadCount > 0 && lastReadMessageId) {
    const firstUnread = messages.find(
      (m) => m.id > lastReadMessageId
    );

    if (firstUnread) {
      const el = messageRefs.current[firstUnread.id];
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
  }

  // 🔥 CASE 2: No unread → go to bottom
  const lastMsg = messages[messages.length - 1];
  const el = messageRefs.current[lastMsg.id];
  el?.scrollIntoView({ behavior: "smooth" });

}, [messages, unreadCount, lastReadMessageId]);

  const unreadTotal = useMemo(
    () => chats.reduce((sum, c) => sum + (c.unread_count || 0), 0),
    [chats]
  );

  


  return (
    <ChatComponent
      messageRefs={messageRefs} mobileView={mobileView} setMobileView={setMobileView}
      replyingTo={replyingTo}
      setReplyingTo={setReplyingTo}
      chats={chats}
      setChats={setChats}
      activeChat={activeChat}
      setActiveChat={setActiveChat}
      setChatFilter={setChatFilter}
      chatFilter={chatFilter}
      loadingChat={loadingChats}
      loadingMessages={loadingMessages}
      unreadTotal={unreadTotal}
      authUser={authUser}
      isTyping={isTyping}
      setIsTyping={setIsTyping}
      chatId={chatId}
      setShowProfile={setShowProfile}
      showProfile={showProfile}
      setShowList={setShowList}
      showList={showList}
      bottomRef={messagesEndRef}
      setToast={setToast}
      openChat={openChat}
      messages={messages}
      setMessages={(updater) => setMessages(activeChat?.id, updater)}
      unreadCount={unreadCount} setUnreadCount={setUnreadCount}
      lastReadMessageId={lastReadMessageId}
      setLastReadMessageId={setLastReadMessageId}
      messagesCacheRef={messagesCacheRef}
      isNavigatingRef={isNavigatingRef} 
      isMinimized={isMinimized}
      setShowSettings={setShowSettings}
      showSettings={showSettings}
      uiMode={uiMode}
      setIsMinimized={setIsMinimized}
      onSeeAll={() => setUiMode("full")}
      setUiMode={setUiMode} loadingExploring={loadingExploring}
      exploreCommunities={exploreCommunities} loading={loading}
      setCommunities={setCommunities} communities={communities}
      setMobileViewCommunity={setMobileViewCommunity} mobileViewCommunity={mobileViewCommunity} 
      lastOpenedCommunity={lastOpenedCommunity} activeCommunity={activeCommunity}
      setActiveCommunity={setActiveCommunity} loadingMessagesCommunity={loadingMessagesCommunity} 
      setLoadingMessagesCommunity={setLoadingMessagesCommunity} communityMessages={communityMessages} 
      setCommunityMessages={setCommunityMessages} messageCommunityRefs={messageCommunityRefs} 
      messagesCommunityEndRef={messagesCommunityEndRef} firstUnreadMessageId={firstUnreadMessageId} 
      unreadDividerRef={unreadDividerRef} setExploreCommunities={setExploreCommunities}
      openCommunity={openCommunity} communityContainerRef={communityContainerRef}
      incomingCall={incomingCall} setIncomingCall={setIncomingCall}
      meetingData={meetingData} setMeetingData={setMeetingData}
      callMode={callMode} setCallMode={setCallMode} communityMessagesCache={communityMessagesCache}
      hasUnreadCommunity={hasUnreadCommunity}
    />
  );
}