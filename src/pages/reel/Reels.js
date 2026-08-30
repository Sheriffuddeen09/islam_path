import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Plus
} from "lucide-react";
import api from "../../Api/axios";
import ReelViewerModal from './ReelViewerModal'
import { useAuth } from '../../layout/AuthProvider';
import MyReelModal from "./MyReelModal";
import CreateReelModal from "./CreateReelModal";
import MyReelReview from "./MyReelReview";
export default function Reels({
    handleReelCreated, chats, myReels, setMyReels, reelUsers, setReelUsers,
    reelLoading, fetchMyReel, fetchReels, error
}) {

    const {user} = useAuth()

    const { user: authUser } = useAuth();
    

  const [createReel, setCreateReel] = useState(false);

    const [open, setOpen] = useState(false);
    
    
    const [selectedUserIndex, setSelectedUserIndex] =
        useState(null);
    
    const [showOptions, setShowOptions] =
        useState(false);
    const [message, setMessage] =
        useState("");
    const [sending, setSending] =
        useState(false);
    const [reaction, setReaction] =
        useState(null);
    const [mediaIndex, setMediaIndex] = useState(0);

    const [openReport, setOpenReport] = useState(false)
    const [showImagePicker, setShowImagePicker] = useState(false);
    const [messageOpenShare, setMessageOpenShare,] = useState(false)
    const [shares, setShares] = useState(false);

    const [
    showMyReelModal,
        setShowMyReelModal
    ] = useState(false);

    const [progress, setProgress] =
            useState(0);


    const [showMyReelReview, setShowMyReelReview] =
    useState(false);

    const [selectedMyIndex, setSelectedMyIndex] =
        useState(0);

    const [selectedReelIndex, setSelectedReelIndex] =
        useState(0);

    const [myMediaIndex, setMyMediaIndex] =
        useState(0);

    const [myProgress, setMyProgress] =
        useState(0);
    
    const [reactionUsers, setReactionUsers] =
        useState([]);

    

    const markReelViewed = async (reelId) => {
        try {
            await api.post(`/api/reels/${reelId}/view`);
        } catch (error) {
            console.error("Failed to mark reel as viewed:", error);
        }
    };

  
    const currentInitial =
        (
            user?.first_name ||
            "U"
        )
            .charAt(0)
            .toUpperCase();

    const openUserReels = (userIndex) => {

        setSelectedUserIndex(userIndex);

        setSelectedReelIndex(0);
        setMediaIndex(0);

        setProgress(0);
        setShowOptions(false);

        setMessage("");

        setReaction(null);
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

    if (!selectedUser) {
        return;
    }

    if (
        selectedReelIndex <
        selectedUser.reels.length - 1
    ) {

        setSelectedReelIndex(
            prev => prev + 1
        );

        setMediaIndex(0);
        setProgress(0);
        setReaction(null);
        setMessage("");

        return;
    }

    if (
        selectedUserIndex <
        reelUsers.length - 1
    ) {

        setSelectedUserIndex(
            prev => prev + 1
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

        const closeMyReview 
            = () => {
                setShowMyReelReview(false);
                setSelectedReelIndex(0);
                setMyMediaIndex(0);
                setMyProgress(0);
                }

 const nextMyReel = () => {

    if (!selectedReel) {
        return;
    }

    if (
        selectedReelIndex <
        selectedReel.reels.length - 1
    ) {

        setSelectedReelIndex(
            prev => prev + 1
        );

        setMyMediaIndex(0);
        setMyProgress(0);
        setReactionUsers(null);

        return;
    }

    if (
        selectedMyIndex <
        myReels.length - 1
    ) {

        setSelectedMyIndex(
            prev => prev + 1
        );

        setSelectedReelIndex(0);
        setMyMediaIndex(0);
        setMyProgress(0);
        setReactionUsers(null);

        return;
    }
    closeMyReview();
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


const previousMyReel = () => {

    if (myMediaIndex > 0) {

        setMediaIndex(
            prev => prev - 1
        );

        setMyProgress(0);

        return;
    }

    if (selectedReelIndex > 0) {

        setSelectedReelIndex(
            prev => prev - 1
        );

        setMyMediaIndex(0);

        setReactionUsers(null);
        return;
    }

    if (selectedMyIndex > 0) {

        const previousMy =
            myReels[
                selectedMyIndex - 1
            ];

        setSelectedMyIndex(
            prev => prev - 1
        );

        setSelectedReelIndex(
            previousMy.reels.length - 1
        );

        setMyMediaIndex(0);

        setReactionUsers(null);
    }
};


    const sendReaction = async (value) => {
    if (!selectedReel) {
        return;
    }

    const reelId = selectedReel.id;

    // Update the button immediately
    setReaction(value);

    // Update the actual reel inside reelUsers
    setReelUsers(prev =>
        prev.map(userGroup => ({
            ...userGroup,

            reels: Array.isArray(userGroup.reels)
                ? userGroup.reels.map(reel =>
                    Number(reel.id) === Number(reelId)
                        ? {
                            ...reel,
                            user_reaction: value || null,
                        }
                        : reel
                )
                : userGroup.reels,
        }))
    );

    // If the selected reel is also one of your reels,
    // update myReels too
    setMyReels(prev =>
        prev.map(reel =>
            Number(reel.id) === Number(reelId)
                ? {
                    ...reel,
                    user_reaction: value || null,
                }
                : reel
        )
    );

    try {
        await api.post(
            `/api/reels/${reelId}/reaction`,
            {
                reaction: value,
            }
        );

    } catch (error) {

        console.error(
            "REACTION ERROR:",
            error
        );

        // Optional: revert if API fails
    }
};

    

    const hasMyReels =
    Array.isArray(myReels) &&
    myReels.length > 0;

    const firstMyReel = useMemo(() => {

    if (!Array.isArray(myReels) || !myReels.length) {
        return null;
    }

        return [...myReels]
            .sort(
                (a, b) =>
                    new Date(a.created_at) -
                    new Date(b.created_at)
            )[0];

    }, [myReels]);

    const firstMyImage =
    firstMyReel?.media?.find(
        media => media.type === "image"
    );

const firstMyVideo =
    firstMyReel?.media?.find(
        media => media.type === "video"
    );

   const isUserInChatList =
    Array.isArray(chats) &&
    chats.some(chat => {
        const chatUser =
            chat?.other_user ??
            chat?.other ??
            (
                Number(chat?.teacher_id) === Number(authUser?.id)
                    ? chat?.student
                    : chat?.teacher
            );

        return Number(chatUser?.id) === Number(user?.id);
    });

    const canShowButton = isUserInChatList;


    if (reelLoading) {
    return (
        <div
            className="
                lg:w-[480px] md:w-96 w-80
                overflow-x-auto
                overflow-y-hidden
              lg: flex items-center justify-center mx-auto
                scrollbar-none
            "
        >
            <div
                className="
                    flex
                    w-max
                    min-w-full
                    gap-3
                    px-1
                "
            >
                <div
                    className="
                        relative
                        shrink-0
                        w-20
                        h-28
                        sm:w-24
                        sm:h-36
                        rounded-xl
                        overflow-hidden
                        bg-gray-200
                        dark:bg-gray-800
                        animate-pulse
                    "
                >

                    {/* Initial */}

                    <div
                        className="
                            absolute
                            top-2
                            left-1/2
                            -translate-x-1/2
                            w-12
                            h-12
                            rounded-full
                            bg-gray-300
                            dark:bg-gray-700
                        "
                    />

                    {/* Plus */}

                    <div
                        className="
                            absolute
                            bottom-8
                            left-1/2
                            -translate-x-1/2
                            w-8
                            h-8
                            rounded-full
                            bg-gray-300
                            dark:bg-gray-700
                        "
                    />

                    {/* Text */}

                    <div
                        className="
                            absolute
                            bottom-2
                            left-1/2
                            -translate-x-1/2
                            w-14
                            h-2
                            rounded
                            bg-gray-300
                            dark:bg-gray-700
                        "
                    />

                </div>


                {Array.from({ length: 4 }).map(
                    (_, index) => (

                        <div
                            key={index}
                            className="
                                relative
                                shrink-0
                                w-20
                                h-28
                                sm:w-24
                                sm:h-36
                                rounded-xl
                                overflow-hidden
                                overflow-x-auto
                                bg-gray-200
                                dark:bg-gray-800
                                animate-pulse
                            "
                        >

                            {/* Fake background */}

                            <div
                                className="
                                    absolute
                                    inset-0
                                    bg-gray-300
                                    dark:bg-gray-700
                                "
                            />

                            {/* Fake initial */}

                            <div
                                className="
                                    absolute
                                    top-2
                                    left-2
                                    w-8
                                    h-8
                                    rounded-full
                                    bg-gray-400
                                    dark:bg-gray-600
                                "
                            />

                            {/* Fake name */}

                            <div
                                className="
                                    absolute
                                    bottom-2
                                    left-2
                                    right-2
                                    h-2
                                    rounded
                                    bg-gray-400
                                    dark:bg-gray-600
                                "
                            />

                        </div>

                    )
                )}

            </div>
        </div>
    );
}


    return (
        <>
            <div
                className=" lg:w-[480px] md:w-96 sm:mt-10 mt-4
                    w-full
                    overflow-x-auto
                    scrollbar-hide
                "
            >
              {!canShowButton && (

    <div
        className="
            flex
            gap-3
            min-w-max
        "
    >

        <button
            type="button"
            onClick={() => {
                if (hasMyReels) {
                    setShowMyReelModal(true);
                } else {
                    setCreateReel(true);
                }
            }}
            className={`
                relative
                shrink-0
                w-20
                h-28
                sm:w-24
                sm:h-36
                rounded-xl
                overflow-hidden
                border-2
                ${
                    hasMyReels
                        ? "border-green-500"
                        : "border-gray-700"
                }
                bg-gray-800
            `}
        >

            {/* MY REEL PREVIEW */}

            {firstMyReel ? (

                <div className="absolute inset-0">

                    {firstMyImage && (
                        <img
                            src={firstMyImage.url}
                            alt=""
                            className="
                                absolute
                                inset-0
                                w-full
                                h-full
                                object-cover
                            "
                        />
                    )}

                    {!firstMyImage &&
                        firstMyVideo && (
                            <video
                                src={firstMyVideo.url}
                                muted
                                playsInline
                                preload="metadata"
                                className="
                                    absolute
                                    inset-0
                                    w-full
                                    h-full
                                    object-cover
                                "
                            />
                        )}

                    {!firstMyImage &&
                        !firstMyVideo &&
                        firstMyReel.content && (

                        <div
                            className="
                                absolute
                                inset-0
                                flex
                                items-center
                                justify-center
                                p-3
                                text-white
                                text-center
                                text-xs
                                font-semibold
                                bg-gradient-to-br
                                from-blue-700
                                to-purple-700
                            "
                        >
                            <span className="line-clamp-6">
                                {firstMyReel.content}
                            </span>
                        </div>

                    )}

                    <div
                        className="
                            absolute
                            inset-0
                            bg-black/30
                        "
                    />

                </div>

            ) : (

                <div
                    className="
                        absolute
                        inset-0
                        bg-gray-800
                    "
                />

            )}

            {/* USER INITIAL */}

            <div
                className={`
                    absolute
                    top-2
                    left-1/2
                    -translate-x-1/2
                    w-12
                    h-12
                    rounded-full
                    bg-blue-600
                    text-white
                    flex
                    items-center
                    justify-center
                    text-xl
                    font-bold
                    border-[3px]
                    ${
                        hasMyReels
                            ? "border-green-500"
                            : "border-gray-400"
                    }
                `}
            >
                {currentInitial}
            </div>

            {/* PLUS */}

            <div
                onClick={(e) => {
                    e.stopPropagation();
                    setCreateReel(true);
                }}
                className="
                    absolute
                    bottom-8
                    left-1/2
                    -translate-x-1/2
                    w-8
                    h-8
                    rounded-full
                    bg-blue-600
                    border-2
                    border-white
                    text-white
                    flex
                    items-center
                    justify-center
                    z-20
                    cursor-pointer
                "
            >
                <Plus size={18} />
            </div>

            {/* TITLE */}

            <span
                className="
                    absolute
                    bottom-2
                    left-0
                    right-0
                    z-20
                    text-xs
                    font-semibold
                    text-white
                    text-center
                "
            >
                Create Reel
            </span>

        </button>


        {/* =========================
            OTHER USERS' REELS
        ========================== */}
{reelUsers.length === 0 ? (

    <div
        className="
            shrink-0
            w-20
            h-28
            sm:w-24
            sm:h-36
            rounded-xl
            border-2
            border-green-600
            bg-green-50
            flex
            items-center
            justify-center
            text-center
            px-2
        "
    >
        <span
            className="
                text-xs
                font-semibold
                text-green-700
                leading-tight
            "
        >
            No more reel status to view
        </span>
    </div>

) : (

    reelUsers.map((item, index) => {

        // -----------------------------------------
        // SAFETY
        // -----------------------------------------

        const user = item?.user;

        const reels = Array.isArray(item?.reels)
            ? item.reels
            : [];

        // Don't render a broken user item
        if (!user) {
            return null;
        }

        const allReelsViewed =
            reels.length > 0 &&
            reels.every(
                reel =>
                    reel?.has_viewed === true
            );

        const firstReel = reels[0];

        const firstMedia =
            firstReel?.media?.[0];

        return (
            <button
                key={user.id ?? `reel-user-${index}`}
                type="button"
                onClick={() =>
                    openUserReels(index)
                }
                className="
                    relative
                    shrink-0
                    w-20
                    h-28
                    sm:w-24
                    sm:h-36
                    rounded-xl
                    overflow-hidden
                    bg-gray-900
                    border
                    border-gray-700
                "
            >

                {/* -------------------------------- */}
                {/* REEL PREVIEW */}
                {/* -------------------------------- */}

                {firstMedia?.type === "image" ? (

                    <img
                        src={firstMedia.url}
                        alt=""
                        className="
                            absolute
                            inset-0
                            w-full
                            h-full
                            object-cover
                        "
                    />

                ) : firstMedia?.type === "video" ? (

                    <video
                        src={firstMedia.url}
                        muted
                        playsInline
                        preload="metadata"
                        className="
                            absolute
                            inset-0
                            w-full
                            h-full
                            object-cover
                        "
                    />

                ) : (

                    <div
                        className="
                            absolute
                            inset-0
                            bg-gradient-to-br
                            from-blue-700
                            to-purple-700
                            p-2
                            flex
                            items-center
                            justify-center
                            text-center
                            text-xs
                            text-white
                        "
                    >
                        {firstReel?.content || "Reel"}
                    </div>

                )}

                {/* -------------------------------- */}
                {/* OVERLAY */}
                {/* -------------------------------- */}

                <div
                    className="
                        absolute
                        inset-0
                        bg-gradient-to-t
                        from-black/80
                        via-transparent
                        to-black/20
                    "
                />

                {/* -------------------------------- */}
                {/* USER INITIAL */}
                {/* -------------------------------- */}

                <div
                    className={`
                        absolute
                        top-2
                        left-2
                        w-8
                        h-8
                        rounded-full
                        bg-blue-600
                        text-white
                        flex
                        items-center
                        justify-center
                        font-bold
                        text-sm
                        border-2
                        ${
                            allReelsViewed
                                ? "border-gray-300"
                                : "border-green-700"
                        }
                    `}
                >
                    {user.initial ||
                        user.first_name?.charAt(0)?.toUpperCase() ||
                        "U"}
                </div>

                {/* -------------------------------- */}
                {/* USER NAME */}
                {/* -------------------------------- */}

                <span
                    className="
                        absolute
                        bottom-2
                        left-2
                        right-2
                        text-white
                        text-xs
                        font-semibold
                        truncate
                        text-left
                    "
                >
                    {user.first_name || "User"}
                </span>

            </button>
        );

    })

)}
    </div>

)}

</div>
            {error && (
                <div
                    className="
                        px-4
                        py-2
                        text-sm
                        text-red-500
                    "
                >
                    {error}
                </div>
            )}



            {selectedReel && (
                <ReelViewerModal
                    chats={chats}
                    user={selectedUser.user}
                    reel={selectedReel}
                    reelIndex={
                        selectedReelIndex
                    }
                    totalReels={
                        selectedUser.reels
                            .length
                    }
                    onClose={closeViewer}
                    onNext={nextReel}
                    onPrevious={
                        previousReel
                    }
                    showOptions={
                        showOptions
                    }
                    setShowOptions={
                        setShowOptions
                    }
                    message={message}
                    setMessage={setMessage}
                    
                    sending={sending}
                    setSending={setSending}
                    reaction={reaction}
                    setReelUsers={setReelUsers}
                    setMyReels={setMyReels}
                    setReaction={
                        setReaction
                    }

                    currentUserIndex={selectedUserIndex}
                    reelUsers={reelUsers}
                    currentUser={user}

                    selectedReel={selectedReel}
                    mediaIndex={mediaIndex}
                    setMediaIndex={setMediaIndex}
                    progress={progress}
                    setProgress={setProgress}
                    nextReel={nextReel}

                    markReelViewed={markReelViewed}
                    open={open}
                    setOpen={setOpen}
                    showImagePicker={showImagePicker}
                    setShowImagePicker={setShowImagePicker}
                    messageOpenShare={messageOpenShare}
                    setMessageOpenShare={setMessageOpenShare}
                    openReport={openReport}
                    setOpenReport={setOpenReport}
                    shares={shares}
                    setShares={setShares}
                    
                />
            )}

            {showMyReelModal && (
                <MyReelModal
                    myReels={myReels}
                    currentUser={user}
                    chats={chats}
                    onClose={() =>
                        setShowMyReelModal(false)
                    }
                    setReactionUsers={setReactionUsers}
                    setMyMediaIndex={setMyMediaIndex}
                    setMyProgress={setMyProgress}
                    setShowMyReelReview={setShowMyReelReview} 
                    setSelectedMyIndex={setSelectedMyIndex} 
                    selectedMyIndex={selectedMyIndex}
                    open={open}
                    setOpen={setOpen}
                    showImagePicker={showImagePicker}
                    setShowImagePicker={setShowImagePicker}
                    messageOpenShare={messageOpenShare}
                    setMessageOpenShare={setMessageOpenShare}
                    openReport={openReport}
                    setOpenReport={setOpenReport}
                    shares={shares}
                    setShares={setShares}
                />
            )}

            {createReel && (
            <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-3">
                
                <CreateReelModal
                    setCreateReel={setCreateReel}
                    handleReelCreated={handleReelCreated}
                />

                </div>
            )}

            {showMyReelReview && (
            <MyReelReview
                myReels={myReels}

                chats={chats}
                selectedMyIndex={
                    selectedMyIndex
                }

                setSelectedMyIndex={
                    setSelectedMyIndex
                }

                myMediaIndex={myMediaIndex}
                setMyMediaIndex={setMyMediaIndex}

                myProgress={myProgress}
                setMyProgress={setMyProgress}

                onClose={() => {
                    setShowMyReelReview(false);
                    setSelectedReelIndex(0);
                    setMyMediaIndex(0);
                    setMyProgress(0);
                }}

                reactionUsers={reactionUsers}
                setReactionUsers={setReactionUsers}
                nextReel={nextMyReel}
                onPrevious={previousMyReel}
                selectedReel={selectedReel}
                setReaction={setReaction}
                open={open}
                setOpen={setOpen}
                showImagePicker={showImagePicker}
                setShowImagePicker={setShowImagePicker}
                messageOpenShare={messageOpenShare}
                setMessageOpenShare={setMessageOpenShare}
                openReport={openReport}
                setOpenReport={setOpenReport}
                shares={shares}
                setShares={setShares}
            />
        )}

        </>
    );
}