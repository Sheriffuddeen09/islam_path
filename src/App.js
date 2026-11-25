import { Route, Routes, Outlet } from "react-router-dom";
import LoginPage from "./Form/LoginPage";
import RegisterPage from "./Form/Register";
import HomePage from './pages/homepageComponent/Home'
import NotFound from "./layout/Notfound";
import { Toaster } from "react-hot-toast";
import "react-toastify/dist/ReactToastify.css";
import ForgotPassword from "./Form/ForgetPassword";
import ResetPassword from "./Form/ResetPassword";
import AdminChoice from "./Form/AdminChoice";
import GetMentor from "./pages/mentor/GetMentor";
import TeacherDashboardLayout from "./teacherdashboard/TeacherDashboard";
import {  useCallback, useEffect, useRef, useState } from "react";
import ProtectedRoute from "./ProtectedRoute";
import ReportList from "./report/ReportList";
import ChatReport from "./report/ChatReport";
import StudentAssignment from "./assignment/StudentAssignment";
import StudentExam from "./exam/StudentExam";
import StudentDashboard from "./studentdashboard/StudentDashboard";
import ExpiredPage from "./assignment/ExpiredPage";
import AssignmentBlock from "./assignment/Block";
import ExamBlock from "./exam/Block";
import ProfileRouter from "./route/ProfileRoute";
import StudentAssignmentResult from "./assignment/StudentAssignmentResult";
import StudentExamResult from "./exam/StudentExamResult";
import Navbar from "./layout/Header";
import PostImagePageId from "./pages/post/PostImagePageId";
import PostFeedVideo from "./pages/post/PostFeedVideo";
import PostVideoPageId from "./pages/post/PostVideoPageId";
import PostReelPageId from "./pages/post/PostReelPageId";
import PostTextPageId from "./pages/post/PostTextPageId";
import QuranGrid from "./pages/homepageComponent/QuranGrid";
import Friend from "./pages/friend/Friend";
import api from "./Api/axios";
import Notifications from "./pages/notification/Notifications";
import ChatReportId from "./report/ChatReportId";
import PostReportUser from "./report/PostReportUser";
import CommentReportUser from "./report/CommentReportUser";
import ProductPage from "./pages/sales/Product";
import ProductVisibility from "./pages/sales/ProductVisibility";
import SingleProduct from "./pages/sales/SingleProduct";
import CartPage from "./pages/sales/cart/CartPage";
import WishlistPage from "./pages/sales/cart/WishlishPage";
import JoinGroup from "./chat/chatbox/JoinGroup";
import ThemeLoader from "./layout/ThemeLoader";
import VerifyTwoStep from "./studentdashboard/VerifyTwoStep";
import About from "./pages/about/About";
import JoinCommunity from "./chat/community/JoinCommunity";
import CommunityReportId from "./report/CommunityReportId";
import CommunityReport from "./report/CommunityReport";
import MeetingRoom from "./chat/chatbox/MeetingRoom";
import JobProfileApproval from "./job/JobProfileApproval";
import JobCreatorProfile from "./job/JobCreatorProfile";
import JobFinderProfile from "./job/JobFinderProfile";
import JobInterview from "./job/JobInterview";
import ContactSupport from "./pages/contact/ContactSupport";
import PrivacyPolicy from "./pages/privacy/PrivacyPolicy";
import PendingJobs from "./job/PendingJob";
import Jobs from "./job/Jobs";
import JobDetails from "./job/JobDetails";
import AdminAdvertisementApproval from "./advertisement/AdminAdvertisementApproval";
import SelectAdvertisementVisibility from "./advertisement/SelectAdvertisementVisibility"
import RealtimeListener from "./components/RealtimeListener";
import { useAuth } from "./layout/AuthProvider";
import { decryptMessage } from "./utils/encryption";
   
function App() {

  // Post  teacher

    const [image, setImage] = useState(null);
    const [video, setVideo] = useState(null);
    const [postComments, setPostComments] = useState([])
    const [loading, setLoading] = useState(false)
    const [showUsersPopup, setShowUsersPopup] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [showEmoji, setShowEmoji] = useState(false);
    const [emojiList, setEmojiList] = useState(['❤️','👍','😂','😮','😢','🔥']);
    const [post, setPost] = useState(null);

    const [friendCount, setFriendCount] = useState(0);
    const [homeCount, setHomeCount] = useState(0);
    const [videoCount, setVideoCount] = useState(0);
    const [reelCount, setReelCount] = useState(0);
    const [unreadCount, setUnreadCount] = useState(0);
    const [unreadNotification, setUnreadNotification] = useState(0);

    const [commentsByPost, setCommentsByPost] = useState({});                     
    const [postIdModal, setPostIdModal] = useState(null);
    const [myReels, setMyReels] = useState([]);
    const [reelUsers, setReelUsers] = useState([]);
    const [reelLoading, setReelLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedUserIndex, setSelectedUserIndex] = useState(null);
    const [mediaIndex, setMediaIndex] = useState(0);
    const [selectedReelIndex, setSelectedReelIndex] = useState(0);
    const [showOptions, setShowOptions] = useState(false);
    const [message, setMessage] = useState("");
    const [progress, setProgress] = useState(0);
    const [reaction, setReaction] = useState(null);
    const [open, setOpen] = useState(false);
    const [openReport, setOpenReport] = useState(false)
    const [showImagePicker, setShowImagePicker] = useState(false);
    const [messageOpenShare, setMessageOpenShare,] = useState(false)
    const [shares, setShares] = useState(false);

    const [sending, setSending] = useState(false);

    const [feedLoading, setFeedLoading] = useState(true);
    const [feedRefreshing, setFeedRefreshing] = useState(false);
    const [feedLoaded, setFeedLoaded] = useState(false);

    const [feedProducts, setFeedProducts] = useState([]);
    const [feedReels, setFeedReels] = useState([]);

    const [hasMorePosts, setHasMorePosts] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [loadMoreError, setLoadMoreError] = useState(false);
    const [waitingForNetwork, setWaitingForNetwork] = useState(false);

      const feedSessionRef = useRef(null);
      const nextCursorRef = useRef(0);

      const hasMoreRef = useRef(true);
      const loadingMoreRef = useRef(false);

      const retryWhenOnlineRef = useRef(false);

      const requestVersionRef = useRef(0);


    // Product
    const [products, setProducts] = useState([]);
    const [savedCount, setSavedCount] = useState(0);
    const [orderCount, setOrderCount] = useState(0);
    

    // User
    const [choice, setChoice] = useState(""); 
    const [selected, setSelected] = useState("");  
    const [isLoading, setIsLoading] = useState(false);
    const [loadingAdmin, setLoadingAdmin] = useState(false);
    const [loadingTeacher, setLoadingTeacher] = useState(false);
    const [loadingStudent, setLoadingStudent] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [teachers, setTeachers] = useState([]);
    const [students, setStudents] = useState([]);
    const [admins, setAdmins] = useState([])
    const [incomingRequests, setIncomingRequests] = useState([]);
    const [user, setUser] = useState(null);
    const [videos, setVideos] = useState([]);
    const [posts, setPosts] = useState([]);
    const [requestStatus, setRequestStatus] = useState({});
    const [coursetitles, setCoursetitles] = useState([]);


    // Chat
    const [chats, setChats] = useState([]);
    const [messageOpen, setMessageOpen] = useState(false);
    const [activeChat, setActiveChat] = useState(null);
    const [messagesMap, setMessagesMap] = useState({});
    const [uiMode, setUiMode] = useState("closed"); 
    const [showSettings, setShowSettings] = useState(false);

    const [incomingCall, setIncomingCall] = useState(null);
    const [callMode, setCallMode] = useState(null); 
    const [meetingData, setMeetingData] = useState(null);

    const [pendingCount, setPendingCount] = useState(0);
  
    const [loadingChats, setLoadingChats] = useState(true);



    // Component unreadCount
    const [show, setShow] = useState(false)
    const [jobProfile, setJobProfile] = useState(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showAdvertisement, setShowAdvertisement] = useState(false);
    const [showJobCreate, setShowJobCreate] = useState(false);
    const [loadingJob, setLoadingJob] = useState(false);
    const [jobs, setJobs] = useState([]);
    const [proposals, setProposals] = useState([]);
    const [loadingProposal, setLoadingProposal] = useState(false)

    // Notification

    const [notifications, setNotifications] = useState([]);
    const [loadingNotification, setLoadingNotification] = useState(false);

    const [badges, setBadges] = useState({
      total: 0,
    });

    const { authUser } = useAuth();
 

    
    useEffect(() => {
      api.get("/api/user/badges")
        .then(res => {
          setBadges(res.data);
        })
        .catch(() => {
          setBadges({ total: 0});
        });
    }, []);
    
    
    const markReelViewed = async (reelId) => {
        try {
            await api.post(`/api/reels/${reelId}/view`);
        } catch (error) {
            console.error("Failed to mark reel as viewed:", error);
        }
    };
    const closeViewer = () => {
        setSelectedUserIndex(null);
        setSelectedReelIndex(0);

        setMediaIndex(0);
        setProgress(0);

        setReaction(null);
        setMessage("");

        setShowOptions(false);
    };



    const selectedUser =
        selectedUserIndex !== null
            ? reelUsers[
                  selectedUserIndex
              ]
            : null;

    const selectedReel =
        selectedUser
            ? selectedUser.reels[
                  selectedReelIndex
              ]
            : null;
   
    const nextReel = () => {

    if (
        selectedUserIndex <
        reelUsers.length - 1
    ) {

        const nextUserIndex =
            selectedUserIndex + 1;

        setSelectedUserIndex(
            nextUserIndex
        );

        setSelectedReelIndex(0);

        setMediaIndex(0);

        setProgress(0);

        setReaction(null);

        setMessage("");

        return;
    }


    closeViewer();
};


const previousReel = () => {

    if (mediaIndex > 0) {

        setMediaIndex(
            prev => prev - 1
        );

        setProgress(0);

        return;
    }

    if (selectedReelIndex > 0) {

        setSelectedReelIndex(
            prev => prev - 1
        );

        setMediaIndex(0);

        setReaction(null);
        setMessage("");

        return;
    }

    if (selectedUserIndex > 0) {

        const previousUser =
            reelUsers[
                selectedUserIndex - 1
            ];

        setSelectedUserIndex(
            prev => prev - 1
        );

        setSelectedReelIndex(
            previousUser.reels.length - 1
        );

        setMediaIndex(0);

        setReaction(null);
        setMessage("");
    }
};


         const openUserReels = (userIndex) => {

        setSelectedUserIndex(userIndex);

        setSelectedReelIndex(0);
        setMediaIndex(0);

        setProgress(0);
        setShowOptions(false);

        setMessage("");

        setReaction(null);
    };

        useEffect(() => {
        fetchReels();
        fetchMyReel()
    }, []);

    const fetchReels = async () => {

        try {

            setReelLoading(true);

            const response =
                await api.get(
                    "/api/reels"
                );

            setReelUsers(
                response.data.reels || []
            );

        } catch (error) {

            console.error(
                "REEL FETCH ERROR:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Unable to load reels."
            );

        } finally {

            setReelLoading(false);

        }
    };


    const fetchMyReel = async () => {
    try {

        const response = await api.get("/api/reels");

        setMyReels(
            response.data.my_reels || []
        );


    } catch (error) {
         setError(
                error.response?.data?.message ||
                "Unable to load reels."
            );
    }
  
};

      useEffect(() => {
          fetchJobProfile();
      }, []);
      
        const fetchJobProfile = async () => {
            try {
                const res = await api.get("/api/job-profile");
                setJobProfile(res.data);
            } catch (error) {
                setJobProfile(null);
            }
        };

    

   const togglePopup = () => {
      setUiMode(prev => (prev === "popup" ? "closed" : "popup"));
    };

   

      const setMessages = (chatId, updater) => {
      setMessagesMap(prev => {
        const current = prev[chatId] || [];
    
        const updated =
          typeof updater === "function"
            ? updater(current)
            : updater;
    
        return {
          ...prev,
          [chatId]: updated,
        };
      });
    };
    

    
      
      const fetchPostCounts = async () => {
        const res = await api.get("/api/post-count");
        setHomeCount(res.data.home_count);
        setVideoCount(res.data.video_count);
      };

      
        const fetchReelCounts = async () => {
            try {
                const res = await api.get("/api/reel-count");

                setReelCount(
                    res.data.reel_count || 0
                );

            } catch (error) {
                console.error(
                    "REEL COUNT ERROR:",
                    error
                );
            }
        };


      const fetchFriendCount = async () => {
        const res = await api.get("/api/friend-request-count");
        setFriendCount(res.data.count);
      };

      const fetchUnreadCount = async () => {
        try {
          const res = await api.get("/api/messages/unread-count");
          setUnreadCount(Number(res.data.message || 0));
        } catch (error) {
          console.error("Failed to fetch unread count:", error);
        }
      };

      const fetchUnreadNotification = async () => {
        const res = await api.get('/api/unread-notifications-count');
        setUnreadNotification(res.data.notification);
      };

      // CLEAR ON PAGE LOAD

      const handleFriendClick = async () => {
        if (friendCount > 0) {
          await api.post("/api/friend-request-clear");
          setFriendCount(0);
        }
      };

      const handleHomeClick = async () => {
        if (homeCount > 0) {
          await api.post("/api/clear-home-posts");
          setHomeCount(0);
        }
      };

      const handleVideoClick = async () => {
          
          if (videoCount > 0) {
           await api.post("/api/clear-video-posts");
          setVideoCount(0);
        }
        };

      const handleReelClick = async () => {
          try {

              if (reelCount > 0) {

                  await api.post(
                      "/api/clear-reel-posts"
                  );

                  setReelCount(0);
              }

          } catch (error) {
              console.error(
                  "CLEAR REEL COUNT ERROR:",
                  error
              );
          }
      };

        const handleNotification = async () => {
          
          if (unreadNotification > 0) {
           await api.post("/api/unread-notifications-clear");
          setUnreadNotification(0);
        }
        };

        const handleMessageClick = async () => {
          await api.post("/api/messages/clear-unread");
          setUnreadCount(0);
        };

      // FETCH + POLLING
      useEffect(() => {
        fetchPostCounts();
        fetchUnreadCount();
        fetchFriendCount();
        fetchUnreadNotification()

        fetchReelCounts()

        const interval = setInterval(() => {
          fetchUnreadCount();
          fetchFriendCount();
        }, 8000);

        return () => clearInterval(interval);
      }, []);


    const handleMessageOpen = (studentId) => {
      if (!studentId) return; // ✅ block
      setActiveChat(studentId);
      setMessageOpen(true);
    };


   const handleMessageOpenHeader = async () => {
      setActiveChat(null);
      setMessageOpen(true);

      try {
        await api.post("/api/messages/clear-unread");
      } catch (error) {
        console.log("Failed to mark messages as read");
      }
    };


    const handleVideoCreated = (newVideo) => {
      setVideos((prev) => [newVideo, ...prev]); 
    };

    const handlePostCreated = (newPost) => {
      setPosts((prev) => [newPost, ...prev]); 
    };

    const handleReelCreated = async (newReel) => {
          if (!newReel) return;

          try {
              await Promise.all([
                  fetchReels(),
                  fetchMyReel(),
              ]);
          } catch (error) {
              console.error(
                  "REFRESH REELS ERROR:",
                  error
              );
          }
    };


    
        const fetchAdmin = async () => {
            try {
                const res = await api.get("/api/admin-friend");
    
                const admins = res.data.admins || [];
    
                const sortedAdmins = [...admins].sort(
                    (a, b) =>
                        new Date(b.created_at) -
                        new Date(a.created_at)
                );
    
                setAdmins(sortedAdmins);
    
            } catch (error) {
                console.error("Error fetching admins:", error);
            } finally {
                setLoadingAdmin(false);
            }
        };
    useEffect(() => {
    
        fetchAdmin();
    }, []);


    
      const fetchStudent = async () => {
        try {
          const res = await api.get("/api/student-friend");
    
          const students = res.data.students || [];
    
          // Latest registered student first
          const sortedStudents = [...students].sort(
            (a, b) => new Date(b.created_at) - new Date(a.created_at)
          );
    
          setStudents(sortedStudents);
        } catch (error) {
          console.error("Error fetching students:", error);
        } finally {
          setLoadingStudent(false);
        }
      };
      useEffect(() => {
    
      fetchStudent();
    }, []);


    const fetchJobs = async (category = "", keyword = "") => {
    
        setLoading(true);
    
        try {
    
            const res = await api.get("/api/jobs", {
    
                params: {
    
                    category,
    
                    search: keyword
    
                }
    
            });
    
            setJobs(res.data.jobs.data);
    
        }
    
        finally {
    
            setLoadingJob(false);
    
        }
    
    };

     const fetchNotifications = async () => {
      setLoading(true);

      try {
        const { data } = await api.get("/api/page-notifications");

        setNotifications(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      } finally {
        setLoadingNotification(false);
      }
    };
  useEffect(() => {

    fetchNotifications();
  }, []);


  const fetchTeachers = async () => {
      try {
        setLoadingTeacher(true);

        const res = await api.get("/api/teacher");
        const categoriesRes = await api.get("/api/coursetitles");
  
        const teachers = res.data.teachers || [];
  
        // Latest registered teacher first
        const sortedTeachers = [...teachers].sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
  
        setTeachers(sortedTeachers);
        setCoursetitles(categoriesRes.data || []);
      } catch (error) {
        console.error("Error fetching teachers:", error);
        setTeachers([]);
      } finally {
        setLoadingTeacher(false);
      }
    };

    useEffect(() => {

        fetchTeachers();
      }, []);


   const fetchProposals = async () => {

        try {
            setLoadingProposal(true);

            const res = await api.get("/api/proposals-get");

            setProposals(res.data);
            console.log(res.data);

        } catch (err) {

            console.log(err);

        } finally {

            setLoadingProposal(false);

        }

    };
    
    const fetchFeed = useCallback(
            async (refresh = false, append = false) => {
                if (append) {
                    if (loadingMoreRef.current || !hasMoreRef.current) {
                        return;
                    }
    
                    loadingMoreRef.current = true;
                    retryWhenOnlineRef.current = false;
    
                    setLoadingMore(true);
                    setLoadMoreError(false);
                    setWaitingForNetwork(false);
                } else if (refresh) {
                    
                    requestVersionRef.current += 1;
    
                    feedSessionRef.current = null;
                    nextCursorRef.current = 0;
    
                    hasMoreRef.current = true;
                    retryWhenOnlineRef.current = false;
    
                    setHasMorePosts(true);
                    setLoadMoreError(false);
                    setWaitingForNetwork(false);
                    setFeedRefreshing(true);
                } else {
                    setFeedLoading(true);
                }
    
                const requestVersion = requestVersionRef.current;
    
                try {
                    const params = {};
    
                    if (append) {
                        params.cursor = nextCursorRef.current;
    
                        if (feedSessionRef.current) {
                            params.feed_session = feedSessionRef.current;
                        }
                    } else if (refresh) {
                        params.refresh = 1;
                    }
    
                    console.log("Fetching feed:", {
                        append,
                        refresh,
                        cursor: params.cursor ?? 0,
                        feed_session: params.feed_session ?? null,
                    });
    
                    const response = await api.get("/api/posts-get", {
                        params,
                    });
    
                    if (requestVersion !== requestVersionRef.current) {
                        return;
                    }
    
                    const data = response.data || {};
    
                    const serverPosts = Array.isArray(data.posts)
                        ? data.posts
                        : [];
    
                    const products = Array.isArray(data.products)
                        ? data.products
                        : [];
    
                    // Preserve the existing content filtering. loadFeedReels
                    const filteredPosts = serverPosts.filter((post) => {
                        const hasContent =
                            typeof post?.content === "string"
                                ? post.content.trim() !== ""
                                : Boolean(post?.content);
    
                        const media = Array.isArray(post?.media)
                            ? post.media
                            : [];
    
                        const hasImage = media.some(
                            (item) => item?.type === "image"
                        );
    
                        const hasVideo = media.some(
                            (item) => item?.type === "video"
                        );
    
                        if (hasVideo && !hasContent) {
                            return false;
                        }
    
                        return hasContent || hasImage;
                    });
    
                    // Retain the server-issued session across all pages.
                    if (data.feed_session) {
                        feedSessionRef.current = data.feed_session;
                    }
    
                    if (data.next_cursor !== undefined) {
                        nextCursorRef.current =
                            Number(data.next_cursor) || 0;
                    }
    
                    const moreAvailable = Boolean(data.has_more);
    
                    hasMoreRef.current = moreAvailable;
                    setHasMorePosts(moreAvailable);
    
                    retryWhenOnlineRef.current = false;
                    setWaitingForNetwork(false);
                    setLoadMoreError(false);
    
                    if (append) {
                        setPosts((previousPosts) => {
                            const existing = Array.isArray(previousPosts)
                                ? previousPosts
                                : [];
    
                            const existingIds = new Set(
                                existing.map((post) => String(post.id))
                            );
    
                            const newPosts = filteredPosts.filter(
                                (post) =>
                                    !existingIds.has(String(post.id))
                            );
    
                            return [...existing, ...newPosts];
                        });
                    } else {
                        setPosts(filteredPosts);
                        setFeedProducts(products);
                    }
    
                    setFeedLoaded(true);
    
                    console.log("Feed response:", {
                        append,
                        received: serverPosts.length,
                        displayed: filteredPosts.length,
                        nextCursor: nextCursorRef.current,
                        hasMore: moreAvailable,
                        feedSession: feedSessionRef.current,
                    });
                } catch (err) {
                    if (requestVersion !== requestVersionRef.current) {
                        return;
                    }
    
                    console.error("Feed fetch error:", {
                        message: err?.message,
                        status: err?.response?.status,
                        response: err?.response?.data,
                        cursor: nextCursorRef.current,
                    });
    
                    if (append) {
                        retryWhenOnlineRef.current = true;
    
                        if (!navigator.onLine) {
                            setWaitingForNetwork(true);
                            setLoadMoreError(false);
                        } else {
                            setWaitingForNetwork(false);
                            setLoadMoreError(true);
                        }
                    } else {
                        setFeedLoaded(true);
                    }
                } finally {
                    if (append) {
                        loadingMoreRef.current = false;
                        setLoadingMore(false);
                    } else if (
                        requestVersion === requestVersionRef.current
                    ) {
                        setFeedLoading(false);
                        setFeedRefreshing(false);
                    }
                }
            },
            [setPosts]
        );
    

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
    
  
  return (
    <div className="">
{/*  
 {authUser && (
                <RealtimeListener
                    authUser={authUser}
                    refreshChatList={fetchChats}
                    refreshHeaderCounts={fetchPostCounts}
                    refreshAdminRequests={fetchAdmin}
                    refreshStudentRequests={fetchStudent}
                    refreshMentorRequests={fetchTeachers}
                    refreshProposals={fetchProposals}
                    refreshFeed={fetchFeed}
                    refreshNotifications={fetchNotifications}
                />
            )} */}

   <ThemeLoader />
      <Routes>

      <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentDashboard onCreated={handleVideoCreated} handlePostCreated={handlePostCreated} user={user} setUser={setUser}
              chats={chats} togglePopup={togglePopup} fetchUnreadCount={fetchUnreadCount}
              pendingCount={pendingCount}
              setPendingCount={setPendingCount}
              image={image} setImage={setImage}
              video={video} setVideo={setVideo}
              postComments={postComments} setPostComments={setPostComments} loading={loading} 
              setLoading={setLoading} showUsersPopup={showUsersPopup} setShowUsersPopup={setShowUsersPopup}
              newComment={newComment} setNewComment={setNewComment}
              showEmoji={showEmoji} setShowEmoji={setShowEmoji}
              emojiList={emojiList} setEmojiList={setEmojiList}
              savedCount={savedCount} setSavedCount={setSavedCount}
              setActiveChat={setActiveChat} setMessages={setMessages}
              setChats={setChats}
              activeChat={activeChat}
              messagesMap={messagesMap}
              setMessagesMap={setMessagesMap}
              setUiMode={setUiMode}
              uiMode={uiMode}
              showSettings={showSettings}
              setShowSettings={setShowSettings}
              setCallMode={setCallMode}
              callMode={callMode}
              setIncomingCall={setIncomingCall}
              incomingCall={incomingCall}
              setMeetingData={setMeetingData}
              meetingData={meetingData}
              fetchChats={fetchChats}
              loadingChats={loadingChats}
              commentsByPost={commentsByPost}
              setCommentsByPost={setCommentsByPost}
              reelUsers={reelUsers} openUserReels={openUserReels}
              sending={sending} setSending={setSending} closeViewer={closeViewer} nextReel={nextReel} 
              previousReel={previousReel} selectedReel={selectedReel} selectedUser={selectedUser}
              markReelViewed={markReelViewed} open={open} setOpen={setOpen} openReport={openReport}
              setOpenReport={setOpenReport} showImagePicker={showImagePicker} setShowImagePicker={setShowImagePicker}
              messageOpenShare={messageOpenShare} setMessageOpenShare={setMessageOpenShare}  shares={shares}
              setShares={setShares}
              setMyReels={setMyReels}
              setReelUsers={setReelUsers}
              selectedReelIndex={selectedReelIndex}
              selectedUserIndex={selectedUserIndex}
              setMediaIndex={setMediaIndex}
              mediaIndex={mediaIndex}
              setProgress={setProgress}
              progress={progress}
              setMessage={setMessage}
              message={message}
              setReaction={setReaction}
              reaction={reaction}
              setShowOptions={setShowOptions}
              showOptions={showOptions}
              handleReelCreated={handleReelCreated}
               />
            </ProtectedRoute>
          }
      />
      <Route path="/admin/dashboard" element={
        <ProtectedRoute allowedRoles={["admin"]}>
          <TeacherDashboardLayout 
          fetchProposals={fetchProposals} proposals={proposals} setProposals={setProposals}
          loadingProposal={loadingProposal} setLoadingProposal={setLoadingProposal}
          togglePopup={togglePopup} 
          pendingCount={pendingCount}
          setPendingCount={setPendingCount}
          onCreated={handleVideoCreated} handlePostCreated={handlePostCreated} user={user} setUser={setUser}
          teachers={teachers} setTeachers={setTeachers} chats={chats} 
          image={image} setImage={setImage}
          video={video} setVideo={setVideo}
          postComments={postComments} setPostComments={setPostComments} loading={loading} 
          setLoading={setLoading} showUsersPopup={showUsersPopup} setShowUsersPopup={setShowUsersPopup}
          newComment={newComment} setNewComment={setNewComment}
          showEmoji={showEmoji} setShowEmoji={setShowEmoji}
          emojiList={emojiList} setEmojiList={setEmojiList}
          savedCount={savedCount} setSavedCount={setSavedCount}
          orderCount={orderCount} setOrderCount={setOrderCount}
          onProfileCompleted={setUser}
          setActiveChat={setActiveChat} setMessages={setMessages}
          handleMessageOpen={handleMessageOpen} messageOpen={messageOpen} unreadCount={unreadCount} 
          setUnreadCount={setUnreadCount} friendCount={friendCount} setFriendCount={setFriendCount}
          homeCount={homeCount} setHomeCount={setHomeCount}
          videoCount={videoCount} setVideoCount={setVideoCount}
          fetchUnreadCount={fetchUnreadCount} handleMessageClick={handleMessageClick}
          handleFriendClick={handleFriendClick}
          handleHomeClick={handleHomeClick}
          handleVideoClick={handleVideoClick} handleNotification={handleNotification}
          unreadNotification={unreadNotification}
          setUnreadNotification={setUnreadNotification}
          setMessageOpen={setMessageOpen} activeChat={activeChat}
          setChats={setChats} handleMessageOpenHeader={handleMessageOpenHeader}
          messagesMap={messagesMap}
          setMessagesMap={setMessagesMap}
          setUiMode={setUiMode}
          uiMode={uiMode}
          showSettings={showSettings} 
          setShowSettings={setShowSettings} 
          setCallMode={setCallMode}
          callMode={callMode}
          setIncomingCall={setIncomingCall}
          incomingCall={incomingCall}
          setMeetingData={setMeetingData}
          meetingData={meetingData}
          fetchChats={fetchChats}
          loadingChats={loadingChats}
          commentsByPost={commentsByPost}
          setCommentsByPost={setCommentsByPost}
          reelUsers={reelUsers} openUserReels={openUserReels}
          sending={sending} setSending={setSending} closeViewer={closeViewer} nextReel={nextReel} 
          previousReel={previousReel} selectedReel={selectedReel} selectedUser={selectedUser}
          markReelViewed={markReelViewed} open={open} setOpen={setOpen} openReport={openReport}
          setOpenReport={setOpenReport} showImagePicker={showImagePicker} setShowImagePicker={setShowImagePicker}
          messageOpenShare={messageOpenShare} setMessageOpenShare={setMessageOpenShare}  shares={shares}
          setShares={setShares}
          setMyReels={setMyReels}
          setReelUsers={setReelUsers}
          selectedReelIndex={selectedReelIndex}
          selectedUserIndex={selectedUserIndex}
          setMediaIndex={setMediaIndex}
          mediaIndex={mediaIndex}
          setProgress={setProgress}
          progress={progress}
          setMessage={setMessage}
          message={message}
          setReaction={setReaction}
          reaction={reaction}
          setShowOptions={setShowOptions}
          showOptions={showOptions}
          handleReelCreated={handleReelCreated}
          />
        </ProtectedRoute>
      } />
        
    <Route element={<LayoutWithHeader
          handleReelCreated={handleReelCreated}
          handleMessageOpen={handleMessageOpen}
          messagesMap={messagesMap}
          setMessagesMap={setMessagesMap}
          setUiMode={setUiMode}
          uiMode={uiMode}
          togglePopup={togglePopup}
          showSettings={showSettings}
          setShowSettings={setShowSettings}
          setMessages={setMessages}
          messageOpen={messageOpen}
          activeChat={activeChat}
          chats={chats}
          setChats={setChats}
          setActiveChat={setActiveChat}
          setMessageOpen={setMessageOpen} 
          handleMessageOpenHeader={handleMessageOpenHeader}
          unreadCount={unreadCount} setUnreadCount={setUnreadCount}
          friendCount={friendCount} setFriendCount={setFriendCount}
          homeCount={homeCount} setHomeCount={setHomeCount}
          reelCount={reelCount} setVideoCount={setVideoCount}
          fetchUnreadCount={fetchUnreadCount}
          handleFriendClick={handleFriendClick}
          handleHomeClick={handleHomeClick}
          handleReelClick={handleReelClick}
          handleMessageClick={handleMessageClick}
          handleNotification={handleNotification}
          unreadNotification={unreadNotification}
          setUnreadNotification={setUnreadNotification}
          setCallMode={setCallMode}
          callMode={callMode}
          setIncomingCall={setIncomingCall}
          incomingCall={incomingCall}
          setMeetingData={setMeetingData}
          meetingData={meetingData}
          fetchChats={fetchChats}
          loadingChats={loadingChats}
          jobProfile={jobProfile}
          setJobProfile={setJobProfile}
          fetchJobProfile={fetchJobProfile}
          show={show}
          setShow={setShow}
          showAdvertisement={showAdvertisement} setShowAdvertisement={setShowAdvertisement}
          showJobCreate={showJobCreate} setShowJobCreate={setShowJobCreate}
          handleVideoClick={handleVideoClick} videoCount={videoCount}
          reelUsers={reelUsers} openUserReels={openUserReels}
        sending={sending} setSending={setSending} closeViewer={closeViewer} nextReel={nextReel} 
        previousReel={previousReel} selectedReel={selectedReel} selectedUser={selectedUser}
        markReelViewed={markReelViewed} open={open} setOpen={setOpen} openReport={openReport}
        setOpenReport={setOpenReport} showImagePicker={showImagePicker} setShowImagePicker={setShowImagePicker}
        messageOpenShare={messageOpenShare} setMessageOpenShare={setMessageOpenShare}  shares={shares}
        setShares={setShares}
        setMyReels={setMyReels}
        setReelUsers={setReelUsers}
        selectedReelIndex={selectedReelIndex}
        selectedUserIndex={selectedUserIndex}
        setMediaIndex={setMediaIndex}
        mediaIndex={mediaIndex}
        setProgress={setProgress}
        progress={progress}
        setMessage={setMessage}
        message={message}
        setReaction={setReaction}
        reaction={reaction}
        setShowOptions={setShowOptions}
        showOptions={showOptions}
          />}>

        

      <Route path="/about" element={<About />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/contact-us" element={<ContactSupport />} />

      <Route path="/admin/jobs" element={<ProtectedRoute><PendingJobs /></ProtectedRoute>} />

      <Route
        path="/job-finder"
        element={<ProtectedRoute><Jobs 
        setJobs={setJobs} jobs={jobs} loading={loadingJob} fetchJobs={fetchJobs}
        /></ProtectedRoute>}
        />


        <Route
        path="/job-finder/:id"
        element={<ProtectedRoute><JobDetails/></ProtectedRoute>}
        />

        <Route
        path="/admin/advertisement"
        element={<AdminAdvertisementApproval/>}
        />

        <Route
            path="/advertisement/:id"
            element={<ProtectedRoute>
                <SelectAdvertisementVisibility />
            </ProtectedRoute>}
        />

        <Route
            path="/dashboard/product-visibility"
            element={
            <ProtectedRoute>
            <ProductVisibility />
            </ProtectedRoute>}
        />

      {/* Video */}

       <Route path="/post/video" element={
        <ProtectedRoute>
        <PostFeedVideo posts={posts} setPosts={setPosts} image={image} setImage={setImage}
        video={video} setVideo={setVideo}
        postComments={postComments} setPostComments={setPostComments} loading={loading} 
        setLoading={setLoading} showUsersPopup={showUsersPopup} setShowUsersPopup={setShowUsersPopup}
        newComment={newComment} setNewComment={setNewComment} commentsByPost={commentsByPost}
        setCommentsByPost={setCommentsByPost}
        showEmoji={showEmoji} setShowEmoji={setShowEmoji}
        emojiList={emojiList} setEmojiList={setEmojiList}
        messageOpen={messageOpen}
        setMessageOpen={setMessageOpen}
        chats={chats}
        setChats={setChats}

        handleVideoClick={handleVideoClick}
        videoCount={videoCount}
        jobProfile={jobProfile}
        setJobProfile={setJobProfile}
        fetchJobProfile={fetchJobProfile}
        show={show}
        setShow={setShow}
        showAdvertisement={showAdvertisement} setShowAdvertisement={setShowAdvertisement}
        showJobCreate={showJobCreate} setShowJobCreate={setShowJobCreate}
        reelUsers={reelUsers} openUserReels={openUserReels}
        sending={sending} setSending={setSending} closeViewer={closeViewer} nextReel={nextReel} 
        previousReel={previousReel} selectedReel={selectedReel} selectedUser={selectedUser}
        markReelViewed={markReelViewed} open={open} setOpen={setOpen} openReport={openReport}
        setOpenReport={setOpenReport} showImagePicker={showImagePicker} setShowImagePicker={setShowImagePicker}
        messageOpenShare={messageOpenShare} setMessageOpenShare={setMessageOpenShare}  shares={shares}
        setShares={setShares}
        setMyReels={setMyReels}
        setReelUsers={setReelUsers}
        selectedReelIndex={selectedReelIndex}
        selectedUserIndex={selectedUserIndex}
        setMediaIndex={setMediaIndex}
        mediaIndex={mediaIndex}
        setProgress={setProgress}
        progress={progress}
        setMessage={setMessage}
        message={message}
        setReaction={setReaction}
        reaction={reaction}
        setShowOptions={setShowOptions}
        showOptions={showOptions}
        
         />   
         </ProtectedRoute>
      } />

      <Route path="/get-mentor" element={
        <ProtectedRoute>
          <GetMentor teachers={teachers} setTeachers={setTeachers} setRequestStatus={setRequestStatus}
          requestStatus={requestStatus} loading={loadingTeacher} coursetitles={coursetitles}
          badges={badges} setBadges={setBadges}
          />
        </ProtectedRoute>
      } />


      <Route path="/admin/job-accepted"
        element={
        <ProtectedRoute>
        <JobProfileApproval />
        </ProtectedRoute>
        }
        />

        <Route path="/applicate/job-create"
        element={<JobCreatorProfile />}
        />

        <Route path="/applicate/job-finder"
        element={
        <ProtectedRoute>
        <JobFinderProfile />
        </ProtectedRoute>
        }
        />

      <Route
          path="/job-interview/:token"
          element={
          <ProtectedRoute>
          <JobInterview />
          </ProtectedRoute>}
      />
      
      <Route path="/quran" element={
        <ProtectedRoute>
          <QuranGrid />
        </ProtectedRoute>
      } />
{/* /admin/friend */}
      <Route path="/notifications" element={
        <ProtectedRoute>
          <Notifications handleMessageOpen={handleMessageOpen} 
            jobProfile={jobProfile}
            setJobProfile={setJobProfile}
            fetchJobProfile={fetchJobProfile}
            show={show}
            setShow={setShow}
            showSuccessModal={showSuccessModal} 
            setShowSuccessModal={setShowSuccessModal}
            showAdvertisement={showAdvertisement} setShowAdvertisement={setShowAdvertisement}
            showJobCreate={showJobCreate} setShowJobCreate={setShowJobCreate}
            handleVideoClick={handleVideoClick}
            videoCount={videoCount} setNotifications={setNotifications}
            notifications={notifications} loading={loadingNotification}
            setLoading={setLoadingNotification}
            />

            </ProtectedRoute>
      }  />

      <Route path="/chat/report/:id" element={
        <ProtectedRoute>
        <ChatReportId />
        </ProtectedRoute>} />


      <Route
        path="/community/report/:id"
        element={
        <ProtectedRoute>
        <CommunityReportId />
        </ProtectedRoute>}
      />

      <Route path="/post/report/:postId" element={
        <ProtectedRoute>
        <PostReportUser />
        </ProtectedRoute>} />

      <Route path="/comment/report/:commentId" element={
        <ProtectedRoute>
        <CommentReportUser />
        </ProtectedRoute>} />

      <Route path="/report-list" element={
        <ProtectedRoute>
          <ReportList />
        </ProtectedRoute>
      } />

      {/* /chat/reports */}
      <Route path="/chat/report" element={
        <ProtectedRoute>
          <ChatReport />
        </ProtectedRoute>
      } />

      <Route path="/community/report" element={
        <ProtectedRoute>
          <CommunityReport />
        </ProtectedRoute>
      } />

      <Route path="/online-sale" element={
        <ProtectedRoute>
          <ProductPage products={products} setProducts={setProducts} 
          savedCount={savedCount} setSavedCount={setSavedCount}
          />
        </ProtectedRoute>
      } />

      <Route path="/product/:id" element={
        <ProtectedRoute>
          <SingleProduct products={products} setProducts={setProducts} />
        </ProtectedRoute>
      } />

       <Route path="/cart" element={
        <ProtectedRoute>
          <CartPage savedCount={savedCount} setSavedCount={setSavedCount} />
        </ProtectedRoute>
      } />

      <Route path="/wishlist" element={
        <ProtectedRoute>
          <WishlistPage savedCount={savedCount} setSavedCount={setSavedCount} />
        </ProtectedRoute>
      } />

      <Route path="/friend" element={
        <ProtectedRoute>
          <Friend students={students} setStudents={setStudents} admins={admins} setAdmins={setAdmins}
          incomingRequests={incomingRequests} setIncomingRequests={setIncomingRequests}
          jobProfile={jobProfile}
          setJobProfile={setJobProfile}
          fetchJobProfile={fetchJobProfile}
          show={show}
          setShow={setShow}
          showSuccessModal={showSuccessModal} 
          setShowSuccessModal={setShowSuccessModal}
          showAdvertisement={showAdvertisement} setShowAdvertisement={setShowAdvertisement}
          showJobCreate={showJobCreate} setShowJobCreate={setShowJobCreate}
          handleVideoClick={handleVideoClick} videoCount={videoCount}
          loadingAdmin={loadingAdmin}
          loadingStudent={loadingStudent}


           />
          </ProtectedRoute>
      } />

      <Route
        path="/meeting/:roomId"
        element={
          <ProtectedRoute>
          <MeetingRoom
                activeChat={activeChat}
                setActiveChat={setActiveChat}
                callMode={callMode}
                setCallMode={setCallMode}
                incomingCall={incomingCall}
                setIncomingCall={setIncomingCall}
                meetingData={meetingData}
                setMeetingData={setMeetingData}
            />
            </ProtectedRoute>}
        />
      {/* profile  */}
      <Route path="/profile/:id" element={
        <ProtectedRoute>
        <ProfileRouter 
      togglePopup={togglePopup} setMessages={setMessages} setActiveChat={setActiveChat}
      requestStatus={requestStatus} handleMessageOpen={handleMessageOpen}
      chats={chats} 
      image={image} setImage={setImage} video={video} setVideo={setVideo}
      postComments={postComments} setPostComments={setPostComments} loading={loading} 
      setLoading={setLoading} showUsersPopup={showUsersPopup} setShowUsersPopup={setShowUsersPopup}
      newComment={newComment} setNewComment={setNewComment} commentsByPost={commentsByPost}
      setCommentsByPost={setCommentsByPost}
      showEmoji={showEmoji} setShowEmoji={setShowEmoji}
      emojiList={emojiList} setEmojiList={setEmojiList}
      jobProfile={jobProfile}
      setJobProfile={setJobProfile}
      fetchJobProfile={fetchJobProfile}
      show={show}
      setShow={setShow}
      showAdvertisement={showAdvertisement} setShowAdvertisement={setShowAdvertisement}
      showJobCreate={showJobCreate} setShowJobCreate={setShowJobCreate} user={user}
      openUserReels={openUserReels}
      reelUsers={reelUsers}
      sending={sending} setSending={setSending} closeViewer={closeViewer} nextReel={nextReel} 
      previousReel={previousReel} selectedReel={selectedReel} selectedUser={selectedUser}
      markReelViewed={markReelViewed} open={open} setOpen={setOpen} openReport={openReport}
      setOpenReport={setOpenReport} showImagePicker={showImagePicker} setShowImagePicker={setShowImagePicker}
      messageOpenShare={messageOpenShare} setMessageOpenShare={setMessageOpenShare}  shares={shares}
      setShares={setShares}
      setMyReels={setMyReels}
        setReelUsers={setReelUsers}
        selectedReelIndex={selectedReelIndex}
        selectedUserIndex={selectedUserIndex}
        setMediaIndex={setMediaIndex}
        mediaIndex={mediaIndex}
        setProgress={setProgress}
        progress={progress}
        setMessage={setMessage}
        message={message}
        setReaction={setReaction}
        reaction={reaction}
        setShowOptions={setShowOptions}
        showOptions={showOptions}
      />
      </ProtectedRoute>}
       />

      <Route
        path="/verify-two-step"
        element={<VerifyTwoStep />}
      />

      {/* Forget Password */}
      <Route path="/forget-password" element={
          <ForgotPassword />
      } />

      {/* Forget Password */}
      <Route path="/reset-password" element={
        
          <ResetPassword />
      } />


      
      <Route path="/admin/choose-choice" element={
        <ProtectedRoute>
          <AdminChoice setChoice={setChoice} choice={choice} isLoading={isLoading} setIsLoading={setIsLoading}
          currentUser={currentUser} setCurrentUser={setCurrentUser} selected={selected} setSelected={setSelected}/>
        </ProtectedRoute> } />
    </Route>
    <Route element={<LayoutWithOutHeader />}>
      

      
      {/* Student Assignment */}

      <Route
          path="/student/assignment/:token"
          element={
          <ProtectedRoute>
          <StudentAssignment />
          </ProtectedRoute>}
        />


      <Route path="/student/exams/result/:resultId" element={
        <ProtectedRoute>
        <StudentExamResult />
        </ProtectedRoute>} />
      <Route path="/student/assignment/result/:resultId" element={<StudentAssignmentResult />} />
        

        <Route
          path="/expire"
          element={
          <ProtectedRoute>
          <ExpiredPage />
          </ProtectedRoute>}
        />

         <Route
          path="/block"
          element={
          <ProtectedRoute>
          <AssignmentBlock />
        </ProtectedRoute>}
        />

        <Route
          path="/block"
          element={
          <ProtectedRoute>
          
          <ExamBlock />
           
          </ProtectedRoute>
          }
        />

        
      <Route
          path="/student/exams/:token"
          element={
          <ProtectedRoute>
          <StudentExam />
          </ProtectedRoute>
          }
        />
      
      <Route path="/post/image/:id" element={<PostImagePageId image={image} setImage={setImage}
        video={video} setVideo={setVideo}
        postComments={postComments} setPostComments={setPostComments} loadingComment={loading} 
        setLoading={setLoading} showUsersPopup={showUsersPopup} setShowUsersPopup={setShowUsersPopup}
        newComment={newComment} setNewComment={setNewComment} commentsByPost={commentsByPost}
        setCommentsByPost={setCommentsByPost}
        showEmoji={showEmoji} setShowEmoji={setShowEmoji}
        emojiList={emojiList} setEmojiList={setEmojiList}
        post={post} setPost={setPost} postId={post?.id}
        chats={chats} user={user} postIdModal={postIdModal} 
        setPostIdModal={setPostIdModal}
        />} />

        <Route path="/post/video/:id" element={<PostVideoPageId image={image} setImage={setImage}
        video={video} setVideo={setVideo}
        postComments={postComments} setPostComments={setPostComments} loadingComment={loading} 
        setLoading={setLoading} showUsersPopup={showUsersPopup} setShowUsersPopup={setShowUsersPopup}
        newComment={newComment} setNewComment={setNewComment} commentsByPost={commentsByPost}
        setCommentsByPost={setCommentsByPost}
        showEmoji={showEmoji} setShowEmoji={setShowEmoji}
        emojiList={emojiList} setEmojiList={setEmojiList}
        post={post} setPost={setPost} postId={post?.id}
        chats={chats}

        />} />


        <Route path="/reel/video/:id" element={<PostReelPageId image={image} setImage={setImage}
        video={video} setVideo={setVideo}
        postComments={postComments} setPostComments={setPostComments} loadingComment={loading} 
        setLoading={setLoading} showUsersPopup={showUsersPopup} setShowUsersPopup={setShowUsersPopup}
        newComment={newComment} setNewComment={setNewComment} commentsByPost={commentsByPost}
        setCommentsByPost={setCommentsByPost}
        showEmoji={showEmoji} setShowEmoji={setShowEmoji}
        emojiList={emojiList} setEmojiList={setEmojiList}
        chats={chats}
        />} />

         <Route path="/reel/video" element={
          <ProtectedRoute>
          <PostReelPageId image={image} setImage={setImage}
         video={video} setVideo={setVideo}
        postComments={postComments} setPostComments={setPostComments} loadingComment={loading} 
        setLoading={setLoading} showUsersPopup={showUsersPopup} setShowUsersPopup={setShowUsersPopup}
        newComment={newComment} setNewComment={setNewComment} commentsByPost={commentsByPost}
        setCommentsByPost={setCommentsByPost}
        showEmoji={showEmoji} setShowEmoji={setShowEmoji}
        emojiList={emojiList} setEmojiList={setEmojiList}
        chats={chats}
        />
        </ProtectedRoute>
      } />


         <Route path="/post/text/:id" element={<PostTextPageId image={image} setImage={setImage}
         video={video} setVideo={setVideo}
        postComments={postComments} setPostComments={setPostComments} loadingComment={loading} 
        setLoading={setLoading} showUsersPopup={showUsersPopup} setShowUsersPopup={setShowUsersPopup}
        newComment={newComment} setNewComment={setNewComment} commentsByPost={commentsByPost}
                            setCommentsByPost={setCommentsByPost}
        showEmoji={showEmoji} setShowEmoji={setShowEmoji}
        emojiList={emojiList} setEmojiList={setEmojiList}
        post={post} setPost={setPost} postId={post?.id}
        chats={chats}

        />} />

        <Route path="/invite/group/:token" element={<JoinGroup />} /> 
        <Route path="/invite/community/:token" element={<JoinCommunity/>} /> 

          {/* Home Post Page*/}
      
      <Route path="/" element={
        <ProtectedRoute>
      <HomePage posts={posts} setPosts={setPosts} image={image} setImage={setImage}
      video={video} setVideo={setVideo}
        postComments={postComments} setPostComments={setPostComments} loading={loading} 
        setLoading={setLoading} showUsersPopup={showUsersPopup} setShowUsersPopup={setShowUsersPopup}
        newComment={newComment} setNewComment={setNewComment} commentsByPost={commentsByPost}
        setCommentsByPost={setCommentsByPost}
        showEmoji={showEmoji} setShowEmoji={setShowEmoji}
        emojiList={emojiList} setEmojiList={setEmojiList}
        messageOpen={messageOpen}
        setMessageOpen={setMessageOpen}
        chats={chats}
        setChats={setChats}
        handleMessageOpen={handleMessageOpen} 
        activeChat={activeChat}
        setActiveChat={setActiveChat}
        handleMessageOpenHeader={handleMessageOpenHeader}
        messagesMap={messagesMap}
        setMessagesMap={setMessagesMap}
        setUiMode={setUiMode}
        uiMode={uiMode}
        togglePopup={togglePopup}
        showSettings={showSettings}
        setShowSettings={setShowSettings}
        setMessages={setMessages}
        unreadCount={unreadCount} setUnreadCount={setUnreadCount}
        friendCount={friendCount} setFriendCount={setFriendCount}
        homeCount={homeCount} setHomeCount={setHomeCount}
        videoCount={videoCount} setVideoCount={setVideoCount}
        fetchUnreadCount={fetchUnreadCount}
        handleFriendClick={handleFriendClick}
        handleHomeClick={handleHomeClick}
        handleVideoClick={handleVideoClick}
        handleMessageClick={handleMessageClick}
        handleNotification={handleNotification}
        unreadNotification={unreadNotification}
        setUnreadNotification={setUnreadNotification}
        setCallMode={setCallMode}
        callMode={callMode}
        setIncomingCall={setIncomingCall}
        incomingCall={incomingCall}
        setMeetingData={setMeetingData}
        meetingData={meetingData}
        fetchChats={fetchChats}
        loadingChats={loadingChats}
        jobProfile={jobProfile}
        setJobProfile={setJobProfile}
        fetchJobProfile={fetchJobProfile}
        show={show}
        setShow={setShow}
        showSuccessModal={showSuccessModal} 
        setShowSuccessModal={setShowSuccessModal}
        showAdvertisement={showAdvertisement} setShowAdvertisement={setShowAdvertisement}
        showJobCreate={showJobCreate} setShowJobCreate={setShowJobCreate}
        handlePostCreated={handlePostCreated}
        handleReelCreated={handleReelCreated}
        myReels={myReels}
        setMyReels={setMyReels}
        reelUsers={reelUsers}
        setReelUsers={setReelUsers}
        error={error}
        reelLoading={reelLoading}
        fetchReels={fetchReels}
        fetchMyReel={fetchMyReel}
        openUserReels={openUserReels}
        setSelectedReelIndex={setSelectedReelIndex}
        selectedReelIndex={selectedReelIndex}
        setSelectedUserIndex={setSelectedUserIndex}
        selectedUserIndex={selectedUserIndex}
        setMediaIndex={setMediaIndex}
        mediaIndex={mediaIndex}
        setProgress={setProgress}
        progress={progress}
        setMessage={setMessage}
        message={message}
        setReaction={setReaction}
        reaction={reaction}
        setShowOptions={setShowOptions}
        showOptions={showOptions}
        sending={sending} setSending={setSending} closeViewer={closeViewer} nextReel={nextReel} 
        previousReel={previousReel} selectedReel={selectedReel} selectedUser={selectedUser}
        markReelViewed={markReelViewed} open={open} setOpen={setOpen} openReport={openReport}
        setOpenReport={setOpenReport} showImagePicker={showImagePicker} setShowImagePicker={setShowImagePicker}
        messageOpenShare={messageOpenShare} setMessageOpenShare={setMessageOpenShare}  shares={shares}
        setShares={setShares} fetchFeed={fetchFeed}
        feedLoading={feedLoading} setFeedLoading={setFeedLoading}
        feedRefreshing={feedRefreshing} setFeedRefreshing={setFeedRefreshing}
        feedLoaded={feedLoaded} setFeedLoaded={setFeedLoaded}
        feedProducts={feedProducts} setFeedProducts={setFeedProducts}
        feedReels={feedReels} setFeedReels={setFeedReels}

        hasMorePosts={hasMorePosts} setHasMorePosts={setHasMorePosts}
        loadingMore={loadingMore} setLoadingMore={setLoadingMore}
        loadMoreError={loadMoreError} setLoadMoreError={setLoadMoreError}
        waitingForNetwork={waitingForNetwork} setWaitingForNetwork={setWaitingForNetwork}

        feedSessionRef={feedSessionRef}
        nextCursorRef={nextCursorRef}

        hasMoreRef={hasMoreRef}
        loadingMoreRef={loadingMoreRef}

        retryWhenOnlineRef={retryWhenOnlineRef}
        requestVersionRef={requestVersionRef}

         />   
         </ProtectedRoute>
      } />

        </Route>

      <Route path="/login" element={
        <LoginPage />
      } />
    
       <Route path="/register" element={
        
        <RegisterPage />
       
      } />
      
       <Route path="*" element={<NotFound />} />

      </Routes>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { zIndex: 9999 },
          }}
        />
    </div>
  );
}

export default App;

function LayoutWithHeader({
  handleMessageOpen,
  messageOpen,
  activeChat,
  setActiveChat,
  setMessageOpen,
  chats, 
  setChats,
  handleMessageOpenHeader,
  unreadCount,
  setUnreadCount,
  friendCount,
  setFriendCount,
  homeCount,
  setHomeCount,
  reelCount,
  fetchUnreadCount,
  handleFriendClick,
  handleHomeClick,
  handleReelClick,
  handleMessageClick,
  handleNotification,
  unreadNotification,
  setUnreadNotification,
  messagesMap,
  setMessagesMap,
  setUiMode,
  uiMode,
  togglePopup,
  showSettings,
  setShowSettings,
  meetingData, setMeetingData, 
  callMode, setCallMode, 
  incomingCall, setIncomingCall,
  setMessages, jobProfile, setJobProfile,
  fetchJobProfile, setShow, show,
  showAdvertisement, setShowAdvertisement,
  showJobCreate, setShowJobCreate,
  handleVideoClick, videoCount,
  reelUsers, openUserReels,
  sending, setSending, closeViewer, nextReel, 
  previousReel, selectedReel, selectedUser,
  markReelViewed, open, setOpen, openReport,
  setOpenReport, showImagePicker, setShowImagePicker,
  messageOpenShare, setMessageOpenShare, shares,
  setShares, setMyReels, setReelUsers,
  selectedReelIndex, selectedUserIndex,
  setMediaIndex,
  mediaIndex, setProgress, progress, setMessage,
  message, setReaction, reaction, setShowOptions, showOptions, handleReelCreated,
  fetchChats, loadingChats
}) {
  return (
    <div>
      <Navbar
        fetchChats={fetchChats}
        loadingChats={loadingChats}
        handleVideoClick={handleVideoClick} videoCount={videoCount}
        handleMessageOpen={handleMessageOpen}
        activeChat={activeChat}
        setActiveChat={setActiveChat}
        messageOpen={messageOpen}
        setMessageOpen={setMessageOpen}
        chats={chats}
        setChats={setChats}
        handleMessageOpenHeader={handleMessageOpenHeader}
        unreadCount={unreadCount} setUnreadCount={setUnreadCount}
        friendCount={friendCount} setFriendCount={setFriendCount}
        homeCount={homeCount} setHomeCount={setHomeCount}
        reelCount={reelCount}
        fetchUnreadCount={fetchUnreadCount}
        handleFriendClick={handleFriendClick}
        handleHomeClick={handleHomeClick}
        handleReelClick={handleReelClick}
        handleMessageClick={handleMessageClick}
        handleNotification={handleNotification}
        unreadNotification={unreadNotification}
        setUnreadNotification={setUnreadNotification}
        messagesMap={messagesMap}
        setMessagesMap={setMessagesMap}
        setUiMode={setUiMode}
        uiMode={uiMode}
        togglePopup={togglePopup}
        showSettings={showSettings}
        setShowSettings={setShowSettings}
        setMessages={setMessages}
        setCallMode={setCallMode}
        callMode={callMode}
        setIncomingCall={setIncomingCall}
        incomingCall={incomingCall}
        setMeetingData={setMeetingData}
        meetingData={meetingData}
        jobProfile={jobProfile}
        setJobProfile={setJobProfile}
        fetchJobProfile={fetchJobProfile}
        show={show}
        setShow={setShow}
        showAdvertisement={showAdvertisement} setShowAdvertisement={setShowAdvertisement}
        showJobCreate={showJobCreate} setShowJobCreate={setShowJobCreate}
        reelUsers={reelUsers} openUserReels={openUserReels}
        sending={sending} setSending={setSending} closeViewer={closeViewer} nextReel={nextReel} 
        previousReel={previousReel} selectedReel={selectedReel} selectedUser={selectedUser}
        markReelViewed={markReelViewed} open={open} setOpen={setOpen} openReport={openReport}
        setOpenReport={setOpenReport} showImagePicker={showImagePicker} setShowImagePicker={setShowImagePicker}
        messageOpenShare={messageOpenShare} setMessageOpenShare={setMessageOpenShare}  shares={shares}
        setShares={setShares}
        setMyReels={setMyReels}
        setReelUsers={setReelUsers}
        selectedReelIndex={selectedReelIndex}
        selectedUserIndex={selectedUserIndex}
        setMediaIndex={setMediaIndex}
        mediaIndex={mediaIndex}
        setProgress={setProgress}
        progress={progress}
        setMessage={setMessage}
        message={message}
        setReaction={setReaction}
        reaction={reaction}
        setShowOptions={setShowOptions}
        showOptions={showOptions}
        handleReelCreated={handleReelCreated}
      />

      <Outlet />
    </div>
  );
}


function LayoutWithOutHeader() {

  return (
    <div>
        <Outlet />
    </div>
  )
}