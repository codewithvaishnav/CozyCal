import { Booking } from '../types';
import { 
  CalendarCheck, 
  TrendingUp, 
  IndianRupee, 
  Clock, 
  Compass, 
  UserPlus
} from 'lucide-react';

interface DashboardViewProps {
  bookings: Booking[];
  onViewBooking: (id: string) => void;
  onNewBooking: () => void;
  isManager?: boolean;
}

export default function DashboardView({ bookings, onViewBooking, onNewBooking , isManager}: DashboardViewProps) {
  // Stats calculations matching exact user logic
  const totalBookings = bookings.length;
  
  const todayStr = new Date().toISOString().split('T')[0];
  const upcomingBookings = bookings.filter(b => 
    b.checkInDate >= todayStr && b.status !== 'Cancelled'
  ).length;

  const pendingPaymentsNum = bookings
    .filter(b => b.status !== 'Cancelled')
    .reduce((sum, b) => sum + b.remainingAmount, 0);

  // Sorting recent bookings based on createdAt (or newest added)
  const recentBookings = [...bookings]
    .sort((a, b) => {
      // Fallback sorting
      const dateA = a.createdAt || '1970-01-01';
      const dateB = b.createdAt || '1970-01-01';
      return dateB.localeCompare(dateA);
    })
    .slice(0, 5);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Cancelled':
        return 'bg-slate-100 text-slate-700';
      case 'Confirmed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Completed':
        return 'bg-teal-50 text-teal-700 border-teal-100';
      default:
        return 'bg-sky-50 text-sky-700 border-sky-100'; // Inquiry
    }
  };

  const formatDateLabel = (dateStr: string) => {
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', options);
  };

  return (
    <div className="space-y-8" id="dashboard-view">
      {/* Stats Cards Row */}
      <div className={`grid grid-cols-1 ${isManager !== false ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-6`}>
        {/* Total Bookings Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 card-shadow flex items-center gap-5 hover:translate-y-[-4px] transition duration-200">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100/50">
            <CalendarCheck className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Bookings</p>
            <h3 className="text-3xl font-extrabold text-slate-800" id="total-bookings-count">
              {totalBookings}
            </h3>
          </div>
        </div>

        {/* Upcoming Bookings Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 card-shadow flex items-center gap-5 hover:translate-y-[-4px] transition duration-200">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50/55 flex items-center justify-center text-emerald-600 border border-emerald-100/50">
            <TrendingUp className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Upcoming Bookings</p>
            <h3 className="text-3xl font-extrabold text-slate-800" id="upcoming-bookings-count">
              {upcomingBookings}
            </h3>
          </div>
        </div>

        {/* Pending Payments Card */}
        {isManager !== false && (
          <div className="bg-white p-6 rounded-3xl border border-slate-100 card-shadow flex items-center gap-5 hover:translate-y-[-4px] transition duration-200">
            <div className="w-14 h-14 rounded-2xl bg-amber-50/55 flex items-center justify-center text-amber-600 border border-amber-100/50">
              <IndianRupee className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Pending Payments</p>
              <h3 className="text-3xl font-extrabold text-slate-800" id="pending-payments-count">
                ₹ {pendingPaymentsNum.toLocaleString('en-IN')}
              </h3>
            </div>
          </div>
        )}
      </div>

      {/* Main Panel layout split */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Recent Bookings List */}
        <div className="lg:col-span-3 bg-white p-6 rounded-3xl border border-slate-100 card-shadow flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <h3 className="text-lg font-bold text-slate-800">Recent Transactions</h3>
            <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 rounded-full text-slate-500">
              Newest Additions
            </span>
          </div>

          <div className="space-y-4 divide-y divide-slate-100 flex-1">
            {recentBookings.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <Compass className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-semibold text-slate-700">No Bookings Recorded Yet</p>
                <p className="text-xs mt-1">Submit your first reservation using the New Booking button.</p>
              </div>
            ) : (
              recentBookings.map((b, idx) => (
                <div
                  key={b.id}
                  onClick={isManager?() => onViewBooking(b.id):undefined}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between pt-4 first:pt-0 -mx-2 px-2 rounded-2xl transition ${
                    isManager
                    ? 'cursor-pointer group hover:bg-slate-50/30'
                    :'cursor-default pointer-events-none'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition">
                      <UserPlus className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition">
                        {b.customerName}
                      </h4>
                      <p className="text-xs text-slate-400 font-medium">{b.phone}</p>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-start sm:items-end justify-between sm:justify-center mt-2.5 sm:mt-0 gap-1.5">
                    <span className="text-xs font-semibold text-slate-500 select-all">
                      {formatDateLabel(b.checkInDate)} &rarr; {formatDateLabel(b.checkOutDate)}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border tracking-wider uppercase ${getStatusStyle(b.status)}`}>
                      {b.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Operational Guidelines / Quick Stats */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 shadow-xs">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-widest mb-4">Operations Checklist</h3>
            <ul className="space-y-4 text-xs font-medium text-slate-600">
              <li className="flex items-start gap-2.5">
                <span className="h-5 w-5 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center font-bold text-xs shrink-0">1</span>
                <span className="leading-relaxed">Keep contact details updated so managers can process and verify advanced slots.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="h-5 w-5 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center font-bold text-xs shrink-0">2</span>
                <span className="leading-relaxed">Ensure check-out times are communicated clearly to prevent conflicts for next guests.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="h-5 w-5 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center font-bold text-xs shrink-0">3</span>
                <span className="leading-relaxed">Remaining amount calculations update live upon editing booking advance payments.</span>
              </li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 card-shadow">
            <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Clock className="text-blue-600 w-5 h-5 animate-pulse" />
              <span>Real-time Status Overview</span>
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Pending inquiries:</span>
                <span className="font-bold text-slate-700">
                  {bookings.filter(b => b.status === 'Inquiry').length}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Active confirmations:</span>
                <span className="font-bold text-emerald-600">
                  {bookings.filter(b => b.status === 'Confirmed').length}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Archived/Completed:</span>
                <span className="font-bold text-teal-600">
                  {bookings.filter(b => b.status === 'Completed').length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
