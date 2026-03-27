import React, { useState, useMemo, useEffect } from 'react';
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
  Utensils,
  Palmtree
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { FESTIVALS, MEETUP_POINTS, MEETUPS, type Artist, type MeetupPoint, type Festival, type Meetup } from './constants';

type Screen = 'auth' | 'lineup' | 'schedule' | 'group' | 'map' | 'festivals';

function ScrollContainer({ children, className, bg }: { children: React.ReactNode, className?: string, bg?: string }) {
  const [showIndicator, setShowIndicator] = useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      // Show indicator if there's more to scroll to the right
      setShowIndicator(scrollWidth > clientWidth && scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  useEffect(() => {
    checkScroll();
    // Add a small delay to ensure layout is complete
    const timer = setTimeout(checkScroll, 100);
    window.addEventListener('resize', checkScroll);
    return () => {
      window.removeEventListener('resize', checkScroll);
      clearTimeout(timer);
    };
  }, [children]);

  return (
    <div className={cn("relative group", className)}>
      <div 
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex gap-2 overflow-x-auto pb-2 no-scrollbar"
      >
        {children}
      </div>
      {showIndicator && (
        <div 
          className="absolute right-0 top-0 bottom-2 w-12 flex items-center justify-end pr-1 pointer-events-none opacity-60 z-10"
          style={{ 
            background: `linear-gradient(to left, ${bg || 'transparent'} 40%, transparent)` 
          }}
        >
          <ChevronRight size={14} className="text-black/20" />
        </div>
      )}
    </div>
  );
}

const getStageColor = (stage: string) => {
  const colors: Record<string, string> = {
    'Coachella Stage': '#FFB3D9',
    'Outdoor Theatre': '#B2CEFE',
    'Main Stage': '#FDFD96',
    'Oasis Stage': '#B2D8B2',
    'Sunset Stage': '#FFB3B3',
    'Summit Stage': '#D1B3FF',
    'Valley Stage': '#FFD1B3',
    'Kinetic Field': '#B3FFE6',
    'Circuit Grounds': '#FFFAB3',
    'Neon Garden': '#D1B3FF',
    'Basspod': '#FFB3B3',
    'Cosmic Meadow': '#B2D8B2',
    'Stereo Bloom': '#B2CEFE',
    'Garden Stage': '#FFB3D9',
    'Meadow Stage': '#FDFD96',
    'Orchard Stage': '#FFD1B3',
    'Hilltop Stage': '#B3FFE6',
    'Coast Stage': '#FFFAB3',
  };
  
  if (colors[stage]) return colors[stage];
  
  // Fallback: Simple hash to color
  let hash = 0;
  for (let i = 0; i < stage.length; i++) {
    hash = stage.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash % 360);
  return `hsl(${h}, 70%, 85%)`;
};

export default function App() {
  const [screen, setScreen] = useState<Screen>('auth');
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [mySchedule, setMySchedule] = useState<string[]>([]);
  const [myFestivals, setMyFestivals] = useState<string[]>([]);
  const [meetupResponses, setMeetupResponses] = useState<Record<string, { status: 'heading' | 'other', message?: string }>>({});
  const [simulatedTime, setSimulatedTime] = useState(1075); // 17:55 (5 mins before first meetup)
  const [showMeetupModal, setShowMeetupModal] = useState<string | null>(null);
  const [otherMessage, setOtherMessage] = useState('');
  const [showGroupSchedule, setShowGroupSchedule] = useState(false);
  const [groupScheduleDay, setGroupScheduleDay] = useState<'Thu' | 'Fri' | 'Sat' | 'Sun'>('Fri');
  const [group, setGroup] = useState<{ name: string; code: string; members: string[] } | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [selectedDay, setSelectedDay] = useState<'Thu' | 'Fri' | 'Sat' | 'Sun'>('Thu');
  const [selectedStage, setSelectedStage] = useState<string>('All');
  const [selectedFestivalId, setSelectedFestivalId] = useState<string>(FESTIVALS[0].id);
  const [scheduleFestId, setScheduleFestId] = useState<string | null>(null);
  const [focusedScheduleId, setFocusedScheduleId] = useState<string | null>(null);

  const [meetupPoints, setMeetupPoints] = useState<MeetupPoint[]>(MEETUP_POINTS);
  const [showAddPointModal, setShowAddPointModal] = useState(false);
  const [isSelectingLocation, setIsSelectingLocation] = useState(false);
  const [notifications, setNotifications] = useState<{ id: string; message: string; type: 'info' | 'warning'; createdAt: number }[]>([]);
  const [newPoint, setNewPoint] = useState({ name: '', location: '', time: '20:00', type: 'stage' as const });

  const addMeetupPoint = () => {
    if (!newPoint.name || !newPoint.location) return;

    // Generate ID with coordinates if it's a custom map point
    const id = newPoint.location.includes('%') 
      ? `custom-${Date.now()}-${newPoint.location.split('at ')[1].split('%')[0]}-${newPoint.location.split(', ')[1].split('%')[0]}`
      : `m${Date.now()}`;

    const type = newPoint.location.toLowerCase().includes('water') ? 'water' : 
                 newPoint.location.toLowerCase().includes('food') || newPoint.location.toLowerCase().includes('chow') ? 'food' : 
                 newPoint.location.toLowerCase().includes('exit') ? 'exit' : 'stage';
    
    const point: MeetupPoint = {
      id,
      name: newPoint.name,
      location: newPoint.location,
      type,
      description: `Located near ${newPoint.location}, perfect for regrouping.`
    };

    setMeetupPoints(prev => [...prev, point]);
    setShowAddPointModal(false);

    // Check for live shows/artists at this time and location
    const [hours, minutes] = newPoint.time.split(':').map(Number);
    const timestamp = hours * 60 + minutes;
    
    const artistAtTime = selectedFestival.artists.find(a => {
      const aStart = a.startTime;
      const aEnd = (a.startTime + 60) % 1440; // Assume 1h set if not specified or use getDuration
      // Simple check: is the meetup time during the set?
      return a.stage === newPoint.location && timestamp >= aStart && timestamp <= (aStart + 90); // 90 min window
    });

    if (artistAtTime) {
      const notification = {
        id: `n${Date.now()}`,
        message: `⚠️ Heads up! ${artistAtTime.name} is playing at ${artistAtTime.stage} during your meetup time (${newPoint.time}). It might be crowded!`,
        type: 'warning' as const,
        createdAt: Date.now()
      };
      setNotifications(prev => [notification, ...prev]);
    } else {
      const notification = {
        id: `n${Date.now()}`,
        message: `New meetup point added: ${newPoint.name} at ${newPoint.time}.`,
        type: 'info' as const,
        createdAt: Date.now()
      };
      setNotifications(prev => [notification, ...prev]);
    }

    // Reset form
    setNewPoint({ name: '', location: '', time: '20:00', type: 'stage' });
  };

  const selectedFestival = useMemo(() => 
    FESTIVALS.find(f => f.id === selectedFestivalId) || FESTIVALS[0], 
  [selectedFestivalId]);

  const stages = useMemo(() => ['All', ...new Set(selectedFestival.artists.map(a => a.stage))], [selectedFestival]);

  const filteredArtists = useMemo(() => {
    return selectedFestival.artists.filter(a => 
      a.day === selectedDay && (selectedStage === 'All' || a.stage === selectedStage)
    );
  }, [selectedDay, selectedStage, selectedFestival]);
  const toggleFestival = (id: string) => {
    setMyFestivals(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleJoinGroup = () => {
    if (joinCode.trim().toUpperCase() === 'FESTSQUAD') {
      setGroup({ 
        name: "Festival Legends", 
        code: "FESTSQUAD", 
        members: ['Alice', 'Bob', 'Charlie', 'Dave', 'Eve', user?.name || 'Me'] 
      });
      setIsJoining(false);
      setJoinCode('');
    } else {
      alert('Invalid code! Try "FESTSQUAD"');
    }
  };

  const toggleSchedule = (id: string) => {
    setMySchedule(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  useEffect(() => {
    const availableDays = (['Thu', 'Fri', 'Sat', 'Sun'] as const).filter(day => 
      selectedFestival.artists.some(a => a.day === day)
    );
    if (availableDays.length > 0 && !availableDays.includes(selectedDay)) {
      setSelectedDay(availableDays[0]);
    }
  }, [selectedFestival, selectedDay]);

  useEffect(() => {
    if (notifications.length === 0) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const tenMinutes = 10 * 60 * 1000;
      setNotifications(prev => prev.filter(n => now - n.createdAt < tenMinutes));
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [notifications.length]);

  // Persistence
  useEffect(() => {
    const savedUser = localStorage.getItem('festie_user');
    const savedFestivals = localStorage.getItem('festie_myFestivals');
    const savedSchedule = localStorage.getItem('festie_mySchedule');

    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setScreen('lineup');
    }
    if (savedFestivals) setMyFestivals(JSON.parse(savedFestivals));
    if (savedSchedule) setMySchedule(JSON.parse(savedSchedule));
  }, []);

  useEffect(() => {
    if (user) localStorage.setItem('festie_user', JSON.stringify(user));
    else {
      localStorage.removeItem('festie_user');
      localStorage.removeItem('festie_myFestivals');
      localStorage.removeItem('festie_mySchedule');
    }
  }, [user]);

  useEffect(() => {
    if (user) localStorage.setItem('festie_myFestivals', JSON.stringify(myFestivals));
  }, [myFestivals, user]);

  useEffect(() => {
    if (user) localStorage.setItem('festie_mySchedule', JSON.stringify(mySchedule));
  }, [mySchedule, user]);

  const TIMELINE_START_MINUTES = 720; // 12:00 PM
  
  const getMinutesFromStart = (m: number) => {
    if (m >= TIMELINE_START_MINUTES) return m - TIMELINE_START_MINUTES;
    return m + (1440 - TIMELINE_START_MINUTES);
  };

  const getDuration = (start: number, end: number) => {
    if (end >= start) return end - start;
    return (end + 1440) - start;
  };

  const themeFestival = useMemo(() => {
    if (myFestivals.length === 0) return FESTIVALS[0];
    // Find the saved festival that appears earliest in the FESTIVALS array (closest upcoming)
    const savedFests = FESTIVALS.filter(f => myFestivals.includes(f.id));
    return savedFests[0] || FESTIVALS[0];
  }, [myFestivals]);

  if (screen === 'auth') {
    return <AuthScreen theme={themeFestival} onLogin={(name, email) => { 
      // Clear states for new login session
      setMyFestivals([]);
      setMySchedule([]);
      setMeetupResponses({});
      setGroup(null);
      
      setUser({ name, email }); 
      setScreen('festivals'); 
    }} />;
  }

  return (
    <div className="min-h-screen pb-32 transition-colors duration-500" style={{ backgroundColor: selectedFestival.bg, color: '#2C3327' }}>
      <header className="pt-12 px-6 mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-serif italic font-black" style={{ color: '#2C3327' }}>Festie</h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: selectedFestival.accent }}>
              {screen === 'lineup' && 'Browse Lineup'}
              {screen === 'schedule' && 'My Schedule'}
              {screen === 'group' && 'Group Hub'}
              {screen === 'map' && 'Festival Map'}
              {screen === 'festivals' && 'Explore Festivals'}
            </p>
            <span className="w-1 h-1 rounded-full bg-black/10" />
            <p className="text-[10px] font-bold opacity-30 uppercase tracking-widest">
              {selectedFestival.name}
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
                <ScrollContainer bg={selectedFestival.bg}>
                  {(['Thu', 'Fri', 'Sat', 'Sun'] as const).filter(day => selectedFestival.artists.some(a => a.day === day)).map(day => (
                      <button 
                        key={day}
                        onClick={() => setSelectedDay(day)}
                        className={cn(
                          "px-6 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all",
                          selectedDay === day 
                            ? "text-white shadow-md" 
                            : "bg-white opacity-40"
                        )}
                        style={{ backgroundColor: selectedDay === day ? selectedFestival.accent : undefined }}
                      >
                      {day}
                    </button>
                  ))}
                </ScrollContainer>
                <ScrollContainer bg={selectedFestival.bg}>
                  {stages.map(stage => (
                    <button 
                      key={stage}
                      onClick={() => setSelectedStage(stage)}
                      className={cn(
                        "px-4 py-2 rounded-xl font-bold text-[10px] uppercase tracking-wider whitespace-nowrap transition-all border-2",
                        selectedStage === stage 
                          ? "bg-white text-black border-white" 
                          : "border-transparent"
                      )}
                      style={{ 
                        color: selectedStage === stage ? undefined : 'rgba(0,0,0,0.3)'
                      }}
                    >
                      {stage}
                    </button>
                  ))}
                </ScrollContainer>
              </div>

              {filteredArtists.length === 0 ? (
                <div className="text-center py-20" style={{ opacity: 0.2 }}>
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
            <motion.div key="schedule" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center ml-2">
                  <h3 className="text-sm font-bold uppercase tracking-widest opacity-40">My Schedules</h3>
                </div>
                
                {myFestivals.length === 0 ? (
                  <div className="bg-white p-10 rounded-[40px] text-center shadow-sm border border-black/5">
                    <Tent size={48} className="mx-auto mb-4 opacity-20" />
                    <p className="font-bold opacity-40">No festivals added yet</p>
                    <button 
                      onClick={() => setScreen('festivals')}
                      className="mt-4 px-6 py-3 rounded-2xl bg-[#B2CEFE] font-bold text-xs uppercase tracking-widest"
                    >
                      Explore Fests
                    </button>
                  </div>
                ) : (
                  <ScrollContainer bg={selectedFestival.bg}>
                    {FESTIVALS.filter(f => myFestivals.includes(f.id)).map(fest => (
                      <button 
                        key={fest.id}
                        onClick={() => {
                          setScheduleFestId(fest.id);
                          setSelectedFestivalId(fest.id);
                        }}
                        className={cn(
                          "px-6 py-3.5 rounded-[24px] font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap border-2",
                          scheduleFestId === fest.id 
                            ? "bg-white border-black/5 shadow-md text-[#2C3327]" 
                            : "bg-white/30 border-transparent opacity-60 text-[#2C3327]"
                        )}
                      >
                        {fest.name}
                      </button>
                    ))}
                  </ScrollContainer>
                )}
              </div>

              {scheduleFestId && (
                <div className="space-y-6">
                  {/* Day Selector */}
                  <ScrollContainer bg={selectedFestival.bg}>
                    {(['Thu', 'Fri', 'Sat', 'Sun'] as const).filter(day => selectedFestival.artists.some(a => a.day === day)).map(day => (
                      <button 
                        key={day}
                        onClick={() => setSelectedDay(day)}
                        className={cn(
                          "px-6 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all",
                          selectedDay === day 
                            ? "text-white shadow-md" 
                            : "bg-white opacity-40"
                        )}
                        style={{ backgroundColor: selectedDay === day ? selectedFestival.accent : undefined }}
                      >
                        {day}
                      </button>
                    ))}
                  </ScrollContainer>

                  {/* Timeline View */}
                  <div className="relative pl-10 min-h-[400px]">
                    {/* Time Indicators */}
                    <div className="absolute left-0 top-0 bottom-0 w-10 border-r" style={{ borderColor: 'rgba(0,0,0,0.05)', height: '1080px' }}>
                      {[12, 14, 16, 18, 20, 22, 0, 2, 4, 6].map((hour, i) => (
                        <div 
                          key={i} 
                          className="absolute text-[9px] font-black w-full text-right pr-1" 
                          style={{ 
                            top: `${i * 120}px`, 
                            opacity: 0.2, 
                            color: '#000000' 
                          }}
                        >
                          {hour === 0 ? '00' : hour}:00
                        </div>
                      ))}
                    </div>

                    {/* Artist Blocks */}
                    <div className="relative" style={{ height: '1080px' }}>
                      {(() => {
                        const artistsOnDay = FESTIVALS.find(f => f.id === scheduleFestId)?.artists
                          .filter(a => mySchedule.includes(a.id) && a.day === selectedDay) || [];
                        
                        // Layout logic
                        const sorted = [...artistsOnDay].sort((a, b) => getMinutesFromStart(a.startTime) - getMinutesFromStart(b.startTime));
                        const clusters: Artist[][] = [];
                        
                        sorted.forEach(artist => {
                          let added = false;
                          const start = getMinutesFromStart(artist.startTime);
                          const end = start + getDuration(artist.startTime, artist.endTime);
                          
                          for (const cluster of clusters) {
                            const clusterOverlaps = cluster.some(c => {
                              const cStart = getMinutesFromStart(c.startTime);
                              const cEnd = cStart + getDuration(c.startTime, c.endTime);
                              return start < cEnd && end > cStart;
                            });
                            
                            if (clusterOverlaps) {
                              cluster.push(artist);
                              added = true;
                              break;
                            }
                          }
                          
                          if (!added) {
                            clusters.push([artist]);
                          }
                        });
                        
                        const layouts: { [id: string]: { left: string; width: string } } = {};
                        clusters.forEach(cluster => {
                          const columns: string[][] = [];
                          cluster.forEach(artist => {
                            let placed = false;
                            const start = getMinutesFromStart(artist.startTime);
                            const end = start + getDuration(artist.startTime, artist.endTime);
                            
                            for (const column of columns) {
                              const colOverlaps = column.some(cId => {
                                const c = cluster.find(a => a.id === cId)!;
                                const cStart = getMinutesFromStart(c.startTime);
                                const cEnd = cStart + getDuration(c.startTime, c.endTime);
                                return start < cEnd && end > cStart;
                              });
                              
                              if (!colOverlaps) {
                                column.push(artist.id);
                                placed = true;
                                break;
                              }
                            }
                            
                            if (!placed) {
                              columns.push([artist.id]);
                            }
                          });
                          
                          const width = 100 / columns.length;
                          columns.forEach((column, colIdx) => {
                            column.forEach(id => {
                              layouts[id] = {
                                left: `${colIdx * width}%`,
                                width: `${width}%`
                              };
                            });
                          });
                        });
                        
                        return artistsOnDay.map(artist => {
                          const startPos = getMinutesFromStart(artist.startTime);
                          const duration = getDuration(artist.startTime, artist.endTime);
                          const layout = layouts[artist.id] || { left: '0%', width: '100%' };
                          const isFocused = focusedScheduleId === artist.id;
                          
                          return (
                            <div 
                              key={artist.id}
                              onClick={() => setFocusedScheduleId(artist.id)}
                              className={cn(
                                "absolute bg-white p-3 rounded-2xl shadow-sm border-l-4 flex flex-col gap-2 overflow-hidden cursor-pointer transition-all",
                                isFocused && "ring-2 ring-black/10 shadow-lg"
                              )}
                              style={{ 
                                top: `${startPos}px`, 
                                height: `${Math.max(duration, 80)}px`,
                                left: layout.left,
                                width: layout.width,
                                zIndex: isFocused ? 50 : 1,
                                borderLeftColor: getStageColor(artist.stage),
                                backgroundColor: '#FFFFFF'
                              }}
                            >
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 relative">
                                  <img src={artist.imageUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-bold text-[11px] leading-tight text-[#2C3327] truncate">{artist.name}</h4>
                                  <p className="text-[8px] font-bold opacity-40 uppercase truncate">{artist.stage}</p>
                                </div>
                              </div>
                              <div className="flex items-center justify-between mt-auto">
                                <p className="text-[8px] font-black opacity-30 uppercase">{artist.time.split(' - ')[0]}</p>
                                <button 
                                  onClick={() => toggleSchedule(artist.id)}
                                  className="w-6 h-6 rounded-lg bg-gray-50 flex items-center justify-center text-gray-300 shrink-0"
                                >
                                  <Plus size={12} className="rotate-45" />
                                </button>
                              </div>
                            </div>
                          );
                        });
                      })()}
                      
                      {FESTIVALS.find(f => f.id === scheduleFestId)?.artists
                        .filter(a => mySchedule.includes(a.id) && a.day === selectedDay).length === 0 && (
                          <div className="py-20 text-center" style={{ opacity: 0.2 }}>
                            <Music size={32} className="mx-auto mb-2" />
                            <p className="text-xs font-bold">No sets saved for this day</p>
                          </div>
                        )}
                    </div>
                  </div>
                </div>
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
                      onClick={() => setGroup({ 
                        name: "The Festival Squad", 
                        code: "FEST123", 
                        members: ['Alice', 'Bob', user?.name || 'Me'] 
                      })}
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
                        placeholder="e.g. FESTSQUAD"
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
                        <p className="text-xs font-bold uppercase tracking-widest" style={{ opacity: 0.4 }}>Invite Code: {group.code}</p>
                      </div>
                      <UserPlus size={24} style={{ opacity: 0.4 }} />
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
                  
                  {(() => {
                    const urgentMeetups = MEETUPS.filter(m => {
                      const timeDiff = m.timestamp - simulatedTime;
                      return timeDiff > 0 && timeDiff <= 10 && !meetupResponses[m.id];
                    });

                    if (urgentMeetups.length === 0) return null;

                    return (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 ml-2">
                          <AlertTriangle size={14} className="text-red-500" />
                          <h3 className="text-sm font-black uppercase tracking-widest text-red-500">Urgent !</h3>
                        </div>
                        {urgentMeetups.map(meetup => {
                          const timeDiff = meetup.timestamp - simulatedTime;
                          return (
                            <motion.div 
                              key={meetup.id}
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="bg-red-50 p-5 rounded-[40px] border-2 border-red-200 shadow-lg shadow-red-100/50"
                            >
                              <div className="flex justify-between items-start mb-4">
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <MapPin size={14} className="text-red-500" />
                                    <h4 className="font-bold text-red-900">{meetup.location}</h4>
                                  </div>
                                  <p className="text-[11px] font-black text-red-600 uppercase">Starting in {timeDiff} mins</p>
                                </div>
                                <div className="bg-red-500 text-white px-3 py-1 rounded-full text-[10px] font-black">
                                  {meetup.time}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => setMeetupResponses(prev => ({ ...prev, [meetup.id]: { status: 'heading' } }))}
                                  className="flex-1 py-3 bg-red-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-md active:scale-95 transition-transform"
                                >
                                  Heading Over
                                </button>
                                <button 
                                  onClick={() => setShowMeetupModal(meetup.id)}
                                  className="flex-1 py-3 bg-white text-red-500 border border-red-200 rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-transform"
                                >
                                  Other Plans
                                </button>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    );
                  })()}

                  <div className="flex justify-between items-center ml-2">
                    <h3 className="text-sm font-bold uppercase tracking-widest" style={{ opacity: 0.4 }}>Group Overlap</h3>
                    <button 
                      onClick={() => {
                        setGroupScheduleDay(selectedDay);
                        setShowGroupSchedule(true);
                      }}
                      className="text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full bg-white shadow-sm border border-black/5 active:scale-95 transition-all" 
                      style={{ color: selectedFestival.accent }}
                    >
                      View Full Schedule
                    </button>
                  </div>
                  <div className="space-y-4">
                    {selectedFestival.artists
                      .filter(a => a.friendsGoing.some(f => group.members.includes(f)))
                      .slice(0, 4)
                      .map(artist => {
                        const friendsHere = artist.friendsGoing.filter(f => group.members.includes(f));
                        return (
                          <div key={artist.id} className="bg-white p-4 rounded-[32px] flex items-center gap-4 shadow-sm border border-black/5">
                            <img src={artist.imageUrl} className="w-12 h-12 rounded-2xl object-cover" referrerPolicy="no-referrer" />
                            <div className="flex-1">
                              <h4 className="font-bold leading-tight text-[#2C3327]">{artist.name}</h4>
                              <p className="text-[10px] opacity-40 font-bold uppercase text-[#2C3327]">{artist.stage} • {artist.time.split(' - ')[0]}</p>
                            </div>
                            <div className="bg-[#B2D8B2] px-3 py-1.5 rounded-full text-[9px] font-black text-white flex items-center gap-1">
                              <Users size={10} />
                              {friendsHere.length} FRIENDS
                            </div>
                          </div>
                        );
                      })}
                  </div>

                  <div className="flex justify-between items-center ml-2 mt-8">
                    <h3 className="text-sm font-bold uppercase tracking-widest" style={{ opacity: 0.4 }}>Group Meetups</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-[8px] font-bold opacity-30">SIMULATE TIME:</span>
                      <button 
                        onClick={() => setSimulatedTime(prev => (prev + 5) % 1440)}
                        className="text-[10px] font-black uppercase bg-white px-2 py-1 rounded-lg shadow-sm"
                      >
                        {Math.floor(simulatedTime/60)}:{(simulatedTime%60).toString().padStart(2, '0')}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {MEETUPS.filter(m => {
                      const timeDiff = m.timestamp - simulatedTime;
                      const isUrgent = timeDiff > 0 && timeDiff <= 10 && !meetupResponses[m.id];
                      return !isUrgent;
                    }).map(meetup => {
                      const timeDiff = meetup.timestamp - simulatedTime;
                      const isNotifying = timeDiff > 0 && timeDiff <= 10;
                      const response = meetupResponses[meetup.id];

                      return (
                        <div key={meetup.id} className="relative">
                          <div className={cn(
                            "bg-white p-5 rounded-[40px] shadow-sm border transition-all duration-500",
                            isNotifying ? "border-red-200 ring-4 ring-red-50" : "border-black/5"
                          )}>
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <MapPin size={14} style={{ color: selectedFestival.accent }} />
                                  <h4 className="font-bold text-[#2C3327]">{meetup.location}</h4>
                                </div>
                                <p className="text-xs opacity-50 font-medium">{meetup.description}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-black" style={{ color: selectedFestival.accent }}>{meetup.time}</p>
                                <p className="text-[9px] font-bold opacity-30 uppercase">{meetup.day}</p>
                              </div>
                            </div>

                            {isNotifying && !response && (
                              <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-4 p-4 bg-red-50 rounded-3xl border border-red-100"
                              >
                                <div className="flex items-center gap-2 mb-3">
                                  <AlertTriangle size={16} className="text-red-500" />
                                  <p className="text-[11px] font-black text-red-600 uppercase">Meetup in {timeDiff} mins!</p>
                                </div>
                                <div className="flex gap-2">
                                  <button 
                                    onClick={() => setMeetupResponses(prev => ({ ...prev, [meetup.id]: { status: 'heading' } }))}
                                    className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm"
                                  >
                                    Heading Over
                                  </button>
                                  <button 
                                    onClick={() => setShowMeetupModal(meetup.id)}
                                    className="flex-1 py-2.5 bg-white text-red-500 border border-red-200 rounded-xl text-[10px] font-black uppercase tracking-widest"
                                  >
                                    Other Plans
                                  </button>
                                </div>
                              </motion.div>
                            )}

                            {response && (
                              <div className="mt-4 flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-black/5">
                                <div className={cn(
                                  "w-8 h-8 rounded-full flex items-center justify-center text-white",
                                  response.status === 'heading' ? "bg-green-400" : "bg-orange-400"
                                )}>
                                  {response.status === 'heading' ? <Check size={16} /> : <Music size={16} />}
                                </div>
                                <div>
                                  <p className="text-[10px] font-black uppercase">
                                    {response.status === 'heading' ? "You're heading over!" : "You sent a message"}
                                  </p>
                                  {response.message && <p className="text-[10px] opacity-50 italic">"{response.message}"</p>}
                                </div>
                              </div>
                            )}
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
                {meetupPoints.map((point, i) => (
                  <motion.div 
                    key={point.id}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="absolute flex flex-col items-center"
                    style={{ 
                      top: point.id.startsWith('custom-') ? point.id.split('-')[3] + '%' : `${20 + (i * 25)}%`, 
                      left: point.id.startsWith('custom-') ? point.id.split('-')[2] + '%' : `${30 + (i * 20)}%` 
                    }}
                  >
                    <div className="bg-white p-2 rounded-xl shadow-lg border-2 border-[#B2CEFE]">
                      {point.type === 'water' && <Droplets size={16} className="text-blue-400" />}
                      {point.type === 'food' && <Utensils size={16} className="text-orange-400" />}
                      {point.type === 'stage' && <Music size={16} className="text-purple-400" />}
                      {point.type === 'exit' && <LogOut size={16} className="text-red-400" />}
                    </div>
                    <div className="bg-black/80 text-white text-[8px] font-bold px-2 py-0.5 rounded-full mt-1 whitespace-nowrap">
                      {point.name}
                    </div>
                  </motion.div>
                ))}

                {isSelectingLocation && (
                  <div 
                    className="absolute inset-0 z-10 cursor-crosshair flex items-center justify-center bg-black/10 backdrop-blur-[1px]"
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
                      const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
                      
                      // Find nearest landmark or just use coordinates
                      const locationName = `Spot at ${x}%, ${y}%`;
                      setNewPoint(prev => ({ ...prev, location: locationName }));
                      setIsSelectingLocation(false);
                      setShowAddPointModal(true);
                    }}
                  >
                    <div className="bg-white/90 px-4 py-2 rounded-full shadow-2xl border-2 border-[#B2CEFE] animate-bounce flex items-center gap-3">
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#B2CEFE]">Tap to set point</p>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsSelectingLocation(false);
                          setShowAddPointModal(true);
                        }}
                        className="w-6 h-6 rounded-full bg-red-50 text-red-400 flex items-center justify-center"
                      >
                        <Plus size={14} className="rotate-45" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Preview Marker */}
                {showAddPointModal && newPoint.location.includes('%') && (
                  <div 
                    className="absolute flex flex-col items-center z-20"
                    style={{ 
                      top: newPoint.location.split(', ')[1].split('%')[0] + '%', 
                      left: newPoint.location.split('at ')[1].split('%')[0] + '%' 
                    }}
                  >
                    <div className="bg-[#B2CEFE] p-2 rounded-xl shadow-lg border-2 border-white animate-pulse">
                      <MapPin size={16} className="text-white" />
                    </div>
                    <div className="bg-white text-black text-[8px] font-bold px-2 py-0.5 rounded-full mt-1 whitespace-nowrap shadow-sm border border-black/5">
                      NEW POINT
                    </div>
                  </div>
                )}

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
                {notifications.length > 0 && (
                  <div className="space-y-2">
                    {notifications.map(n => (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={n.id} 
                        className={cn(
                          "p-3 rounded-2xl text-[10px] font-bold border flex items-center gap-2",
                          n.type === 'warning' ? "bg-red-50 border-red-100 text-red-600" : "bg-blue-50 border-blue-100 text-blue-600"
                        )}
                      >
                        {n.type === 'warning' ? <AlertTriangle size={14} /> : <Plus size={14} />}
                        <div className="flex-1 flex flex-col">
                          <span>{n.message}</span>
                          <span className="text-[8px] opacity-30 mt-0.5">
                            {Math.floor((Date.now() - n.createdAt) / 60000)}m ago • Expiring soon
                          </span>
                        </div>
                        <button onClick={() => setNotifications(prev => prev.filter(x => x.id !== n.id))} className="opacity-40 hover:opacity-100">
                          <Check size={14} />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}

                <div className="flex justify-between items-center ml-2">
                  <h3 className="text-sm font-bold uppercase tracking-widest opacity-40">Meetup Points</h3>
                  <button 
                    onClick={() => setShowAddPointModal(true)}
                    className="text-[10px] font-black text-[#B2CEFE] uppercase tracking-widest hover:opacity-70 transition-opacity"
                  >
                    Add Point
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {meetupPoints.map(point => (
                    <div key={point.id} className="bg-white p-4 rounded-[32px] flex items-center gap-4 shadow-sm border border-black/5">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center",
                        point.type === 'water' ? "bg-blue-50" : point.type === 'food' ? "bg-orange-50" : point.type === 'exit' ? "bg-red-50" : "bg-purple-50"
                      )}>
                        {point.type === 'water' && <Droplets size={22} className="text-blue-400/60" />}
                        {point.type === 'food' && <Utensils size={22} className="text-orange-400/60" />}
                        {point.type === 'stage' && <Music size={22} className="text-purple-400/60" />}
                        {point.type === 'exit' && <LogOut size={22} className="text-red-400/60" />}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-base leading-tight">{point.name}</h4>
                        <p className="text-[10px] opacity-40 font-bold uppercase tracking-tight">{point.location}</p>
                        {point.description && (
                          <p className="text-[9px] opacity-60 mt-1 italic">{point.description}</p>
                        )}
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

          {screen === 'festivals' && (
            <motion.div key="festivals" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div className="flex justify-between items-center ml-2">
                <h3 className="text-sm font-bold uppercase tracking-widest" style={{ opacity: 0.4 }}>All Events</h3>
                <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: selectedFestival.accent }}>{myFestivals.length} Attending</p>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {FESTIVALS.map(fest => {
                  const isAttending = myFestivals.includes(fest.id);
                  return (
                    <div 
                      key={fest.id}
                      className={cn(
                        "p-6 rounded-[40px] text-left transition-all border-2 flex items-center justify-between group relative overflow-hidden cursor-pointer active:scale-[0.98]",
                        selectedFestivalId === fest.id 
                          ? "border-black/20 shadow-lg ring-2 ring-black/5" 
                          : "border-black/5 opacity-80 hover:border-black/10 hover:opacity-100"
                      )}
                      style={{ backgroundColor: fest.bg }}
                    >
                      <div className="flex items-center gap-4 flex-1" onClick={() => {
                        setSelectedFestivalId(fest.id);
                        setScreen('lineup');
                        setSelectedStage('All');
                      }}>
                        <div className="w-16 h-16 rounded-3xl flex items-center justify-center shadow-sm" style={{ backgroundColor: fest.accent }}>
                          {fest.id === 'coachella-2026' ? <Palmtree size={32} className="text-white" /> : <Tent size={32} className="text-white" />}
                        </div>
                        <div style={{ color: '#2C3327' }}>
                          <h3 className="text-xl font-serif italic font-bold tracking-tight leading-tight">{fest.name}</h3>
                          <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">{fest.location} • {fest.date}</p>
                        </div>
                      </div>
                      
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFestival(fest.id);
                        }}
                        className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-sm border-4 border-white",
                          isAttending ? "bg-[#B2D8B2] text-white" : "bg-white text-gray-300"
                        )}
                      >
                        {isAttending ? <Check size={20} /> : <Plus size={20} />}
                      </button>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
          {/* Add Point Modal */}
          <AnimatePresence>
            {showAddPointModal && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowAddPointModal(false)}
                  className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                />
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="relative w-full max-w-sm bg-white rounded-[40px] p-8 shadow-2xl overflow-hidden"
                >
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold tracking-tight">Add Meetup Point</h3>
                    <button onClick={() => setShowAddPointModal(false)} className="opacity-20 hover:opacity-100 transition-opacity">
                      <Plus size={24} className="rotate-45" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2 mb-1 block">Point Name</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Sunset Regroup"
                        value={newPoint.name}
                        onChange={e => setNewPoint(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-[#B2CEFE] transition-all"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-end mb-1">
                        <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2 block">Location / Landmark</label>
                        <button 
                          onClick={() => {
                            setShowAddPointModal(false);
                            setIsSelectingLocation(true);
                          }}
                          className="text-[9px] font-black text-[#B2CEFE] uppercase tracking-widest hover:opacity-70 transition-opacity flex items-center gap-1"
                        >
                          <MapPin size={10} /> Select on Map
                        </button>
                      </div>
                      <select 
                        value={newPoint.location}
                        onChange={e => setNewPoint(prev => ({ ...prev, location: e.target.value }))}
                        className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-[#B2CEFE] transition-all"
                      >
                        <option value="">Select a location...</option>
                        <optgroup label="Stages">
                          {[...new Set(selectedFestival.artists.map(a => a.stage))].map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </optgroup>
                        <optgroup label="General">
                          <option value="Main Entrance">Main Entrance</option>
                          <option value="Food Court A">Food Court A</option>
                          <option value="Water Station 1">Water Station 1</option>
                          <option value="Ferris Wheel">Ferris Wheel</option>
                        </optgroup>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2 mb-1 block">Meeting Time</label>
                      <input 
                        type="time" 
                        value={newPoint.time}
                        onChange={e => setNewPoint(prev => ({ ...prev, time: e.target.value }))}
                        className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-[#B2CEFE] transition-all"
                      />
                    </div>

                    <div className="pt-4">
                      <button 
                        onClick={addMeetupPoint}
                        disabled={!newPoint.name || !newPoint.location}
                        className="w-full bg-black text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-black/10 active:scale-95 transition-all disabled:opacity-20"
                      >
                        Create Point
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </AnimatePresence>
      </main>

      <nav 
        className="fixed bottom-6 left-5 right-5 max-w-md mx-auto h-20 rounded-[32px] flex items-center justify-around px-4 shadow-2xl z-50 border border-white/20"
        style={{ backgroundColor: selectedFestival.accent }}
      >
        <NavButton active={screen === 'festivals'} onClick={() => setScreen('festivals')} icon={Tent} label="Fests" />
        <NavButton active={screen === 'lineup'} onClick={() => setScreen('lineup')} icon={Music} label="Lineup" />
        <NavButton active={screen === 'schedule'} onClick={() => setScreen('schedule')} icon={Calendar} label="Schedule" />
        <NavButton active={screen === 'group'} onClick={() => setScreen('group')} icon={Users} label="Group" />
        <NavButton active={screen === 'map'} onClick={() => setScreen('map')} icon={MapIcon} label="Map" />
      </nav>

      {showMeetupModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white w-full max-w-sm rounded-[40px] p-8 shadow-2xl"
          >
            <h3 className="text-2xl font-serif italic font-bold mb-2">What's the plan?</h3>
            <p className="text-sm opacity-50 mb-6">Let the squad know what you're up to instead.</p>
            
            <textarea 
              autoFocus
              value={otherMessage}
              onChange={e => setOtherMessage(e.target.value)}
              placeholder="e.g. Grabbing food first, be there in 20!"
              className="w-full p-5 rounded-3xl bg-[#F0F4FF] border-none font-bold text-sm mb-6 outline-none focus:ring-4 ring-[#B2CEFE]/30 h-32 resize-none"
            />

            <div className="flex gap-3">
              <button 
                onClick={() => {
                  setShowMeetupModal(null);
                  setOtherMessage('');
                }}
                className="flex-1 py-4 rounded-2xl bg-gray-100 font-bold text-sm"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  setMeetupResponses(prev => ({ 
                    ...prev, 
                    [showMeetupModal]: { status: 'other', message: otherMessage } 
                  }));
                  setShowMeetupModal(null);
                  setOtherMessage('');
                }}
                className="flex-1 py-4 rounded-2xl bg-[#B2CEFE] font-bold text-sm shadow-md"
              >
                Send Message
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <AnimatePresence>
        {showGroupSchedule && group && (
          <div className="fixed inset-0 z-[110] bg-white flex flex-col">
            <header className="pt-12 px-6 mb-6 flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-serif italic font-bold">Group Schedule</h2>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40">{group.name}</p>
              </div>
              <button 
                onClick={() => setShowGroupSchedule(false)}
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shadow-sm active:scale-90 transition-transform"
              >
                <Plus size={24} className="rotate-45 opacity-40" />
              </button>
            </header>

            <ScrollContainer bg="white" className="px-6 mb-8">
              {['Thu', 'Fri', 'Sat', 'Sun'].filter(day => selectedFestival.artists.some(a => a.day === day)).map((day) => (
                <button 
                  key={day}
                  onClick={() => setGroupScheduleDay(day as any)}
                  className={cn(
                    "px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                    groupScheduleDay === day ? "bg-black text-white shadow-lg scale-105" : "bg-white border border-black/5 opacity-40"
                  )}
                >
                  {day}
                </button>
              ))}
            </ScrollContainer>

            <div className="flex-1 overflow-y-auto px-6 pb-12">
              <div className="relative flex gap-2 min-h-[1080px]">
                {/* Time Indicators */}
                <div className="w-10 shrink-0 relative">
                  {[12, 14, 16, 18, 20, 22, 0, 2, 4, 6].map((hour, i) => (
                    <div 
                      key={i} 
                      className="absolute text-[9px] font-black w-full text-right pr-1" 
                      style={{ top: `${i * 120}px`, opacity: 0.2 }}
                    >
                      {hour === 0 ? '00' : hour}:00
                    </div>
                  ))}
                </div>

                {/* Grid Lines */}
                <div className="absolute left-10 right-0 top-0 bottom-0 pointer-events-none">
                  {[12, 14, 16, 18, 20, 22, 0, 2, 4, 6].map((_, i) => (
                    <div key={i} className="absolute w-full h-px bg-black/5" style={{ top: `${i * 120}px` }} />
                  ))}
                </div>

                {/* Calendar Content */}
                <div className="flex-1 relative">
                  {(() => {
                    const groupArtists = selectedFestival.artists.filter(a => 
                      a.day === groupScheduleDay && 
                      (mySchedule.includes(a.id) || a.friendsGoing.some(f => group.members.includes(f)))
                    );
                    
                    const dayMeetups = MEETUPS.filter(m => m.day === groupScheduleDay);

                    // Combine for layout
                    const allItems = [
                      ...groupArtists.map(a => ({ ...a, type: 'artist' as const })),
                      ...dayMeetups.map(m => ({ 
                        id: m.id, 
                        name: `Meetup: ${m.location}`, 
                        startTime: m.timestamp, 
                        endTime: (m.timestamp + 30) % 1440, 
                        type: 'meetup' as const,
                        description: m.description
                      }))
                    ];

                    // Layout logic (same as personal schedule)
                    const sorted = [...allItems].sort((a, b) => getMinutesFromStart(a.startTime) - getMinutesFromStart(b.startTime));
                    const clusters: any[][] = [];
                    
                    sorted.forEach(item => {
                      let added = false;
                      const start = getMinutesFromStart(item.startTime);
                      const end = start + getDuration(item.startTime, item.endTime);
                      
                      for (const cluster of clusters) {
                        const clusterOverlaps = cluster.some(c => {
                          const cStart = getMinutesFromStart(c.startTime);
                          const cEnd = cStart + getDuration(c.startTime, c.endTime);
                          return start < cEnd && end > cStart;
                        });
                        
                        if (clusterOverlaps) {
                          cluster.push(item);
                          added = true;
                          break;
                        }
                      }
                      if (!added) clusters.push([item]);
                    });
                    
                    const layouts: { [id: string]: { left: string; width: string } } = {};
                    clusters.forEach(cluster => {
                      const columns: string[][] = [];
                      cluster.forEach(item => {
                        let placed = false;
                        const start = getMinutesFromStart(item.startTime);
                        const end = start + getDuration(item.startTime, item.endTime);
                        
                        for (const column of columns) {
                          const colOverlaps = column.some(cId => {
                            const c = cluster.find(a => a.id === cId)!;
                            const cStart = getMinutesFromStart(c.startTime);
                            const cEnd = cStart + getDuration(c.startTime, c.endTime);
                            return start < cEnd && end > cStart;
                          });
                          if (!colOverlaps) {
                            column.push(item.id);
                            placed = true;
                            break;
                          }
                        }
                        if (!placed) columns.push([item.id]);
                      });
                      
                      const width = 100 / columns.length;
                      columns.forEach((column, colIdx) => {
                        column.forEach(id => {
                          layouts[id] = { left: `${colIdx * width}%`, width: `${width}%` };
                        });
                      });
                    });

                    return allItems.map(item => {
                      const startPos = getMinutesFromStart(item.startTime);
                      const duration = getDuration(item.startTime, item.endTime);
                      const layout = layouts[item.id] || { left: '0%', width: '100%' };
                      const isFocused = focusedScheduleId === item.id;
                      
                      if (item.type === 'artist') {
                        const artist = item as Artist;
                        const friendsHere = artist.friendsGoing.filter(f => group.members.includes(f));
                        
                        return (
                          <div 
                            key={artist.id}
                            onClick={() => setFocusedScheduleId(artist.id)}
                            className={cn(
                              "absolute bg-white p-3 rounded-2xl shadow-sm border-l-4 flex flex-col gap-2 overflow-hidden cursor-pointer transition-all",
                              isFocused && "ring-2 ring-black/10 shadow-lg"
                            )}
                            style={{ 
                              top: `${startPos}px`, 
                              height: `${Math.max(duration, 80)}px`,
                              left: layout.left,
                              width: layout.width,
                              zIndex: isFocused ? 50 : 1,
                              borderLeftColor: getStageColor(artist.stage),
                              backgroundColor: '#FFFFFF'
                            }}
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0">
                                <img src={artist.imageUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-[11px] leading-tight text-[#2C3327] truncate">{artist.name}</h4>
                                <p className="text-[8px] font-bold opacity-40 uppercase truncate">{artist.stage}</p>
                              </div>
                            </div>
                            <div className="flex -space-x-1.5 mt-auto">
                              {mySchedule.includes(artist.id) && user && (
                                <div className="w-5 h-5 rounded-full border border-white overflow-hidden bg-white ring-2 ring-black/5">
                                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} alt={user.name} />
                                </div>
                              )}
                              {friendsHere.slice(0, 3).map((name, i) => (
                                <div key={i} className="w-5 h-5 rounded-full border border-white overflow-hidden bg-gray-100">
                                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`} alt={name} />
                                </div>
                              ))}
                              {friendsHere.length > 3 && (
                                <div className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center text-[7px] font-black border border-white">
                                  +{friendsHere.length - 3}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      } else {
                        return (
                          <div 
                            key={item.id}
                            onClick={() => setFocusedScheduleId(item.id)}
                            className={cn(
                              "absolute bg-[#FDFD96] p-2 rounded-2xl shadow-sm border-l-4 border-yellow-400 flex flex-col gap-1 overflow-hidden cursor-pointer transition-all",
                              isFocused && "ring-2 ring-yellow-600/20 shadow-lg"
                            )}
                            style={{ 
                              top: `${startPos}px`, 
                              height: `${Math.max(duration, 40)}px`,
                              left: layout.left,
                              width: layout.width,
                              zIndex: isFocused ? 50 : 20
                            }}
                          >
                            <div className="flex items-center gap-2">
                              <MapPin size={10} className="text-yellow-600 shrink-0" />
                              <h4 className="font-black text-[9px] leading-tight text-yellow-800 uppercase tracking-tight">{item.name}</h4>
                            </div>
                            <p className="text-[7px] font-bold text-yellow-700/60 line-clamp-1">{(item as any).description}</p>
                          </div>
                        );
                      }
                    });
                  })()}
                </div>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AuthScreen({ onLogin, theme }: { onLogin: (name: string, email: string) => void, theme: Festival }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 transition-colors duration-700" style={{ backgroundColor: theme.bg }}>
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <div className="w-20 h-20 rounded-[32px] flex items-center justify-center mx-auto mb-6 shadow-lg transition-colors duration-700" style={{ backgroundColor: theme.accent }}>
            {theme.id === 'coachella-2026' ? <Palmtree size={40} className="text-white" /> : <Music size={40} className="text-white" />}
          </div>
          <h1 className="text-5xl font-serif italic font-black text-[#2C3327]">Festie</h1>
          <p className="text-sm font-bold opacity-40 uppercase tracking-widest mt-2">Ready for the show?</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-3">
            <input 
              type="text" 
              placeholder="Your Name" 
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full p-5 rounded-2xl bg-white border-none shadow-sm focus:ring-4 outline-none font-bold placeholder:opacity-30 transition-all"
              style={{ '--tw-ring-color': `${theme.accent}4D` } as any}
            />
            <input 
              type="email" 
              placeholder="Email Address" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full p-5 rounded-2xl bg-white border-none shadow-sm focus:ring-4 outline-none font-bold placeholder:opacity-30 transition-all"
              style={{ '--tw-ring-color': `${theme.accent}4D` } as any}
            />
          </div>

          <button 
            disabled={!name || !email}
            onClick={() => onLogin(name, email)}
            className="w-full py-5 rounded-2xl text-black/80 font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
            style={{ backgroundColor: theme.accent }}
          >
            Enter Festival
          </button>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-black/5"></div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => onLogin('Google User', 'google@example.com')}
              className="flex items-center justify-center gap-3 py-4 rounded-2xl bg-white shadow-sm border border-black/5 font-bold text-xs active:scale-95 transition-all"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </button>
            <button 
              onClick={() => onLogin('Apple User', 'apple@example.com')}
              className="flex items-center justify-center gap-3 py-4 rounded-2xl bg-black text-white shadow-sm font-bold text-xs active:scale-95 transition-all"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.11.74.73 0 1.92-.79 3.46-.73 1.82.07 3.1.74 3.84 1.8-3.5 2.1-2.94 6.6.4 8.06-.73 1.83-1.73 3.65-2.81 3.1zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.25 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              Apple
            </button>
          </div>
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
            <h3 className="text-2xl font-serif italic font-bold leading-tight text-[#2C3327]">{artist.name}</h3>
          </div>
          <p className="text-xs font-bold opacity-30 tracking-widest uppercase text-[#2C3327]">{artist.time}</p>
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
            <h4 className="text-lg font-serif italic font-bold leading-tight text-[#2C3327]">{artist.name}</h4>
            {friendsCount > 0 && (
              <div className="flex items-center gap-1 bg-[#B2D8B2]/20 px-2 py-0.5 rounded-full">
                <Users size={10} className="text-[#B2D8B2]" />
                <span className="text-[9px] font-black text-[#B2D8B2]">{friendsCount}</span>
              </div>
            )}
          </div>
          <p className="text-[10px] font-bold opacity-40 uppercase text-[#2C3327]">{artist.time} • {artist.stage}</p>
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
