import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { UserProfile, Message, Match } from '../types';
import { Send, ChevronLeft, Phone, Video } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface ChatPageProps {
  profile: UserProfile;
}

export default function ChatPage({ profile }: ChatPageProps) {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [otherUser, setOtherUser] = useState<UserProfile | null>(null);
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!matchId) return;

    // Fetch match and other user info
    const fetchMatchInfo = async () => {
      const matchDoc = await getDoc(doc(db, 'matches', matchId));
      if (matchDoc.exists()) {
        const data = matchDoc.data() as Match;
        const otherUid = data.users.find(id => id !== profile.uid)!;
        const userSnap = await getDoc(doc(db, 'users', otherUid));
        setOtherUser(userSnap.data() as UserProfile);
      }
    };

    fetchMatchInfo();

    // Listen for messages
    const q = query(
      collection(db, 'matches', matchId, 'messages'),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message)));
    });

    return () => unsubscribe();
  }, [matchId, profile.uid]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !matchId) return;

    const text = inputText;
    setInputText('');

    try {
      await addDoc(collection(db, 'matches', matchId, 'messages'), {
        senderId: profile.uid,
        text,
        createdAt: serverTimestamp(),
      });

      await updateDoc(doc(db, 'matches', matchId), {
        lastMessage: text,
        lastMessageAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Send failed:', error);
    }
  };

  if (!otherUser) return null;

  return (
    <div className="fixed inset-0 bg-white z-[60] flex flex-col max-w-md mx-auto">
      {/* Header */}
      <header className="bg-white border-b border-zinc-100 h-16 flex items-center px-4 gap-3 shrink-0">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-zinc-400 hover:text-rose-500 transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        
        <div className="flex-1 flex items-center gap-3">
          <img 
            src={otherUser.photoURL} 
            alt={otherUser.displayName} 
            className="w-10 h-10 rounded-xl object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="min-w-0">
            <h3 className="font-bold text-zinc-900 truncate leading-none mb-1">{otherUser.displayName}</h3>
            <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">Online</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button className="p-2 text-zinc-400 hover:text-rose-500 transition-colors">
            <Phone className="w-5 h-5" />
          </button>
          <button className="p-2 text-zinc-400 hover:text-rose-500 transition-colors">
            <Video className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50/50">
        <div className="text-center py-8 space-y-2">
          <div className="w-20 h-20 mx-auto rounded-3xl overflow-hidden shadow-xl shadow-rose-100">
            <img src={otherUser.photoURL} alt={otherUser.displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
          <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest">You matched with {otherUser.displayName}</p>
        </div>

        {messages.map((msg) => {
          const isMe = msg.senderId === profile.uid;
          return (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              key={msg.id}
              className={cn(
                "flex flex-col max-w-[80%]",
                isMe ? "ml-auto items-end" : "mr-auto items-start"
              )}
            >
              <div className={cn(
                "px-4 py-3 rounded-2xl text-sm font-medium shadow-sm",
                isMe 
                  ? "bg-rose-500 text-white rounded-tr-none" 
                  : "bg-white text-zinc-700 rounded-tl-none border border-zinc-100"
              )}>
                {msg.text}
              </div>
              <span className="text-[10px] text-zinc-400 font-bold mt-1 uppercase tracking-tighter">
                {msg.createdAt ? format(msg.createdAt.toDate(), 'HH:mm') : ''}
              </span>
            </motion.div>
          );
        })}
        <div ref={scrollRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 bg-white border-t border-zinc-100 flex items-center gap-3">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-zinc-100 border-none rounded-2xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-rose-500 outline-none transition-all"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="bg-rose-500 text-white p-3 rounded-2xl shadow-lg shadow-rose-200 disabled:opacity-50 disabled:shadow-none transition-all active:scale-95"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
