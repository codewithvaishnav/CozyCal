import { Booking } from '../types';
import { X, AlertTriangle, CalendarDays } from 'lucide-react';

interface ConflictModalProps {
  isOpen: boolean;
  onClose: () => void;
  conflicts: Booking[];
}

export default function ConflictModal({ isOpen, onClose, conflicts }: ConflictModalProps) {
  if (!isOpen) return null;

  const formatDateLabel = (dateStr: string) => {
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', options);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in" id="conflict-modal-holder">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border-2 border-amber-500/30 flex flex-col my-8">
        
        {/* Header warnings container */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-amber-50/10 rounded-t-3xl">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-4.5 h-4.5 animate-bounce" />
            </div>
            <h2 className="text-sm font-extrabold text-amber-800 uppercase tracking-widest" id="conflict-modal-title">
              Booking Overlap Conflict
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition"
            id="conflict-close-btn"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Conflict list logs */}
        <div className="p-6 space-y-4" id="conflict-modal-content">
          <p className="text-xs font-semibold text-slate-500 leading-relaxed">
            The selected check-in/out dates overlap with existing bookings. Please modify dates or select another date.
          </p>

          <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1" id="conflict-list-elements">
            {conflicts.map((b) => (
              <div 
                key={b.id} 
                className="p-4 rounded-2xl bg-amber-50/40 border border-amber-100/50 flex items-start gap-3 text-xs font-semibold"
              >
                <div className="w-7 h-7 rounded-lg bg-amber-100/50 flex items-center justify-center text-amber-600 shrink-0 mt-0.5">
                  <CalendarDays className="w-4 h-4" />
                </div>
                <div className="space-y-1 flex-1">
                  <h4 className="font-extrabold text-slate-800 text-sm leading-none">{b.customerName}</h4>
                  <p className="text-slate-500 text-[11px] leading-tight mt-1 select-all">Phone: {b.phone}</p>
                  <p className="text-blue-600 text-[11px] font-bold">
                    {formatDateLabel(b.checkInDate)} to {formatDateLabel(b.checkOutDate)}
                  </p>
                  <span className="text-[9px] font-bold px-2 py-0.2 bg-white border border-amber-100 rounded-full inline-block text-amber-700 tracking-wider mt-1.5 uppercase">
                    Status: {b.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center p-3 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100/30 font-bold text-xs" id="conflict-warning-accent">
            Resolve overlapping days to finalize this reservation request.
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex justify-end rounded-b-3xl">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition active:scale-[0.98]"
            id="conflict-done-btn"
          >
            Modify Chosen Dates
          </button>
        </div>

      </div>
    </div>
  );
}
