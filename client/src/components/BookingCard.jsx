import { formatPKR, formatDate } from "../utils/currency";

const statusStyles = {
  confirmed: "bg-emerald-900/40 text-emerald-300 border-emerald-700/50",
  completed: "bg-blue-900/40 text-blue-300 border-blue-700/50",
  cancelled: "bg-red-900/40 text-red-300 border-red-700/50",
};

export default function BookingCard({
  booking,
  onModify,
  onCancel,
  onInvoice,
  onFeedback,
  onService,
  onIssue,
}) {
  const isConfirmed = booking.status === "confirmed";
  const isCompleted = booking.status === "completed";
  const showActions = isConfirmed || isCompleted;

  return (
    <div className="bg-aurelia-panel border border-aurelia-border rounded-lg p-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h3 className="font-serif text-xl text-aurelia-text">
            {booking.room?.name} — {booking.room?.roomNumber}
          </h3>
          <span className="text-xs text-aurelia-muted">{booking.bookingCode}</span>
        </div>
        <div className="text-right">
          <p className="font-serif text-xl text-aurelia-gold">{formatPKR(booking.totalAmount)}</p>
          <span
            className={`inline-block mt-1 text-xs uppercase px-2 py-1 rounded border ${statusStyles[booking.status]}`}
          >
            {booking.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 text-sm">
        <div>
          <p className="text-aurelia-muted uppercase text-xs">Check-in</p>
          <p className="text-aurelia-text mt-1">{formatDate(booking.checkIn)}</p>
        </div>
        <div>
          <p className="text-aurelia-muted uppercase text-xs">Check-out</p>
          <p className="text-aurelia-text mt-1">{formatDate(booking.checkOut)}</p>
        </div>
        <div>
          <p className="text-aurelia-muted uppercase text-xs">Nights</p>
          <p className="text-aurelia-text mt-1">{booking.nights}</p>
        </div>
        <div>
          <p className="text-aurelia-muted uppercase text-xs">Guests</p>
          <p className="text-aurelia-text mt-1">{booking.guests}</p>
        </div>
      </div>

      {showActions && (
        <div className="flex flex-wrap gap-3 mt-6">
          {isConfirmed && onModify && (
            <button
              onClick={() => onModify(booking)}
              className="border border-aurelia-border rounded-md px-4 py-2 text-sm uppercase tracking-wide text-aurelia-text hover:border-aurelia-gold"
            >
              Modify Dates
            </button>
          )}
          {isConfirmed && onCancel && (
            <button
              onClick={() => onCancel(booking)}
              className="border border-red-800 text-red-300 rounded-md px-4 py-2 text-sm uppercase tracking-wide hover:bg-red-950/40"
            >
              Cancel
            </button>
          )}
          {isConfirmed && onService && (
            <button
              onClick={() => onService(booking)}
              className="border border-aurelia-border rounded-md px-4 py-2 text-sm uppercase tracking-wide text-aurelia-text hover:border-aurelia-gold"
            >
              Request Service
            </button>
          )}
          {onIssue && (
            <button
              onClick={() => onIssue(booking)}
              className="border border-aurelia-border rounded-md px-4 py-2 text-sm uppercase tracking-wide text-aurelia-text hover:border-aurelia-gold"
            >
              Report Issue
            </button>
          )}
          {isCompleted && onFeedback && (
            <button
              onClick={() => onFeedback(booking)}
              className="border border-aurelia-gold/40 text-aurelia-goldLight rounded-md px-4 py-2 text-sm uppercase tracking-wide hover:border-aurelia-gold"
            >
              Leave Feedback
            </button>
          )}
          {onInvoice && (
            <button
              onClick={() => onInvoice(booking)}
              className="border border-aurelia-border rounded-md px-4 py-2 text-sm uppercase tracking-wide text-aurelia-text hover:border-aurelia-gold"
            >
              Invoice
            </button>
          )}
        </div>
      )}
    </div>
  );
}
