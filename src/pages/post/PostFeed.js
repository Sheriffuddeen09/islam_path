import { useEffect, useState } from "react";
import PostCard from "./PostCard";
import api from "../../Api/axios";
import SidebarRight from "../homepageComponent/SidebarRight";
import SidebarLeft from "../homepageComponent/SideBarLeft";
import Reels from "../reel/Reels";

export default function PostFeed({posts, setPosts, image, postComments, setPostComments, newComment, setNewComment,
  showEmoji, setShowEmoji, emojiList, setEmojiList, messageOpen, setMessageOpen, chats, setChats,
  loading, setLoading, setImage, setShowUsersPopup, showUsersPopup, fetchJobProfile, show, setShow, jobProfile, setJobProfile,
  showAdvertisement, setShowAdvertisement, showJobCreate, setShowJobCreate, handlePostCreated,
handleReelCreated, reelUsers, setReelUsers, myReels, setMyReels, videoCount, handleVideoClick,
reelLoading, error, fetchMyReel, fetchReels}) {

    const [feedLoading, setFeedLoading] = useState(false)
 useEffect(() => {
  const fetchPosts = async () => {
    setFeedLoading(true);

    try {
      const res = await api.get("/api/posts-get");

      const filtered = res.data.posts.filter(post => {

        const hasContent = !!post.content;

        const hasImage = post.media?.some(m => m.type === "image");
        const hasVideo = post.media?.some(m => m.type === "video");

        if (hasVideo && !hasContent) {
          return false;
        }
        return hasContent || hasImage || (hasVideo && hasContent);

      });

      setPosts(filtered);

    } catch (err) {
      console.error(err);
    } finally {
      setFeedLoading(false);
    }
  };

  fetchPosts();
}, []);

  if (feedLoading) {
    return <FeedSkeleton />;
}
  const largeScreen = (
    <div className="block md:hidden lg:block">
        <div className="flex flex-col lg:flex-row  items-center justify-center  mx-auto min-h-screen bg-[var(--bg-color)] text-[var(--text-color)]">
        {/* Mobile Menu Button */}

        {/* SidebarRight */}
        <SidebarLeft 
        handleVideoClick={handleVideoClick}
        videoCount={videoCount}
        jobProfile={jobProfile}
        setJobProfile={setJobProfile}
        fetchJobProfile={fetchJobProfile}
        show={show}
        setShow={setShow}
        showAdvertisement={showAdvertisement} setShowAdvertisement={setShowAdvertisement}
        showJobCreate={showJobCreate} setShowJobCreate={setShowJobCreate}

        />
    
    
      
    
    <div className="flex-1 transition-all mx-auto p-4 gap-3 flex justif-start flex-col items-center">
    
      <Reels 
       error={error}
        reelLoading={reelLoading}
        fetchReels={fetchReels}
        fetchMyReel={fetchMyReel}
       chats={chats} handlePostCreated={handlePostCreated}
       handleReelCreated={handleReelCreated}
        myReels={myReels}
        setMyReels={setMyReels}
        reelUsers={reelUsers}
        setReelUsers={setReelUsers} />

      {
        posts.length === 0 && (
          <p className="lg:ml-96 translate-y-40 sm:translate-y-0 mx-auto sm:text-xl flex flex-col justify-center items-center text-center text-xl font-bold ">
            No Feed Post Available
          </p>
         )
      }
      {posts.map(post => (
        <PostCard key={post.id} post={post} setPosts={setPosts} 
        image={image} setImage={setImage}  showUsersPopup={showUsersPopup} setShowUsersPopup={setShowUsersPopup}
        newComment={newComment} setNewComment={setNewComment}
        showEmoji={showEmoji} setShowEmoji={setShowEmoji}
        emojiList={emojiList} setEmojiList={setEmojiList}
        messageOpen={messageOpen}
        setMessageOpen={setMessageOpen}
        chats={chats}
        setChats={setChats}
        postComments={postComments} setPostComments={setPostComments} loading={loading} setLoading={setLoading}
        />
      ))}
      </div>
     
      
      <SidebarRight />
    </div>
    </div>
  );

  const ipadScreen = (
          <div className="md:block lg:hidden hidden">
        <div className="flex flex-col items-start mx-auto min-h-screen bg-[var(--bg-color)] text-[var(--text-color)]">
        {/* Mobile Menu Button */}

        {/* SidebarRight */}
       
    <SidebarRight />
    
     

      <div className="flex-1 transition-all p-4 mt-28 gap-4 ml-4 relative">
      <Reels 
       error={error}
        reelLoading={reelLoading}
        fetchReels={fetchReels}
        fetchMyReel={fetchMyReel}
       chats={chats} handlePostCreated={handlePostCreated}
       handleReelCreated={handleReelCreated}
        myReels={myReels}
        setMyReels={setMyReels}
        reelUsers={reelUsers}
        setReelUsers={setReelUsers} />

      
      {
        posts.length === 0 && (
          <p className="bg-[var(--bg-color)] text-[var(--text-color)] md:translate-y-60 md:ml-96 
          lg:translate-y-0 mx-auto sm:text-xl flex flex-col justify-center items-center text-xl font-bold ">
            No Feed Post Available
          </p>
         )
      }
      {posts.map(post => (
        <PostCard key={post.id} post={post} setPosts={setPosts} 
        image={image} setImage={setImage}  showUsersPopup={showUsersPopup} setShowUsersPopup={setShowUsersPopup}
        newComment={newComment} setNewComment={setNewComment}
        showEmoji={showEmoji} setShowEmoji={setShowEmoji}
        emojiList={emojiList} setEmojiList={setEmojiList}
        postComments={postComments} setPostComments={setPostComments} loading={loading} setLoading={setLoading}
        messageOpen={messageOpen}
        setMessageOpen={setMessageOpen}
        chats={chats}
        setChats={setChats}
        />
      ))}
      </div>
      
    </div>
    </div>
  );

  return (
    <div className="">
      
      {largeScreen}
      {ipadScreen}  
    </div>
  )
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