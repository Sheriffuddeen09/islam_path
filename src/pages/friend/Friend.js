import { useAuth } from "../../layout/AuthProvider";
import AdminFriend from "./AdminFriend";
import StudentFriend from "./StudentFriend";

export default function Friend ({students, setStudents, setIncomingRequests, incomingRequests, admins, setAdmins,
                                jobProfile, setJobProfile, show, setShow, fetchJobProfile, showSuccessModal, setShowSuccessModal
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
        showSuccessModal={showSuccessModal} 
        setShowSuccessModal={setShowSuccessModal}
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
        showSuccessModal={showSuccessModal} 
        setShowSuccessModal={setShowSuccessModal}
        />
        )}
        </div>
    )
}