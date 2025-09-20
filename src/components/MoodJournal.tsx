import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";

interface JournalEntry {
  id: string;
  mood: string;
  text: string;
  sentiment: string;
  aiResponse?: string; // Added for AI feedback
  timestamp?: any;
}

const MoodJournal: React.FC = () => {
  const [mood, setMood] = useState<string>("");
  const [entry, setEntry] = useState<string>("");
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingEntries, setLoadingEntries] = useState<boolean>(true);
  const [aiResponse, setAiResponse] = useState<string>(""); // Added for AI feedback display

  // ✅ Initialize Firebase Functions
  const functions = getFunctions();
  const analyzeSentimentWithGemini = httpsCallable(functions, 'analyzeSentimentWithGemini');

  // ✅ Save entry to Firestore with AI analysis
  const handleSubmit = async () => {
    if (!auth.currentUser) {
      alert("Please log in first!");
      return;
    }
    if (!mood || !entry.trim()) {
      alert("Please select a mood and write something.");
      return;
    }

    try {
      setLoading(true);
      setAiResponse(""); // Clear previous AI response

      // Call Gemini AI for sentiment analysis and feedback
      let aiAnalysis = null;
      try {
        const result = await analyzeSentimentWithGemini({ 
          text: entry, 
          mood: mood 
        });
        aiAnalysis = result.data as { aiResponse?: string; sentiment?: string };
        setAiResponse(aiAnalysis.aiResponse || ""); // Display AI feedback
      } catch (aiError) {
        console.warn("AI analysis failed, continuing without it:", aiError);
      }

      // Save to Firestore with AI data
      await addDoc(
        collection(db, "users", auth.currentUser.uid, "journals"),
        {
          mood,
          text: entry,
          sentiment: aiAnalysis?.sentiment || mood, // Use AI sentiment or fallback to mood
          aiResponse: aiAnalysis?.aiResponse || "", // Store AI feedback
          timestamp: serverTimestamp(),
        }
      );

      setMood("");
      setEntry("");
      await loadEntries(); // refresh list
    } catch (error) {
      console.error("Error saving entry:", error);
      alert("⚠️ Failed to save entry. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Load all past entries
  const loadEntries = async () => {
    if (!auth.currentUser) return;
    try {
      setLoadingEntries(true);
      const q = query(
        collection(db, "users", auth.currentUser.uid, "journals"),
        orderBy("timestamp", "desc")
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<JournalEntry, "id">),
      }));
      setJournals(data);
    } catch (error) {
      console.error("Error fetching entries:", error);
    } finally {
      setLoadingEntries(false);
    }
  };

  // ✅ Reload entries when user changes (login/logout)
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(() => {
      loadEntries();
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-lg mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        How are you feeling today?
      </h2>
      <p className="text-gray-600 mb-4">
        Take a moment to reflect on your emotions and thoughts
      </p>

      {/* Mood Selector */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          Select your mood
        </h3>
        <div className="flex justify-between space-x-2">
          {["Happy", "Sad", "Neutral", "Angry", "Anxious"].map((m) => (
            <div
              key={m}
              onClick={() => setMood(m)}
              className={`cursor-pointer text-center p-2 rounded-lg transition-all ${
                mood === m ? "bg-blue-100 scale-110" : ""
              }`}
            >
              <span className="text-3xl">
                {m === "Happy" && "😊"}
                {m === "Sad" && "😢"}
                {m === "Neutral" && "😐"}
                {m === "Angry" && "😠"}
                {m === "Anxious" && "😟"}
              </span>
              <p className="text-sm">{m}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Journal Textarea */}
      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          Write your thoughts
        </h3>
        <textarea
          className="w-full h-32 p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="What's on your mind?"
          value={entry}
          onChange={(e) => setEntry(e.target.value)}
        />
        <div className="flex justify-between items-center mt-2">
          <span className="text-sm text-gray-500">{entry.length} characters</span>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="py-2 px-4 rounded-lg bg-teal-500 hover:bg-teal-600 text-white font-bold transition-colors disabled:bg-gray-400"
          >
            {loading ? "Analyzing..." : "Save Entry"}
          </button>
        </div>
      </div>

      {/* AI Feedback Display */}
      {aiResponse && (
        <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-lg">
          <h4 className="text-sm font-semibold text-blue-800 mb-1">AI Wellness Support:</h4>
          <p className="text-sm text-blue-700">{aiResponse}</p>
        </div>
      )}

      {/* Previous Entries */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          Previous Entries
        </h3>
        {loadingEntries ? (
          <p className="text-gray-500">Loading entries...</p>
        ) : journals.length === 0 ? (
          <p className="text-gray-500">No entries yet.</p>
        ) : (
          <ul className="space-y-2">
            {journals.map((j) => (
              <li
                key={j.id}
                className="p-3 border rounded-lg bg-gray-50 shadow-sm"
              >
                <p className="text-gray-800">
                  <b>{j.mood}</b> — {j.text}
                </p>
                <p className="text-xs text-gray-500">
                  {j.timestamp?.toDate
                    ? j.timestamp.toDate().toLocaleString()
                    : "Just now"}
                </p>
                <p className="text-xs italic text-gray-400">
                  Sentiment: {j.sentiment || "neutral"}
                </p>
                {/* Display AI Response for previous entries */}
                {j.aiResponse && (
                  <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                    <span className="font-semibold text-blue-800">AI Support: </span>
                    <span className="text-blue-700">{j.aiResponse}</span>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default MoodJournal;
