import { useState, useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "./firebase"; // make sure you have firebase.ts
import ConsentScreen from "./components/ConsentScreen";
import MoodJournal from "./components/MoodJournal";
import CaregiverAlert from "./components/CaregiverAlert";
import PromptDisplay from "./components/PromptDisplay";
import AuthScreen from "./components/AuthScreen"; // 👈 add login/register

function App() {
  const [currentPage, setCurrentPage] = useState("consent");
  const [isCrisis, setIsCrisis] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ Check Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Show loading screen until Firebase finishes checking login state
  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  // ✅ If no user is logged in → show Auth Screen
  if (!user) {
    return <AuthScreen />;
  }

  // ✅ Crisis screen overrides everything
  if (isCrisis) {
    return (
      <CaregiverAlert
        onTriggerCrisis={() => setIsCrisis(true)}
        onClose={() => setIsCrisis(false)}
      />
    );
  }

  // ✅ Consent screen → show first after login
  if (currentPage === "consent") {
    return <ConsentScreen onConsent={() => setCurrentPage("journal")} />;
  }

  // ✅ Journal screen with navigation bar
  if (currentPage === "journal") {
    return (
      <div className="bg-gray-100 min-h-screen">
        {/* Top Navigation */}
        <div className="flex justify-between p-4 bg-white shadow-md">
          <div className="space-x-4">
            <button
              onClick={() => setCurrentPage("journal")}
              className="px-4 py-2 rounded-lg bg-blue-500 text-white"
            >
              Journal
            </button>
            <button
              onClick={() => setIsCrisis(true)}
              className="px-4 py-2 rounded-lg bg-red-500 text-white"
            >
              Trigger Crisis
            </button>
          </div>

          {/* ✅ Logout button */}
          <button
            onClick={() => auth.signOut()}
            className="px-4 py-2 rounded-lg bg-gray-600 text-white"
          >
            Logout
          </button>
        </div>

        {/* Journal Content */}
        <div className="container mx-auto p-4 mt-4">
          <h1 className="text-3xl font-bold text-center my-4">
            Daily Mood Journal
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Track your emotions and reflect on your daily experiences.
          </p>
          <PromptDisplay />
          <MoodJournal />
        </div>
      </div>
    );
  }

  return <div className="p-4 text-center">Page Not Found</div>;
}

export default App;
