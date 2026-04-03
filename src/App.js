import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

const STORAGE_KEY = "homework-star-tracker-v2";

const avatarThemes = [
  {
    name: "Starter Buddy",
    badge: "Base Avatar",
    torso: "#60a5fa",
    arms: "#38bdf8",
    legs: "#1d4ed8",
    accent: "#2563eb",
    cap: "#dbeafe",
  },
  {
    name: "Rocket Champ",
    badge: "Unlocked at ₹250",
    torso: "#f472b6",
    arms: "#fb7185",
    legs: "#be185d",
    accent: "#9d174d",
    cap: "#fce7f3",
  },
  {
    name: "Jungle Ninja",
    badge: "Unlocked at ₹500",
    torso: "#34d399",
    arms: "#6ee7b7",
    legs: "#047857",
    accent: "#065f46",
    cap: "#d1fae5",
  },
  {
    name: "Galaxy Hero",
    badge: "Unlocked at ₹750",
    torso: "#8b5cf6",
    arms: "#a78bfa",
    legs: "#5b21b6",
    accent: "#4c1d95",
    cap: "#ede9fe",
  },
];

const StarTrackerApp = () => {
  const [homeworkData, setHomeworkData] = useState([]);
  const [stars, setStars] = useState(0);
  const [currentAvatar, setCurrentAvatar] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [details, setDetails] = useState("");

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setHomeworkData(parsed.homeworkData || []);
        setStars(parsed.stars || 0);
        setCurrentAvatar(parsed.currentAvatar || 0);
      } catch (e) {
        console.error("Failed to load data:", e);
      }
    }
  }, []);

  // Persist to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        homeworkData,
        stars,
        currentAvatar,
      })
    );
  }, [homeworkData, stars, currentAvatar]);

  const chartData = useMemo(() => {
    const grouped = {};
    homeworkData.forEach((entry) => {
      if (!grouped[entry.date]) {
        grouped[entry.date] = { date: entry.date, count: 0, stars: 0 };
      }
      grouped[entry.date].count += 1;
      grouped[entry.date].stars += 2;
    });
    return Object.values(grouped).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
  }, [homeworkData]);

  const handleAddHomework = () => {
    if (!subject.trim() || !date) {
      alert("Please fill in all fields");
      return;
    }

    const newEntry = {
      id: Date.now(),
      subject,
      date,
      details,
      completedAt: new Date().toISOString(),
    };

    const newHomeworkData = [...homeworkData, newEntry];
    setHomeworkData(newHomeworkData);
    setStars(stars + 2);

    // Check for avatar unlock
    if (stars + 2 >= 250 && currentAvatar === 0) {
      setCurrentAvatar(1);
    } else if (stars + 2 >= 500 && currentAvatar === 1) {
      setCurrentAvatar(2);
    } else if (stars + 2 >= 750 && currentAvatar === 2) {
      setCurrentAvatar(3);
    }

    // Reset form
    setSubject("");
    setDetails("");
    setDate(new Date().toISOString().split("T")[0]);
    setShowForm(false);
  };

  const handleDeleteHomework = (id) => {
    setHomeworkData(homeworkData.filter((entry) => entry.id !== id));
    setStars(Math.max(0, stars - 2));
  };

  const currentTheme = avatarThemes[currentAvatar];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            📚 Homework Star Tracker
          </h1>
          <p className="text-gray-600">
            Track your homework and unlock amazing avatars!
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Avatar Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-3xl shadow-xl p-8 sticky top-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">
                Your Avatar
              </h2>

              {/* Avatar Display */}
              <div className="flex justify-center mb-8">
                <svg width="200" height="240" viewBox="0 0 200 240">
                  {/* Cap */}
                  <ellipse
                    cx="100"
                    cy="50"
                    rx="45"
                    ry="30"
                    fill={currentTheme.cap}
                    stroke={currentTheme.accent}
                    strokeWidth="2"
                  />

                  {/* Head */}
                  <circle
                    cx="100"
                    cy="85"
                    r="30"
                    fill="#fdbcb4"
                    stroke={currentTheme.accent}
                    strokeWidth="2"
                  />

                  {/* Eyes */}
                  <circle cx="90" cy="80" r="4" fill={currentTheme.accent} />
                  <circle cx="110" cy="80" r="4" fill={currentTheme.accent} />

                  {/* Smile */}
                  <path
                    d="M 90 90 Q 100 95 110 90"
                    stroke={currentTheme.accent}
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                  />

                  {/* Torso */}
                  <rect
                    x="75"
                    y="115"
                    width="50"
                    height="60"
                    rx="10"
                    fill={currentTheme.torso}
                    stroke={currentTheme.accent}
                    strokeWidth="2"
                  />

                  {/* Left Arm */}
                  <rect
                    x="40"
                    y="125"
                    width="35"
                    height="20"
                    rx="10"
                    fill={currentTheme.arms}
                    stroke={currentTheme.accent}
                    strokeWidth="2"
                  />

                  {/* Right Arm */}
                  <rect
                    x="125"
                    y="125"
                    width="35"
                    height="20"
                    rx="10"
                    fill={currentTheme.arms}
                    stroke={currentTheme.accent}
                    strokeWidth="2"
                  />

                  {/* Legs */}
                  <rect
                    x="80"
                    y="175"
                    width="15"
                    height="50"
                    rx="7"
                    fill={currentTheme.legs}
                    stroke={currentTheme.accent}
                    strokeWidth="2"
                  />
                  <rect
                    x="105"
                    y="175"
                    width="15"
                    height="50"
                    rx="7"
                    fill={currentTheme.legs}
                    stroke={currentTheme.accent}
                    strokeWidth="2"
                  />
                </svg>
              </div>

              {/* Avatar Info */}
              <div className="text-center mb-6">
                <h3 className="font-bold text-lg text-gray-800">
                  {currentTheme.name}
                </h3>
                <p className="text-sm text-gray-600 mb-3">{currentTheme.badge}</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-3xl">⭐</span>
                  <span className="text-2xl font-bold text-yellow-500">
                    {stars}
                  </span>
                </div>
              </div>

              {/* Avatar Unlock Progress */}
              <div className="space-y-3">
                {avatarThemes.map((theme, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg text-sm font-medium transition-all ${
                      currentAvatar >= index
                        ? "bg-green-100 border-2 border-green-400 text-green-800"
                        : "bg-gray-100 border-2 border-gray-300 text-gray-600"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span>{theme.name}</span>
                      {currentAvatar >= index ? (
                        <span>✓ Unlocked</span>
                      ) : (
                        <span>{theme.badge.match(/\d+/) || "—"}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right Column - Main Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:col-span-2"
          >
            {/* Statistics */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-white rounded-2xl shadow-md p-6">
                <div className="text-gray-600 text-sm font-medium mb-2">
                  Total Completed
                </div>
                <div className="text-3xl font-bold text-blue-600">
                  {homeworkData.length}
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-md p-6">
                <div className="text-gray-600 text-sm font-medium mb-2">
                  Current Streak
                </div>
                <div className="text-3xl font-bold text-purple-600">
                  {homeworkData.length > 0 ? "🔥" : "—"}
                </div>
              </div>
            </div>

            {/* Chart */}
            {chartData.length > 0 && (
              <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  Progress Chart
                </h2>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient
                        id="colorStars"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#8b5cf6"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#8b5cf6"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      stroke="#666"
                      style={{ fontSize: "12px" }}
                    />
                    <YAxis stroke="#666" style={{ fontSize: "12px" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#f3f4f6",
                        border: "1px solid #d1d5db",
                        borderRadius: "8px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="stars"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorStars)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Add Homework Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowForm(!showForm)}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-2xl font-bold text-lg hover:shadow-lg transition-shadow mb-6"
            >
              {showForm ? "Cancel" : "+ Add Homework"}
            </motion.button>

            {/* Add Homework Form */}
            <AnimatePresence>
              {showForm && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white rounded-3xl shadow-xl p-8 mb-8"
                >
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">
                    Add New Homework
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Subject
                      </label>
                      <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="e.g., Math, English, Science"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date
                      </label>
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Details (Optional)
                      </label>
                      <textarea
                        value={details}
                        onChange={(e) => setDetails(e.target.value)}
                        placeholder="What homework did you complete?"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        rows="3"
                      />
                    </div>
                    <button
                      onClick={handleAddHomework}
                      className="w-full bg-green-500 text-white py-2 rounded-lg font-bold hover:bg-green-600 transition-colors"
                    >
                      Add Homework ✅
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Homework List */}
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Homework History
              </h2>
              {homeworkData.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No homework logged yet. Start by adding some! 📝
                </p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  <AnimatePresence>
                    {homeworkData
                      .slice()
                      .reverse()
                      .map((entry) => (
                        <motion.div
                          key={entry.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg hover:shadow-md transition-shadow"
                        >
                          <div>
                            <h3 className="font-bold text-gray-800">
                              {entry.subject}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {new Date(entry.date).toLocaleDateString()}
                              {entry.details && ` • ${entry.details}`}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-yellow-500 text-lg">⭐+2</span>
                            <button
                              onClick={() => handleDeleteHomework(entry.id)}
                              className="text-red-500 hover:text-red-700 font-bold text-lg"
                            >
                              ✕
                            </button>
                          </div>
                        </motion.div>
                      ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default StarTrackerApp;
