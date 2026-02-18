import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./dashboard.css";
import {Line} from "react-chartjs-2";
import {
 Chart as ChartJS,
 LineElement,
 CategoryScale,
 LinearScale,
 PointElement
} from "chart.js";

ChartJS.register(LineElement,CategoryScale,LinearScale,PointElement);
export default function Dashboard() {
  const navigate = useNavigate();
  const [recoveryData,setRecoveryData]=useState(null);
  const [user, setUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
const [selectedMetric, setSelectedMetric] = useState("hr");
  const [age, setAge] = useState("");
  const [condition, setCondition] = useState("");
  const [msg, setMsg] = useState("");
  const [chat, setChat] = useState([]);
  const [status, setStatus] = useState("Calculating...");
  const [score, setScore] = useState(0);

  const [cameraOn, setCameraOn] = useState(false);

  const [stats, setStats] = useState({
    sit: 0,
    arm: 0,
    march: 0
  });

  // 💊 Medication popup states
  const [showMedModal, setShowMedModal] = useState(false);
  const [medName, setMedName] = useState("");
  const [medTime, setMedTime] = useState("");
  const [reminders, setReminders] = useState([]);
const sendMessage = async () => {
  if (!msg) return;

  setChat(c=>[...c,{sender:"user",text:msg}]);

  const res = await fetch("http://127.0.0.1:5000/chat",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({
      message: msg,
      disease: condition,
      score: score
    })
  });

  const data = await res.json();

  setChat(c=>[...c,{sender:"bot",text:data.reply}]);
  setMsg("");
};
// 🎙 VOICE SUMMARY FUNCTION
const handleVoiceSummary = () => {
  if (!recoveryData) {
    alert("Recovery data not loaded yet");
    return;
  }

  const latestHR = recoveryData.hr[recoveryData.hr.length - 1];
  const latestSpO2 = recoveryData.spo2[recoveryData.spo2.length - 1];
  const latestActivity = recoveryData.activity[recoveryData.activity.length - 1];

  let summary = "";

  // Heart Rate Analysis
  if (latestHR > 100) {
    summary += "Your heart rate is slightly elevated. ";
  } else if (latestHR < 60) {
    summary += "Your heart rate is lower than normal. ";
  } else {
    summary += "Your heart rate is within a healthy range. ";
  }

  // SpO2 Analysis
  if (latestSpO2 < 94) {
    summary += "Oxygen levels are below ideal range. ";
  } else {
    summary += "Oxygen levels are stable. ";
  }

  // Activity Analysis
  if (latestActivity < 30) {
    summary += "Your activity level is low. Try light movement if advised.";
  } else {
    summary += "Your activity level looks good.";
  }

  // Speak using browser voice
  const speech = new SpeechSynthesisUtterance(summary);
  speech.rate = 1;
  speech.pitch = 1;
  window.speechSynthesis.speak(speech);

};
  // AUTH
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


  useEffect(()=>{
  fetch("http://127.0.0.1:5000/recovery")
    .then(res=>res.json())
    .then(data=>setRecoveryData(data));
},[]);
  // LOAD MEDS
  useEffect(() => {
    const saved = localStorage.getItem("medReminders");
    if (saved) setReminders(JSON.parse(saved));
  }, []);

  // MED ALERT
  // ✅ DAILY MEDICATION ALERT
useEffect(() => {
  const interval = setInterval(() => {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0,5);
    const today = now.toDateString();

    const updated = reminders.map(r => {

      // if time matches AND not alerted today
      if (r.time === currentTime && r.lastAlert !== today) {
        alert(`💊 Time to take ${r.name}`);

        return {
          ...r,
          lastAlert: today
        };
      }

      return r;
    });

    setReminders(updated);
    localStorage.setItem("medReminders", JSON.stringify(updated));

  }, 30000);

  return () => clearInterval(interval);
}, [reminders]);

  // SCORE
  useEffect(() => {
    const fakeScore = Math.floor(Math.random() * 100);
    setScore(fakeScore);

    if (fakeScore >= 80) setStatus("Excellent");
    else if (fakeScore >= 60) setStatus("Stable");
    else if (fakeScore >= 40) setStatus("Improving");
    else setStatus("Critical");
  }, []);

  // FETCH AI
  useEffect(() => {
    if (!cameraOn) return;

    const interval = setInterval(() => {
      fetch("http://127.0.0.1:5000/stats")
        .then(res => res.json())
        .then(data => setStats(data));
    }, 1000);

    return () => clearInterval(interval);
  }, [cameraOn]);

  // ADD MEDICINE (inside popup)
  const addReminder = () => {
    if (!medName || !medTime) return;

    const newRem = [
      ...reminders,
      { name: medName, time: medTime, lastAlert: null }
    ];

    setReminders(newRem);
    localStorage.setItem("medReminders", JSON.stringify(newRem));

    setMedName("");
    setMedTime("");
  };

  // DELETE MED
  const deleteMed = (i) => {
    const updated = reminders.filter((_,idx)=>idx!==i);
    setReminders(updated);
    localStorage.setItem("medReminders", JSON.stringify(updated));
  };

  const savePatientData = () => {
    localStorage.setItem("patientData", JSON.stringify({ age, condition }));
    setShowModal(false);
  };

  const logout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  if (!user) return null;
if (!user) return null;

// 👉 ADD HERE 
const recoveryMean = recoveryData
  ? recoveryData.hr.map((_, i) => {
      return (
        (recoveryData.hr[i] +
         recoveryData.spo2[i] +
         recoveryData.activity[i]) / 3
      );
    })
  : [];
  return (
    <div className="dashboard">

      <div className="dashboardLeft">

       <div className="graphCard">
  <h2>Recovery Graph</h2>
<div style={{marginBottom:"15px"}}>
  <button onClick={()=>setSelectedMetric("hr")}>Heart Rate</button>
  <button onClick={()=>setSelectedMetric("spo2")}>SpO2</button>
  <button onClick={()=>setSelectedMetric("activity")}>Activity</button>
  <button onClick={()=>setSelectedMetric("recovery")}>Recovery</button>
</div>
  {recoveryData && (
  <Line
  data={{
    labels: recoveryData.hr.map((_, i) => i + 1),

   datasets: [
  {
    label:
      selectedMetric === "hr"
        ? "Heart Rate"
        : selectedMetric === "spo2"
        ? "SpO2"
        : selectedMetric === "activity"
        ? "Activity"
        : "Recovery Score",

    data:
      selectedMetric === "hr"
        ? recoveryData.hr
        : selectedMetric === "spo2"
        ? recoveryData.spo2
        : selectedMetric === "activity"
        ? recoveryData.activity
        : recoveryMean,   // ✅ THIS LINE WAS MISSING

    borderColor:
      selectedMetric === "recovery" ? "#28a745" : "#1f77ff",

    backgroundColor:
      selectedMetric === "recovery"
        ? "rgba(40,167,69,0.15)"
        : "rgba(31,119,255,0.1)",

    tension: 0.4,
    pointRadius: 2
  }
]
  }}

  options={{
    responsive: true,
    maintainAspectRatio: false,

    plugins:{
      legend:{display:true}
    },

    scales:{
      x:{
        title:{display:true,text:"Time (samples)"}
      },
      y:{
        title:{
          display:true,
          text:
  selectedMetric === "hr"
    ? "Heart Rate"
    : selectedMetric === "spo2"
    ? "SpO2 (%)"
    : selectedMetric === "activity"
    ? "Activity"
    : "Recovery Score"
        }
      }
    }
  }}
/>
  )}
</div>

        {/* FLEX ROW */}
        <div style={{display:"flex",gap:"20px"}}>

          {/* AI MONITOR */}
          <div className="graphCard" style={{flex:1,height:"420px"}}>
            <h2>Live AI Monitor</h2>

            {!cameraOn ? (
              <button onClick={()=>setCameraOn(true)} className="startBtn">
                ▶ Start Camera
              </button>
            ) : (
              <button onClick={()=>setCameraOn(false)} className="stopBtn">
                ⏹ Stop Camera
              </button>
            )}

            {cameraOn && (
              <>
                <img src="http://127.0.0.1:5000/video"
                     alt="Live"
                     style={{
                       width:"100%",
                       borderRadius:"10px",
                       marginTop:"10px",
                       maxHeight:"220px",
                       objectFit:"cover"
                     }}/>

                <p>Sit: {stats.sit}</p>
                <p>Arm: {stats.arm}</p>
                <p>March: {stats.march}</p>
              </>
            )}
          </div>

          {/* MEDICATION CARD */}
          <div className="graphCard" style={{flex:1,height:"420px"}}>
            <h2>💊 Medication Reminder</h2>

            <button className="startBtn"
              onClick={()=>setShowMedModal(true)}>
              Add Reminder
            </button>

            <div style={{
              maxHeight:"300px",
              overflowY:"auto",
              marginTop:"10px"
            }}>
              {reminders.map((r,i)=>(
                <div key={i} style={{
                  display:"flex",
                  justifyContent:"space-between",
                  background:"#eee",
                  padding:"10px",
                  borderRadius:"8px",
                  marginBottom:"8px"
                }}>
                  <span>{r.name} — {r.time}</span>
                  <button onClick={()=>deleteMed(i)}>❌</button>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="dashboardRight">
       <div className="profileCard">
  <h3>PROFILE</h3>

  <img
    src={user.photoURL || "https://i.pravatar.cc/150"}
    className="profileImg"
  />

  <h2>{user.displayName || "User"}</h2>
  <p>Email: {user.email}</p>
  <p>Age: {age}</p>
  <p>Condition: {condition}</p>
  <p>Status: {status}</p>

  {/* CHATBOT INSIDE PROFILE */}
  <div className="chatbot">
    <h4>AI Assistant</h4>

    <div className="chatbox">
      {chat.map((c, i) => (
        <div key={i} className={`msg ${c.sender}`}>
          {c.text}
        </div>
      ))}
    </div>

    <div className="chatinput">
      <input
        value={msg}
        onChange={(e) => setMsg(e.target.value)}
        placeholder="Ask about recovery..."
      />
      <button onClick={sendMessage}>Send</button>
    </div>
    <div style={{marginTop:"10px"}}>
  <button
    onClick={handleVoiceSummary}
    style={{
      width:"100%",
      padding:"8px",
      borderRadius:"8px",
      border:"none",
      background:"#1f77ff",
      color:"white",
      cursor:"pointer"
    }}
  >
    🎙 Voice Recovery Summary
  </button>
</div>
  </div>
</div>
        <button className="logoutBtn" onClick={logout}>Logout</button>
      </div>

      {/* MED POPUP */}
      {showMedModal && (
        <div className="modalOverlay">
          <div className="modal">
            <h2>Add Medicines</h2>

            <input
              placeholder="Medicine"
              value={medName}
              onChange={e=>setMedName(e.target.value)}
            />

            <input
              type="time"
              value={medTime}
              onChange={e=>setMedTime(e.target.value)}
            />

            <button onClick={addReminder}>Add</button>

            <div style={{
              maxHeight:"200px",
              overflowY:"auto",
              marginTop:"10px"
            }}>
              {reminders.map((r,i)=>(
                <p key={i}>{r.name} — {r.time}</p>
              ))}
            </div>

            <button onClick={()=>setShowMedModal(false)}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* PATIENT MODAL */}
      {showModal && (
        <div className="modalOverlay">
          <div className="modal">
            <h2>Patient Details</h2>

            <input type="number"
              placeholder="Age"
              onChange={e=>setAge(e.target.value)}
            />

            <input
              placeholder="Condition"
              onChange={e=>setCondition(e.target.value)}
            />

            <button onClick={savePatientData}>Save</button>
          </div>
        </div>
      )}
    </div>
  );
}