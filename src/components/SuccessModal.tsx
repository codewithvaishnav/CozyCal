import { Booking } from '../types';
import { X, CheckCircle } from 'lucide-react';
import { FaWhatsapp } from "react-icons/fa";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  booking?: Booking | null;
  isWhatsAppSent?: boolean;
  onWhatsAppSent?: () => void;
}

export default function SuccessModal({ isOpen, onClose, message, booking, isWhatsAppSent = false,
  onWhatsAppSent }: SuccessModalProps) {
  if (!isOpen) return null;

  const formatDateLabel = (dateStr: string) => {
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', options);
  };

  const handleWhatsAppClick = () => {
    if (!booking) return;

     // Clean up and format phone numbers with 91 prefix
    const formattedPhone = booking.phone.replace(/\D/g, '');
    const cleanPhone = formattedPhone.startsWith('91') && formattedPhone.length === 12 
      ? formattedPhone 
      : formattedPhone.length === 10 
        ? `91${formattedPhone}` 
        : formattedPhone;

        // Draft message template
    const textMessage = `Hi ${booking.customerName}! 👋..!\n
    You're all set! Your selected dates have been reserved. 🎉\n
    📅 Reservation Details:
    🔑Check-In: ${formatDateLabel(booking.checkInDate)}, ${booking.checkInTime}
    🚪Check-Out: ${formatDateLabel(booking.checkOutDate)}, ${booking.checkOutTime}
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in" id="success-modal-holder">
      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col my-8">
        
        {/* Header container */}
        <div className="flex justify-end p-4 pb-0">
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition"
            id="success-close-icon"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content body with dynamic receipt */}
        <div className="p-6 text-center space-y-4" id="success-modal-content">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-50 text-emerald-500 mb-2 border border-emerald-100">
            <CheckCircle className="w-9 h-9 animate-bounce" />
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-slate-800" id="success-modal-main-message">
              Success!
            </h3>
            <p className="text-xs font-semibold text-slate-500 leading-relaxed">
              {message}
            </p>
          </div>

          {booking && (
            <div className="p-4 rounded-2xl bg-emerald-50/20 border border-emerald-100/50 text-left text-xs font-semibold text-slate-600 space-y-2" id="success-booking-summary">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 border-b border-emerald-55 pb-1">
                Receipt Overview
              </p>
              <div className="space-y-1">
                <p className="flex justify-between">
                  <span className="text-slate-400">Customer:</span>
                  <span className="font-bold text-slate-800 truncate pl-3 max-w-[150px]">{booking.customerName}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-slate-400">Duration:</span>
                  <span className="font-bold text-slate-700">{formatDateLabel(booking.checkInDate)} to {formatDateLabel(booking.checkOutDate)}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-slate-400">Paid In-advance:</span>
                  <span className="font-bold text-slate-800">₹{booking.advanceAmount.toLocaleString('en-IN')}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-slate-400">Balance:</span>
                  <span className={`font-bold ${booking.remainingAmount > 0 ? 'text-rose-500' : 'text-emerald-700'}`}>
                    ₹{booking.remainingAmount.toLocaleString('en-IN')}
                  </span>
                </p>
                <p className="flex justify-between">
                  <span className="text-slate-400">Status:</span>
                  <span className="font-extrabold text-emerald-600 uppercase tracking-wide">{booking.status}</span>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="p-5 bg-slate-50/50 flex flex-col gap-2 rounded-b-3xl">
          {booking && (
            <button
              onClick={handleWhatsAppClick}
              className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer transition active:scale-[0.98] flex items-center justify-center gap-1.5"
              id="success-whatsapp-btn"
            >
              <FaWhatsapp className="w-6 h-6 text-white" />
              <span>{isWhatsAppSent ? "Resend to WhatsApp" : "Send to WhatsApp"}</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer transition active:scale-[0.98]"
            id="success-ok-btn"
          >
            Confirm
          </button>
        </div>

      </div>
    </div>
  );
}
