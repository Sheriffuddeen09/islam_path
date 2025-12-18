import { useEffect } from "react";
import Echo from "laravel-echo";

function ChatComponent({ userId }) {
    const [unreadMessages, setUnreadMessages] = useState(0);

    useEffect(() => {
        const channel = Echo.private(`chat.${userId}`)
            .listen('NewMessage', (e) => {
                setUnreadMessages(prev => prev + 1);
            });

        // Clean up subscription when component unmounts
        return () => {
            channel.stopListening('NewMessage');
        };
    }, [userId]);

    return (
        <div className="text-black">
            Unread Messages: {unreadMessages}
        </div>
    );
}
