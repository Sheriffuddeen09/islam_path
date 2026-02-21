import { useAuth } from "../../layout/AuthProvider";
import AdminFriend from "./AdminFriend";
import StudentFriend from "./StudentFriend";

export default function Friend ({students, setStudents, setIncomingRequests, incomingRequests, admins, setAdmins}) {

    const {user} = useAuth()
    console.log('user', user)
    
    return (
        <div>
        {user.role === "student" && (
        <StudentFriend students={students} setStudents={setStudents} 
        incomingRequests={incomingRequests} setIncomingRequests={setIncomingRequests}
        />
        )}
        {user.role === "admin" && (
        <AdminFriend admins={admins} setAdmins={setAdmins} 
        incomingRequests={incomingRequests} setIncomingRequests={setIncomingRequests}
        />
        )}
        </div>
    )
}