import { useState, useEffect } from 'react';
import { Booking, HistoryItem, Member } from './types';
import CalendarView from './components/CalendarView';
import DashboardView from './components/DashboardView';
import BookingsView from './components/BookingsView';
import BookingModal from './components/BookingModal';
import ViewBookingModal from './components/ViewBookingModal';
import ConflictModal from './components/ConflictModal';
import SuccessModal from './components/SuccessModal';
import LoginView from './components/LoginView';

import { 
  auth, 
  db, 
  onAuthStateChanged, 
  signOut, 
  collection, 
  onSnapshot, 
  setDoc, 
  doc, 
  updateDoc,
  deleteDoc,
  User
} from './firebase';

import { 
  Home, 
  Calendar, 
  ListOrdered, 
  Plus, 
  LogOut,
  Sparkles,
  Menu,
  X
} from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [currentView, setCurrentView] = useState<'calendar' | 'dashboard' | 'bookings'>('calendar');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Modal open states
  const [bookingFormOpen, setBookingFormOpen] = useState(false);
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [conflictOpen, setConflictOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

  // Selected entities states
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [initialSelectedDate, setInitialSelectedDate] = useState<string | null>(null);
  const [conflictList, setConflictList] = useState<Booking[]>([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [successReceipt, setSuccessReceipt] = useState<Booking | null>(null);

  // Subscribe to Authentication state changes on mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Subscribe to real-time Firestore database members
  useEffect(() => {
    if (!user) {
      setMembers([]);
      return;
    }

    const q = collection(db, "members");
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: Member[] = [];
      snapshot.forEach((snap) => {
        list.push({ uid: snap.id, ...snap.data() } as Member);
      });
      setMembers(list);
    }, (error) => {
      console.warn("Active members snapshot listener detached or failed on sign out:", error);
    });

    return () => unsubscribe();
  }, [user]);

  // Subscribe to real-time Firestore database bookings
  useEffect(() => {
    if (!user) {
      setBookings([]);
      return;
    }

    const q = collection(db, "bookings");
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const list: Booking[] = [];
      snapshot.forEach((snap) => {
        list.push({ id: snap.id, ...snap.data() } as Booking);
      });

      if (snapshot.empty) {
        setBookings([]);
      } else {
        const visibleList = list.filter(booking => !booking.isDeletedByClient);
        setBookings(visibleList);
      }
    }, (error) => {
      console.warn("Active bookings snapshot listener detached or failed on sign out:", error);
    });

    return () => unsubscribe();
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      // Explicitly clear local state to guarantee immediate transition
      setUser(null);
      setMembers([]);
      setBookings([]);
    } catch (err) {
      console.error("Sign-out failed:", err);
    }
  };

  const getIndianTimestamp = (): string => {
    return new Date().toLocaleString('en-IN', {
      hour12: true,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Conflict Checking Algorithms matching inclusive overlaps (both check-in and check-out dates are inclusive)
  const isDateOverlap = (start1: string, end1: string, start2: string, end2: string): boolean => {
    const s1 = new Date(start1 + 'T00:00:00');
    const e1 = new Date(end1 + 'T00:00:00');
    const s2 = new Date(start2 + 'T00:00:00');
    const e2 = new Date(end2 + 'T00:00:00');
    return s1 <= e2 && e1 >= s2;
  };

  const checkConflicts = (checkIn: string, checkOut: string, excludeId: string | null = null): Booking[] => {
    return bookings.filter(b => {
      if (b.id === excludeId) return false;
      if (b.status === 'Cancelled') return false;
      return isDateOverlap(checkIn, checkOut, b.checkInDate, b.checkOutDate);
    });
  };

  // Form submit handler (Creates or updates booking inside Firestore)
  const handleBookingFormSubmit = async (data: Omit<Booking, 'id' | 'history' | 'createdAt' | 'updatedAt'>) => {
    // Check conflicts first
    const conflicts = checkConflicts(data.checkInDate, data.checkOutDate, editingBooking?.id || null);
    if (conflicts.length > 0) {
      setConflictList(conflicts);
      setConflictOpen(true);
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];

    try {
      if (editingBooking) {
        // Modify existing
        const updatedHistory = [...editingBooking.history];

        // Track advanced changes
        if (editingBooking.advanceAmount !== data.advanceAmount) {
          updatedHistory.push({
            action: 'Advance Amount Changed',
            timestamp: getIndianTimestamp(),
            oldValue: `₹${editingBooking.advanceAmount.toLocaleString('en-IN')}`,
            newValue: `₹${data.advanceAmount.toLocaleString('en-IN')}`
          });
        }

        // Track status changes
        if (editingBooking.status !== data.status) {
          updatedHistory.push({
            action: 'Status Changed',
            timestamp: getIndianTimestamp(),
            oldValue: editingBooking.status,
            newValue: data.status
          });
        }

        // Track booking source changes
        if (editingBooking.bookingSource !== data.bookingSource) {
          updatedHistory.push({
            action: 'Booking Source Changed',
            timestamp: getIndianTimestamp(),
            oldValue: editingBooking.bookingSource || 'None',
            newValue: data.bookingSource || 'None'
          });
        }

        const updated: Booking = {
          ...editingBooking,
          ...data,
          history: updatedHistory,
          updatedAt: todayStr
        };

        await setDoc(doc(db, "bookings", editingBooking.id), updated);
        
        setBookingFormOpen(false);
        setEditingBooking(null);
        
        // Prompt success modal
        setSuccessReceipt(updated);
        setSuccessMessage('Booking updated successfully');
        setSuccessOpen(true);
      } else {
        // Create new
        const generatedId = 'booking_' + Date.now().toString(36);
        const newB: Booking = {
          id: generatedId,
          ...data,
          history: [
            {
              action: 'Booking Created',
              timestamp: getIndianTimestamp(),
              oldValue: null,
              newValue: null
            }
          ],
          createdAt: todayStr,
          updatedAt: todayStr
        };

        await setDoc(doc(db, "bookings", generatedId), newB);
        
        setBookingFormOpen(false);
        
        // Prompt success modal
        setSuccessReceipt(newB);
        setSuccessMessage('Booking Saved Successfully.');
        setSuccessOpen(true);
      }
    } catch (err) {
      console.error("Firestore submit error:", err);
    }
  };

  // Action: Launch edit modal
  const handleEditTrigger = (id: string) => {
    const b = bookings.find(item => item.id === id);
    if (b) {
      setEditingBooking(b);
      setBookingFormOpen(true);
    }
  };

  // Action: Delete booking inside Firestore
  const handleDeleteTrigger = async (id: string) => {
    try {
      await updateDoc(doc(db, "bookings", id), { isDeletedByClient: true });
      setViewDetailsOpen(false);
      setSelectedBooking(null);
      
      // Prompt success indicators
      setSuccessReceipt(null);
      setSuccessMessage('Booking deleted successfully.');
      setSuccessOpen(true);
    } catch (err) {
      console.error("Firestore delete error:", err);
    }
  };

  // Action: View details modal
  const handleViewDetailsTrigger = (id: string) => {
    const b = bookings.find(item => item.id === id);
    if (b) {
      setSelectedBooking(b);
      setViewDetailsOpen(true);
    }
  };

  // Action: Launch blank booking modal on specific calendar click
  const handleNewBookingAtDateTrigger = (dateStr: string) => {
    setInitialSelectedDate(dateStr);
    setEditingBooking(null);
    setBookingFormOpen(true);
  };

  // Action: Launch standard blank booking wizard
  const handleBlankBookingTrigger = () => {
    setInitialSelectedDate(null);
    setEditingBooking(null);
    setBookingFormOpen(true);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 font-sans" id="auth-loading-screen">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" id="loading-spinner" />
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Signing You In...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginView onAuthSuccess={() => {}} />;
  }

  const currentMember = members.find(m => m.uid === user.uid);
  const isManager = currentMember?.isManager === true;
  const displayName = currentMember?.fullName || user.email || 'Operator';
  const displayInitial = currentMember?.fullName 
    ? currentMember.fullName.charAt(0).toUpperCase() 
    : (user.email ? user.email.charAt(0).toUpperCase() : 'O');

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-50 flex font-sans" id="app-viewport">
      
      {/* SIDEBAR NAVIGATION - DESKTOP */}
      <aside className="hidden lg:flex flex-col w-64 bg-white text-slate-800 shrink-0 shadow-xs justify-between border-r border-slate-200 h-full relative z-40">
        <div className="flex-1 py-6 px-4 space-y-8 overflow-y-auto min-h-0">
          
          {/* Logo Brand Header */}
          <div className="flex items-center gap-3 px-2">
            <div className="p-2 bg-blue-600 rounded-xl shadow-md">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold tracking-tight text-slate-800">CozyCal</h2>
              
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1" id="sidebar-nav">
            <button
              onClick={() => { setCurrentView('calendar'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-xs uppercase tracking-wider transition-all duration-200 ${
                currentView === 'calendar' 
                  ? 'bg-blue-50 text-blue-600 border-r-3 border-blue-600 shadow-xs' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
              id="sidebar-nav-calendar"
            >
              <Calendar className="w-4 h-4 shrink-0" />
              <span>Shared Calendar</span>
            </button>

            <button
              onClick={() => { setCurrentView('dashboard'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-xs uppercase tracking-wider transition-all duration-200 ${
                currentView === 'dashboard' 
                  ? 'bg-blue-50 text-blue-600 border-r-3 border-blue-600 shadow-xs' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
              id="sidebar-nav-dashboard"
            >
              <Home className="w-4 h-4 shrink-0" />
              <span>Metrics & Stats</span>
            </button>

            <button
              onClick={() => { setCurrentView('bookings'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-xs uppercase tracking-wider transition-all duration-200 ${
                currentView === 'bookings' 
                  ? 'bg-blue-50 text-blue-600 border-r-3 border-blue-600 shadow-xs' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
              id="sidebar-nav-bookings"
            >
              <ListOrdered className="w-4 h-4 shrink-0" />
              <span>All Reservations</span>
            </button>
          </nav>
        </div>

        {/* User context footer */}
        <div className="p-4 pb-5 border-t border-slate-100 bg-slate-50/50 flex flex-col gap-3 min-w-0 w-full relative z-50">
          <div className="flex items-center gap-2.5 min-w-0 w-full">
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs text-blue-600 font-bold border border-slate-200 shrink-0 select-none">
              {displayInitial}
            </div>
            <div className="leading-tight min-w-0 flex-1 select-none">
              <p className="text-[11px] font-bold text-slate-700 truncate" title={displayName}>
                {displayName}
              </p>
            </div>
          </div>
          
          <button 
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 mb-1 rounded-xl bg-red-600 text-white font-extrabold text-xs uppercase tracking-wider cursor-pointer border-none shrink-0 relative z-50"
            style={{ cursor: 'pointer' }}
            id="desktop-logout-btn"
            aria-label="Log out"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MOBILE MENU LAYOUT OVERLAY */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden flex">
          {/* Backdrop screen filter */}
          <div 
            onClick={() => setMobileMenuOpen(false)} 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" 
          />
          {/* Drawer sidebar panel */}
          <div className="relative flex flex-col w-64 max-w-xs bg-white text-slate-800 p-6 shadow-2xl space-y-8 animate-fade-in border-r border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4.5 h-4.5 text-blue-600 animate-pulse" />
                <span className="font-extrabold text-sm tracking-tight text-slate-800">Cozy Cottage Stay</span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="p-1 hover:bg-slate-50 rounded text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="space-y-1" id="mobile-nav-panel">
              <button
                onClick={() => { setCurrentView('calendar'); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-xs uppercase tracking-wider transition ${
                  currentView === 'calendar' ? 'bg-blue-50 text-blue-600 border-r-3 border-blue-600' : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Calendar Overview</span>
              </button>

              <button
                onClick={() => { setCurrentView('dashboard'); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-xs uppercase tracking-wider transition ${
                  currentView === 'dashboard' ? 'bg-blue-50 text-blue-600 border-r-3 border-blue-600' : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <Home className="w-4 h-4" />
                <span>Metrics & Stats</span>
              </button>

              <button
                onClick={() => { setCurrentView('bookings'); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-xs uppercase tracking-wider transition ${
                  currentView === 'bookings' ? 'bg-blue-50 text-blue-600 border-r-3 border-blue-600' : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <ListOrdered className="w-4 h-4" />
                <span>All Reservations</span>
              </button>
            </nav>

            <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
              <div className="flex items-center gap-2.5 px-2">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs text-blue-600 font-bold border border-slate-200 shrink-0">
                  {displayInitial}
                </div>
                <div className="leading-tight overflow-hidden">
                  <p className="text-[11px] font-bold text-slate-700 truncate">{displayName}</p>
                </div>
              </div>
              <button 
                onClick={() => { handleSignOut(); setMobileMenuOpen(false); }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs uppercase tracking-wider cursor-pointer border-none shadow-xs"
                style={{ cursor: 'pointer' }}
                id="mobile-logout-button"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RENDERED CORE VIEW SHELL */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* TOP COMPREHENSIVE ACTION HEADER BAR */}
        <header className="flex items-center justify-between p-4 sm:p-6 bg-white/85 backdrop-blur-md border-b border-slate-200 z-10 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-xl text-slate-550 text-slate-500 transition"
              id="mobile-hamburger-btn"
            >
              <Menu className="w-4.5 h-4.5" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 capitalize leading-tight">
                {currentView === 'calendar' ? 'Calendar Overview' : currentView === 'dashboard' ? 'Metrics and Stats' : 'All Reservations'}
              </h1>
            </div>
          </div>
        {isManager &&(
          <div className="flex items-center gap-3">
            <button
              onClick={handleBlankBookingTrigger}
              className="px-4.5 py-2.5 bg-blue-600 text-white font-extrabold text-xs tracking-wider uppercase rounded-xl shadow-md shadow-blue-600/15 active:scale-[0.98] transition hover:bg-blue-700 cursor-pointer flex items-center gap-2"
              id="new-booking-trigger"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">New Booking</span>
              <span className="sm:hidden">Book</span>
            </button>
          </div>
          )}
        </header>

        {/* CONTAINER CONTENT WRAPPER */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
          {currentView === 'calendar' && (
            <CalendarView 
              bookings={bookings} 
              onViewBooking={handleViewDetailsTrigger}
              onNewBookingAtDate={handleNewBookingAtDateTrigger}
              isManager={isManager}
            />
          )}

          {currentView === 'dashboard' && (
            <DashboardView 
              bookings={bookings} 
              onViewBooking={handleViewDetailsTrigger}
              onNewBooking={handleBlankBookingTrigger}
              isManager={currentMember?.isManager === true}
            />
          )}

          {currentView === 'bookings' && (
            <BookingsView 
              bookings={bookings} 
              onViewBooking={handleViewDetailsTrigger}
              onNewBooking={handleBlankBookingTrigger}
              isManager={isManager}
            />
          )}
        </div>

      </main>

      {/* FORM AND OPERATION MODALS COORDINATORS */}
      <BookingModal 
        isOpen={bookingFormOpen}
        onClose={() => { setBookingFormOpen(false); setEditingBooking(null); }}
        onSubmit={handleBookingFormSubmit}
        bookingToEdit={editingBooking}
        initialDate={initialSelectedDate}
        members={members}
      />

      <ViewBookingModal 
        isOpen={viewDetailsOpen}
        onClose={() => { setViewDetailsOpen(false); setSelectedBooking(null); }}
        booking={selectedBooking}
        onEdit={handleEditTrigger}
        onDelete={handleDeleteTrigger}
      />

      <ConflictModal 
        isOpen={conflictOpen}
        onClose={() => setConflictOpen(false)}
        conflicts={conflictList}
      />

      <SuccessModal 
        isOpen={successOpen}
        onClose={() => setSuccessOpen(false)}
        message={successMessage}
        booking={successReceipt}
      />

    </div>
  );
}
