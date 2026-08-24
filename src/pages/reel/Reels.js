import {
    useEffect,
    useState,
} from "react";

import {
    Plus
} from "lucide-react";
import api from "../../Api/axios";
import ReelViewerModal from './ReelViewerModal'
import { useAuth } from '../../layout/AuthProvider';
export default function Reels({
    
}) {

    const {user} = useAuth()


    const [reelUsers, setReelUsers] =
        useState([]);
    const [loading, setLoading] =
        useState(true);
    const [error, setError] =
        useState("");
    const [selectedUserIndex, setSelectedUserIndex] =
        useState(null);
    const [selectedReelIndex, setSelectedReelIndex] =
        useState(0);
    const [showOptions, setShowOptions] =
        useState(false);
    const [message, setMessage] =
        useState("");
    const [sending, setSending] =
        useState(false);
    const [reaction, setReaction] =
        useState(null);
    const [mediaIndex, setMediaIndex] = useState(0);
    const [progress, setProgress] =
            useState(0);

            useEffect(() => {
        fetchReels();
    }, []);

    const markReelViewed = async (reelId) => {
        try {
            await api.post(`/api/reels/${reelId}/view`);
        } catch (error) {
            console.error("Failed to mark reel as viewed:", error);
        }
    };

    const fetchReels = async () => {

        try {

            setLoading(true);

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

            setLoading(false);

        }
    };

    console.log('user', user)
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


    const sendReaction = async (
        value
    ) => {

        if (!selectedReel) {
            return;
        }

        try {

            setReaction(value);

            await api.post(
                `/api/reels/${selectedReel.id}/reaction`,
                {
                    reaction: value,
                }
            );

        } catch (error) {

            console.error(
                "REACTION ERROR:",
                error
            );

        }
    };

    const sendMessage = async () => {

        if (
            !selectedReel ||
            !message.trim() ||
            sending
        ) {
            return;
        }

        try {

            setSending(true);

            await api.post(
                `/api/reels/${selectedReel.id}/message`,
                {
                    message:
                        message.trim(),
                }
            );

            setMessage("");

        } catch (error) {

            console.error(
                "MESSAGE ERROR:",
                error
            );

        } finally {

            setSending(false);

        }
    };



    if (loading) {
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

    const hasMyStatus = currentUserReels.length > 0;
   

    return (
        <>
            <div
                className=" lg:w-[480px] md:w-96 sm:mt-10 mt-4
                    w-full
                    overflow-x-auto
                    scrollbar-hide
                "
            >

                <div
                    className="
                        flex
                        gap-3
                        min-w-max
                    "
                >

                    <button
                        type="button"
                        // onClick={onCreateReel}
                        className="
                            relative
                            shrink-0
                            w-20
                            h-28
                            sm:w-24
                            sm:h-36
                            rounded-xl
                            overflow-hidden
                            bg-gray-800
                            border
                            border-gray-700
                        "
                    >

                        <div
                            className="
                                w-full
                                h-full
                                flex
                                flex-col
                                items-center
                                justify-end
                                pb-2
                            "
                        >

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
                                    hasMyStatus
                                        ? "border-green-500"
                                        : "border-gray-400"
                                }
                            `}
                        >
                            {currentInitial}
                        </div>

                            <div
                                className="
                                    absolute
                                    bottom-8
                                    w-8
                                    h-8
                                    rounded-full
                                    bg-blue-600
                                    border-2
                                    border-white text-white
                                    flex
                                    items-center
                                    justify-center
                                "
                            >
                                <Plus
                                    size={18}
                                />
                            </div>

                            <span
                                className="
                                    text-xs
                                    font-semibold text-white
                                "
                            >
                                Create Reel
                            </span>

                        </div>

                    </button>

                    {reelUsers.map(
                        (item, index) =>  {

                    const allReelsViewed =
                        item.reels?.length > 0 &&
                        item.reels.every(
                            reel => reel.has_viewed === true
                        );
                            

                        return (
                            <button
                                key={
                                    item.user.id
                                }
                                type="button"
                                onClick={() =>
                                    openUserReels(
                                        index
                                    )
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

                                {/* REEL PREVIEW */}

                                {item.reels?.[0]
                                    ?.media?.[0]
                                    ?.type ===
                                "image" ? (

                                    <img
                                        src={
                                            item
                                                .reels[0]
                                                .media[0]
                                                .url
                                        }
                                        alt=""
                                        className="
                                            absolute
                                            inset-0
                                            w-full
                                            h-full
                                            object-cover
                                        "
                                    />

                                ) : item.reels?.[0]
                                      ?.media?.[0]
                                      ?.type ===
                                  "video" ? (

                                    <video
                                        src={
                                            item
                                                .reels[0]
                                                .media[0]
                                                .url
                                        }
                                        muted
                                        playsInline
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
                                            text-xs text-white
                                        "
                                    >
                                        {
                                            item
                                                .reels[0]
                                                ?.content
                                        }
                                    </div>

                                )}


                                {/* DARK OVERLAY */}

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


                                {/* USER INITIAL */}

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
                                        border
                                        border-2
                                        ${
                                            allReelsViewed
                                                ? "border-gray-300"
                                                : "border-green-700"
                                        }
                                    `}
                                >
                                    {
                                        item.user
                                            .initial
                                    }
                                </div>


                                {/* NAME */}

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
                                    {
                                        item.user
                                            .first_name
                                    }
                                </span>

                            </button>

                        )}
                    )}

                </div>

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
                    onSendMessage={
                        sendMessage
                    }
                    sending={sending}
                    reaction={reaction}
                    onReaction={
                        sendReaction
                    }

                    currentUserIndex={selectedUserIndex}
                    reelUsers={reelUsers}
                    currentUser={user}

                    mediaIndex={mediaIndex}
                    setMediaIndex={setMediaIndex}
                    progress={progress}
                    setProgress={setProgress}
                    nextReel={nextReel}

                    markReelViewed={markReelViewed}
                />
            )}

        </>
    );
}