import Echo from "laravel-echo";
import Pusher from "pusher-js";

window.Pusher = Pusher;

export function initEcho() {
  if (window.Echo) return window.Echo;

  window.Echo = new Echo({
    broadcaster: "pusher",
    key: process.env.REACT_APP_PUSHER_KEY || "local",
    cluster: process.env.REACT_APP_PUSHER_CLUSTER || "mt1",
    wsHost: process.env.REACT_APP_WS_HOST || window.location.hostname,
    wsPort: process.env.REACT_APP_WS_PORT || 6001,
    forceTLS: false,
    enabledTransports: ["ws", "wss"]
  });

  return window.Echo;
}
