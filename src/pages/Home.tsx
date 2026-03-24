import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, serverTimestamp, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { UserProfile, Swipe } from '../types';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'motion/react';
import { Heart, X, Star, Info, MapPin } from 'lucide-react';
import { cn } from '../lib/utils';

interface HomeProps {
  profile: UserProfile;
}

export default function Home({ profile }: HomeProps) {
  const [potentialMatches, setPotentialMatches] = useState<UserProfile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPotentialMatches = async () => {
      setLoading(true);
      try {
        // Fetch users who match the current user's interestedIn
        const usersRef = collection(db, 'users');
        const q = query(
          usersRef,
          where('gender', 'in', profile.interestedIn),
          limit(20)
        );
        
        const querySnapshot = await getDocs(q);
        const users = querySnapshot.docs
          .map(doc => doc.data() as UserProfile)
          .filter(u => u.uid !== profile.uid); // Exclude self

        // TODO: Filter out users already swiped on
        setPotentialMatches(users);
      } catch (error) {
        console.error('Error fetching matches:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPotentialMatches();
  }, [profile]);

  const handleSwipe = async (direction: 'like' | 'pass', targetUid: string) => {
    try {
      await addDoc(collection(db, 'swipes'), {
        fromUid: profile.uid,
        toUid: targetUid,
        type: direction,
        createdAt: serverTimestamp(),
      });

      if (direction === 'like') {
        // Check for mutual match
        const swipesRef = collection(db, 'swipes');
        const q = query(
          swipesRef,
          where('fromUid', '==', targetUid),
          where('toUid', '==', profile.uid),
          where('type', '==', 'like')
        );
        const mutualSwipe = await getDocs(q);
        
        if (!mutualSwipe.empty) {
          // It's a match!
          await addDoc(collection(db, 'matches'), {
            users: [profile.uid, targetUid],
            createdAt: serverTimestamp(),
          });
          alert("It's a Match! 🎉");
        }
      }

      setCurrentIndex(prev => prev + 1);
    } catch (error) {
      console.error('Swipe failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center">
            <Heart className="w-8 h-8 text-rose-500 animate-bounce" />
          </div>
          <p className="text-zinc-400 font-medium">Finding people near you...</p>
        </div>
      </div>
    );
  }

  const currentPerson = potentialMatches[currentIndex];

  if (!currentPerson) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8 gap-6">
        <div className="bg-zinc-100 p-6 rounded-full">
          <Star className="w-12 h-12 text-zinc-300" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-zinc-900">No more people!</h3>
          <p className="text-zinc-500">Try expanding your preferences or check back later.</p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="bg-rose-500 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-rose-200"
        >
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="relative flex-1">
        <AnimatePresence>
          <SwipeCard 
            key={currentPerson.uid}
            person={currentPerson}
            onSwipe={(dir) => handleSwipe(dir, currentPerson.uid)}
          />
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-6 pb-4">
        <button 
          onClick={() => handleSwipe('pass', currentPerson.uid)}
          className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-xl shadow-zinc-200 text-zinc-400 hover:text-rose-500 transition-all active:scale-90"
        >
          <X className="w-8 h-8" />
        </button>
        <button 
          onClick={() => handleSwipe('like', currentPerson.uid)}
          className="w-20 h-20 bg-rose-500 rounded-full flex items-center justify-center shadow-xl shadow-rose-200 text-white hover:bg-rose-600 transition-all active:scale-90"
        >
          <Heart className="w-10 h-10 fill-current" />
        </button>
      </div>
    </div>
  );
}

function SwipeCard({ person, onSwipe, ...props }: { person: UserProfile, onSwipe: (dir: 'like' | 'pass') => void, [key: string]: any }) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);
  const likeOpacity = useTransform(x, [50, 150], [0, 1]);
  const nopeOpacity = useTransform(x, [-50, -150], [0, 1]);

  const handleDragEnd = (_: any, info: any) => {
    if (info.offset.x > 100) onSwipe('like');
    else if (info.offset.x < -100) onSwipe('pass');
  };

  return (
    <motion.div
      style={{ x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      className="absolute inset-0 cursor-grab active:cursor-grabbing"
    >
      <div className="relative h-full w-full rounded-3xl overflow-hidden shadow-2xl shadow-zinc-300 bg-zinc-200">
        <img 
          src={person.photoURL} 
          alt={person.displayName}
          className="h-full w-full object-cover select-none"
          referrerPolicy="no-referrer"
        />
        
        {/* Overlay Labels */}
        <motion.div style={{ opacity: likeOpacity }} className="absolute top-10 left-10 border-4 border-emerald-500 text-emerald-500 font-black text-4xl px-4 py-2 rounded-xl rotate-[-15deg] uppercase">
          Like
        </motion.div>
        <motion.div style={{ opacity: nopeOpacity }} className="absolute top-10 right-10 border-4 border-rose-500 text-rose-500 font-black text-4xl px-4 py-2 rounded-xl rotate-[15deg] uppercase">
          Nope
        </motion.div>

        {/* Info Gradient */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 flex flex-col justify-end gap-2">
          <div className="flex items-end justify-between">
            <div className="text-white">
              <h2 className="text-3xl font-black tracking-tight flex items-center gap-2">
                {person.displayName}, {new Date().getFullYear() - new Date(person.birthDate).getFullYear()}
              </h2>
              <div className="flex items-center gap-1 text-zinc-300 text-sm font-medium mt-1">
                <MapPin className="w-4 h-4" />
                <span>2 miles away</span>
              </div>
            </div>
            <button className="bg-white/20 backdrop-blur-md p-2 rounded-full text-white">
              <Info className="w-6 h-6" />
            </button>
          </div>
          <p className="text-zinc-200 text-sm line-clamp-2 font-medium leading-relaxed">
            {person.bio || "No bio yet."}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
