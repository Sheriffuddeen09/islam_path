import {
  useEffect,
  useRef,
  useState
} from "react";

import api from "../../Api/axios";

import CommunityList from "./CommunityList";
import CommunityMessages from "./CommunityMessages";
import CommunitySettings from "./CommunitySettings";

export default function CommunityPage({
  onClose,
  authUser
}) {

  const [
  loadingMessages,
  setLoadingMessages
  ] = useState(false);

  const [loading, setLoading] =
  useState(true);
  const [communities,
    setCommunities] =
    useState([]);
  const [activeCommunity,
    setActiveCommunity] =
    useState(null);

  const [messages,
    setMessages] =
    useState([]);

  const [mobileView, setMobileView] = useState(window.innerWidth >= 768 ? "messages" : "sidebar");

   const hasLoaded = useRef(false);
  const communitiesCache = useRef([]);
  const messagesCache = useRef({});
  const lastOpenedCommunity = useRef(null);

  useEffect(() => {

    fetchCommunities();

  }, []);

  const fetchCommunities = async () => {

  // ✅ USE CACHE
  if (
    hasLoaded.current &&
    communitiesCache.current.length
  ) {

    setCommunities(
      communitiesCache.current
    );

    setLoading(false);

    // ✅ AUTO OPEN LAST CHAT
    const lastId =
      localStorage.getItem(
        "last_opened_community"
      );

    if (lastId) {

      const found =
        communitiesCache.current.find(
          (c) =>
            Number(c.id) ===
            Number(lastId)
        );

      // ✅ ONLY LARGE SCREEN
      if (
        found &&
        window.innerWidth >= 768
      ) {

        openCommunity(
          found,
          true
        );
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

    communitiesCache.current =
      data;

    hasLoaded.current = true;

    setCommunities(data);

    // ✅ AUTO OPEN LAST COMMUNITY
    const lastId =
      localStorage.getItem(
        "last_opened_community"
      );

    if (lastId) {

      const found = data.find(
        (c) =>
          Number(c.id) ===
          Number(lastId)
      );

      if (
        found &&
        window.innerWidth >= 768
      ) {

        openCommunity(
          found,
          true
        );
      }
    }

  } catch (err) {

    console.log(err);

  } finally {

    setLoading(false);
  }
};



  const openCommunity = async (
  community,
  skipMobile = false
) => {

  setActiveCommunity(
    community
  );

  localStorage.setItem(
    "last_opened_community",
    community.id
  );

  lastOpenedCommunity.current =
    community;

  // DESKTOP
  if (
    window.innerWidth >= 768
  ) {

    setMobileView(
      "messages"
    );
  }

  // MOBILE
  else if (!skipMobile) {

    setMobileView(
      "messages"
    );
  }

  // START LOADING
  setLoadingMessages(true);

  // OPTIONAL:
  // clear old messages
  setMessages([]);

  // CACHE
  if (
    messagesCache.current[
      community.id
    ]
  ) {

    setMessages(
      messagesCache.current[
        community.id
      ]
    );

    setLoadingMessages(
      false
    );

    return;
  }

  try {

    const res =
      await api.get(
        `/api/community/${community.id}/messages`
      );

    const msgs =
      res.data.messages || [];

    messagesCache.current[
      community.id
    ] = msgs;

    setMessages(msgs);

  } catch (err) {

    console.log(err);

  } finally {

    // STOP LOADING
    setLoadingMessages(
      false
    );
  }
};


  const openSettings = () => {
    setMobileView(
      "settings"
    );
  };

  const goBack = () => {
    if (
      mobileView === "settings"
    ) {
      setMobileView(
        "messages"
      );
    } else {
      setMobileView(
        "sidebar"
      );
    }
  };

  return (

    <div className="fixed inset-0 z-[9999] bg-[var(--bg-color)] flex overflow-hidden">

      <div className={`
        w-full
        lg:w-[370px]
        ${mobileView === "sidebar"
          ? "flex"
          : "hidden"}
        lg:flex
        flex-col
      `}>

        <CommunityList
          communities={communities}
          activeCommunity={
            activeCommunity
          }
          setActiveCommunity={
            openCommunity
          }
          loading={loading}
          onClose={onClose}
        />

      </div>

      <div className={`
        flex-1
        ${mobileView === "messages"
          ? "flex"
          : "hidden"}
        
        shadow-md
        lg:flex
        flex-col

      `}>

        <CommunityMessages
          authUser={authUser}
          activeCommunity={
            activeCommunity
          }
          messages={messages}

          setMessages={
            setMessages
          }
          onOpenSettings={
            openSettings
          }
          onBack={
            goBack
          }

          loadingMessages={loadingMessages}

        />

      </div>
      <div className={`

        w-full
        lg:w-[370px]
        shadow-md

        ${mobileView === "settings"
          ? "flex"
          : "hidden"}

        lg:flex
        flex-col

      `}>

        <CommunitySettings

          activeCommunity={
            activeCommunity
          }

          // ✅ BACK
          onBack={
            goBack
          }

        />

      </div>

    </div>
  );
}