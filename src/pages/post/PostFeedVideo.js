
import React, {
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";

import api from "../../Api/axios";

import PostCardVideo from "./PostCardVideo";
import ProductFeedBlock from "./ProductFeedBlock";

import SidebarLeft from "../homepageComponent/SideBarLeft";
import SidebarRight from "../homepageComponent/SidebarRight";


export default function PostFeedVideo({
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
    videoCount,
    handleVideoClick,
    commentsByPost,
    setCommentsByPost,
    reelUsers,
    openUserReels,
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
    setMyReels,
    setReelUsers,
    selectedReelIndex,
    selectedUserIndex,
    setMediaIndex,
    mediaIndex,
    setProgress,
    progress,
    setMessage,
    message,
    setReaction,
    reaction,
    setShowOptions,
    showOptions,
    video,
    setVideo,
}) {
     
    const [feedLoading, setFeedLoading] = useState(false);
    const [feedRefreshing, setFeedRefreshing] = useState(false);
    const [feedLoaded, setFeedLoaded] = useState(false);

    const [feedProducts, setFeedProducts] = useState([]);

    const [feedEnded, setFeedEnded] = useState(false);

    // --------------------------------------------------
    // PAGINATION STATES
    // --------------------------------------------------

    const [hasMorePosts, setHasMorePosts] = useState(true);

    const [loadingMore, setLoadingMore] = useState(false);

    const [loadMoreError, setLoadMoreError] = useState(false);

    const [waitingForNetwork, setWaitingForNetwork] = useState(false);

    // --------------------------------------------------
    // PAGINATION REFS
    // --------------------------------------------------

    const feedSessionRef = useRef(null);

    const nextCursorRef = useRef(0);

    const hasMoreRef = useRef(true);

    const loadingMoreRef = useRef(false);

    const retryWhenOnlineRef = useRef(false);

    const requestVersionRef = useRef(0);

    // Last video / pagination observer.
    const lastVideoRef = useRef(null);

    // --------------------------------------------------
    // FETCH VIDEO FEED
    // --------------------------------------------------

    const fetchPosts = useCallback(
        async (isRefresh = false, isLoadMore = false) => {

            // --------------------------------------------------
            // LOAD MORE
            // --------------------------------------------------

            if (isLoadMore) {

                if (
                    loadingMoreRef.current ||
                    !hasMoreRef.current
                ) {
                    return;
                }

                if (!navigator.onLine) {

                    retryWhenOnlineRef.current = true;

                    setWaitingForNetwork(true);

                    return;
                }

                loadingMoreRef.current = true;

                setLoadingMore(true);

                setLoadMoreError(false);

                setWaitingForNetwork(false);

            }

            // --------------------------------------------------
            // REFRESH
            // --------------------------------------------------

            else if (isRefresh) {

                // Invalidate previous requests.
                requestVersionRef.current++;

                // Reset pagination.
                nextCursorRef.current = 0;

                feedSessionRef.current = null;

                hasMoreRef.current = true;

                loadingMoreRef.current = false;

                retryWhenOnlineRef.current = false;

                setHasMorePosts(true);

                setLoadingMore(false);

                setLoadMoreError(false);

                setWaitingForNetwork(false);

                setFeedEnded(false);

                setFeedRefreshing(true);

            }

            // --------------------------------------------------
            // INITIAL LOAD
            // --------------------------------------------------

            else {

                setFeedLoading(true);
            }

            const requestVersion = requestVersionRef.current;

            const cursor = isLoadMore
                ? nextCursorRef.current
                : 0;

            try {

                // --------------------------------------------------
                // API REQUEST
                // --------------------------------------------------

                const res = await api.get("/api/posts-get", {
                    params: {
                        cursor,

                        ...(feedSessionRef.current
                            ? {
                                feed_session: feedSessionRef.current,
                            }
                            : {}),

                        ...(isRefresh
                            ? {
                                refresh: 1,
                            }
                            : {}),
                    },
                });

                // Ignore outdated requests.
                if (
                    requestVersion !== requestVersionRef.current
                ) {
                    return;
                }

                // --------------------------------------------------
                // RESPONSE POSTS
                // --------------------------------------------------

                const responsePosts = Array.isArray(
                    res.data?.posts
                )
                    ? res.data.posts
                    : [];

                // --------------------------------------------------
                // PRODUCTS
                // --------------------------------------------------

                const products = Array.isArray(
                    res.data?.products
                )
                    ? res.data.products
                    : [];

                // Preserve your existing product behavior.
                if (!isLoadMore) {
                    setFeedProducts(products);
                }

                // --------------------------------------------------
                // FILTER VIDEO POSTS ONLY
                // --------------------------------------------------

                const videoPosts = responsePosts.filter(
                    (post) => {

                        const hasVideo =
                            Array.isArray(post?.media) &&
                            post.media.some(
                                (media) =>
                                    media?.type === "video"
                            );

                        return hasVideo;
                    }
                );

                // --------------------------------------------------
                // FEED SESSION
                // --------------------------------------------------

                if (res.data?.feed_session) {

                    feedSessionRef.current =
                        res.data.feed_session;
                }

                // --------------------------------------------------
                // PAGINATION INFORMATION
                // --------------------------------------------------

                const moreAvailable =
                    Boolean(res.data?.has_more);

                const nextCursor =
                    res.data?.next_cursor;

                nextCursorRef.current =
                    nextCursor ?? (
                        cursor + responsePosts.length
                    );

                hasMoreRef.current = moreAvailable;

                setHasMorePosts(moreAvailable);

                setFeedEnded(!moreAvailable);

                // --------------------------------------------------
                // INITIAL LOAD / REFRESH
                // --------------------------------------------------

                if (!isLoadMore) {

                    setPosts(videoPosts);

                }

                // --------------------------------------------------
                // APPEND NEXT PAGE
                // --------------------------------------------------

                else {

                    setPosts((previousPosts) => {

                        const existingIds = new Set(
                            previousPosts.map(
                                (post) => post.id
                            )
                        );

                        const newVideos = videoPosts.filter(
                            (post) => {

                                return !existingIds.has(
                                    post.id
                                );

                            }
                        );

                        return [
                            ...previousPosts,
                            ...newVideos,
                        ];
                    });

                }

                // --------------------------------------------------
                // SUCCESS
                // --------------------------------------------------

                setFeedLoaded(true);

                retryWhenOnlineRef.current = false;

                setLoadMoreError(false);

                setWaitingForNetwork(false);

                console.log("VIDEO FEED PAGINATION:", {
                    requestedCursor: cursor,
                    nextCursor: nextCursorRef.current,
                    receivedPosts: responsePosts.length,
                    receivedVideos: videoPosts.length,
                    hasMore: moreAvailable,
                    feedSession: feedSessionRef.current,
                });

            } catch (error) {

                if (
                    requestVersion !== requestVersionRef.current
                ) {
                    return;
                }

                console.error(
                    "VIDEO FEED ERROR:",
                    error
                );

                // --------------------------------------------------
                // LOAD MORE ERROR
                // --------------------------------------------------

                if (isLoadMore) {

                    if (!navigator.onLine) {

                        retryWhenOnlineRef.current = true;

                        setWaitingForNetwork(true);

                    } else {

                        setLoadMoreError(true);
                    }

                }

                // --------------------------------------------------
                // INITIAL / REFRESH ERROR
                // --------------------------------------------------

                else {

                    setFeedLoaded(true);
                }

            } finally {

                if (
                    requestVersion === requestVersionRef.current
                ) {

                    if (isLoadMore) {

                        loadingMoreRef.current = false;

                        setLoadingMore(false);

                    } else {

                        setFeedLoading(false);

                        setFeedRefreshing(false);
                    }
                }
            }

        },
        [setPosts]
    );

    // --------------------------------------------------
    // INITIAL FEED LOAD
    // --------------------------------------------------

    useEffect(() => {

        fetchPosts(false, false);

    }, [fetchPosts]);

    // --------------------------------------------------
    // AUTOMATIC VIDEO PAGINATION
    // --------------------------------------------------

    useEffect(() => {

        if (
            !feedLoaded ||
            feedLoading ||
            feedRefreshing ||
            loadingMore ||
            waitingForNetwork ||
            loadMoreError ||
            !hasMorePosts
        ) {
            return;
        }

        let disposed = false;

        let frameId = null;

        const checkForNextPage = () => {

            if (
                disposed ||
                frameId !== null
            ) {
                return;
            }

            frameId = window.requestAnimationFrame(() => {

                frameId = null;

                if (disposed) return;

                if (
                    loadingMoreRef.current ||
                    !hasMoreRef.current
                ) {
                    return;
                }

                // --------------------------------------------------
                // CHECK INTERNET
                // --------------------------------------------------

                if (!navigator.onLine) {

                    retryWhenOnlineRef.current = true;

                    setWaitingForNetwork(true);

                    return;
                }

                // --------------------------------------------------
                // LAST VIDEO
                // --------------------------------------------------

                const target = lastVideoRef.current;

                if (
                    !target ||
                    !target.isConnected
                ) {
                    return;
                }

                const rect = target.getBoundingClientRect();

                const shouldLoad =
                    rect.top <= window.innerHeight + 800 &&
                    rect.bottom >= -800;

                if (shouldLoad) {

                    console.log(
                        "Loading next video page:",
                        {
                            cursor: nextCursorRef.current,
                            feedSession: feedSessionRef.current,
                        }
                    );

                    fetchPosts(false, true);
                }

            });

        };

        // --------------------------------------------------
        // INTERSECTION OBSERVER
        // --------------------------------------------------

        const target = lastVideoRef.current;

        let observer = null;

        if (target) {

            observer = new IntersectionObserver(
                (entries) => {

                    if (
                        entries.some(
                            (entry) => entry.isIntersecting
                        )
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

        // Listen to window and nested scroll containers.
        document.addEventListener(
            "scroll",
            checkForNextPage,
            {
                capture: true,
                passive: true,
            }
        );

        window.addEventListener(
            "resize",
            checkForNextPage
        );

        // Check immediately after rendering.
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

            window.removeEventListener(
                "resize",
                checkForNextPage
            );

        };

    }, [
        posts.length,
        feedLoaded,
        feedLoading,
        feedRefreshing,
        loadingMore,
        waitingForNetwork,
        loadMoreError,
        hasMorePosts,
        fetchPosts,
    ]);

    // --------------------------------------------------
    // NETWORK RECONNECTION
    // --------------------------------------------------

    useEffect(() => {

        const handleOnline = () => {

            if (!retryWhenOnlineRef.current) return;

            if (loadingMoreRef.current) return;

            if (!hasMoreRef.current) return;

            console.log(
                "Internet restored. Retrying video feed..."
            );

            setWaitingForNetwork(false);

            fetchPosts(false, true);
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

        window.addEventListener(
            "online",
            handleOnline
        );

        window.addEventListener(
            "offline",
            handleOffline
        );

        return () => {

            window.removeEventListener(
                "online",
                handleOnline
            );

            window.removeEventListener(
                "offline",
                handleOffline
            );

        };

    }, [fetchPosts]);

    // --------------------------------------------------
    // REFRESH VIDEO FEED
    // --------------------------------------------------

    const handleRefresh = useCallback(async () => {

        if (
            feedRefreshing ||
            feedLoading ||
            loadingMoreRef.current
        ) {
            return;
        }

        await fetchPosts(true, false);

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });

    }, [
        feedRefreshing,
        feedLoading,
        fetchPosts,
    ]);

    // --------------------------------------------------
    // EMPTY VIDEO FEED
    // --------------------------------------------------

    const renderNoVideos = () => {

        if (
            !feedLoaded ||
            posts?.length > 0 ||
            hasMorePosts
        ) {
            return null;
        }

        return (
            <div
                className="
                    w-full
                    flex
                    flex-col
                    justify-center
                    items-center
                    text-center
                    py-20
                    px-4
                "
            >

                <p className="text-xl font-bold">
                    No Video Available
                </p>

                <p className="mt-2 text-sm opacity-70">
                    Try refreshing to check for new videos.
                </p>

                <button
                    type="button"
                    onClick={handleRefresh}
                    disabled={feedRefreshing || feedLoading}
                    className="
                        min-w-[160px]
                        px-5
                        py-2.5
                        rounded-lg
                        bg-green-600
                        hover:bg-green-700
                        text-white
                        font-semibold
                        transition
                        disabled:opacity-50
                        disabled:cursor-not-allowed
                        flex
                        items-center
                        justify-center
                        gap-2
                        mt-4
                    "
                >

                    {feedRefreshing ? (

                        <>
                            <svg
                                className="animate-spin h-5 w-5"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                />

                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="
                                        M4 12
                                        a8 8 0 018-8
                                        v4
                                        a4 4 0 00-4 4
                                        H4z
                                    "
                                />
                            </svg>

                            Refreshing
                        </>

                    ) : (

                        <>
                            <span className="text-xl leading-none">
                                ↻
                            </span>

                            Refresh Videos
                        </>

                    )}

                </button>

            </div>
        );
    };

    // --------------------------------------------------
    // VIDEO FEED END / LOADING / RETRY
    // --------------------------------------------------

    const renderFeedEnd = () => {

        if (!feedLoaded) return null;

        // --------------------------------------------------
        // LOADING MORE / WAITING FOR INTERNET
        // --------------------------------------------------

        if (
            loadingMore ||
            waitingForNetwork
        ) {

            return (
                <div className="w-full space-y-3 py-3">

                    {[1].map((item) => (

                        <div
                            key={item}
                            className="
                                w-full
                                animate-pulse
                                space-y-3
                                rounded-xl
                                p-3
                            "
                        >

                            <div className="h-10 w-2/3 rounded-lg bg-gray-200 dark:bg-gray-800" />

                            <div className="h-4 w-1/2 rounded bg-gray-200 dark:bg-gray-800" />

                            <div className="h-48 w-full rounded-lg bg-gray-200 dark:bg-gray-800" />

                            <div className="h-5 w-4/5 rounded bg-gray-200 dark:bg-gray-800" />

                        </div>

                    ))}

                    {waitingForNetwork && (

                        <p className="text-center text-sm opacity-70">
                            Waiting for internet connection...
                        </p>

                    )}

                </div>
            );
        }

        // --------------------------------------------------
        // LOAD MORE ERROR
        // --------------------------------------------------

        if (
            loadMoreError &&
            hasMorePosts
        ) {

            return (
                <div
                    className="
                        flex
                        w-full
                        flex-col
                        items-center
                        gap-3
                        px-4
                        py-8
                    "
                >

                    <p className="text-center text-sm">
                        Could not load more videos. Check your connection.
                    </p>

                    <button
                        type="button"
                        onClick={() => fetchPosts(false, true)}
                        disabled={loadingMore}
                        className="
                            font-semibold
                            transition
                            disabled:opacity-50
                        "
                    >
                        Retry
                    </button>

                </div>
            );
        }

        // --------------------------------------------------
        // END OF VIDEO FEED
        // --------------------------------------------------

        if (
            !hasMorePosts &&
            posts.length > 0
        ) {

            return (
                <div className="w-full px-4 pb-10 pt-5 text-center">

                    <p className="text-sm">
                        You have reached the end of the video feed.
                    </p>

                    <button
                        type="button"
                        onClick={handleRefresh}
                        disabled={feedRefreshing || feedLoading}
                        className="
                            mt-3
                            font-semibold
                            transition
                            disabled:opacity-50
                        "
                    >
                        {feedRefreshing
                            ? "Refreshing"
                            : "Refresh Videos"}
                    </button>

                </div>
            );
        }

        return null;
    };

    // --------------------------------------------------
    // VIDEO CARD PROPS
    // --------------------------------------------------

    const videoCardProps = (post) => ({

        post,
        setPosts,

        image,
        setImage,

        video,
        setVideo,

        showUsersPopup,
        setShowUsersPopup,

        newComment,
        setNewComment,

        showEmoji,
        setShowEmoji,

        emojiList,
        setEmojiList,

        postComments,
        setPostComments,

        loading,
        setLoading,

        messageOpen,
        setMessageOpen,

        commentsByPost,
        setCommentsByPost,

        reelUsers,
        openUserReels,

        chats,
        setChats,

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

        setMyReels,
        setReelUsers,

        selectedReelIndex,
        selectedUserIndex,

        setMediaIndex,
        mediaIndex,

        setProgress,
        progress,

        setMessage,
        message,

        setReaction,
        reaction,

        setShowOptions,
        showOptions,

    });

    // --------------------------------------------------
    // VIDEO CARD RENDERING
    // --------------------------------------------------

    const renderVideoPosts = (alignment = "center") => {

        return (
            <>

                {posts.map((post, index) => {

                    const isLastPost =
                        index === posts.length - 1;

                    return (
                        <React.Fragment key={post.id}>

                            <div
                                ref={
                                    isLastPost
                                        ? lastVideoRef
                                        : null
                                }
                                className={`
                                    w-full
                                    flex
                                    ${
                                        alignment === "end"
                                            ? "justify-end"
                                            : "justify-center"
                                    }
                                `}
                            >

                                <PostCardVideo
                                    {...videoCardProps(post)}
                                />

                            </div>

                            {/* PRODUCT BLOCK AFTER 10 VIDEOS */}

                            {index === 9 &&
                                feedProducts.length > 0 && (

                                    <ProductFeedBlock
                                        products={feedProducts}
                                    />

                                )}

                        </React.Fragment>
                    );

                })}

                {/* 
                    If the current page contains no videos,
                    this sentinel allows pagination to continue.
                */}

                {posts.length === 0 && hasMorePosts && (

                    <div
                        ref={lastVideoRef}
                        className="w-full h-px"
                    />

                )}

            </>
        );
    };

    // --------------------------------------------------
    // LARGE SCREEN
    // --------------------------------------------------

    const largeScreen = (

        <div className="block md:hidden lg:block">

            <div
                className="
                    flex
                    flex-col
                    lg:flex-row
                    items-center
                    justify-center
                    mx-auto
                    min-h-screen
                    bg-[var(--bg-color)]
                    text-[var(--text-color)]
                "
            >

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

                <div
                    className="
                        flex-1
                        transition-all
                        mx-auto
                        p-4
                        mt-20
                        gap-3
                        flex
                        flex-col
                        items-center
                    "
                >

                    {renderNoVideos()}

                    {renderVideoPosts("center")}

                    {renderFeedEnd()}

                </div>

                <SidebarRight />

            </div>

        </div>
    );

    // --------------------------------------------------
    // IPAD SCREEN
    // --------------------------------------------------

    const ipadScreen = (

        <div className="md:block lg:hidden hidden">

            <div
                className="
                    flex
                    flex-col
                    items-start
                    mx-auto
                    min-h-screen
                    bg-[var(--bg-color)]
                    text-[var(--text-color)]
                "
            >

                <SidebarRight />

                <div
                    className="
                        flex-1
                        transition-all
                        p-4
                        mt-20
                        gap-3
                        relative
                        right-4
                        flex
                        flex-col
                        items-end
                    "
                >

                    {renderNoVideos()}

                    {renderVideoPosts("end")}

                    {renderFeedEnd()}

                </div>

            </div>

        </div>
    );

    // --------------------------------------------------
    // INITIAL LOADING
    // --------------------------------------------------

    if (feedLoading && !feedLoaded) {

        return <FeedSkeleton />;

    }

    // --------------------------------------------------
    // RETURN
    // --------------------------------------------------

    return (

        <div>

            {largeScreen}

            {ipadScreen}

        </div>

    );

}

   

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

                    {/* ==================================================
                        LEFT SIDEBAR
                    ================================================== */}

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

                    <main
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

                                {/* USER HEADER */}

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


                                {/* CONTENT */}

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


                                {/* MEDIA */}

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


                                {/* ACTION BUTTONS */}

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

                    </main>


                    {/* ==================================================
                        RIGHT SIDEBAR
                    ================================================== */}

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