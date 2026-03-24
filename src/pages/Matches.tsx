import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy, getDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { UserProfile, Match } from '../types';
import { Link } from 'react-router-dom';
import { MessageSquare, Heart, ChevronRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface MatchesProps {
  profile: UserProfile;
}

export default function Matches({ profile }: MatchesProps) {
  const [matches, setMatches] = useState<(Match & { otherUser: UserProfile })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'matches'),
      where('users', 'array-contains', profile.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const matchData = await Promise.all(
        snapshot.docs.map(async (matchDoc) => {
          const data = matchDoc.data() as Match;
          const otherUid = data.users.find(id => id !== profile.uid)!;
          const userSnap = await getDoc(doc(db, 'users', otherUid));
          return {
            ...data,
            id: matchDoc.id,
            otherUser: userSnap.data() as UserProfile
          };
        })
      );
      setMatches(matchData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [profile.uid]);

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-20 bg-zinc-100 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8 gap-6">
        <div className="bg-rose-50 p-6 rounded-full">
          <Heart className="w-12 h-12 text-rose-200" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-zinc-900">No matches yet</h3>
          <p className="text-zinc-500">Keep swiping to find your perfect match!</p>
        </div>
        <Link 
          to="/"
          className="bg-rose-500 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-rose-200"
        >
          Start Swiping
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black tracking-tight text-zinc-900">Your Matches</h2>
        <span className="bg-rose-100 text-rose-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
          {matches.length} Total
        </span>
      </div>

      <div className="grid gap-3">
        {matches.map((match) => (
          <Link
            key={match.id}
            to={`/chat/${match.id}`}
            className="flex items-center gap-4 bg-white p-4 rounded-3xl border border-zinc-100 hover:border-rose-200 transition-all active:scale-[0.98] group"
          >
            <div className="relative">
              <img
                src={match.otherUser.photoURL}
                alt={match.otherUser.displayName}
                className="w-16 h-16 rounded-2xl object-cover shadow-sm"
                referrerPolicy="no-referrer"
              />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold text-zinc-900 truncate">{match.otherUser.displayName}</h3>
                <span className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">
                  {match.lastMessageAt ? formatDistanceToNow(match.lastMessageAt.toDate(), { addSuffix: true }) : 'New Match'}
                </span>
              </div>
              <p className="text-sm text-zinc-500 truncate font-medium">
                {match.lastMessage || `You matched with ${match.otherUser.displayName}!`}
              </p>
            </div>

            <ChevronRight className="w-5 h-5 text-zinc-300 group-hover:text-rose-400 transition-colors" />
          </Link>
        ))}
      </div>
    </div>
  );
}
