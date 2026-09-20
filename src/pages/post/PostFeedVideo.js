import React, {
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";

import api from "../../Api/axios";
import PostCardVideo from "./PostCardVideo";
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
}) {
    const [feedLoading, setFeedLoading] = useState(false);
    const [feedRefreshing, setFeedRefreshing] = useState(false);
    const [feedLoaded, setFeedLoaded] = useState(false);
    const [feedEnded, setFeedEnded] = useState(false);

    const lastVideoRef = useRef(null);

  
    const fetchPosts = useCallback(async (isRefresh = false) => {
        if (isRefresh) {
            setFeedRefreshing(true);
        } else {
            setFeedLoading(true);
        }

        setFeedEnded(false);

        try {
            const res = await api.get("/api/posts-get");

            const responsePosts = Array.isArray(res.data?.posts)
                ? res.data.posts
                : [];

            const onlyVideoPosts = responsePosts.filter((post) => {
                const hasVideo = Array.isArray(post?.media)
                    ? post.media.some(
                          (media) => media?.type === "video"
                      )
                    : false;

                const hasNoContent =
                    !post?.content ||
                    post.content.trim() === "";

                return hasVideo && hasNoContent;
            });

            setPosts(onlyVideoPosts);
            setFeedLoaded(true);

            setFeedEnded(false);
        } catch (error) {
            console.error("VIDEO FEED ERROR:", error);

            setPosts([]);
            setFeedLoaded(true);
            setFeedEnded(false);
        } finally {
            setFeedLoading(false);
            setFeedRefreshing(false);
        }
    }, [setPosts]);

    
    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    useEffect(() => {
        if (!feedLoaded || posts.length === 0) {
            return;
        }

        const lastVideo = lastVideoRef.current;

        if (!lastVideo) {
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];

                if (entry.isIntersecting) {
                    setFeedEnded(true);
                }
            },
            {
                threshold: 0.2,
            }
        );

        observer.observe(lastVideo);

        return () => {
            observer.disconnect();
        };
    }, [posts, feedLoaded]);

    const handleRefresh = async () => {
        if (feedRefreshing || feedLoading) {
            return;
        }

        await fetchPosts(true);

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    const renderFeedEnd = () => {
      
        if (
            !feedLoaded ||
            posts.length === 0 ||
            !feedEnded
        ) {
            return null;
        }

        return (
            <div className="w-full flex flex-col items-center justify-center py-10 px-4">
                <p className="text-sm sm:text-base text-center mb-4">
                    No More Video Available
                </p>

                <button
                    type="button"
                    onClick={handleRefresh}
                    disabled={feedRefreshing}
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

    const renderNoVideos = () => {
        if (!feedLoaded || posts.length > 0) {
            return null;
        }

        return (
            <div className="
                w-full
                flex
                flex-col
                justify-center
                items-center
                text-center
                py-20
                px-4
            ">
                <p className="text-xl font-bold">
                    No Video Available
                </p>
            </div>
        );
    };

    if (feedLoading) {
        return <FeedSkeleton />;
    }

    /*
    |--------------------------------------------------------------------------
    | Large screen
    |--------------------------------------------------------------------------
    */
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
                {/* Sidebar */}
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

                {renderNoVideos()}

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
                    {posts.map((post, index) => {
                        const isLastPost =
                            index === posts.length - 1;

                        return (
                            <div
                                key={post.id}
                                ref={
                                    isLastPost
                                        ? lastVideoRef
                                        : null
                                }
                                className="w-full flex justify-center"
                            >
                                <PostCardVideo
                                    post={post}
                                    setPosts={setPosts}
                                    image={image}
                                    setImage={setImage}
                                    showUsersPopup={showUsersPopup}
                                    setShowUsersPopup={
                                        setShowUsersPopup
                                    }
                                    newComment={newComment}
                                    setNewComment={setNewComment}
                                    showEmoji={showEmoji}
                                    setShowEmoji={setShowEmoji}
                                    emojiList={emojiList}
                                    setEmojiList={setEmojiList}
                                    postComments={postComments}
                                    setPostComments={
                                        setPostComments
                                    }
                                    loading={loading}
                                    setLoading={setLoading}
                                    messageOpen={messageOpen}
                                    commentsByPost={
                                        commentsByPost
                                    }
                                    reelUsers={reelUsers}
                                    openUserReels={
                                        openUserReels
                                    }
                                    setCommentsByPost={
                                        setCommentsByPost
                                    }
                                    setMessageOpen={
                                        setMessageOpen
                                    }
                                    chats={chats}
                                    setChats={setChats}
                                    sending={sending}
                                    setSending={setSending}
                                    closeViewer={closeViewer}
                                    nextReel={nextReel}
                                    previousReel={
                                        previousReel
                                    }
                                    selectedReel={
                                        selectedReel
                                    }
                                    selectedUser={
                                        selectedUser
                                    }
                                    markReelViewed={
                                        markReelViewed
                                    }
                                    open={open}
                                    setOpen={setOpen}
                                    openReport={openReport}
                                    setOpenReport={
                                        setOpenReport
                                    }
                                    showImagePicker={
                                        showImagePicker
                                    }
                                    setShowImagePicker={
                                        setShowImagePicker
                                    }
                                    messageOpenShare={
                                        messageOpenShare
                                    }
                                    setMessageOpenShare={
                                        setMessageOpenShare
                                    }
                                    shares={shares}
                                    setShares={setShares}
                                    setMyReels={setMyReels}
                                    setReelUsers={
                                        setReelUsers
                                    }
                                    selectedReelIndex={
                                        selectedReelIndex
                                    }
                                    selectedUserIndex={
                                        selectedUserIndex
                                    }
                                    setMediaIndex={
                                        setMediaIndex
                                    }
                                    mediaIndex={mediaIndex}
                                    setProgress={
                                        setProgress
                                    }
                                    progress={progress}
                                    setMessage={setMessage}
                                    message={message}
                                    setReaction={
                                        setReaction
                                    }
                                    reaction={reaction}
                                    setShowOptions={
                                        setShowOptions
                                    }
                                    showOptions={
                                        showOptions
                                    }
                                />
                            </div>
                        );
                    })}

                    {renderFeedEnd()}
                </div>
            </div>
        </div>
    );

    /*
    |--------------------------------------------------------------------------
    | iPad / medium screen
    |--------------------------------------------------------------------------
    */
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

                {renderNoVideos()}

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
                    {posts.map((post, index) => {
                        const isLastPost =
                            index === posts.length - 1;

                        return (
                            <div
                                key={post.id}
                                ref={
                                    isLastPost
                                        ? lastVideoRef
                                        : null
                                }
                                className="w-full flex justify-end"
                            >
                                <PostCardVideo
                                    post={post}
                                    setPosts={setPosts}
                                    image={image}
                                    setImage={setImage}
                                    showUsersPopup={
                                        showUsersPopup
                                    }
                                    setShowUsersPopup={
                                        setShowUsersPopup
                                    }
                                    newComment={newComment}
                                    setNewComment={
                                        setNewComment
                                    }
                                    showEmoji={showEmoji}
                                    setShowEmoji={
                                        setShowEmoji
                                    }
                                    emojiList={emojiList}
                                    setEmojiList={
                                        setEmojiList
                                    }
                                    commentsByPost={
                                        commentsByPost
                                    }
                                    reelUsers={reelUsers}
                                    openUserReels={
                                        openUserReels
                                    }
                                    setCommentsByPost={
                                        setCommentsByPost
                                    }
                                    postComments={postComments}
                                    setPostComments={
                                        setPostComments
                                    }
                                    loading={loading}
                                    setLoading={setLoading}
                                    sendReeling={sending}
                                    setSendReeling={
                                        setSending
                                    }
                                    closeViewer={closeViewer}
                                    nextReel={nextReel}
                                    previousReel={
                                        previousReel
                                    }
                                    selectedReel={
                                        selectedReel
                                    }
                                    selectedUser={
                                        selectedUser
                                    }
                                    markReelViewed={
                                        markReelViewed
                                    }
                                    open={open}
                                    setOpen={setOpen}
                                    openReport={openReport}
                                    setOpenReport={
                                        setOpenReport
                                    }
                                    showImagePicker={
                                        showImagePicker
                                    }
                                    setShowImagePicker={
                                        setShowImagePicker
                                    }
                                    messageOpenShared={
                                        messageOpenShare
                                    }
                                    setMessageOpenShared={
                                        setMessageOpenShare
                                    }
                                    shareds={shares}
                                    setShareds={setShares}
                                    setMyReels={setMyReels}
                                    setReelUsers={
                                        setReelUsers
                                    }
                                    selectedReelIndex={
                                        selectedReelIndex
                                    }
                                    selectedUserIndex={
                                        selectedUserIndex
                                    }
                                    setMediaIndex={
                                        setMediaIndex
                                    }
                                    mediaIndex={mediaIndex}
                                    setProgress={
                                        setProgress
                                    }
                                    progress={progress}
                                    setMessage={setMessage}
                                    message={message}
                                    setReaction={
                                        setReaction
                                    }
                                    reaction={reaction}
                                    setShowOptions={
                                        setShowOptions
                                    }
                                    showOptions={
                                        showOptions
                                    }
                                />
                            </div>
                        );
                    })}

                    {renderFeedEnd()}
                </div>
            </div>
        </div>
    );

    /*
    |--------------------------------------------------------------------------
    | Return
    |--------------------------------------------------------------------------
    */
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