import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, 
  Users, 
  MapPin, 
  Heart, 
  Settings, 
  Music,
  Tent,
  Plus,
  Check,
  AlertTriangle,
  UserPlus,
  Map as MapIcon,
  LogOut,
  ChevronRight,
  Droplets,
  Utensils
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { LOLLA_FEST, MEETUP_POINTS, type Artist, type MeetupPoint } from './constants';

type Screen = 'auth' | 'lineup' | 'schedule' | 'group' | 'map';

export default function App() {
  const [screen, setScreen] = useState<Screen>('auth');
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [mySchedule, setMySchedule] = useState<string[]>([]);
  const [group, setGroup] = useState<{ name: string; code: string; members: string[] } | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [selectedDay, setSelectedDay] = useState<'Thu' | 'Fri' | 'Sat' | 'Sun'>('Thu');
  const [selectedStage, setSelectedStage] = useState<string>('All');

  const stages = useMemo(() => ['All', ...new Set(LOLLA_FEST.artists.map(a => a.stage))], []);

  const filteredArtists = useMemo(() => {
    return LOLLA_FEST.artists.filter(a => 
      a.day === selectedDay && (selectedStage === 'All' || a.stage === selectedStage)
    );
  }, [selectedDay, selectedStage]);
  const handleJoinGroup = () => {
    if (joinCode.trim().toUpperCase() === 'LOLLASQUAD') {
      setGroup({ name: "Lolla Legends", code: "LOLLASQUAD", members: ['Alice', 'Bob', 'Charlie', 'Dave', 'Eve'] });
      setIsJoining(false);
      setJoinCode('');
    } else {
      alert('Invalid code! Try "LOLLASQUAD"');
    }
  };

  const toggleSchedule = (id: string) => {
    setMySchedule(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const conflicts = useMemo(() => {
    const selectedArtists = LOLLA_FEST.artists.filter(a => mySchedule.includes(a.id));
    const conflictIds: string[] = [];
    
    for (let i = 0; i < selectedArtists.length; i++) {
      for (let j = i + 1; j < selectedArtists.length; j++) {
        const a = selectedArtists[i];
        const b = selectedArtists[j];
        if (a.startTime < b.endTime && b.startTime < a.endTime) {
          conflictIds.push(a.id, b.id);
        }
      }
    }
    return [...new Set(conflictIds)];
  }, [mySchedule]);

  if (screen === 'auth') {
    return <AuthScreen onLogin={(name, email) => { setUser({ name, email }); setScreen('lineup'); }} />;
  }

  return (
    <div className="min-h-screen pb-32" style={{ backgroundColor: LOLLA_FEST.bg, color: '#2C3327' }}>
      <header className="pt-12 px-6 mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-serif italic font-black text-[#2C3327]">{LOLLA_FEST.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-[10px] font-black text-[#B2CEFE] uppercase tracking-widest">
              {screen === 'lineup' && 'Browse Lineup'}
              {screen === 'schedule' && 'My Schedule'}
              {screen === 'group' && 'Group Hub'}
              {screen === 'map' && 'Festival Map'}
            </p>
            <span className="w-1 h-1 rounded-full bg-black/10" />
            <p className="text-[10px] font-bold opacity-30 uppercase tracking-widest">
              Hey, {user?.name.split(' ')[0]}
            </p>
          </div>
        </div>
        <button 
          onClick={() => { setUser(null); setScreen('auth'); }} 
          className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm active:scale-90 transition-transform"
        >
          <LogOut size={18} className="opacity-40" />
        </button>
      </header>

      <main className="px-5">
        <AnimatePresence mode="wait">
          {screen === 'lineup' && (
            <motion.div key="lineup" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
              {/* Filters */}
              <div className="space-y-4 mb-6">
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                  {(['Thu', 'Fri', 'Sat', 'Sun'] as const).map(day => (
                    <button 
                      key={day}
                      onClick={() => setSelectedDay(day)}
                      className={cn(
                        "px-6 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all",
                        selectedDay === day ? "bg-[#B2CEFE] text-white shadow-md" : "bg-white opacity-40"
                      )}
                    >
                      {day}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                  {stages.map(stage => (
                    <button 
                      key={stage}
                      onClick={() => setSelectedStage(stage)}
                      className={cn(
                        "px-4 py-2 rounded-xl font-bold text-[10px] uppercase tracking-wider whitespace-nowrap transition-all border-2",
                        selectedStage === stage ? "border-[#B2CEFE] text-[#B2CEFE] bg-white" : "border-transparent opacity-30"
                      )}
                    >
                      {stage}
                    </button>
                  ))}
                </div>
              </div>

              {filteredArtists.length === 0 ? (
                <div className="text-center py-20 opacity-20">
                  <Music size={48} className="mx-auto mb-4" />
                  <p className="font-bold">No artists found for this filter</p>
                </div>
              ) : (
                filteredArtists.map(artist => (
                  <ArtistCard 
                    key={artist.id} 
                    artist={artist} 
                    isSelected={mySchedule.includes(artist.id)}
                    onToggle={() => toggleSchedule(artist.id)}
                  />
                ))
              )}
            </motion.div>
          )}

          {screen === 'schedule' && (
            <motion.div key="schedule" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              {mySchedule.length === 0 ? (
                <div className="text-center py-20 opacity-40">
                  <Calendar size={48} className="mx-auto mb-4" />
                  <p className="font-bold">Your schedule is empty</p>
                </div>
              ) : (
                LOLLA_FEST.artists
                  .filter(a => mySchedule.includes(a.id))
                  .sort((a, b) => a.startTime - b.startTime)
                  .map(artist => (
                    <ScheduleItem 
                      key={artist.id} 
                      artist={artist} 
                      hasConflict={conflicts.includes(artist.id)}
                      friendsCount={group ? artist.friendsGoing.filter(f => group.members.includes(f)).length : 0}
                      onRemove={() => toggleSchedule(artist.id)}
                    />
                  ))
              )}
            </motion.div>
          )}

          {screen === 'group' && (
            <motion.div key="group" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              {!group ? (
                <div className="space-y-6">
                  <div className="bg-white p-8 rounded-[40px] text-center shadow-sm border border-black/5">
                    <Users size={48} className="mx-auto mb-4 text-[#B2CEFE]" />
                    <h2 className="text-2xl font-serif italic font-bold mb-2">Festival is better with friends</h2>
                    <p className="text-sm opacity-50 mb-6">Create a group to see where everyone is heading.</p>
                    <button 
                      onClick={() => setGroup({ name: "The Chicago Squad", code: "CH123", members: ['Alice', 'Bob'] })}
                      className="w-full py-4 rounded-2xl bg-[#B2CEFE] font-bold shadow-md active:scale-95 transition-transform"
                    >
                      Create Group
                    </button>
                    <button 
                      onClick={() => setIsJoining(true)}
                      className="w-full py-4 mt-3 rounded-2xl border-2 border-[#B2CEFE] text-[#B2CEFE] font-bold active:scale-95 transition-transform"
                    >
                      Join with Code
                    </button>
                  </div>

                  {isJoining && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      className="bg-white p-6 rounded-[32px] shadow-lg border border-[#B2CEFE]/20"
                    >
                      <h3 className="font-bold mb-4">Enter Invite Code</h3>
                      <input 
                        type="text" 
                        value={joinCode}
                        onChange={e => setJoinCode(e.target.value.toUpperCase())}
                        placeholder="e.g. LOLLASQUAD"
                        className="w-full p-4 rounded-xl bg-[#F0F4FF] border-none font-bold mb-4 outline-none focus:ring-2 ring-[#B2CEFE]"
                      />
                      <div className="flex gap-3">
                        <button 
                          onClick={() => setIsJoining(false)}
                          className="flex-1 py-3 rounded-xl bg-gray-100 font-bold text-sm"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={handleJoinGroup}
                          className="flex-1 py-3 rounded-xl bg-[#B2CEFE] font-bold text-sm"
                        >
                          Join
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-[#FDFD96] p-6 rounded-[40px] shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h2 className="text-2xl font-serif italic font-bold">{group.name}</h2>
                        <p className="text-xs font-bold opacity-40 uppercase tracking-widest">Invite Code: {group.code}</p>
                      </div>
                      <UserPlus size={24} className="opacity-40" />
                    </div>
                    <div className="flex -space-x-2">
                      {group.members.slice(0, 4).map((name, i) => (
                        <div key={i} className="w-10 h-10 rounded-full bg-white border-2 border-[#FDFD96] flex items-center justify-center font-black text-[10px] shadow-sm overflow-hidden">
                          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`} alt={name} />
                        </div>
                      ))}
                      {group.members.length > 4 && (
                        <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-black text-xs shadow-sm">
                          +{group.members.length - 4}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center ml-2">
                    <h3 className="text-sm font-bold uppercase tracking-widest opacity-40">Group Overlap</h3>
                    <button className="text-[10px] font-black text-[#B2CEFE] uppercase tracking-widest">View Full Schedule</button>
                  </div>
                  <div className="space-y-4">
                    {LOLLA_FEST.artists
                      .filter(a => a.friendsGoing.some(f => group.members.includes(f)))
                      .slice(0, 4)
                      .map(artist => {
                        const friendsHere = artist.friendsGoing.filter(f => group.members.includes(f));
                        return (
                          <div key={artist.id} className="bg-white p-4 rounded-[32px] flex items-center gap-4 shadow-sm border border-black/5">
                            <img src={artist.imageUrl} className="w-12 h-12 rounded-2xl object-cover" referrerPolicy="no-referrer" />
                            <div className="flex-1">
                              <h4 className="font-bold leading-tight">{artist.name}</h4>
                              <p className="text-[10px] opacity-40 font-bold uppercase">{artist.stage} • {artist.time.split(' - ')[0]}</p>
                            </div>
                            <div className="bg-[#B2D8B2] px-3 py-1.5 rounded-full text-[9px] font-black text-white flex items-center gap-1">
                              <Users size={10} />
                              {friendsHere.length} FRIENDS
                            </div>
                          </div>
                        );
                      })}
                  </div>
                  
                  <button 
                    onClick={() => setGroup(null)}
                    className="w-full py-4 rounded-2xl border-2 border-red-100 text-red-400 text-xs font-bold uppercase tracking-widest"
                  >
                    Leave Group
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {screen === 'map' && (
            <motion.div key="map" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div className="relative aspect-square bg-[#E8F0FE] rounded-[40px] overflow-hidden shadow-inner border-4 border-white">
                {/* Stylized Map Background */}
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#B2CEFE 2px, transparent 2px)', backgroundSize: '20px 20px' }} />
                
                {/* Stage Areas */}
                <div className="absolute top-10 left-10 w-32 h-32 bg-[#B2CEFE]/40 rounded-full blur-xl animate-pulse" />
                <div className="absolute bottom-20 right-10 w-40 h-40 bg-[#FDFD96]/40 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }} />
                
                {/* Markers */}
                {MEETUP_POINTS.map((point, i) => (
                  <motion.div 
                    key={point.id}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="absolute flex flex-col items-center"
                    style={{ 
                      top: `${20 + (i * 25)}%`, 
                      left: `${30 + (i * 20)}%` 
                    }}
                  >
                    <div className="bg-white p-2 rounded-xl shadow-lg border-2 border-[#B2CEFE]">
                      {point.type === 'water' && <Droplets size={16} className="text-blue-400" />}
                      {point.type === 'food' && <Utensils size={16} className="text-orange-400" />}
                      {point.type === 'stage' && <Music size={16} className="text-purple-400" />}
                    </div>
                    <div className="bg-black/80 text-white text-[8px] font-bold px-2 py-0.5 rounded-full mt-1 whitespace-nowrap">
                      {point.name}
                    </div>
                  </motion.div>
                ))}

                {/* Friend Marker Placeholder */}
                {group && (
                  <div className="absolute top-[45%] left-[55%] flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full border-2 border-white shadow-lg overflow-hidden bg-white">
                      <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alice" alt="Alice" />
                    </div>
                    <div className="bg-[#B2D8B2] text-white text-[8px] font-black px-2 py-0.5 rounded-full mt-1">
                      ALICE
                    </div>
                  </div>
                )}

                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="bg-white/80 backdrop-blur-md px-6 py-3 rounded-2xl shadow-xl border border-white/50 text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#B2CEFE]">Live Map Active</p>
                    <p className="text-[8px] opacity-40 font-bold">GPS Tracking Enabled</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center ml-2">
                  <h3 className="text-sm font-bold uppercase tracking-widest opacity-40">Meetup Points</h3>
                  <button className="text-[10px] font-black text-[#B2CEFE] uppercase tracking-widest">Add Point</button>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {MEETUP_POINTS.map(point => (
                    <div key={point.id} className="bg-white p-4 rounded-[32px] flex items-center gap-4 shadow-sm border border-black/5">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center",
                        point.type === 'water' ? "bg-blue-50" : point.type === 'food' ? "bg-orange-50" : "bg-purple-50"
                      )}>
                        {point.type === 'water' && <Droplets size={22} className="text-blue-400/60" />}
                        {point.type === 'food' && <Utensils size={22} className="text-orange-400/60" />}
                        {point.type === 'stage' && <MapPin size={22} className="text-purple-400/60" />}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-base leading-tight">{point.name}</h4>
                        <p className="text-[10px] opacity-40 font-bold uppercase tracking-tight">{point.location}</p>
                      </div>
                      <button className="w-10 h-10 rounded-xl bg-[#F0F4FF] flex items-center justify-center text-[#B2CEFE]">
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <nav className="fixed bottom-6 left-5 right-5 max-w-md mx-auto h-20 rounded-[32px] bg-[#B2CEFE] flex items-center justify-around px-6 shadow-2xl z-50 border border-white/20">
        <NavButton active={screen === 'lineup'} onClick={() => setScreen('lineup')} icon={Music} label="Lineup" />
        <NavButton active={screen === 'schedule'} onClick={() => setScreen('schedule')} icon={Calendar} label="Schedule" />
        <NavButton active={screen === 'group'} onClick={() => setScreen('group')} icon={Users} label="Group" />
        <NavButton active={screen === 'map'} onClick={() => setScreen('map')} icon={MapIcon} label="Map" />
      </nav>
    </div>
  );
}

function AuthScreen({ onLogin }: { onLogin: (name: string, email: string) => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-[#F0F4FF]">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <div className="w-20 h-20 bg-[#B2CEFE] rounded-[32px] flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Music size={40} className="text-white" />
          </div>
          <h1 className="text-5xl font-serif italic font-black text-[#2C3327]">Festie</h1>
          <p className="text-sm font-bold opacity-40 uppercase tracking-widest mt-2">Join the Lolla Squad</p>
        </div>

        <div className="space-y-4">
          <input 
            type="text" 
            placeholder="Your Name" 
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full p-5 rounded-2xl bg-white border-none shadow-sm focus:ring-4 focus:ring-[#B2CEFE]/30 outline-none font-bold placeholder:opacity-30"
          />
          <input 
            type="email" 
            placeholder="Email Address" 
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full p-5 rounded-2xl bg-white border-none shadow-sm focus:ring-4 focus:ring-[#B2CEFE]/30 outline-none font-bold placeholder:opacity-30"
          />
          <button 
            disabled={!name || !email}
            onClick={() => onLogin(name, email)}
            className="w-full py-5 rounded-2xl bg-[#B2CEFE] text-black/80 font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
          >
            Enter Festival
          </button>
        </div>
      </div>
    </div>
  );
}

interface ArtistCardProps {
  key?: React.Key;
  artist: Artist;
  isSelected: boolean;
  onToggle: () => void;
}

function ArtistCard({ artist, isSelected, onToggle }: ArtistCardProps) {
  return (
    <div className="bg-white rounded-[40px] p-6 shadow-sm border border-black/5 relative overflow-hidden">
      <div className="flex gap-6">
        <div className="relative shrink-0">
          <img src={artist.imageUrl} className="w-28 h-28 rounded-[32px] object-cover shadow-sm" referrerPolicy="no-referrer" />
          <button 
            onClick={onToggle}
            className={cn(
              "absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl flex items-center justify-center shadow-md border-4 border-white transition-all active:scale-90",
              isSelected ? "bg-[#B2D8B2]" : "bg-[#B2CEFE]"
            )}
          >
            {isSelected ? <Check size={18} className="text-white" /> : <Plus size={18} className="text-white" />}
          </button>
        </div>
        
        <div className="flex-1 flex flex-col justify-between py-1">
          <div>
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-2 inline-block bg-[#F0F4FF] text-[#B2CEFE]">
                {artist.stage}
              </span>
              <Heart size={22} className="text-[#FDFD96]" />
            </div>
            <h3 className="text-2xl font-serif italic font-bold leading-tight">{artist.name}</h3>
          </div>
          <p className="text-xs font-bold opacity-30 tracking-widest uppercase">{artist.time}</p>
        </div>
      </div>
    </div>
  );
}

interface ScheduleItemProps {
  key?: React.Key;
  artist: Artist;
  hasConflict: boolean;
  friendsCount: number;
  onRemove: () => void;
}

function ScheduleItem({ artist, hasConflict, friendsCount, onRemove }: ScheduleItemProps) {
  return (
    <div className={cn(
      "bg-white rounded-[32px] p-5 shadow-sm border-2 transition-colors",
      hasConflict ? "border-[#FFB3B3] bg-[#FFF5F5]" : "border-transparent"
    )}>
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gray-100 overflow-hidden shrink-0">
          <img src={artist.imageUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="text-lg font-serif italic font-bold leading-tight">{artist.name}</h4>
            {friendsCount > 0 && (
              <div className="flex items-center gap-1 bg-[#B2D8B2]/20 px-2 py-0.5 rounded-full">
                <Users size={10} className="text-[#B2D8B2]" />
                <span className="text-[9px] font-black text-[#B2D8B2]">{friendsCount}</span>
              </div>
            )}
          </div>
          <p className="text-[10px] font-bold opacity-40 uppercase">{artist.time} • {artist.stage}</p>
        </div>
        {hasConflict && (
          <div className="w-10 h-10 rounded-xl bg-[#FFB3B3] flex items-center justify-center text-white">
            <AlertTriangle size={20} />
          </div>
        )}
        <button onClick={onRemove} className="text-xs font-bold opacity-20 hover:opacity-100 px-2 py-1">Remove</button>
      </div>
    </div>
  );
}

function NavButton({ active, onClick, icon: Icon, label }: { active: boolean; onClick: () => void; icon: any; label: string }) {
  return (
    <button onClick={onClick} className={cn("flex flex-col items-center gap-1.5 transition-all", active ? "scale-110" : "opacity-40")}>
      <Icon size={26} className={active ? "text-white" : "text-black/60"} />
      <span className="text-[9px] font-bold uppercase tracking-wider text-black/60">{label}</span>
    </button>
  );
}
