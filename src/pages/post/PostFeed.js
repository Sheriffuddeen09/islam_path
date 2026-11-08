
import React, {
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";

import api from "../../Api/axios";

import SidebarRight from "../homepageComponent/SidebarRight";
import SidebarLeft from "../homepageComponent/SideBarLeft";
import Reels from "../reel/Reels";
import ProductFeedBlock from "./ProductFeedBlock";
import PostCard from "./PostCard";
import ReelFeedCard from "./ReelFeedCard";

export default function PostFeed({
    posts,
    setPosts,
    image,
    postComments,
    setPostComments,
    newComment,
    setNewComment,
    showEmoji,
    setShowEmoji,
    emojiList,
    setEmojiList,
    messageOpen,
    setMessageOpen,
    chats,
    setChats,
    loading,
    setLoading,
    setImage,
    setShowUsersPopup,
    showUsersPopup,
    fetchJobProfile,
    show,
    setShow,
    jobProfile,
    setJobProfile,
    showAdvertisement,
    setShowAdvertisement,
    showJobCreate,
    setShowJobCreate,
    handlePostCreated,
    handleReelCreated,
    reelUsers,
    setReelUsers,
    myReels,
    setMyReels,
    videoCount,
    handleVideoClick,
    reelLoading,
    error,
    fetchMyReel,
    fetchReels,
    commentsByPost,
    setCommentsByPost,
    openUserReels,
    setMessage,
    message,
    setSelectedReelIndex,
    selectedReelIndex,
    setSelectedUserIndex,
    selectedUserIndex,
    setProgress,
    progress,
    setMediaIndex,
    mediaIndex,
    setShowOptions,
    showOptions,
    setReaction,
    reaction,
    sending,
    setSending,
    closeViewer,
    nextReel,
    previousReel,
    selectedReel,
    selectedUser,
    markReelViewed,
    open,
    setOpen,
    openReport,
    setOpenReport,
    showImagePicker,
    setShowImagePicker,
    messageOpenShare,
    setMessageOpenShare,
    shares,
    setShares,
    video,
    setVideo,
}) {
    // --------------------------------------------------
    // FEED STATE
    // --------------------------------------------------

    const [feedLoading, setFeedLoading] = useState(true);
    const [feedRefreshing, setFeedRefreshing] = useState(false);
    const [feedLoaded, setFeedLoaded] = useState(false);

    const [feedProducts, setFeedProducts] = useState([]);
    const [feedReels, setFeedReels] = useState([]);

    const [hasMorePosts, setHasMorePosts] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [loadMoreError, setLoadMoreError] = useState(false);
    const [waitingForNetwork, setWaitingForNetwork] = useState(false);

    // --------------------------------------------------
    // PAGINATION REFS loadFeedReels
    // --------------------------------------------------

    const feedSessionRef = useRef(null);
    const nextCursorRef = useRef(0);

    const hasMoreRef = useRef(true);
    const loadingMoreRef = useRef(false);

    const retryWhenOnlineRef = useRef(false);
    const preloadPostRef = useRef(null);

    // Incremented when refreshing to invalidate old requests.
    const requestVersionRef = useRef(0);

    // --------------------------------------------------
    // NORMAL POSTS ONLY
    // --------------------------------------------------

    const normalPosts = (
        Array.isArray(posts) ? posts : []
    ).filter(
        (post) =>
            post?.feed_type !== "reel" &&
            post?.post_type !== "reel"
    );

    // --------------------------------------------------
    // FETCH REELS
    // --------------------------------------------------  reelFeeds

    
const loadFeedReels = useCallback(async () => {
    try {
        const response = await api.get("/api/reels-get");
        const data = response.data;

        console.log("Reels API response:", data);

        // Support the response keys your endpoint may use.
        const result = Array.isArray(data?.posts)
            ? data.posts
            : Array.isArray(data?.reels)
                ? data.reels
                : Array.isArray(data?.data)
                    ? data.data
                    : [];

        const eligibleReels = result.filter((reel) => {
            const isReel =
                reel?.is_reel === true ||
                reel?.is_reel === 1 ||
                reel?.is_reel === "1" ||
                reel?.feed_type === "reel" ||
                reel?.post_type === "reel";

            return Boolean(reel?.id && isReel);
        });

        console.log("Reels found:", result.length);
        console.log("Eligible reels:", eligibleReels.length);
        console.log("First reel:", eligibleReels[0] ?? null);

        setFeedReels(eligibleReels);
    } catch (err) {
        console.error("Failed to load feed reels:", {
            message: err?.message,
            status: err?.response?.status,
            response: err?.response?.data,
        });
    }
}, []);


    useEffect(() => {
        loadFeedReels();
    }, [loadFeedReels]);

    // --------------------------------------------------
    // FETCH PAGINATED FEED
    // --------------------------------------------------

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
                // Invalidate pending requests from the previous feed.
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

    // --------------------------------------------------
    // INITIAL FEED LOAD
    // --------------------------------------------------

    useEffect(() => {
        fetchFeed(false, false);
    }, [fetchFeed]);

    // --------------------------------------------------
    // AUTOMATIC RETRY WHEN INTERNET RETURNS
    // --------------------------------------------------

    useEffect(() => {
        const handleOnline = () => {
            if (!retryWhenOnlineRef.current) return;
            if (loadingMoreRef.current) return;
            if (!hasMoreRef.current) return;

            fetchFeed(false, true);
        };

        const handleOffline = () => {
            if (
                loadingMoreRef.current ||
                retryWhenOnlineRef.current
            ) {
                setWaitingForNetwork(true);
                setLoadMoreError(false);
            }
        };

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, [fetchFeed]);

    // --------------------------------------------------
    // AUTOMATIC PAGINATION
    // --------------------------------------------------

    useEffect(() => {
        if (
            !feedLoaded ||
            feedLoading ||
            feedRefreshing ||
            loadingMore ||
            waitingForNetwork ||
            loadMoreError ||
            !hasMorePosts ||
            normalPosts.length === 0
        ) {
            return;
        }

        let disposed = false;
        let frameId = null;

        const checkForNextPage = () => {
            if (disposed || frameId !== null) return;

            frameId = window.requestAnimationFrame(() => {
                frameId = null;

                if (disposed) return;
                if (loadingMoreRef.current || !hasMoreRef.current) {
                    return;
                }

                if (!navigator.onLine) {
                    retryWhenOnlineRef.current = true;
                    setWaitingForNetwork(true);
                    return;
                }

                const target = preloadPostRef.current;

                if (!target || !target.isConnected) {
                    return;
                }

                const rect = target.getBoundingClientRect();

                const shouldLoad =
                    rect.top <= window.innerHeight + 800 &&
                    rect.bottom >= -800;

                if (shouldLoad) {
                    console.log("Loading next feed page:", {
                        cursor: nextCursorRef.current,
                        feedSession: feedSessionRef.current,
                    });

                    fetchFeed(false, true);
                }
            });
        };

        const target = preloadPostRef.current;

        let observer = null;

        if (target) {
            observer = new IntersectionObserver(
                (entries) => {
                    if (
                        entries.some((entry) => entry.isIntersecting)
                    ) {
                        checkForNextPage();
                    }
                },
                {
                    root: null,
                    rootMargin: "800px 0px",
                    threshold: 0,
                }
            );

            observer.observe(target);
        }

        // Capture scrolls from nested scrollable containers too.
        document.addEventListener("scroll", checkForNextPage, {
            capture: true,
            passive: true,
        });

        window.addEventListener("resize", checkForNextPage);

        // Check immediately after each batch renders.
        checkForNextPage();

        return () => {
            disposed = true;

            if (frameId !== null) {
                window.cancelAnimationFrame(frameId);
            }

            observer?.disconnect();

            document.removeEventListener(
                "scroll",
                checkForNextPage,
                true
            );

            window.removeEventListener("resize", checkForNextPage);
        };
    }, [
        normalPosts.length,
        feedLoaded,
        feedLoading,
        feedRefreshing,
        loadingMore,
        waitingForNetwork,
        loadMoreError,
        hasMorePosts,
        fetchFeed,
    ]);

    // --------------------------------------------------
    // MARK FEED REELS AS VIEWED
    // --------------------------------------------------

    const markReelFeedCardViewed = useCallback(async (reel) => {
        if (!reel?.id) return;

        try {
            await api.post(`/api/feed/reels/${reel.id}/view`);
        } catch (err) {
            console.error("Failed to mark reel as viewed:", err);
        }
    }, []);

    // --------------------------------------------------
    // REFRESH FEED
    // --------------------------------------------------

    const handleFeedRefresh = useCallback(async () => {
        if (
            feedRefreshing ||
            feedLoading ||
            loadingMoreRef.current
        ) {
            return;
        }

        await fetchFeed(true, false);

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });

        loadFeedReels();
    }, [
        feedRefreshing,
        feedLoading,
        fetchFeed,
        loadFeedReels,
    ]);

    // --------------------------------------------------
    // EMPTY FEED
    // --------------------------------------------------

    const renderNoFeedPosts = () => {
        if (!feedLoaded || normalPosts.length > 0) {
            return null;
        }

        return (
            <div className="flex w-full flex-col items-center justify-center px-4 py-20 text-center">
                <p className="text-xl font-bold">
                    No Feed Post Available
                </p>

                <p className="mt-2 text-sm opacity-70">
                    Try refreshing to check for new posts.
                </p>

                <button
                    type="button"
                    onClick={handleFeedRefresh}
                    disabled={feedRefreshing || feedLoading}
                    className="mt-4 flex min-w-[160px] items-center justify-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {feedRefreshing ? "Refreshing" : "Refresh Feed"}
                </button>
            </div>
        );
    };

    // --------------------------------------------------
    // FEED END / LOADING / RETRY
    // --------------------------------------------------

    const renderFeedEnd = () => {
        if (!feedLoaded) return null;

        if (loadingMore || waitingForNetwork) {
            return (
                <div className="w-full space-y-3 py-3">
                    {[1].map((item) => (
                        <div
                            key={item}
                            className="w-full animate-pulse space-y-3 rounded-xl p-3"
                        >
                            <div className="h-10 w-2/3 rounded-lg bg-gray-200 dark:bg-gray-800" />
                            <div className="h-4 w-1/2 rounded bg-gray-200 dark:bg-gray-800" />
                            <div className="h-48 w-full rounded-lg bg-gray-200 dark:bg-gray-800" />
                            <div className="h-5 w-4/5 rounded bg-gray-200 dark:bg-gray-800" />
                        </div>
                    ))}
                </div>
            );
        }

        if (loadMoreError && hasMorePosts) {
            return (
                <div className="flex w-full flex-col items-center gap-3 px-4 py-8">
                    <p className="text-center text-sm">
                        Could not load more posts. Check your connection.
                    </p>

                    <button
                        type="button"
                        onClick={() => fetchFeed(false, true)}
                        disabled={loadingMore}
                        className="font-semibold transition   disabled:opacity-50"
                    >
                        Retry
                    </button>
                </div>
            );
        }

        if (!hasMorePosts && normalPosts.length > 0) {
            return (
                <div className="w-full px-4 pb-3 text-center">
                    <p className="text-sm">
                        You have reached the end of the feed.
                    </p>

                    <button
                        type="button"
                        onClick={handleFeedRefresh}
                        disabled={feedRefreshing || feedLoading}
                        className="font-semibold transition disabled:opacity-50"
                    >
                        {feedRefreshing ? "Refreshing" : "Refresh Feed"}
                    </button>
                </div>
            );
        }

        return null;
    };

    // --------------------------------------------------
    // REELS COMPONENT
    // --------------------------------------------------

    const renderReels = () => (
        <Reels
            error={error}
            reelLoading={reelLoading}
            fetchReels={fetchReels}
            fetchMyReel={fetchMyReel}
            chats={chats}
            handlePostCreated={handlePostCreated}
            handleReelCreated={handleReelCreated}
            myReels={myReels}
            setMyReels={setMyReels}
            reelUsers={reelUsers}
            setReelUsers={setReelUsers}
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
            sending={sending}
            setSending={setSending}
            closeViewer={closeViewer}
            nextReel={nextReel}
            previousReel={previousReel}
            selectedReel={selectedReel}
            selectedUser={selectedUser}
            markReelViewed={markReelViewed}
            open={open}
            setOpen={setOpen}
            openReport={openReport}
            setOpenReport={setOpenReport}
            showImagePicker={showImagePicker}
            setShowImagePicker={setShowImagePicker}
            messageOpenShare={messageOpenShare}
            setMessageOpenShare={setMessageOpenShare}
            shares={shares}
            setShares={setShares}
        />
    );

    // --------------------------------------------------
    // RENDER POSTS
    // --------------------------------------------------

    const renderFeedPosts = () => (
        <>
            {normalPosts.map((post, index) => {
                const preloadIndex = Math.max(
                    normalPosts.length - 4,
                    0
                );

                const shouldPreload = index === preloadIndex;

                
                const REEL_INTERVAL = 15;

                const reelIndex =
                    Math.floor((index + 1) / REEL_INTERVAL) - 1;

                const reelToShow =
                    (index + 1) % REEL_INTERVAL === 0
                        ? feedReels[reelIndex] ?? null
                        : null;

                return (
                    <React.Fragment key={post.id}>
                        <div
                            ref={shouldPreload ? preloadPostRef : null}
                            className="flex w-full justify-center"
                        >
                            <PostCard
                                post={post}
                                setPosts={setPosts}
                                video={video}
                                setVideo={setVideo}
                                image={image}
                                setImage={setImage}
                                showUsersPopup={showUsersPopup}
                                setShowUsersPopup={setShowUsersPopup}
                                newComment={newComment}
                                setNewComment={setNewComment}
                                showEmoji={showEmoji}
                                setShowEmoji={setShowEmoji}
                                emojiList={emojiList}
                                setEmojiList={setEmojiList}
                                commentsByPost={commentsByPost}
                                setCommentsByPost={setCommentsByPost}
                                postComments={postComments}
                                setPostComments={setPostComments}
                                reelUsers={reelUsers}
                                openUserReels={openUserReels}
                                loading={loading}
                                setLoading={setLoading}
                                messageOpen={messageOpen}
                                setMessageOpen={setMessageOpen}
                                chats={chats}
                                setChats={setChats}
                            />
                        </div>

                        {reelToShow && (
                            <div
                                key={`feed-reel-${reelToShow.id}`}
                                className="flex w-full justify-center"
                            >
                                <ReelFeedCard
                                    reel={reelToShow}
                                    onImpression={markReelFeedCardViewed}
                                    onClick={() =>
                                        openUserReels(reelToShow)
                                    }
                                />
                            </div>
                        )}

                        {index === 9 && feedProducts.length > 0 && (
                            <ProductFeedBlock products={feedProducts} />
                        )}
                    </React.Fragment>
                );
            })}

            {renderFeedEnd()}
        </>
    );

    // --------------------------------------------------
    // INITIAL LOADING  reelIndex
    // --------------------------------------------------

    if (feedLoading && !feedLoaded) {
        return <FeedSkeleton />;
    }

    // --------------------------------------------------
    // DESKTOP / LARGE SCREEN
    // --------------------------------------------------

    const largeScreen = (
        <div className="block md:hidden lg:block">
            <div className="mx-auto flex min-h-screen flex-col items-center justify-center bg-[var(--bg-color)] text-[var(--text-color)] lg:flex-row">
                <SidebarLeft
                    handleVideoClick={handleVideoClick}
                    videoCount={videoCount}
                    jobProfile={jobProfile}
                    setJobProfile={setJobProfile}
                    fetchJobProfile={fetchJobProfile}
                    show={show}
                    setShow={setShow}
                    showAdvertisement={showAdvertisement}
                    setShowAdvertisement={setShowAdvertisement}
                    showJobCreate={showJobCreate}
                    setShowJobCreate={setShowJobCreate}
                />

                <div className="mx-auto flex flex-1 flex-col items-center justify-start gap-3 p-4 transition-all">
                    {renderReels()}
                    {renderNoFeedPosts()}
                    {renderFeedPosts()}
                </div>

                <SidebarRight />
            </div>
        </div>
    );

    // --------------------------------------------------
    // TABLET / IPAD
    // --------------------------------------------------

    const ipadScreen = (
        <div className="hidden md:block lg:hidden">
            <div className="mx-auto flex min-h-screen flex-col items-start bg-[var(--bg-color)] text-[var(--text-color)]">
                <SidebarRight />

                <div className="relative ml-4 mt-28 flex-1 flex-col gap-4 p-4 transition-all">
                    {renderReels()}
                    {renderNoFeedPosts()}
                    {renderFeedPosts()}
                </div>
            </div>
        </div>
    );

    return (
        <div>
            {largeScreen}
            {ipadScreen}
        </div>
    );
}

// main
const FeedSkeleton = () => {
    return (
        <div
            className="
                w-full
                max-w-full
                min-w-0
                min-h-screen
                overflow-x-hidden
                sm:pt-20
                pt-14
            "
        >

            <div
                className="
                    w-full
                    max-w-full
                    min-w-0
                    mx-auto
                    px-2
                    sm:px-4
                    lg:px-6
                    py-4
                    overflow-x-hidden
                "
            >

                <div
                    className="
                        grid
                        w-full
                        max-w-full
                        min-w-0
                        grid-cols-1
                        sm:grid-cols-[220px_minmax(0,1fr)]
                        lg:grid-cols-[240px_minmax(0,1fr)_280px]
                        gap-4
                        lg:gap-6
                    "
                >

                    
                    <aside
                        className="
                            hidden
                            sm:block
                            min-w-0
                            max-w-full
                        "
                    >

                        <div
                            className="
                                sticky
                                top-4
                                space-y-4
                                animate-pulse
                                min-w-0
                            "
                        >

                            {/* PROFILE */}

                            <div
                                className="
                                    w-full
                                    max-w-full
                                    min-w-0
                                    rounded-2xl
                                    border
                                    border-gray-200
                                    dark:border-gray-800
                                    bg-[var(--bg-color)]
                                    p-4
                                "
                            >

                                <div
                                    className="
                                        flex
                                        items-center
                                        gap-3
                                        min-w-0
                                    "
                                >

                                    <div
                                        className="
                                            w-12
                                            h-12
                                            rounded-full
                                            bg-gray-200
                                            dark:bg-gray-700
                                            shrink-0
                                        "
                                    />

                                    <div
                                        className="
                                            flex-1
                                            min-w-0
                                            space-y-2
                                        "
                                    >

                                        <div
                                            className="
                                                h-3
                                                w-24
                                                max-w-full
                                                rounded
                                                bg-gray-200
                                                dark:bg-gray-700
                                            "
                                        />

                                        <div
                                            className="
                                                h-2
                                                w-16
                                                max-w-full
                                                rounded
                                                bg-gray-200
                                                dark:bg-gray-700
                                            "
                                        />

                                    </div>

                                </div>

                            </div>


                            {/* MENU */}

                            <div
                                className="
                                    w-full
                                    max-w-full
                                    min-w-0
                                    rounded-2xl
                                    border
                                    border-gray-200
                                    dark:border-gray-800
                                    bg-[var(--bg-color)]
                                    p-3
                                "
                            >

                                <div className="space-y-4">

                                    {Array.from({
                                        length: 7,
                                    }).map((_, index) => (

                                        <div
                                            key={index}
                                            className="
                                                flex
                                                items-center
                                                gap-3
                                                px-2
                                                min-w-0
                                            "
                                        >

                                            <div
                                                className="
                                                    w-9
                                                    h-9
                                                    rounded-lg
                                                    bg-gray-200
                                                    dark:bg-gray-700
                                                    shrink-0
                                                "
                                            />

                                            <div
                                                className="
                                                    h-3
                                                    flex-1
                                                    min-w-0
                                                    rounded
                                                    bg-gray-200
                                                    dark:bg-gray-700
                                                "
                                            />

                                        </div>

                                    ))}

                                </div>

                            </div>

                        </div>

                    </aside>


                    {/* ==================================================
                        MAIN FEED
                    ================================================== */}

                     <div
                        className="
                            w-full
                            max-w-full
                            min-w-0
                            overflow-x-hidden
                            sm:pt-0
                            pt-10 no-scrollbar
                        "
                    >
                        {Array.from({
                            length: 3,
                        }).map((_, index) => (

                            <div
                                key={index}
                                className="
                                    w-full
                                    max-w-full
                                    min-w-0
                                    mb-5
                                    rounded-2xl
                                    overflow-hidden
                                    border
                                    border-gray-200
                                    dark:border-gray-800
                                    bg-[var(--bg-color)]
                                    animate-pulse no-scrollbar
                                "
                            >


                                <div
                                    className="
                                        flex
                                        items-center
                                        gap-3
                                        p-4
                                        min-w-0
                                    "
                                >

                                    <div
                                        className="
                                            w-11
                                            h-11
                                            rounded-full
                                            bg-gray-200
                                            dark:bg-gray-700
                                            shrink-0
                                        "
                                    />

                                    <div
                                        className="
                                            flex-1
                                            min-w-0
                                            space-y-2
                                        "
                                    >

                                        <div
                                            className="
                                                h-3
                                                w-32
                                                max-w-full
                                                rounded
                                                bg-gray-200
                                                dark:bg-gray-700
                                            "
                                        />

                                        <div
                                            className="
                                                h-2
                                                w-20
                                                max-w-full
                                                rounded
                                                bg-gray-200
                                                dark:bg-gray-700
                                            "
                                        />

                                    </div>

                                    <div
                                        className="
                                            w-8
                                            h-8
                                            rounded-full
                                            bg-gray-200
                                            dark:bg-gray-700
                                            shrink-0
                                        "
                                    />

                                </div>



                                <div
                                    className="
                                        w-full
                                        max-w-full
                                        min-w-0
                                        px-4
                                        pb-4
                                        space-y-2
                                    "
                                >

                                    <div
                                        className="
                                            h-3
                                            w-full
                                            max-w-full
                                            rounded
                                            bg-gray-200
                                            dark:bg-gray-700
                                        "
                                    />

                                    <div
                                        className="
                                            h-3
                                            w-5/6
                                            max-w-full
                                            rounded
                                            bg-gray-200
                                            dark:bg-gray-700
                                        "
                                    />

                                    <div
                                        className="
                                            h-3
                                            w-2/3
                                            max-w-full
                                            rounded
                                            bg-gray-200
                                            dark:bg-gray-700
                                        "
                                    />

                                </div>



                                <div
                                    className="
                                        w-full
                                        max-w-full
                                        h-[320px]
                                        sm:h-[420px]
                                        bg-gray-200
                                        dark:bg-gray-700
                                    "
                                />



                                <div
                                    className="
                                        flex
                                        items-center
                                        justify-between
                                        gap-3
                                        p-4
                                        min-w-0
                                        max-w-full
                                    "
                                >

                                    <div
                                        className="
                                            flex
                                            items-center
                                            gap-2
                                            sm:gap-4
                                            min-w-0
                                            overflow-hidden
                                        "
                                    >

                                        {[1, 2, 3].map(
                                            (button) => (

                                                <div
                                                    key={button}
                                                    className="
                                                        h-8
                                                        w-14
                                                        sm:w-16
                                                        rounded-lg
                                                        bg-gray-200
                                                        dark:bg-gray-700
                                                        shrink-0
                                                    "
                                                />

                                            )
                                        )}

                                    </div>

                                    <div
                                        className="
                                            w-8
                                            h-8
                                            rounded-full
                                            bg-gray-200
                                            dark:bg-gray-700
                                            shrink-0
                                        "
                                    />

                                </div>

                            </div>

                        ))}
                            
                    </div>


                  

                    <aside
                        className="
                            hidden
                            lg:block
                            min-w-0
                            max-w-full
                            overflow-hidden
                        "
                    >

                        <div
                            className="
                                sticky
                                top-4
                                space-y-4
                                animate-pulse
                                min-w-0
                            "
                        >

                            {/* SEARCH */}

                            <div
                                className="
                                    h-11
                                    w-full
                                    max-w-full
                                    rounded-xl
                                    bg-gray-200
                                    dark:bg-gray-700
                                "
                            />


                            {/* PEOPLE */}

                            <div
                                className="
                                    w-full
                                    max-w-full
                                    min-w-0
                                    rounded-2xl
                                    border
                                    border-gray-200
                                    dark:border-gray-800
                                    bg-[var(--bg-color)]
                                    p-4
                                "
                            >

                                <div
                                    className="
                                        h-4
                                        w-32
                                        max-w-full
                                        rounded
                                        bg-gray-200
                                        dark:bg-gray-700
                                        mb-5
                                    "
                                />

                                <div className="space-y-5">

                                    {Array.from({
                                        length: 5,
                                    }).map((_, index) => (

                                        <div
                                            key={index}
                                            className="
                                                flex
                                                items-center
                                                gap-3
                                                min-w-0
                                            "
                                        >

                                            <div
                                                className="
                                                    w-10
                                                    h-10
                                                    rounded-full
                                                    bg-gray-200
                                                    dark:bg-gray-700
                                                    shrink-0
                                                "
                                            />

                                            <div
                                                className="
                                                    flex-1
                                                    min-w-0
                                                    space-y-2
                                                "
                                            >

                                                <div
                                                    className="
                                                        h-3
                                                        w-24
                                                        max-w-full
                                                        rounded
                                                        bg-gray-200
                                                        dark:bg-gray-700
                                                    "
                                                />

                                                <div
                                                    className="
                                                        h-2
                                                        w-16
                                                        max-w-full
                                                        rounded
                                                        bg-gray-200
                                                        dark:bg-gray-700
                                                    "
                                                />

                                            </div>

                                            <div
                                                className="
                                                    w-14
                                                    h-7
                                                    rounded-lg
                                                    bg-gray-200
                                                    dark:bg-gray-700
                                                    shrink-0
                                                "
                                            />

                                        </div>

                                    ))}

                                </div>

                            </div>


                            {/* SECOND RIGHT CARD */}

                            <div
                                className="
                                    w-full
                                    max-w-full
                                    min-w-0
                                    rounded-2xl
                                    border
                                    border-gray-200
                                    dark:border-gray-800
                                    bg-[var(--bg-color)]
                                    p-4
                                "
                            >

                                <div
                                    className="
                                        h-4
                                        w-28
                                        max-w-full
                                        rounded
                                        bg-gray-200
                                        dark:bg-gray-700
                                        mb-5
                                    "
                                />

                                <div className="space-y-3">

                                    {Array.from({
                                        length: 4,
                                    }).map((_, index) => (

                                        <div
                                            key={index}
                                            className="
                                                h-3
                                                w-full
                                                max-w-full
                                                rounded
                                                bg-gray-200
                                                dark:bg-gray-700
                                            "
                                        />

                                    ))}

                                </div>

                            </div>

                        </div>

                    </aside>

                </div>

            </div>

        </div>
    );
};