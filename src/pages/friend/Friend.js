import { useAuth } from "../../layout/AuthProvider";
import AdminFriend from "./AdminFriend";
import StudentFriend from "./StudentFriend";

export default function Friend ({students, setStudents, setIncomingRequests, incomingRequests, admins, setAdmins}) {

    const auth = useAuth();

    
    return (
        <div>
        {auth.user?.role === "student" && (
        <StudentFriend students={students} setStudents={setStudents} 
        incomingRequests={incomingRequests} setIncomingRequests={setIncomingRequests}
        />
        )}
        {auth.user?.role === "admin" && (
        <AdminFriend admins={admins} setAdmins={setAdmins} 
        incomingRequests={incomingRequests} setIncomingRequests={setIncomingRequests}
        />
        )}
        </div>
    )
}