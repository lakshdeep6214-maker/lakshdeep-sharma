/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, onSnapshot, collection, query, where } from 'firebase/firestore';
import { auth, db } from './firebase';
import { UserProfile } from './types';
import Layout from './components/Layout';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Matches from './pages/Matches';
import ChatPage from './pages/ChatPage';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data() as UserProfile);
        } else {
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-zinc-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        
        <Route element={user ? <Layout user={user} profile={profile} /> : <Navigate to="/login" />}>
          <Route path="/" element={profile ? <Home profile={profile} /> : <Navigate to="/onboarding" />} />
          <Route path="/onboarding" element={!profile ? <Onboarding user={user} onComplete={setProfile} /> : <Navigate to="/" />} />
          <Route path="/profile" element={profile ? <Profile profile={profile} onUpdate={setProfile} /> : <Navigate to="/onboarding" />} />
          <Route path="/matches" element={profile ? <Matches profile={profile} /> : <Navigate to="/onboarding" />} />
          <Route path="/chat/:matchId" element={profile ? <ChatPage profile={profile} /> : <Navigate to="/onboarding" />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

