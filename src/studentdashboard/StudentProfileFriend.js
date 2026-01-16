export default function StudentProfileFriend() {

  const { id: profileId } = useParams();
  const navigate = useNavigate();
  const { user: authUser } = useAuth();

  const [acceptedStudents, setAcceptedStudents] = useState([]);
  const [relations, setRelations] = useState([]);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);

  const [profile, setProfile] = useState(null);
  const [visibility, setVisibility] = useState({});
  const [visibleProfile, setVisibleProfile] = useState(1);
  const [relation, setRelation] = useState({});
  const [loadingId, setLoadingId] = useState(null);

  // -------------------------
  // EFFECTS (ALL TOGETHER)
  // -------------------------
  useEffect(() => {
    if (!profileId) return;

    const fetchAll = async () => {
      try {
        const res = await api.get(`/api/student/profile/${profileId}`);
        setAcceptedStudents(res.data.acceptedStudents || []);
        setRelations(res.data.relations || []);
        setIsOwner(res.data.isOwner);
        setProfile(res.data.profile);
        setVisibility(res.data.visibility || {});
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [profileId]);

  // -------------------------
  // DERIVED DATA (NO HOOKS)
  // -------------------------
  const relationMap = {};
  relations.forEach(r => {
    const otherId =
      r.sender_id === authUser?.id
        ? r.receiver_id
        : r.sender_id;

    relationMap[otherId] = r.status;
  });

  // -------------------------
  // ACTIONS
  // -------------------------
  const sendRequest = async (studentId) => {
    await api.post("/api/student-friend/request", { student_id: studentId });
    toast.success("Friend request sent");

    setRelations(prev => [...prev, {
      sender_id: authUser.id,
      receiver_id: studentId,
      status: "pending"
    }]);
  };

  const openChat = async (studentId) => {
    const res = await api.post("/api/chats/start", {
      user_id: studentId,
      type: "student_student"
    });

    navigate(`/chats/${res.data.chat_id}`);
  };

  const handleToggleVisibility = (field) => {
    setVisibility(prev => ({ ...prev, [field]: !prev[field] }));
  };

  // -------------------------
  // RETURNS (ONLY NOW!)
  // -------------------------
  if (loading) {
    return <p>Loading…</p>;
  }

  if (!acceptedStudents.length) {
    return (
      <p className="text-gray-500 text-center mt-6">
        No accepted students yet
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-lg">
        Students ({acceptedStudents.length})
      </h3>

      {acceptedStudents.map(student => {
        const status = relationMap[student.id];

        return (
          <div key={student.id} className="flex justify-between p-3 border rounded">
            <span>{student.name}</span>

            {isOwner && (
              <button
                onClick={() => openChat(student.id)}
                className="bg-purple-600 text-white px-3 py-1 rounded"
              >
                Message
              </button>
            )}

            {!isOwner && (
              <>
                {status === "accepted" && (
                  <button
                    onClick={() => openChat(student.id)}
                    className="bg-purple-600 text-white px-3 py-1 rounded"
                  >
                    Message
                  </button>
                )}

                {status === "pending" && (
                  <button disabled className="bg-gray-400 text-white px-3 py-1 rounded">
                    Pending
                  </button>
                )}

                {!status && (
                  <button
                    onClick={() => sendRequest(student.id)}
                    className="bg-blue-600 text-white px-3 py-1 rounded"
                  >
                    Add Friend
                  </button>
                )}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
