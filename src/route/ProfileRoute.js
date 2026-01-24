import { useParams } from "react-router-dom";
import { useAuth } from "../layout/AuthProvider";
import ProfileId from "./ProfileId";

export default function ProfileRouter({handleMessageOpen, requestStatus}) {
  const { id } = useParams();
  const { user } = useAuth();

  
  return (
    <div>
      <ProfileId profileId={id} handleMessageOpen={handleMessageOpen} requests={requestStatus} />
    </div>
  )
}
