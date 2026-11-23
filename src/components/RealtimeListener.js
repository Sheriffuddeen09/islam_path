
import { useEffect } from "react";
import echo from "../services/echo";

export default function RealtimeListener({
    authUser,
    refreshChatList,
    refreshHeaderCounts,
    refreshAdminRequests,
    refreshStudentRequests,
    refreshMentorRequests,
    refreshProposals,
    refreshFeed,
    refreshNotifications,
}) {

    useEffect(() => {
        if (!authUser?.id) return;

        const channel = echo.private(`users.${authUser.id}`);

        channel.listen(".activity.updated", async (event) => {

            console.log("REALTIME ACTIVITY:", event);

            switch (event.type) {

                case "new_message":
                    await Promise.all([
                        refreshChatList?.(),
                        refreshHeaderCounts?.(),
                    ]);
                    break;

                case "new_video":
                    await refreshFeed?.();
                    break;

                case "friend_request":
                case "friend_accepted":
                    await Promise.all([
                        refreshAdminRequests?.(),
                        refreshHeaderCounts?.(),
                    ]);
                    break;

                case "mentor_request":
                    await Promise.all([
                        refreshMentorRequests?.(),
                        refreshHeaderCounts?.(),
                    ]);
                    break;

                case "new_proposal":
                case "proposal_accepted":
                    await refreshProposals?.();
                    break;

                case "notification":
                    await refreshNotifications?.();
                    await refreshHeaderCounts?.();
                    break;

                case "community_message":
                case "new_comment":
                    await refreshNotifications?.();
                    break;

                default:
                    await refreshHeaderCounts?.();
                    break;
            }
        });

        return () => {
            echo.leave(`users.${authUser.id}`);
        };

    }, [authUser?.id]);
    
    return null;
}
