// CommunityPage.jsx

import {
  useEffect,
  useState
} from "react";


import CommunitySidebar from "./CommunitySidebar";

import CommunityMessages from "./CommunityMessages";

import CommunitySettings from "./CommunitySettings";
import api from "../../Api/axios";

export default function CommunityPage({

  onClose

}) {

  const [communities, setCommunities] =
    useState([]);

  const [activeCommunity,
    setActiveCommunity] =
    useState(null);

  const [messages, setMessages] =
    useState([]);

  // ===================================
  // FETCH COMMUNITIES
  // ===================================

  useEffect(() => {

    fetchCommunities();

  }, []);

  const fetchCommunities =
  async () => {

    try {

      const res =
        await api.get(
          "/api/communities"
        );

      setCommunities(
        res.data.communities || []
      );

    } catch (err) {

      console.log(err);
    }
  };

  // ===================================
  // FETCH COMMUNITY MESSAGES
  // ===================================

  const openCommunity =
  async (community) => {

    setActiveCommunity(
      community
    );

    try {

      const res =
        await api.get(
          `/api/community/${community.id}/messages`
        );

      setMessages(
        res.data.messages || []
      );

    } catch (err) {

      console.log(err);
    }
  };

  return (

    <div className="fixed inset-0 z-[9999] bg-[var(--bg-color)] flex">

      {/* LEFT */}
      <CommunitySidebar
        communities={communities}
        activeCommunity={
          activeCommunity
        }
        setActiveCommunity={
          openCommunity
        }
        onClose={onClose}
      />

      {/* MIDDLE */}
      <CommunityMessages
        activeCommunity={
          activeCommunity
        }
        messages={messages}
        setMessages={setMessages}
      />

      {/* RIGHT */}
      <CommunitySettings
        activeCommunity={
          activeCommunity
        }
      />

    </div>
  );
}