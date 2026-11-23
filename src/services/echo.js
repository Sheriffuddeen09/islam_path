
import Echo from "laravel-echo";
import Pusher from "pusher-js";

window.Pusher = Pusher;

const appKey = process.env.REACT_APP_REVERB_APP_KEY;

if (!appKey) {
    throw new Error(
        "Missing REACT_APP_REVERB_APP_KEY. Check your React .env file and restart the server."
    );
}

const echo = new Echo({
    broadcaster: "reverb",
    key: appKey,
    wsHost: process.env.REACT_APP_REVERB_HOST || "127.0.0.1",
    wsPort: Number(process.env.REACT_APP_REVERB_PORT || 8080),
    wssPort: Number(process.env.REACT_APP_REVERB_PORT || 8080),
    forceTLS: (process.env.REACT_APP_REVERB_SCHEME || "http") === "https",
    enabledTransports: ["ws", "wss"],
});

export default echo;
