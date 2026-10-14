import { useState } from 'react';
import { Booking } from '../types';
import { 
  Search, 
  Eye, 
  MapPin, 
  ChevronRight, 
  User, 
  Compass, 
  Phone, 
  Calendar, 
  IndianRupee,
  SlidersHorizontal,
  Plus
} from 'lucide-react';

interface BookingsViewProps {
  bookings: Booking[];
  onViewBooking: (id: string) => void;
  onNewBooking: () => void;
  isManager?: boolean;
}

export default function BookingsView({ bookings, onViewBooking, onNewBooking ,isManager=false}: BookingsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Filter logic
  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch = 
      booking.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.phone.includes(searchQuery);
    
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Cancelled':
        return 'bg-slate-100 text-slate-700 border-slate-200';
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
    <div className="space-y-6" id="bookings-view">
      {/* Sub-header Filter Panel */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between bg-white/70 backdrop-blur-md p-4 rounded-3xl border border-slate-100 card-shadow">
        {/* Search Input Box */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by customer name or phone number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-slate-700 text-sm focus:outline-none focus:border-blue-600 focus:bg-white placeholder-slate-400 font-medium transition"
            id="bookings-search-input"
          />
        </div>

        {/* Quick Filter Pill Selectors */}
        <div className="w-full md:w-auto overflow-x-auto pb-1 md:pb-0 -mx-2 px-2 md:mx-0 md:px-0 scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none]">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl min-w-max">
            {['all', 'Inquiry', 'Confirmed', 'Completed', 'Cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition shrink-0 ${
                  statusFilter === status
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
                id={`filter-${status}-btn`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bookings Display */}
      {filteredBookings.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100 card-shadow p-16 text-center">
          <Compass className="w-12 h-12 text-slate-350 mx-auto mb-3" />
          <p className="text-base font-bold text-slate-800">No Reservations Found</p>
          <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">
            We couldn't find any records matching your criteria.
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <button
               onClick={() => { setSearchQuery(''); setStatusFilter('all'); }}
               className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-700 rounded-xl font-semibold text-xs border border-slate-100 cursor-pointer transition"
            >
               Reset Filters
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white rounded-3xl border border-slate-100 card-shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse" id="bookings-table-element">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="py-4 px-6">Customer Details</th>
                    <th className="py-4 px-6">Check-In</th>
                    <th className="py-4 px-6">Check-Out</th>
                    {isManager && <th className="py-4 px-6">Payment Overview</th>} {/* <--- CONDITIONED */}
                    <th className="py-4 px-6">Status</th>
                    {isManager && <th className="py-4 px-6 text-right">Actions</th>} {/* <--- CONDITIONED */}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-600">
                  {filteredBookings.map((b) => (
                    <tr 
                      key={b.id} 
                      className="hover:bg-slate-50/40 transition group"
                      id={`row-${b.id}`}
                    >
                      {/* Name & Contact */}
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="text-slate-850 font-bold group-hover:text-blue-600 transition truncate max-w-[200px]">
                            {b.customerName}
                          </span>
                          <span className="text-xs text-slate-400 font-medium select-all mt-0.5">
                            {b.phone}
                          </span>
                        </div>
                      </td>

                      {/* Check-In */}
                      <td className="py-4 px-6 text-slate-700">
                        {formatDateLabel(b.checkInDate)}
                      </td>

                      {/* Check-Out */}
                      <td className="py-4 px-6 text-slate-700">
                        {formatDateLabel(b.checkOutDate)}
                      </td>

                      {/* Payments */}
                      {isManager && (
                        <td className="py-4 px-6">
                          <div className="flex flex-col">
                            <span className="text-slate-850 font-bold">
                              ₹{b.totalAmount.toLocaleString('en-IN')}
                            </span>
                            {b.remainingAmount > 0 ? (
                              <span className="text-xs text-rose-500 font-bold mt-0.5">
                                ₹{b.remainingAmount.toLocaleString('en-IN')} pending
                              </span>
                            ) : (
                              <span className="text-xs text-emerald-600 font-bold mt-0.5">
                                Fully Paid
                              </span>
                            )}
                          </div>
                        </td>
                      )}

                      {/* Status badge */}
                      <td className="py-4 px-6">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border tracking-wider uppercase inline-block ${getStatusStyle(b.status)}`}>
                          {b.status}
                        </span>
                      </td>

                      {/* Action buttons */}
                      {isManager && (
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => onViewBooking(b.id)}
                            className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl transition duration-150 inline-flex items-center gap-1 text-xs font-bold shadow-xs border border-blue-100 cursor-pointer active:scale-[0.98]"
                            id={`action-view-${b.id}`}
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Details</span>
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card List View (Responsive Fallback) */}
          <div className="md:hidden space-y-4">
            {filteredBookings.map((b) => (
              <div 
                key={b.id}
                onClick={isManager ? () => onViewBooking(b.id) : undefined}
                className={`bg-white p-5 rounded-3xl border border-slate-100 card-shadow hover:shadow-md transition flex flex-col gap-4 relative overflow-hidden ${isManager ? 'cursor-pointer' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">{b.customerName}</h4>
                    <p className="text-xs text-slate-400 font-medium select-all mt-0.5">{b.phone}</p>
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border tracking-wider uppercase ${getStatusStyle(b.status)}`}>
                    {b.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 py-3 border-y border-slate-50 text-xs">
                  <div>
                    <p className="text-slate-400 font-bold uppercase tracking-wider text-[9px] mb-1">Check-In</p>
                    <p className="font-semibold text-slate-700">{formatDateLabel(b.checkInDate)}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-bold uppercase tracking-wider text-[9px] mb-1">Check-Out</p>
                    <p className="font-semibold text-slate-700">{formatDateLabel(b.checkOutDate)}</p>
                  </div>
                </div>

                {isManager && (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 font-bold uppercase tracking-wider text-[9px] mb-0.5">Payment Details</p>
                      <span className="font-extrabold text-slate-800 text-sm">
                        ₹{b.totalAmount.toLocaleString('en-IN')}
                      </span>
                      {b.remainingAmount > 0 ? (
                        <span className="text-[10px] text-rose-500 font-bold ml-1.5 inline-block">
                          (₹{b.remainingAmount.toLocaleString('en-IN')} due)
                        </span>
                      ) : (
                        <span className="text-[10px] text-emerald-600 font-bold ml-1.5 inline-block">
                          (Paid)
                        </span>
                      )}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewBooking(b.id);
                      }}
                      className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition border border-blue-100"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
