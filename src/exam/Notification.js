import { useEffect, useState } from "react";
import api from "../../api/axios";


export default function NotificationBell() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    api.get("/api/notifications/unread-count")
      .then(res => setCount(res.data.count));
  }, []);


 



  return (
    <div className="relative">
      🔔
      {count > 0 && (
        <span className="badge">{count}</span>
      )}
    </div>
  );
}
