import { useState } from 'react';
import { Booking } from '../types';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar, 
  CalendarDays, 
  Eye, 
  User, 
  Phone, 
  IndianRupee,
  AlertCircle
} from 'lucide-react';

interface CalendarViewProps {
  bookings: Booking[];
  onViewBooking: (id: string) => void;
  onNewBookingAtDate: (dateStr: string) => void;
  isManager?: boolean;

}

export default function CalendarView({ bookings, onViewBooking, onNewBookingAtDate, isManager = false }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewType, setViewType] = useState<'month' | 'week'>('month');
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(
    new Date().toISOString().split('T')[0]
  );

  // Helper: Format date as YYYY-MM-DD local
  const formatDateString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Check if booking overlaps with a single date
  const isBookingActiveOnDate = (booking: Booking, dateStr: string): boolean => {
    if (booking.status === 'Cancelled') return false;
    const date = new Date(dateStr + 'T00:00:00');
    const checkIn = new Date(booking.checkInDate + 'T00:00:00');
    const checkOut = new Date(booking.checkOutDate + 'T00:00:00');
    
    // Active if date is >= checkIn AND date <= checkOut (check-out day is fully occupied/booked)
    return date >= checkIn && date <= checkOut;
  };

  // Get active bookings for a specific date
  const getBookingsForDate = (dateStr: string): Booking[] => {
    return bookings.filter(b => isBookingActiveOnDate(b, dateStr));
  };

  // Navigation handlers
  const handlePrev = () => {
    const newDate = new Date(currentDate);
    if (viewType === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setDate(newDate.getDate() - 7);
    }
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (viewType === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else {
      newDate.setDate(newDate.getDate() + 7);
    }
    setCurrentDate(newDate);
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDateStr(formatDateString(today));
  };

  // Month Math
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // First day of current month (0 = Sun, 1 = Mon...)
  const firstDayIndex = new Date(year, month, 1).getDay();
  // Total days in current month
  const totalMonthDays = new Date(year, month + 1, 0).getDate();
  // Total days in previous month
  const prevMonthDays = new Date(year, month, 0).getDate();

  // Calendar cells generation
  const monthCells: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] = [];

  // Filler days from previous month
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const d = prevMonthDays - i;
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const dateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    monthCells.push({ dateStr, dayNum: d, isCurrentMonth: false });
  }

  // Days of current month
  for (let d = 1; d <= totalMonthDays; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    monthCells.push({ dateStr, dayNum: d, isCurrentMonth: true });
  }

  // Filler days from next month to make full weeks (multiple of 7)
  const totalCells = Math.ceil(monthCells.length / 7) * 7;
  const nextMonthFillerCount = totalCells - monthCells.length;
  for (let d = 1; d <= nextMonthFillerCount; d++) {
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    const dateStr = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    monthCells.push({ dateStr, dayNum: d, isCurrentMonth: false });
  }

  // Week View math (7 days centered around currentDate or starting from Sunday of current week)
  const getWeekDates = (): { dateStr: string; dateObj: Date }[] => {
    const dates = [];
    // Start from Sunday of current date's week
    const currentDayOfWeek = currentDate.getDay();
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDayOfWeek);

    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      dates.push({
        dateStr: formatDateString(d),
        dateObj: d
      });
    }
    return dates;
  };

  const getStatusBadgeStyle = (booking: Booking): string => {
    if (booking.status === 'Cancelled') {
      return 'bg-slate-100 text-slate-700 border-slate-200';
    }
    if (booking.status === 'Confirmed') {
      if (booking.remainingAmount === 0) {
        return 'bg-emerald-500 text-white border-emerald-600 shadow-sm shadow-emerald-500/20';
      }
      if (booking.advanceAmount > 0) {
        return 'bg-amber-500 text-white border-amber-600 shadow-sm shadow-amber-500/10';
      }
      return 'bg-rose-500 text-white border-rose-600 shadow-sm shadow-rose-500/10';
    }
    if (booking.status === 'Completed') {
      return 'bg-teal-600 text-white border-teal-700';
    }
    return 'bg-sky-500 text-white border-sky-600'; // Inquiry
  };

  const selectedDateBookings = selectedDateStr ? getBookingsForDate(selectedDateStr) : [];
  const hasActiveBooking = selectedDateBookings.some(b => b.status !== 'Cancelled');

  return (
    <div className="space-y-6" id="calendar-view">
      {/* Calendar Header with Navigation and Views */}
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between bg-white/70 backdrop-blur-md p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-xl transition text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Previous"
            id="cal-prev-btn"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleToday}
            className="px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-100 text-slate-700 font-semibold text-sm rounded-xl transition outline-none focus:ring-2 focus:ring-blue-500"
            id="cal-today-btn"
          >
            Today
          </button>
          <button
            onClick={handleNext}
            className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-xl transition text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Next"
            id="cal-next-btn"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-bold text-slate-800 ml-2" id="cal-title-header">
            {viewType === 'month' 
              ? `${monthNames[month]} ${year}` 
              : `Week of ${new Date(getWeekDates()[0].dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
            }
          </h2>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setViewType('month')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold transition ${
              viewType === 'month' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-slate-600 hover:text-slate-800'
            }`}
            id="view-month-btn"
          >
            <Calendar className="w-4 h-4" />
            <span>Month</span>
          </button>
          <button
            onClick={() => setViewType('week')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold transition ${
              viewType === 'week' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-slate-600 hover:text-slate-800'
            }`}
            id="view-week-btn"
          >
            <CalendarDays className="w-4 h-4" />
            <span>Week</span>
          </button>
        </div>
      </div>

      {viewType === 'month' ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Month Calendar Grid */}
          <div className="lg:col-span-3 bg-white p-6 rounded-3xl border border-slate-100 card-shadow">
            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-xs font-semibold uppercase tracking-wider text-slate-400 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-2">
              {monthCells.map(({ dateStr, dayNum, isCurrentMonth }) => {
                const dayBookings = getBookingsForDate(dateStr);
                const isSelected = selectedDateStr === dateStr;
                const isToday = formatDateString(new Date()) === dateStr;

                return (
                  <button
                    key={dateStr}
                    onClick={() => setSelectedDateStr(dateStr)}
                    className={`min-h-[72px] sm:min-h-[100px] p-2 flex flex-col items-stretch text-left border rounded-2xl transition-all ${
                      isCurrentMonth 
                        ? 'bg-slate-50/30' 
                        : 'bg-slate-50/10 opacity-45'
                    } ${
                      isSelected 
                        ? 'border-blue-600 shadow-md bg-blue-50/10 scale-[1.01]' 
                        : isToday 
                        ? 'border-blue-200 shadow-inner' 
                        : 'border-slate-100 hover:bg-slate-50/50 hover:border-slate-200'
                    }`}
                    id={`cell-${dateStr}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-sm font-semibold p-1 px-1.5 rounded-lg inline-flex items-center justify-center ${
                        isToday 
                          ? 'bg-blue-600 text-white shadow-md' 
                          : isSelected 
                          ? 'text-blue-600 font-bold' 
                          : 'text-slate-700'
                      }`}>
                        {dayNum}
                      </span>
                    </div>

                    {/* Booking bars in grid cell (hidden on smallest viewports, dots instead) */}
                    <div className="flex-1 space-y-1 overflow-hidden pointer-events-none">
                      {/* On md+: List item blocks */}
                      <div className="hidden md:block space-y-1">
                        {dayBookings.slice(0, 3).map((b) => (
                          <div
                            key={b.id}
                            className={`text-[10px] leading-tight font-medium px-1.5 py-0.5 rounded-md truncate border ${getStatusBadgeStyle(b)}`}
                          >
                            {b.customerName}
                          </div>
                        ))}
                        {dayBookings.length > 3 && (
                          <div className="text-[9px] font-bold text-slate-500 pl-1">
                            +{dayBookings.length - 3} more
                          </div>
                        )}
                      </div>

                      {/* On mobile: minimalist dots */}
                      <div className="md:hidden flex flex-wrap gap-1 mt-1 justify-center">
                        {dayBookings.map((b) => (
                          <span
                            key={b.id}
                            className={`w-1.5 h-1.5 rounded-full ${
                              b.status === 'Cancelled' ? 'bg-slate-400' :
                              b.status === 'Confirmed' && b.remainingAmount === 0 ? 'bg-emerald-500' :
                              b.status === 'Confirmed' && b.advanceAmount > 0 ? 'bg-amber-500' :
                              b.status === 'Confirmed' ? 'bg-rose-500' :
                              b.status === 'Completed' ? 'bg-teal-600' : 'bg-sky-500'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Date Detail Drawer / Panel */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 card-shadow h-fit flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Bookings list for</p>
                <p className="text-base font-bold text-slate-800" id="selected-date-title">
                  {selectedDateStr 
                    ? new Date(selectedDateStr + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
                    : 'Select a date'
                  }
                </p>
              </div>
              {selectedDateStr && !hasActiveBooking && isManager &&(
                <button
                  onClick={() => onNewBookingAtDate(selectedDateStr)}
                  className="flex items-center justify-center p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl transition shadow-xs border border-blue-100"
                  title="Add Booking on this day"
                  id="add-at-date-btn"
                >
                  <Plus className="w-5 h-5" />
                </button>
              )}
            </div>

            {selectedDateStr && selectedDateBookings.length === 0 ? (
              <div className="text-center py-10 px-4 flex flex-col items-center">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-350 mb-2 border border-slate-100/30">
                  <Calendar className="w-6 h-6 text-slate-300" />
                </div>
                <p className="text-sm font-semibold text-slate-700">No bookings active</p>
                <p className="text-xs text-slate-400 max-w-[200px] mt-1 mb-4 leading-relaxed">
                  The farmhouse is unoccupied on this day.
                </p>
                {isManager && ( <button
                  onClick={() => onNewBookingAtDate(selectedDateStr)}
                  className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md cursor-pointer transition active:scale-[0.98]"
                  id="add-first-booking-btn"
                >
                  <Plus className="w-4 h-4" />
                  <span>Book This Date</span>
                </button> )}
              </div>
            ) : (
              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                {selectedDateBookings.map((b) => (
                  <div
                    key={b.id}
                    className="p-4 bg-slate-50 rounded-2xl border border-slate-100/50 hover:shadow-xs transition group relative overflow-hidden"
                  >
                    <div className="flex items-start justify-between mb-2">
                       <div>
                        <h4 className="font-bold text-slate-800 text-sm">{b.customerName}</h4>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wide inline-block mt-0.5 uppercase ${
                          b.status === 'Cancelled' ? 'bg-slate-100 text-slate-600' :
                          b.status === 'Completed' ? 'bg-teal-50 text-teal-600' :
                          b.status === 'Confirmed' && b.remainingAmount === 0 ? 'bg-emerald-50 text-emerald-600' :
                          b.status === 'Confirmed' ? 'bg-rose-50 text-rose-600' : 'bg-sky-50 text-sky-600'
                        }`}>
                          {b.status} {b.status === 'Confirmed' && b.remainingAmount === 0 ? '(Paid)' : ''}
                        </span>
                      </div>
                      {isManager && (<button
                        onClick={() => onViewBooking(b.id)}
                        className="p-1.5 bg-white hover:bg-blue-50 border border-slate-100 text-blue-500 hover:text-blue-600 rounded-lg shadow-xs transition"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </button> )}
                    </div>

                    <div className="space-y-1 text-xs text-slate-500">
                      <p className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{b.phone}</span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{b.checkInDate} to {b.checkOutDate}</span>
                      </p>
                      <p className="flex items-center gap-1.5 font-semibold text-slate-700">
                        <IndianRupee className="w-3.5 h-3.5 text-slate-400" />
                        <span>₹{b.totalAmount.toLocaleString('en-IN')} total</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* 7-Day Agenda Agenda / Week View */
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          {getWeekDates().map(({ dateStr, dateObj }) => {
            const dayBookings = getBookingsForDate(dateStr);
            const isToday = formatDateString(new Date()) === dateStr;

            return (
              <div 
                key={dateStr}
                className={`bg-white p-3 md:p-4 rounded-2xl md:rounded-3xl border flex flex-col h-[145px] md:h-[300px] transition shadow-xs ${
                  isToday 
                    ? 'border-blue-400 bg-blue-50/10 shadow-blue-600/5' 
                    : 'border-slate-100 hover:border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between pb-2 md:pb-3 border-b border-slate-100 mb-2 md:mb-3">
                  <div className="text-left">
                    <p className={`text-[10px] md:text-xs font-bold uppercase tracking-wider ${isToday ? 'text-blue-600' : 'text-slate-400'}`}>
                      {dateObj.toLocaleDateString('en-US', { weekday: 'short' })}
                    </p>
                    <p className="text-sm md:text-base font-bold text-slate-800 leading-none mt-0.5 md:mt-1">
                      {dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  {!dayBookings.some(b => b.status !== 'Cancelled') && isManager && (
                    <button
                      onClick={() => onNewBookingAtDate(dateStr)}
                      className="p-1 px-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-lg text-slate-500 hover:text-slate-700 transition"
                    >
                      <Plus className="w-3 md:w-3.5 h-3 md:h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex-1 space-y-1.5 md:space-y-2 overflow-y-auto pr-0.5">
                  {dayBookings.length === 0 ? (
                    <div className="text-center py-4 md:py-12 flex flex-col items-center justify-center h-full">
                      <p className="text-[10px] md:text-[11px] font-semibold text-slate-400">Unbooked</p>
                    </div>
                  ) : (
                    dayBookings.map((b) => {
                      const CardElement = isManager ? 'button' : 'div';
                      return (
                        <CardElement
                          key={b.id}
                          onClick={isManager ? () => onViewBooking(b.id) : undefined}
                          className={`w-full text-left p-1.5 md:p-2.5 rounded-lg md:rounded-xl border text-[10px] md:text-xs transition duration-150 ${getStatusBadgeStyle(b)} ${isManager ? 'hover:scale-[1.02] cursor-pointer' : 'cursor-default'} focus:outline-none`}
                        >
                          <p className="font-bold truncate">{b.customerName}</p>
                          <p className="text-[9px] md:text-[10px] opacity-90 truncate mt-0.5">{b.checkInDate} &rarr; {b.checkOutDate}</p>
                        </CardElement>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Legend showing event color codes */}
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50 text-xs text-slate-600 font-semibold shadow-xs">
        <span className="text-slate-400 uppercase tracking-widest text-[9px] font-bold mr-2">Legend:</span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 bg-blue-500 rounded-full inline-block border border-blue-600" />
          <span>Inquiry</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 bg-rose-500 rounded-full inline-block border border-rose-600" />
          <span>Payment Pending</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 bg-amber-500 rounded-full inline-block border border-amber-600" />
          <span>Advance Paid</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 bg-emerald-500 rounded-full inline-block border border-emerald-600" />
          <span>Pay Complete</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 bg-teal-600 rounded-full inline-block border border-teal-700" />
          <span>Completed</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 bg-slate-300 rounded-full inline-block border border-slate-400" />
          <span>Cancelled</span>
        </span>
      </div>
    </div>
  );
}
