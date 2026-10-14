import { useState } from 'react';
import { Booking } from '../types';
import { FaWhatsapp } from "react-icons/fa";
import { 
  X, 
  User, 
  Phone, 
  Calendar, 
  IndianRupee, 
  Info, 
  StickyNote, 
  Edit3, 
  Trash2,
  Lock,
  Clock,
  Compass,
  MessageCircle,
  Send
} from 'lucide-react';

interface ViewBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  isWhatsAppSent?: boolean;
  onWhatsAppSent?: () => void;
}

export default function ViewBookingModal({ 
  isOpen, 
  onClose, 
  booking, 
  onEdit, 
  onDelete,
  isWhatsAppSent = false,
  onWhatsAppSent
}: ViewBookingModalProps) {
  if (!isOpen || !booking) return null;

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleWhatsAppClick = () => {
    if (!booking) return;

    const formattedPhone = booking.phone.replace(/\D/g, '');
    const cleanPhone = formattedPhone.startsWith('91') && formattedPhone.length === 12 
      ? formattedPhone 
      : formattedPhone.length === 10 
        ? `91${formattedPhone}` 
        : formattedPhone;

  const textMessage = `Hi ${booking.customerName}! 👋,\n
    You're all set! Your selected dates have been reserved. 🎉\n
    📅 Reservation Details:
    🔑Check-In: ${formatDateLabel(booking.checkInDate)} {booking.checkInTime}
    🚪Check-Out: ${formatDateLabel(booking.checkOutDate)} {booking.checkOutTime}
    ✨ Status: ${booking.status}\n
Thank you for choosing us. If you have any questions, feel free to reply here. 💬
See you soon,\n\n
🏡 Cozy Cottage 🌄`;

  const whatsappUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(textMessage)}`;
    
    if (onWhatsAppSent) {
      onWhatsAppSent();
    }
    
    window.open(whatsappUrl, '_blank');
  };

  const getStatusBadgeStyle = (status: Booking['status']): string => {
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

  const handleClose = () => {
    setShowDeleteConfirm(false);
    onClose();
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto" id="view-booking-modal-holder">
      
      {/* Absolute/Fixed Delete Confirmation Dialog overlaying everything uniformly */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-4 z-[60] animate-fade-in animate-duration-150">
          <div className="bg-white p-6 rounded-3xl max-w-sm w-full border border-slate-100 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 border border-rose-100 mx-auto">
              <Trash2 className="w-6 h-6 animate-pulse" />
            </div>
            <div className="text-center space-y-1.5">
              <h3 className="font-extrabold text-slate-800 text-sm">Delete Reservation</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                Are you sure you want to delete the reservation for <strong className="text-slate-800 font-extrabold">{booking.customerName}</strong>? This action cannot be revoked.!
              </p>
            </div>
            <div className="flex gap-2.5 justify-center pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-slate-100 text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-50 transition cursor-pointer active:scale-[0.98]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  onDelete(booking.id);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-rose-600/10 transition cursor-pointer active:scale-[0.98]"
              >
                Yes, Delete Booking
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col my-8 max-h-[90vh]">

        {/* Header container */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50 rounded-t-3xl">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50/50 text-blue-600 flex items-center justify-center border border-blue-100/30">
              <User className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-extrabold text-slate-800" id="view-modal-header-title">
              Reservation details
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition"
            id="view-modal-close-icon"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Info panel */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6" id="view-modal-content-container">
          
          {/* Section 1: Customer info */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100/50 space-y-3">
            <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-blue-500" />
              <span>Customer Details</span>
            </h3>
            <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-600">
              <div>
                <p className="text-[9px] text-slate-400 uppercase tracking-wider mb-0.5">Name</p>
                <p className="text-sm font-bold text-slate-800" id="view-customer-name">
                  {booking.customerName}
                </p>
              </div>
              <div>
                <p className="text-[9px] text-slate-400 uppercase tracking-wider mb-0.5">Contact Number</p>
                <p className="text-sm font-bold text-slate-800 select-all" id="view-customer-phone">
                  {booking.phone}
                </p>
              </div>
            </div>
          </div>

          {/* Section: Marketing */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100/50 space-y-3">
            <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-purple-500 shrink-0" />
              <span>Marketing</span>
            </h3>
            <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-600">
              <div className="col-span-2">
                <p className="text-[9px] text-slate-400 uppercase tracking-wider mb-0.5">Booking Source</p>
                <p className="text-sm font-bold text-slate-800" id="view-booking-source">
                  {booking.bookingSource || 'Not mentioned'}
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Residency metrics */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100/50 space-y-3">
            <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-emerald-500" />
              <span>Rental Duration</span>
            </h3>
            <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-600">
              <div>
                <p className="text-[9px] text-slate-400 uppercase tracking-wider mb-0.5">Check-In</p>
                <p className="text-sm font-bold text-slate-850" id="view-check-in-date">
                  {formatDateLabel(booking.checkInDate)}
                </p>
              </div>
              <div>
                <p className="text-[9px] text-slate-400 uppercase tracking-wider mb-0.5">Check-Out</p>
                <p className="text-sm font-bold text-slate-850" id="view-check-out-date">
                  {formatDateLabel(booking.checkOutDate)}
                </p>
              </div>
            </div>
            {/* Additional Reservation Specifications */}
            {(booking.checkInTime || booking.checkOutTime || booking.numberOfPeople || booking.stayType) && (
              <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-600 border-t border-slate-100/40 pt-3 mt-3">
                {booking.checkInTime && (
                  <div>
                    <p className="text-[9px] text-slate-400 uppercase tracking-wider mb-0.5">Check-In Time</p>
                    <p className="text-sm font-bold text-slate-850">{booking.checkInTime}</p>
                  </div>
                )}
                {booking.checkOutTime && (
                  <div>
                    <p className="text-[9px] text-slate-400 uppercase tracking-wider mb-0.5">Check-Out Time</p>
                    <p className="text-sm font-bold text-slate-850">{booking.checkOutTime}</p>
                  </div>
                )}
                {booking.numberOfPeople && (
                  <div>
                    <p className="text-[9px] text-slate-400 uppercase tracking-wider mb-0.5">Number of People</p>
                    <p className="text-sm font-bold text-slate-850">{booking.numberOfPeople}</p>
                  </div>
                )}
                {booking.stayType && (
                  <div>
                    <p className="text-[9px] text-slate-400 uppercase tracking-wider mb-0.5">Stay Type</p>
                    <p className="text-sm font-bold text-slate-850 capitalize">{booking.stayType}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section 3: Invoicing parameters */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100/50 space-y-4">
            <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1 border-b border-slate-100/30 pb-1.5">
              <IndianRupee className="w-3.5 h-3.5 text-amber-500" />
              <span>Billing details</span>
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-semibold text-slate-600">
              <div>
                <p className="text-[9px] text-slate-400 uppercase tracking-wider mb-0.5">Total Amount</p>
                <p className="text-sm font-extrabold text-slate-850" id="view-total-amount">
                  ₹ {booking.totalAmount.toLocaleString('en-IN')}
                </p>
              </div>
              <div>
                <p className="text-[9px] text-slate-400 uppercase tracking-wider mb-0.5">Advance Paid</p>
                <p className="text-sm font-extrabold text-slate-850" id="view-advance-amount">
                  ₹ {booking.advanceAmount.toLocaleString('en-IN')}
                </p>
              </div>
              <div>
                <p className="text-[9px] text-slate-400 uppercase tracking-wider mb-0.5">Remaining Due</p>
                <p className={`text-sm font-extrabold ${booking.remainingAmount > 0 ? 'text-rose-500' : 'text-emerald-600'}`} id="view-remaining-amount">
                  ₹ {booking.remainingAmount.toLocaleString('en-IN')}
                </p>
              </div>
              <div>
                <p className="text-[9px] text-slate-400 uppercase tracking-wider mb-0.5">Received By</p>
                <p className="text-sm font-bold text-slate-850 truncate" id="view-received-by">
                  {booking.receivedBy || 'Not Allocated'}
                </p>
              </div>
            </div>
          </div>

          {/* Section 4: Workflow state */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100/50">
            <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span>Booking status</span>
            </span>
            <span className={`text-[10px] font-extrabold px-3 py-1 bg-white rounded-full border shadow-xs tracking-wider uppercase ${getStatusBadgeStyle(booking.status)}`} id="view-status-badge">
              {booking.status}
            </span>
          </div>

          {/* Section 5: Private internal details notes */}
          {booking.notes && (
            <div className="p-4 bg-amber-50/20 rounded-2xl border border-amber-100/30 text-xs text-slate-600 font-semibold space-y-1.5">
              <p className="flex items-center gap-1.5 text-slate-405 font-bold uppercase tracking-widest text-[9px]">
                <StickyNote className="w-3.5 h-3.5 text-amber-500" />
                <span>Customer Preferences</span>
              </p>
              <p className="leading-relaxed bg-white/50 p-2.5 rounded-lg border border-amber-50" id="view-notes-content">
                {booking.notes}
              </p>
            </div>
          )}

          {/* Section 6: Simplified Creation log only */}
          {(() => {
            const createdLog = booking.history?.find(log => log.action === 'Booking Created') || {
              action: 'Booking Created',
              timestamp: booking.createdAt ? new Date(booking.createdAt).toLocaleString('en-IN') : 'Date/time not recorded',
              oldValue: null,
              newValue: null
            };

            return (
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100/50 text-xs font-semibold" id="view-creation-log">
                <span className="text-slate-500 font-bold uppercase tracking-widest text-[9px] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Booking Created</span>
                </span>
                <span className="text-slate-600 font-extrabold font-mono" id="view-creation-time">
                  {createdLog.timestamp}
                </span>
              </div>
            );
          })()}

        </div>

        {/* Footer controls */}
        <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between rounded-b-3xl">
          <button
            onClick={handleDeleteClick}
            className="px-4 py-2 hover:bg-rose-50 text-rose-500 hover:text-rose-600 rounded-xl font-bold text-xs transition duration-150 inline-flex items-center gap-1 cursor-pointer active:scale-[0.98]"
            id="view-delete-btn"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete booking</span>
          </button>

          <div className="flex gap-2">
            <button
              onClick={handleWhatsAppClick}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer active:scale-[0.98] inline-flex items-center gap-1"
              id="view-whatsapp-btn"
            >
              <FaWhatsapp className="w-6 h-8 text-white" />
              <span>{isWhatsAppSent ? "Resend" : "Send WhatsApp"}</span>
            </button>
            <button
              onClick={handleClose}
              className="px-4 py-2 border border-slate-100 text-slate-600 font-semibold text-xs rounded-xl hover:bg-slate-100 transition cursor-pointer"
              id="view-cancel-btn"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                handleClose();
                onEdit(booking.id);
              }}
              className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-md border border-blue-100 hover:shadow-lg transition cursor-pointer active:scale-[0.98] inline-flex items-center gap-1"
              id="view-edit-btn"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Booking Details</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
