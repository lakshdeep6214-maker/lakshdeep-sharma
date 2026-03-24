import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { UserProfile } from '../types';
import { Camera, MapPin, Calendar, Heart, Save, ChevronRight, Settings, Shield, HelpCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface ProfileProps {
  profile: UserProfile;
  onUpdate: (profile: UserProfile) => void;
}

export default function Profile({ profile, onUpdate }: ProfileProps) {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState(profile);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', profile.uid), {
        ...formData,
      } as any);
      onUpdate(formData);
      setEditing(false);
    } catch (error) {
      console.error('Update failed:', error);
    } finally {
      setSaving(false);
    }
  };

  const menuItems = [
    { icon: Settings, label: 'Settings', color: 'text-zinc-400' },
    { icon: Shield, label: 'Safety Center', color: 'text-emerald-500' },
    { icon: HelpCircle, label: 'Help & Support', color: 'text-blue-500' },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Profile Header */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative group">
          <div className="w-32 h-32 rounded-3xl overflow-hidden shadow-2xl shadow-rose-100 ring-4 ring-white">
            <img 
              src={profile.photoURL} 
              alt={profile.displayName} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <button className="absolute -bottom-2 -right-2 bg-rose-500 text-white p-2.5 rounded-2xl shadow-lg shadow-rose-200 hover:scale-110 transition-transform">
            <Camera className="w-5 h-5" />
          </button>
        </div>
        
        <div className="text-center">
          <h2 className="text-2xl font-black tracking-tight text-zinc-900">
            {profile.displayName}, {new Date().getFullYear() - new Date(profile.birthDate).getFullYear()}
          </h2>
          <div className="flex items-center justify-center gap-1 text-zinc-400 font-bold text-xs uppercase tracking-widest mt-1">
            <MapPin className="w-3 h-3" />
            <span>New York, NY</span>
          </div>
        </div>
      </div>

      {/* Profile Sections */}
      <div className="space-y-4">
        <div className="bg-white p-6 rounded-3xl border border-zinc-100 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-zinc-900 uppercase tracking-wider text-sm">About Me</h3>
            <button 
              onClick={() => editing ? handleSave() : setEditing(true)}
              className="text-rose-500 font-bold text-xs uppercase tracking-widest hover:text-rose-600 transition-colors flex items-center gap-1"
            >
              {saving ? 'Saving...' : editing ? <><Save className="w-3 h-3" /> Save</> : 'Edit'}
            </button>
          </div>
          
          {editing ? (
            <textarea
              value={formData.bio}
              onChange={e => setFormData({ ...formData, bio: e.target.value })}
              className="w-full bg-zinc-50 border-none rounded-2xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-rose-500 outline-none min-h-[100px]"
            />
          ) : (
            <p className="text-zinc-600 text-sm font-medium leading-relaxed">
              {profile.bio || "Tell people a bit about yourself!"}
            </p>
          )}

          <div className="flex flex-wrap gap-2 pt-2">
            <div className="bg-rose-50 text-rose-600 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5">
              <Heart className="w-3 h-3" />
              {profile.gender}
            </div>
            <div className="bg-zinc-100 text-zinc-600 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5">
              <Calendar className="w-3 h-3" />
              {new Date(profile.birthDate).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="bg-white rounded-3xl border border-zinc-100 overflow-hidden shadow-sm">
          {menuItems.map((item, i) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                className={cn(
                  "w-full flex items-center justify-between p-5 hover:bg-zinc-50 transition-colors group",
                  i !== menuItems.length - 1 && "border-b border-zinc-50"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn("p-2 rounded-xl bg-zinc-50 group-hover:bg-white transition-colors", item.color)}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-zinc-700 text-sm">{item.label}</span>
                </div>
                <ChevronRight className="w-5 h-5 text-zinc-300 group-hover:text-rose-400 transition-colors" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Stats/Badges */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-rose-500 p-6 rounded-3xl text-white shadow-lg shadow-rose-200">
          <h4 className="text-3xl font-black">12</h4>
          <p className="text-rose-100 text-xs font-bold uppercase tracking-widest mt-1">Matches this week</p>
        </div>
        <div className="bg-zinc-900 p-6 rounded-3xl text-white shadow-lg shadow-zinc-200">
          <h4 className="text-3xl font-black">84%</h4>
          <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest mt-1">Profile Strength</p>
        </div>
      </div>
    </div>
  );
}
