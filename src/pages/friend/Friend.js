import { useAuth } from "../../layout/AuthProvider";
import AdminFriend from "./AdminFriend";
import StudentFriend from "./StudentFriend";

export default function Friend ({students, setStudents, setIncomingRequests, incomingRequests, admins, setAdmins,
                                jobProfile, setJobProfile, show, setShow, fetchJobProfile
}) {

    const auth = useAuth();

    
    return (
        <div>
        {auth.user?.role === "student" && (
        <StudentFriend students={students} setStudents={setStudents} 
        incomingRequests={incomingRequests} setIncomingRequests={setIncomingRequests}
        jobProfile={jobProfile}
        setJobProfile={setJobProfile}
        fetchJobProfile={fetchJobProfile}
        show={show}
        setShow={setShow}
        />
        )}
        {auth.user?.role === "admin" && (
        <AdminFriend admins={admins} setAdmins={setAdmins} 
        incomingRequests={incomingRequests} setIncomingRequests={setIncomingRequests}
        jobProfile={jobProfile}
        setJobProfile={setJobProfile}
        fetchJobProfile={fetchJobProfile}
        show={show}
        setShow={setShow}
        />
        )}
        </div>
    )
}