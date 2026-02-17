import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [age, setAge] = useState("");
  const [condition, setCondition] = useState("");

  const [status, setStatus] = useState("Calculating...");
  const [score, setScore] = useState(0);

  const [cameraOn, setCameraOn] = useState(false); // ✅ NEW

  const [stats, setStats] = useState({
    sit: 0,
    arm: 0,
    march: 0
  });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) navigate("/login");
      else {
        setUser(u);

        const saved = localStorage.getItem("patientData");
        if (!saved) setShowModal(true);
        else {
          const d = JSON.parse(saved);
          setAge(d.age);
          setCondition(d.condition);
        }
      }
    });

    return () => unsub();
  }, []);

  // simulated score
  useEffect(() => {
    const fakeScore = Math.floor(Math.random() * 100);
    setScore(fakeScore);

    if (fakeScore >= 80) setStatus("Excellent");
    else if (fakeScore >= 60) setStatus("Stable");
    else if (fakeScore >= 40) setStatus("Improving");
    else setStatus("Critical");
  }, []);

  // ✅ Fetch stats ONLY when camera ON
  useEffect(() => {
    if (!cameraOn) return;

    const interval = setInterval(() => {
      fetch("http://127.0.0.1:5000/stats")
        .then(res => res.json())
        .then(data => setStats(data))
        .catch(() => {});
    }, 1000);

    return () => clearInterval(interval);
  }, [cameraOn]);

  const savePatientData = () => {
    const data = { age, condition };
    localStorage.setItem("patientData", JSON.stringify(data));
    setShowModal(false);
  };

  const logout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  if (!user) return null;

  return (
    <div className="dashboard">

      <div className="dashboardLeft">

        <div className="graphCard">
          <h2>Recovery Graph</h2>
          <p>ML graph will appear here</p>
          <h3>Recovery Score: {score}</h3>
        </div>

        {/* CAMERA CARD */}
        <div className="graphCard">
          <h2>Live AI Monitor</h2>

          {/* ✅ BUTTONS */}
          {!cameraOn ? (
            <button
              onClick={() => setCameraOn(true)}
              className="startBtn"
            >
              ▶ Start Camera
            </button>
          ) : (
            <button
              onClick={() => setCameraOn(false)}
              className="stopBtn"
            >
              ⏹ Stop Camera
            </button>
          )}

          {/* ✅ SHOW VIDEO ONLY IF ON */}
          {cameraOn && (
            <>
              <img
                src="http://127.0.0.1:5000/video"
                alt="Live"
                style={{
                  width: "100%",
                  borderRadius: "10px",
                  marginTop: "10px"
                }}
              />

              <div style={{ marginTop: "10px" }}>
                <p>Sit-to-Stand: {stats.sit}</p>
                <p>Arm Raises: {stats.arm}</p>
                <p>March Steps: {stats.march}</p>
              </div>
            </>
          )}
        </div>

      </div>

      <div className="dashboardRight">
        <div className="profileCard">
          <h3>PROFILE</h3>

          <img
            src={user.photoURL || "https://i.pravatar.cc/150"}
            alt=""
            className="profileImg"
          />

          <h2>{user.displayName || "User"}</h2>

          <p>Email: {user.email}</p>
          <p>Age: {age}</p>
          <p>Condition: {condition}</p>
          <p>Status: {status}</p>
        </div>

        <button className="logoutBtn" onClick={logout}>
          Logout
        </button>
      </div>

      {showModal && (
        <div className="modalOverlay">
          <div className="modal">
            <h2>Patient Details</h2>

            <input
              placeholder="Age"
              type="number"
              onChange={(e) => setAge(e.target.value)}
            />

            <input
              placeholder="Condition"
              onChange={(e) => setCondition(e.target.value)}
            />

            <button onClick={savePatientData}>
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}