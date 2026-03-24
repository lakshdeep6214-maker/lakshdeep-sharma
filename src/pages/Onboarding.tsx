import { useState } from 'react';
import { User } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { UserProfile } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, Heart, User as UserIcon, Calendar, ChevronRight } from 'lucide-react';

interface OnboardingProps {
  user: User;
  onComplete: (profile: UserProfile) => void;
}

export default function Onboarding({ user, onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    displayName: user.displayName || '',
    photoURL: user.photoURL || '',
    bio: '',
    gender: 'male' as const,
    interestedIn: ['female'] as ('male' | 'female' | 'non-binary' | 'other')[],
    birthDate: '',
    interests: [] as string[],
  });

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    const profile: any = {
      ...formData,
      uid: user.uid,
      createdAt: serverTimestamp(),
    };
    await setDoc(doc(db, 'users', user.uid), profile);
    onComplete(profile as UserProfile);
  };

  const steps = [
    {
      title: "What's your name?",
      icon: UserIcon,
      content: (
        <input
          type="text"
          value={formData.displayName}
          onChange={e => setFormData({ ...formData, displayName: e.target.value })}
          className="w-full bg-white border-2 border-zinc-100 rounded-2xl px-6 py-4 text-xl font-semibold focus:border-rose-500 outline-none transition-colors"
          placeholder="Display Name"
        />
      )
    },
    {
      title: "When's your birthday?",
      icon: Calendar,
      content: (
        <input
          type="date"
          value={formData.birthDate}
          onChange={e => setFormData({ ...formData, birthDate: e.target.value })}
          className="w-full bg-white border-2 border-zinc-100 rounded-2xl px-6 py-4 text-xl font-semibold focus:border-rose-500 outline-none transition-colors"
        />
      )
    },
    {
      title: "I am a...",
      icon: UserIcon,
      content: (
        <div className="grid grid-cols-2 gap-3">
          {['male', 'female', 'non-binary', 'other'].map(g => (
            <button
              key={g}
              onClick={() => setFormData({ ...formData, gender: g as any })}
              className={`px-6 py-4 rounded-2xl font-semibold capitalize transition-all ${
                formData.gender === g ? 'bg-rose-500 text-white shadow-lg shadow-rose-200' : 'bg-white border-2 border-zinc-100 text-zinc-600'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      )
    },
    {
      title: "Interested in...",
      icon: Heart,
      content: (
        <div className="grid grid-cols-2 gap-3">
          {['male', 'female', 'non-binary', 'other'].map(g => (
            <button
              key={g}
              onClick={() => {
                const current = formData.interestedIn;
                const next = current.includes(g as any) 
                  ? current.filter(i => i !== g)
                  : [...current, g as any];
                setFormData({ ...formData, interestedIn: next });
              }}
              className={`px-6 py-4 rounded-2xl font-semibold capitalize transition-all ${
                formData.interestedIn.includes(g as any) ? 'bg-rose-500 text-white shadow-lg shadow-rose-200' : 'bg-white border-2 border-zinc-100 text-zinc-600'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      )
    },
    {
      title: "Tell us about yourself",
      icon: Camera,
      content: (
        <textarea
          value={formData.bio}
          onChange={e => setFormData({ ...formData, bio: e.target.value })}
          className="w-full bg-white border-2 border-zinc-100 rounded-2xl px-6 py-4 text-lg font-medium focus:border-rose-500 outline-none transition-colors min-h-[150px]"
          placeholder="I love hiking and coffee..."
        />
      )
    }
  ];

  const currentStep = steps[step - 1];
  const Icon = currentStep.icon;

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col p-6">
      <div className="flex-1 max-w-sm mx-auto w-full flex flex-col justify-center gap-12">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="bg-rose-100 p-3 rounded-2xl">
              <Icon className="w-8 h-8 text-rose-500" />
            </div>
            <span className="text-zinc-400 font-bold text-sm uppercase tracking-widest">Step {step} of {steps.length}</span>
          </div>
          <h2 className="text-3xl font-black tracking-tight text-zinc-900">{currentStep.title}</h2>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="min-h-[200px]"
          >
            {currentStep.content}
          </motion.div>
        </AnimatePresence>

        <div className="flex gap-4">
          {step > 1 && (
            <button
              onClick={handleBack}
              className="flex-1 bg-zinc-100 text-zinc-600 px-6 py-4 rounded-2xl font-bold hover:bg-zinc-200 transition-colors"
            >
              Back
            </button>
          )}
          <button
            onClick={step === steps.length ? handleSubmit : handleNext}
            className="flex-[2] bg-rose-500 text-white px-6 py-4 rounded-2xl font-bold shadow-lg shadow-rose-200 hover:bg-rose-600 transition-all flex items-center justify-center gap-2"
          >
            {step === steps.length ? 'Finish Setup' : 'Continue'}
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
