import { useParams } from "react-router-dom";
import { useAuth } from "../layout/AuthProvider";
import StudentProfilePageId from "../studentdashboard/StudentProfileId";
import ProfilePageId from "../teacherdashboard/AdminProfileId";

export default function ProfileRouter({setIncomingRequests, students, setStudents}) {
  const { id } = useParams();
  const { user } = useAuth();

  if (!user) return null; // or loading spinner

  switch (user.role) {
    case "student":
      return (

      <StudentProfilePageId profileId={id}  setStudents={setStudents} setIncomingRequests={setIncomingRequests}/>
    
    );

    case "admin":
      return <ProfilePageId profileId={id} />;


    default:
      return <div>Unauthorized</div>;
  }
}
