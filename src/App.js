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
  {
    name: "Blaze Runner",
    badge: "Unlocked at ₹1000",
    torso: "#fb923c",
    arms: "#fdba74",
    legs: "#c2410c",
    accent: "#9a3412",
    cap: "#ffedd5",
  },
  {
    name: "Steel Knight",
    badge: "Unlocked at ₹1250",
    torso: "#94a3b8",
    arms: "#cbd5e1",
    legs: "#475569",
    accent: "#1e293b",
    cap: "#f1f5f9",
  },
  {
    name: "Golden Legend",
    badge: "Unlocked at ₹1500",
    torso: "#fbbf24",
    arms: "#fde68a",
    legs: "#b45309",
    accent: "#92400e",
    cap: "#fef3c7",
  },
];

const rewardMilestones = [
  {
    amount: 250,
    title: "Story Time",
    detail: "Unlock a special story session.",
    emoji: "📚",
  },
  {
    amount: 500,
    title: "Papa Play Time",
    detail: "Unlock one dedicated play session with Papa.",
    emoji: "⚽",
  },
  {
    amount: 1000,
    title: "New Game",
    detail: "Unlock a brand new game reward.",
    emoji: "🎮",
  },
];

const defaultForm = {
  duration: 30,
  completedHomework: true,
  stayedInOnePlace: true,
  gotUp: false,
  talked: false,
  tookBreak: false,
  focused: true,
  goodBehavior: false,
  noComplaint: false,
  notes: "",
};

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(dateKey) {
  const date = new Date(dateKey + "T00:00:00");
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getMonthLabel(date) {
  return date.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

function calculateStars(entry) {
  if (Number(entry.duration) > 60) {
    return {
      baseStars: 0,
      bonusStars: 0,
      totalStars: 0,
      reasons: ["More than 60 minutes means 0 stars for the day."],
      status: "reset",
    };
  }

  let baseStars = 7;
  const reasons = [];

  if (!entry.completedHomework) {
    baseStars -= 1;
    reasons.push("Homework was not fully completed.");
  }
  if (Number(entry.duration) > 30) {
    baseStars -= 1;
    reasons.push("Took more than 30 minutes.");
  }
  if (Number(entry.duration) > 45) {
    baseStars -= 1;
    reasons.push("Took more than 45 minutes.");
  }
  if (!entry.stayedInOnePlace) {
    baseStars -= 1;
    reasons.push("Did not sit in one place.");
  }
  if (entry.gotUp) {
    baseStars -= 1;
    reasons.push("Got up during homework.");
  }
  if (entry.talked) {
    baseStars -= 1;
    reasons.push("Talked during homework.");
  }
  if (entry.tookBreak) {
    baseStars -= 1;
    reasons.push("Took a break in between.");
  }
  if (!entry.focused) {
    baseStars -= 1;
    reasons.push("Focus was broken.");
  }

  baseStars = Math.max(0, baseStars);

  let bonusStars = 0;
  if (entry.goodBehavior) bonusStars += 1;
  if (entry.noComplaint) bonusStars += 1;

  if (bonusStars > 0) {
    reasons.push(`Bonus stars earned: ${bonusStars}.`);
  }

  if (!reasons.length) {
    reasons.push("Perfect session. All homework stars earned.");
  }

  const totalStars = baseStars + bonusStars;
  const status = totalStars >= 8 ? "epic" : totalStars >= 6 ? "great" : totalStars >= 3 ? "good" : "tryAgain";

  return {
    baseStars,
    bonusStars,
    totalStars,
    reasons,
    status,
  };
}

function getWeekStart(dateKey) {
  const d = new Date(dateKey + "T00:00:00");
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

function weekLabelFromDate(dateKey) {
  const start = getWeekStart(dateKey);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return `${start.toLocaleDateString(undefined, { month: "short", day: "numeric" })} - ${end.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;
}

function getCalendarDays(currentMonth) {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);

  const start = new Date(first);
  const startDay = start.getDay();
  const mondayShift = startDay === 0 ? 6 : startDay - 1;
  start.setDate(start.getDate() - mondayShift);

  const end = new Date(last);
  const endDay = end.getDay();
  const sundayShift = endDay === 0 ? 0 : 7 - endDay;
  end.setDate(end.getDate() + sundayShift);

  const days = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

function getStarTone(stars) {
  if (stars >= 8) return "bg-emerald-100 text-emerald-800 border-emerald-200";
  if (stars >= 5) return "bg-amber-100 text-amber-800 border-amber-200";
  if (stars >= 1) return "bg-orange-100 text-orange-800 border-orange-200";
  return "bg-rose-100 text-rose-800 border-rose-200";
}

function playSound(kind = "save") {
  if (typeof window === "undefined") return;
  const AudioContextRef = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextRef) return;

  const ctx = new AudioContextRef();
  const now = ctx.currentTime;
  const patterns = {
    save: [330, 392],
    good: [392, 494, 587],
    epic: [523, 659, 784, 1046],
    unlock: [440, 554, 659, 880],
  };

  const tones = patterns[kind] || patterns.save;
  tones.forEach((frequency, index) => {
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = "triangle";
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, now + index * 0.14);
    gain.gain.exponentialRampToValueAtTime(0.15, now + index * 0.14 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.14 + 0.12);
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start(now + index * 0.14);
    oscillator.stop(now + index * 0.14 + 0.14);
  });

  window.setTimeout(() => {
    if (ctx.state !== "closed") ctx.close();
  }, 1000);
}

function AvatarCard({ faceImage, theme, title, subtitle, active = false, locked = false }) {
  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.01 }}
      className={`rounded-[28px] border p-4 shadow-sm transition ${
        active ? "border-fuchsia-300 bg-fuchsia-50" : "border-slate-200 bg-white"
      } ${locked ? "opacity-50" : "opacity-100"}`}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-bold text-slate-900">{title}</div>
          <div className="text-xs text-slate-500">{subtitle}</div>
        </div>
        <div className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${locked ? "bg-slate-200 text-slate-500" : active ? "bg-fuchsia-100 text-fuchsia-700" : "bg-slate-100 text-slate-700"}`}>
          {locked ? "Locked" : active ? "Active" : "Unlocked"}
        </div>
      </div>

      <div className="rounded-[24px] bg-gradient-to-b from-sky-50 to-indigo-50 py-4">
        <div className="mx-auto flex w-full items-end justify-center">
          <div className="flex flex-col items-center">
            <div
              className="relative mb-2 h-20 w-20 overflow-hidden rounded-full border-4 bg-white shadow-md"
              style={{ borderColor: theme.accent }}
            >
              {faceImage && !locked ? (
                <img src={faceImage} alt="Child avatar" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-3xl">😎</div>
              )}
              <div className="absolute inset-x-0 top-0 h-4" style={{ backgroundColor: theme.cap }} />
            </div>

            <div className="flex flex-col items-center">
              <div className="mb-1 h-14 w-16 rounded-lg shadow-sm" style={{ backgroundColor: theme.torso }} />
              <div className="-mt-14 flex w-28 justify-between px-1">
                <div className="h-12 w-5 rounded-lg" style={{ backgroundColor: theme.arms }} />
                <div className="h-12 w-5 rounded-lg" style={{ backgroundColor: theme.arms }} />
              </div>
              <div className="mt-1 flex gap-2">
                <div className="h-14 w-6 rounded-lg" style={{ backgroundColor: theme.legs }} />
                <div className="h-14 w-6 rounded-lg" style={{ backgroundColor: theme.legs }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ScoreCard({ label, value, subvalue, glow = false }) {
  return (
    <div className={`rounded-[28px] border p-4 shadow-sm ${glow ? "border-fuchsia-200 bg-gradient-to-br from-fuchsia-50 to-amber-50" : "border-slate-200 bg-white"}`}>
      <div className="text-sm text-slate-500">{label}</div>
      <div className="mt-2 text-2xl font-black text-slate-900">{value}</div>
      {subvalue ? <div className="mt-1 text-xs text-slate-500">{subvalue}</div> : null}
    </div>
  );
}

function Toggle({ checked, onChange, label, positive = true, emoji }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-[22px] border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-lg">{emoji}</div>
        <span className="pr-2 text-sm font-medium text-slate-700">{label}</span>
      </div>
      <button
        type="button"
        onClick={onChange}
        className={`relative h-7 w-12 rounded-full transition ${checked ? (positive ? "bg-emerald-500" : "bg-rose-500") : "bg-slate-300"}`}
      >
        <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${checked ? "left-6" : "left-1"}`} />
      </button>
    </label>
  );
}

function ProgressMeter({ value, max, label }) {
  const percentage = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-semibold text-slate-700">{label}</span>
        <span className="text-slate-500">{value} / {max}</span>
      </div>
      <div className="h-4 rounded-full bg-slate-200">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          className="h-4 rounded-full bg-gradient-to-r from-fuchsia-500 via-orange-400 to-amber-300"
        />
      </div>
    </div>
  );
}

export default function HomeworkStarTrackerApp() {
  const [profileName, setProfileName] = useState("Homework Hero");
  const [childPhoto, setChildPhoto] = useState("");
  const [records, setRecords] = useState({});
  const [selectedDate, setSelectedDate] = useState(todayKey());
  const [form, setForm] = useState(defaultForm);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [lastSavedMessage, setLastSavedMessage] = useState("");
  const [soundOn, setSoundOn] = useState(true);
  const [celebration, setCelebration] = useState(null);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      setProfileName(parsed.profileName || "Homework Hero");
      setChildPhoto(parsed.childPhoto || "");
      setRecords(parsed.records || {});
      setSoundOn(parsed.soundOn ?? true);
    } catch (e) {
      console.error("Could not load saved data", e);
    }
  }, []);

  useEffect(() => {
    const data = { profileName, childPhoto, records, soundOn };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [profileName, childPhoto, records, soundOn]);

  useEffect(() => {
    const existing = records[selectedDate];
    setForm(existing ? { ...defaultForm, ...existing } : defaultForm);
  }, [selectedDate, records]);

  const recordsArray = useMemo(() => {
    return Object.values(records).sort((a, b) => a.date.localeCompare(b.date));
  }, [records]);

  const totalStars = useMemo(
    () => recordsArray.reduce((sum, item) => sum + (item.totalStars || item.stars || 0), 0),
    [recordsArray]
  );

  const creditedAmount = Math.floor(totalStars / 7) * 250;
  const pendingStars = totalStars % 7;
  const permanentlyUnlockedCount = Math.min(
    avatarThemes.length - 1,
    Math.floor(creditedAmount / 250)
  );

  const weeklyData = useMemo(() => {
    const buckets = {};
    recordsArray.forEach((item) => {
      const label = weekLabelFromDate(item.date);
      if (!buckets[label]) {
        buckets[label] = { week: label, stars: 0, sessions: 0 };
      }
      buckets[label].stars += item.totalStars || item.stars || 0;
      buckets[label].sessions += 1;
    });
    return Object.values(buckets).slice(-8);
  }, [recordsArray]);

  const thisWeekStars = weeklyData.length ? weeklyData[weeklyData.length - 1].stars : 0;
  const previousWeekStars = weeklyData.length > 1 ? weeklyData[weeklyData.length - 2].stars : 0;
  const trendDown = weeklyData.length > 1 && thisWeekStars < previousWeekStars;
  const activeUnlockedCount = Math.max(0, permanentlyUnlockedCount - (trendDown ? 1 : 0));
  const activeTheme = avatarThemes[Math.min(activeUnlockedCount, avatarThemes.length - 1)];

  const thisMonthLabel = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}`;
  const monthStars = recordsArray
    .filter((item) => item.date.startsWith(thisMonthLabel))
    .reduce((sum, item) => sum + (item.totalStars || item.stars || 0), 0);

  const todayWeekStart = getWeekStart(todayKey()).toISOString().slice(0, 10);
  const weekStars = recordsArray
    .filter((item) => item.date >= todayWeekStart)
    .reduce((sum, item) => sum + (item.totalStars || item.stars || 0), 0);

  const completionRate = recordsArray.length
    ? Math.round((recordsArray.filter((item) => (item.totalStars || item.stars || 0) >= 6).length / recordsArray.length) * 100)
    : 0;

  const projectedNextCredit = pendingStars === 0 ? 7 : 7 - pendingStars;
  const previewResult = calculateStars(form);
  const calendarDays = getCalendarDays(currentMonth);
  const rewardProgress = creditedAmount % 1000;

  const streak = useMemo(() => {
    let count = 0;
    const keys = Object.keys(records).sort().reverse();
    let cursor = new Date(todayKey() + "T00:00:00");
    for (let i = 0; i < keys.length; i += 1) {
      const key = cursor.toISOString().slice(0, 10);
      const entry = records[key];
      if (entry && (entry.totalStars || entry.stars || 0) > 0) {
        count += 1;
      } else {
        break;
      }
      cursor.setDate(cursor.getDate() - 1);
    }
    return count;
  }, [records]);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function triggerCelebration(message, soundKind = "good") {
    setCelebration({ id: Date.now(), message });
    if (soundOn) playSound(soundKind);
    window.setTimeout(() => setCelebration(null), 2400);
  }

  function handleSave() {
    const beforeAmount = Math.floor(totalStars / 7) * 250;
    const result = calculateStars(form);
    const entry = {
      ...form,
      duration: Number(form.duration),
      baseStars: result.baseStars,
      bonusStars: result.bonusStars,
      totalStars: result.totalStars,
      stars: result.totalStars,
      reasons: result.reasons,
      status: result.status,
      date: selectedDate,
      updatedAt: new Date().toISOString(),
    };

    const nextRecords = { ...records, [selectedDate]: entry };
    const nextTotalStars = Object.values(nextRecords).reduce((sum, item) => sum + (item.totalStars || item.stars || 0), 0);
    const afterAmount = Math.floor(nextTotalStars / 7) * 250;

    setRecords(nextRecords);
    setLastSavedMessage(`Saved ${result.totalStars} star${result.totalStars === 1 ? "" : "s"} for ${formatDate(selectedDate)}.`);

    if (afterAmount > beforeAmount) {
      triggerCelebration(`Awesome! ₹${afterAmount} unlocked!`, "unlock");
    } else if (result.totalStars >= 8) {
      triggerCelebration("Superstar day! Bonus stars earned!", "epic");
    } else if (result.totalStars >= 6) {
      triggerCelebration("Great job! Keep the streak going!", "good");
    } else if (soundOn) {
      playSound("save");
    }
  }

  function handlePhotoUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setChildPhoto(String(reader.result || ""));
      triggerCelebration("Photo added to the hero avatar!", "good");
    };
    reader.readAsDataURL(file);
  }

  function shiftMonth(direction) {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + direction, 1));
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#fff7ed_0%,#fdf2f8_25%,#eff6ff_70%,#eef2ff_100%)] p-3 text-slate-900 md:p-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <AnimatePresence>
          {celebration ? (
            <motion.div
              key={celebration.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed left-1/2 top-4 z-50 w-[92%] max-w-md -translate-x-1/2 rounded-[28px] border border-amber-200 bg-white/95 p-4 shadow-2xl backdrop-blur"
            >
              <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[28px]">
                {[...Array(12)].map((_, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20, x: 0, rotate: 0 }}
                    animate={{ opacity: [0, 1, 0], y: -120, x: (index % 2 === 0 ? -1 : 1) * (16 + index * 3), rotate: index * 24 }}
                    transition={{ duration: 1.8, delay: index * 0.03 }}
                    className="absolute bottom-4 left-1/2 text-xl"
                  >
                    ⭐
                  </motion.div>
                ))}
              </div>
              <div className="relative z-10 text-center">
                <div className="text-3xl">🎉</div>
                <div className="mt-1 text-lg font-black text-slate-900">{celebration.message}</div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-5 lg:grid-cols-[1.2fr,0.8fr]"
        >
          <div className="overflow-hidden rounded-[32px] bg-gradient-to-br from-fuchsia-600 via-violet-600 to-sky-600 p-6 text-white shadow-xl">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="text-sm font-bold uppercase tracking-[0.28em] text-fuchsia-100">Kid Homework Quest</div>
                <h1 className="mt-2 text-3xl font-black md:text-5xl">{profileName}</h1>
                <p className="mt-3 max-w-2xl text-sm text-fuchsia-50 md:text-base">
                  A playful Android-style reward app with stars, sounds, celebration popups, bonus behavior points, and unlockable rewards.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">📱 Android-friendly layout</span>
                  <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">🎵 Sound effects</span>
                  <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">🎉 Celebration animations</span>
                </div>
              </div>

              <div className="rounded-[28px] bg-white/12 p-4 backdrop-blur-md">
                <div className="mb-3 flex items-center justify-between gap-3 text-sm text-fuchsia-50">
                  <span>Active hero</span>
                  <button
                    onClick={() => setSoundOn((prev) => !prev)}
                    className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold"
                  >
                    {soundOn ? "🔊 Sound On" : "🔈 Sound Off"}
                  </button>
                </div>
                <div className="w-44">
                  <AvatarCard
                    faceImage={childPhoto}
                    theme={activeTheme}
                    title={activeTheme.name}
                    subtitle={trendDown ? "One level hidden until progress improves" : "Progress is strong"}
                    active
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[32px] border border-white/60 bg-white/85 p-6 shadow-xl backdrop-blur">
            <div className="text-lg font-black text-slate-900">Profile and thumbnail</div>
            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-600">Child name</label>
                <input
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full rounded-[20px] border border-slate-200 px-4 py-3 outline-none transition focus:border-fuchsia-400"
                  placeholder="Enter name"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-600">Upload face photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="block w-full rounded-[20px] border border-slate-200 px-4 py-3 text-sm"
                />
                <p className="mt-2 text-xs text-slate-500">
                  The face photo is placed on the hero avatar so the thumbnail looks personal and fun.
                </p>
              </div>

              <div className="rounded-[24px] bg-slate-50 p-4">
                <div className="text-sm font-semibold text-slate-700">Next ₹250 unlock</div>
                <div className="mt-2">
                  <ProgressMeter value={pendingStars} max={7} label="Star bank progress" />
                </div>
                <div className="mt-3 text-xs text-slate-500">{projectedNextCredit} more stars needed for the next ₹250 credit.</div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
          <ScoreCard label="Total stars" value={totalStars} subvalue="Homework stars plus behavior bonus stars" glow />
          <ScoreCard label="Wallet balance" value={`₹${creditedAmount}`} subvalue="Credited only in blocks of 7 stars" glow />
          <ScoreCard label="Star bank" value={`${pendingStars} / 7`} subvalue="Saved toward the next ₹250" />
          <ScoreCard label="This week" value={weekStars} subvalue="Stars earned since Monday" />
          <ScoreCard label="Strong days" value={`${completionRate}%`} subvalue="Days with 6 or more stars" />
          <ScoreCard label="Streak" value={`${streak} days`} subvalue="Consecutive star-earning days" />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr,1fr]">
          <div className="rounded-[32px] border border-white/60 bg-white/85 p-6 shadow-xl backdrop-blur">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-xl font-black text-slate-900">Today's mission</div>
                <div className="text-sm text-slate-500">Track homework discipline and bonus behavior stars.</div>
              </div>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="rounded-[20px] border border-slate-200 px-4 py-3"
              />
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-[24px] bg-gradient-to-br from-sky-50 to-indigo-50 p-4">
                <label className="mb-2 block text-sm font-semibold text-slate-700">Homework duration in minutes</label>
                <input
                  type="number"
                  min="0"
                  value={form.duration}
                  onChange={(e) => updateField("duration", e.target.value)}
                  className="w-full rounded-[18px] border border-slate-200 bg-white px-4 py-3 outline-none focus:border-fuchsia-400"
                />
                <p className="mt-2 text-xs text-slate-500">
                  Under 30 minutes is best. Over 45 minutes reduces another star. Over 60 minutes gives 0 stars for that day.
                </p>
              </div>

              <div className="rounded-[24px] bg-gradient-to-br from-amber-50 to-rose-50 p-4">
                <label className="mb-2 block text-sm font-semibold text-slate-700">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => updateField("notes", e.target.value)}
                  rows={4}
                  className="w-full rounded-[18px] border border-slate-200 bg-white px-4 py-3 outline-none focus:border-fuchsia-400"
                  placeholder="Optional notes for the day"
                />
              </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <Toggle checked={form.completedHomework} onChange={() => updateField("completedHomework", !form.completedHomework)} label="Homework fully completed" emoji="✅" />
              <Toggle checked={form.stayedInOnePlace} onChange={() => updateField("stayedInOnePlace", !form.stayedInOnePlace)} label="Sat in one place" emoji="🪑" />
              <Toggle checked={form.gotUp} onChange={() => updateField("gotUp", !form.gotUp)} label="Got up during homework" positive={false} emoji="🏃" />
              <Toggle checked={form.talked} onChange={() => updateField("talked", !form.talked)} label="Talked during homework" positive={false} emoji="🗣️" />
              <Toggle checked={form.tookBreak} onChange={() => updateField("tookBreak", !form.tookBreak)} label="Took a break in between" positive={false} emoji="☕" />
              <Toggle checked={form.focused} onChange={() => updateField("focused", !form.focused)} label="Stayed focused throughout" emoji="🎯" />
              <Toggle checked={form.goodBehavior} onChange={() => updateField("goodBehavior", !form.goodBehavior)} label="Good behavior bonus star" emoji="🌟" />
              <Toggle checked={form.noComplaint} onChange={() => updateField("noComplaint", !form.noComplaint)} label="No complaint bonus star" emoji="😇" />
            </div>

            <div className="mt-6 rounded-[28px] bg-gradient-to-r from-fuchsia-100 via-amber-50 to-sky-100 p-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-sm font-semibold text-fuchsia-700">Star preview for {formatDate(selectedDate)}</div>
                  <div className="mt-1 text-3xl font-black text-slate-900">{previewResult.totalStars} / 9</div>
                  <div className="mt-1 text-xs text-slate-600">{previewResult.baseStars} homework stars + {previewResult.bonusStars} bonus stars</div>
                </div>
                <button
                  onClick={handleSave}
                  className="rounded-[20px] bg-gradient-to-r from-fuchsia-600 to-orange-500 px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:scale-[1.01]"
                >
                  Save mission
                </button>
              </div>

              <div className="mt-4 grid gap-2">
                {previewResult.reasons.map((reason, index) => (
                  <div key={index} className="rounded-[18px] bg-white/80 px-3 py-2 text-sm text-slate-700">
                    {reason}
                  </div>
                ))}
              </div>

              {lastSavedMessage ? <div className="mt-4 text-sm font-bold text-emerald-700">{lastSavedMessage}</div> : null}
            </div>
          </div>

          <div className="rounded-[32px] border border-white/60 bg-white/85 p-6 shadow-xl backdrop-blur">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-xl font-black text-slate-900">Rewards and unlocks</div>
                <div className="text-sm text-slate-500">Keep earning to unlock more fun choices.</div>
              </div>
              <div className="rounded-full bg-fuchsia-100 px-3 py-1 text-xs font-bold text-fuchsia-700">₹{creditedAmount}</div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {rewardMilestones.map((reward) => {
                const unlocked = creditedAmount >= reward.amount;
                return (
                  <motion.div
                    key={reward.amount}
                    whileHover={{ y: -3 }}
                    className={`rounded-[24px] border p-4 ${unlocked ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-slate-50"}`}
                  >
                    <div className="text-3xl">{reward.emoji}</div>
                    <div className="mt-2 text-base font-black text-slate-900">{reward.title}</div>
                    <div className="mt-1 text-sm text-slate-500">{reward.detail}</div>
                    <div className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${unlocked ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"}`}>
                      {unlocked ? `Unlocked at ₹${reward.amount}` : `Locked until ₹${reward.amount}`}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="mt-5 rounded-[24px] bg-slate-50 p-4">
              <ProgressMeter value={rewardProgress} max={1000} label="Progress to the ₹1000 New Game unlock" />
            </div>

            {trendDown ? (
              <div className="mt-5 rounded-[22px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                Weekly progress dipped, so one avatar level is hidden for now. Better progress brings it right back.
              </div>
            ) : (
              <div className="mt-5 rounded-[22px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                Weekly progress is steady or improving. All unlocked avatar levels stay active.
              </div>
            )}

            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {avatarThemes.map((theme, index) => {
                const isBase = index === 0;
                const unlocked = isBase || index <= permanentlyUnlockedCount;
                const active = index === Math.min(activeUnlockedCount, avatarThemes.length - 1);
                return (
                  <AvatarCard
                    key={theme.name}
                    faceImage={childPhoto}
                    theme={theme}
                    title={theme.name}
                    subtitle={theme.badge}
                    locked={!unlocked}
                    active={active && unlocked}
                  />
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
          <div className="rounded-[32px] border border-white/60 bg-white/85 p-6 shadow-xl backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl font-black text-slate-900">Weekly progress chart</div>
                <div className="text-sm text-slate-500">A simple graph to show how motivation is building.</div>
              </div>
              <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                Last {Math.max(weeklyData.length, 1)} week{weeklyData.length === 1 ? "" : "s"}
              </div>
            </div>

            <div className="mt-6 h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyData.length ? weeklyData : [{ week: "No data", stars: 0 }]}>
                  <defs>
                    <linearGradient id="weeklyGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#d946ef" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="stars" stroke="#d946ef" fill="url(#weeklyGradient)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-[32px] border border-white/60 bg-white/85 p-6 shadow-xl backdrop-blur">
            <div className="text-xl font-black text-slate-900">Progress snapshot</div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <ScoreCard label="This month" value={monthStars} subvalue={`Stars inside ${getMonthLabel(currentMonth)}`} glow />
              <ScoreCard label="Last week" value={previousWeekStars} subvalue="Compare against the current week" />
              <div className="rounded-[24px] bg-slate-50 p-4 md:col-span-2">
                <div className="text-sm font-semibold text-slate-500">Reward rule</div>
                <div className="mt-2 text-base text-slate-700">
                  Every time total stars reach a multiple of 7, ₹250 gets added to the wallet. Bonus stars from good behavior and no complaints also count.
                </div>
              </div>
              <div className="rounded-[24px] bg-slate-50 p-4 md:col-span-2">
                <div className="text-sm font-semibold text-slate-500">Android use</div>
                <div className="mt-2 text-base text-slate-700">
                  This version is designed to feel like a phone app. When deployed, it can be added to an Android home screen for an app-like experience.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[32px] border border-white/60 bg-white/85 p-6 shadow-xl backdrop-blur">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-xl font-black text-slate-900">Calendar progress view</div>
              <div className="text-sm text-slate-500">Tap a day to review or edit the mission results.</div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => shiftMonth(-1)} className="rounded-[18px] border border-slate-200 px-4 py-2 text-sm font-semibold hover:bg-slate-50">
                Previous
              </button>
              <div className="min-w-[170px] text-center text-sm font-black">{getMonthLabel(currentMonth)}</div>
              <button onClick={() => shiftMonth(1)} className="rounded-[18px] border border-slate-200 px-4 py-2 text-sm font-semibold hover:bg-slate-50">
                Next
              </button>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-7 gap-2 text-center text-xs font-bold uppercase tracking-wide text-slate-500">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
              <div key={day} className="py-2">{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((date) => {
              const key = date.toISOString().slice(0, 10);
              const inCurrentMonth = date.getMonth() === currentMonth.getMonth();
              const entry = records[key];
              const isSelected = key === selectedDate;
              const stars = entry ? entry.totalStars || entry.stars || 0 : 0;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedDate(key)}
                  className={`min-h-[96px] rounded-[20px] border p-2 text-left transition ${
                    isSelected ? "border-fuchsia-500 ring-2 ring-fuchsia-200" : "border-slate-200"
                  } ${inCurrentMonth ? "bg-white" : "bg-slate-50 text-slate-400"}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black">{date.getDate()}</span>
                    {entry ? (
                      <span className={`rounded-full border px-2 py-1 text-[11px] font-bold ${getStarTone(stars)}`}>
                        {stars}★
                      </span>
                    ) : null}
                  </div>
                  {entry ? (
                    <div className="mt-3 text-xs text-slate-500">
                      <div>{entry.duration} min</div>
                      <div className="mt-1 line-clamp-2">{entry.notes || "Mission saved"}</div>
                    </div>
                  ) : (
                    <div className="mt-3 text-xs text-slate-400">No entry</div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="sticky bottom-3 mx-auto flex w-full max-w-md items-center justify-around rounded-[28px] border border-white/70 bg-white/90 px-3 py-3 shadow-2xl backdrop-blur md:hidden">
          <div className="text-center text-xs font-bold text-fuchsia-700">
            <div className="text-lg">🏠</div>
            Home
          </div>
          <div className="text-center text-xs font-bold text-slate-500">
            <div className="text-lg">⭐</div>
            Stars
          </div>
          <div className="text-center text-xs font-bold text-slate-500">
            <div className="text-lg">🎁</div>
            Rewards
          </div>
          <div className="text-center text-xs font-bold text-slate-500">
            <div className="text-lg">📅</div>
            Calendar
          </div>
        </div>
      </div>
    </div>
  );
}
