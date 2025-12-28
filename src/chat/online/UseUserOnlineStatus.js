import { useEffect, useState } from "react";
import api from "../../Api/axios";

export function useUserOnlineStatus(userId) {
  const [status, setStatus] = useState({
    online: false,
    lastSeen: null,
  });

  useEffect(() => {
    if (!userId) return;

    api.get(`/api/users/${userId}/status`)
      .then(res => {
        setStatus({
          online: res.data.online,
          lastSeen: res.data.last_seen_at,
        });
      })
      .catch(() => {
        setStatus({ online: false, lastSeen: null });
      });
  }, [userId]);

  return status;
}
