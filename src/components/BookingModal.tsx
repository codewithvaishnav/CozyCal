import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Booking, Member } from '../types';
import { 
  X, 
  User, 
  Phone, 
  Calendar, 
  IndianRupee, 
  Info, 
  StickyNote, 
  CheckCircle2,
  Compass
} from 'lucide-react';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Booking, 'id' | 'history' | 'createdAt' | 'updatedAt'>) => void;
  bookingToEdit?: Booking | null;
  initialDate?: string | null;
  members: Member[];
}

export default function BookingModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  bookingToEdit, 
  initialDate,
  members = []
}: BookingModalProps) {
  // Local state for each form field
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [advanceAmount, setAdvanceAmount] = useState<number>(0);
  const [receivedBy, setReceivedBy] = useState('');
  const [status, setStatus] = useState<Booking['status']>('Inquiry');
  const [notes, setNotes] = useState('');
  const [bookingSource, setBookingSource] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [checkInTime, setCheckInTime] = useState('');
  const [checkOutTime, setCheckOutTime] = useState('');
  const [numberOfPeople, setNumberOfPeople] = useState<number | ''>('');
  const [stayType, setStayType] = useState<'Day outing' | 'Night stay'>('Day outing');

  // Auto-calculated remaining amount
  const remainingAmount = Math.max(0, totalAmount - advanceAmount);


  // Load editing values or initials when active
  useEffect(() => {
    if (isOpen) {
      setError(null);
      if (bookingToEdit) {
        setCustomerName(bookingToEdit.customerName);
        setPhone(bookingToEdit.phone);
        setCheckInDate(bookingToEdit.checkInDate);
        setCheckOutDate(bookingToEdit.checkOutDate);
        setTotalAmount(bookingToEdit.totalAmount);
        setAdvanceAmount(bookingToEdit.advanceAmount);
        setReceivedBy(bookingToEdit.receivedBy || '');
        setStatus(bookingToEdit.status);
        setNotes(bookingToEdit.notes || '');
        setBookingSource(bookingToEdit.bookingSource || '');
        setCheckInTime(bookingToEdit.checkInTime || '');
        setCheckOutTime(bookingToEdit.checkOutTime || '');
        setNumberOfPeople(bookingToEdit.numberOfPeople || '');
        setStayType(bookingToEdit.stayType || 'Day outing');
      } else {
        // Reset state for new booking creation
        setCustomerName('');
        setPhone('');
        setCheckInDate(initialDate || '');
        setCheckInTime('');
        setCheckOutTime('');
        setNumberOfPeople('');
        setStayType('Day outing');
        
        // Calculate default check-out date (next day)
        if (initialDate) {
          const nextDay = new Date(initialDate + 'T00:00:00');
          nextDay.setDate(nextDay.getDate() + 1);
          setCheckOutDate(nextDay.toISOString().split('T')[0]);
        } else {
          setCheckOutDate('');
        }

        setTotalAmount(0);
        setAdvanceAmount(0);
        setReceivedBy('');
        setStatus('Inquiry');
        setNotes('');
        setBookingSource('');
      }
    }
  }, [isOpen, bookingToEdit, initialDate]);

  if (!isOpen) return null;

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => {
      setIsShaking(false);
    }, 500);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Fundamental validation
    if (!customerName.trim() || !phone.trim() || !checkInDate || !checkOutDate || !numberOfPeople || Number(numberOfPeople) < 1) {
      setError('Please fill out all required fields');
      triggerShake();
      return;
    }

    // Phone number should consist of only numerical digits
    const cleanedPhone = phone.trim();
    if (!/^\d+$/.test(cleanedPhone)) {
      setError('Phone number must contain only numerical digits');
      triggerShake();
      return;
    }

    // Check out date must not be past the check in date
    const checkIn = new Date(checkInDate + 'T00:00:00');
    const checkOut = new Date(checkOutDate + 'T00:00:00');
    if (checkOut < checkIn) {
      setError('Check-out date cannot be earlier or past than the check-in date.');
      triggerShake();
      return;
    }

    onSubmit({
      customerName: customerName.trim(),
      phone: cleanedPhone,
      checkInDate,
      checkOutDate,
      totalAmount,
      advanceAmount,
      remainingAmount,
      receivedBy,
      status,
      notes,
      bookingSource: bookingSource.trim(),
      checkInTime,
      checkOutTime,
      numberOfPeople: numberOfPeople === '' ? undefined : numberOfPeople,
      stayType,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto" id="booking-modal-holder">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col my-8 max-h-[90vh]">
        
        {/* Header container */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50 rounded-t-3xl">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50/50 text-blue-600 flex items-center justify-center border border-blue-100/30">
              <Calendar className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-extrabold text-slate-800" id="modal-title-element">
              {bookingToEdit ? 'Customize Active Reservation' : 'Schedule Custom Booking'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition"
            id="modal-close-icon"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form container */}
        <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 space-y-6" id="booking-modal-form">
          
          {/* Error Banner */}
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-rose-800 animate-slide-down" id="form-error-banner">
              <Info className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-rose-700">Reservation Warning</h4>
                <p className="text-xs font-semibold text-rose-600 mt-0.5 leading-relaxed">{error}</p>
              </div>
              <button 
                type="button" 
                onClick={() => setError(null)}
                className="p-1 hover:bg-rose-100 rounded-lg text-rose-500 hover:text-rose-700 transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Section 1: Customer info */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1.5 border-b border-slate-50 pb-1.5">
              <User className="w-4 h-4 text-blue-500" />
              <span>Customer Identification</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Customer Name *</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-4 py-2 border border-slate-100 rounded-xl font-semibold text-slate-700 text-sm focus:outline-none focus:border-blue-600 placeholder-slate-300"
                  id="form-customer-name"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 9876543210"
                  className="w-full px-4 py-2 border border-slate-100 rounded-xl font-semibold text-slate-700 text-sm focus:outline-none focus:border-blue-600 placeholder-slate-300"
                  id="form-customer-phone"
                />
              </div>
            </div>
          </div>

          {/* Section: Marketing */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1.5 border-b border-slate-50 pb-1.5">
              <Compass className="w-4 h-4 text-purple-500 shrink-0" />
              <span>Marketing</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Booking Source</label>
                <input
                  type="text"
                  value={bookingSource}
                  onChange={(e) => setBookingSource(e.target.value)}
                  placeholder="e.g. Instagram, Word of mouth, Website..."
                  className="w-full px-4 py-2 border border-slate-100 rounded-xl font-semibold text-slate-700 text-sm focus:outline-none focus:border-blue-600 placeholder-slate-300"
                  id="form-booking-source"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Reservation Scheduling durations */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1.5 border-b border-slate-50 pb-1.5">
              <Calendar className="w-4 h-4 text-emerald-500" />
              <span>Rental Duration</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Check-In Date *</label>
                <input
                  type="date"
                  required
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-100 rounded-xl font-semibold text-slate-700 text-sm focus:outline-none focus:border-blue-600"
                  id="form-check-in-date"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Check-Out Date *</label>
                <input
                  type="date"
                  required
                  value={checkOutDate}
                  onChange={(e) => setCheckOutDate(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-100 rounded-xl font-semibold text-slate-700 text-sm focus:outline-none focus:border-blue-600"
                  id="form-check-out-date"
                />
              </div>
            </div>
            {/* Additional Fields: Check-In/Out Time, Number of People, Stay Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3 pt-3 border-t border-slate-50">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Check-In Time</label>
                <input
                  type="time"
                  value={checkInTime}
                  onChange={(e) => setCheckInTime(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-100 rounded-xl font-semibold text-slate-700 text-sm focus:outline-none focus:border-blue-600"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Check-Out Time</label>
                <input
                  type="time"
                  value={checkOutTime}
                  onChange={(e) => setCheckOutTime(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-100 rounded-xl font-semibold text-slate-700 text-sm focus:outline-none focus:border-blue-600"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Number of People *</label>
                <input
                  type="number"
                  min="1"
                  value={numberOfPeople}
                  onChange={(e) => setNumberOfPeople(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="e.g. 5"
                  className="w-full px-4 py-2 border border-slate-100 rounded-xl font-semibold text-slate-700 text-sm focus:outline-none focus:border-blue-600"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Stay Type</label>
                <select
                  value={stayType}
                  onChange={(e) => setStayType(e.target.value as 'day outing' | 'night stay')}
                  className="w-full px-4 py-2 border border-slate-100 rounded-xl font-semibold text-slate-700 text-sm focus:outline-none focus:border-blue-600 bg-white"
                >
                  <option value="day outing">Day Outing</option>
                  <option value="night stay">Night Stay</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Financial accounting parameters */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1.5 border-b border-slate-50 pb-1.5">
              <IndianRupee className="w-4 h-4 text-amber-500" />
              <span>Billing details</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Total Invoice Amount *</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={totalAmount || ''}
                  onChange={(e) => setTotalAmount(Number(e.target.value))}
                  placeholder="0"
                  className="w-full px-4 py-2 border border-slate-100 rounded-xl font-semibold text-slate-700 text-sm focus:outline-none focus:border-blue-600 placeholder-slate-350"
                  id="form-total-amount"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Advance Amount Paid</label>
                <input
                  type="number"
                  min="0"
                  value={advanceAmount || ''}
                  onChange={(e) => setAdvanceAmount(Number(e.target.value))}
                  placeholder="0"
                  className="w-full px-4 py-2 border border-slate-100 rounded-xl font-semibold text-slate-700 text-sm focus:outline-none focus:border-blue-600 placeholder-slate-350"
                  id="form-advance-amount"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400">Pending Amount</label>
                <div className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl font-bold text-slate-500 text-sm">
                  ₹ {remainingAmount.toLocaleString('en-IN')}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Assigned Manager</label>
                <select
                  value={receivedBy}
                  onChange={(e) => setReceivedBy(e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-slate-100 rounded-xl font-semibold text-slate-700 text-sm focus:outline-none focus:border-blue-600"
                  id="form-received-by"
                >
                  <option value="">Select Manager</option>
                  {members.length > 0 ? (
                    <>
                      {/* Preserve the currently set manager if it's an old default placeholder or not currently an active manager */}
                      {bookingToEdit?.receivedBy && !members.filter(m => m.isManager === true).some(m => m.fullName === bookingToEdit.receivedBy) && (
                        <option value={bookingToEdit.receivedBy}>{bookingToEdit.receivedBy}</option>
                      )}
                      {members.filter(m => m.isManager === true).map((m) => (
                        <option key={m.uid} value={m.fullName}>
                          {m.fullName}
                        </option>
                      ))}
                    </>
                  ) : (
                    <>
                      <option value="Member 1">Member 1</option>
                      <option value="Member 2">Member 2</option>
                      <option value="Member 3">Member 3</option>
                      <option value="Member 4">Member 4</option>
                    </>
                  )}
                </select>
              </div>
            </div>
          </div>

          {/* Section 4: Booking workflow status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-blue-500" />
                <span>Booking Status *</span>
              </label>
              <select
                required
                value={status}
                onChange={(e) => setStatus(e.target.value as Booking['status'])}
                className="w-full px-4 py-2 bg-white border border-slate-100 rounded-xl font-semibold text-slate-700 text-sm focus:outline-none focus:border-blue-600"
                id="form-status"
              >
                <option value="Inquiry">Inquiry</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Section 5: Descriptive Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 flex items-center gap-1">
              <StickyNote className="w-3.5 h-3.5 text-slate-400" />
              <span>Customer Preferences</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Private details, dietary requirements, group description..."
              rows={3}
              className="w-full px-4 py-2 border border-slate-100 rounded-xl font-semibold text-slate-700 text-sm focus:outline-none focus:border-blue-600 placeholder-slate-300 resize-none"
              id="form-notes"
            />
          </div>

        </form>

        {/* Footer actions */}
        <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-2.5 rounded-b-3xl">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-100 text-slate-600 font-semibold text-xs rounded-xl hover:bg-slate-100 transition cursor-pointer"
            id="form-cancel-btn"
          >
            Cancel
          </button>
          <motion.button
            type="button"
            onClick={handleFormSubmit}
            // Trigger horizontal shaking on the X-axis for exactly 500ms
            animate={isShaking ? { x: [-8, 8, -6, 6, -4, 4, -2, 2, 0] } : {}}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className={`px-5 py-2.5 font-bold text-xs rounded-xl shadow-md cursor-pointer flex items-center gap-1.5 active:scale-[0.98] transition-colors duration-200 ${
              isShaking 
                ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20' 
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/10'
            }`}
            id="form-submit-btn"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Save Reservation</span>
          </motion.button>
        </div>

      </div>
    </div>
  );
}
