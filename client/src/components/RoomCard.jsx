import { formatPKR } from "../utils/currency";

const typeBadgeClass = "bg-black/70 text-xs uppercase tracking-wide px-3 py-1 rounded text-aurelia-text";

export default function RoomCard({ room, onReserve, reserving }) {
  const isAvailable = room.isBookable && room.status === "available";

  return (
    <div className="bg-aurelia-panel border border-aurelia-border rounded-lg overflow-hidden flex flex-col">
      <div className="relative h-56 bg-aurelia-panelLight overflow-hidden">
        {room.images?.[0] ? (
          <img src={room.images[0]} alt={room.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-aurelia-muted text-sm">
            {room.name}
          </div>
        )}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={typeBadgeClass}>{room.type}</span>
          {!isAvailable && (
            <span className="bg-red-900/70 text-xs uppercase tracking-wide px-3 py-1 rounded text-red-200">
              Taken
            </span>
          )}
        </div>
        <div className="absolute bottom-3 right-3 text-right">
          <span className="text-aurelia-gold font-serif text-xl font-semibold">
            {formatPKR(room.pricePerNight)}
          </span>
          <span className="text-aurelia-muted text-xs"> /night</span>
        </div>
      </div>

      <div className="p-5 flex flex-col gap-3 flex-1">
        <div className="flex items-start justify-between">
          <h3 className="font-serif text-lg text-aurelia-text">{room.name}</h3>
          <span className="text-xs text-aurelia-muted">#{room.roomNumber}</span>
        </div>

        <div className="flex items-center gap-4 text-sm text-aurelia-muted">
          <span>👤 {room.capacity} guests</span>
          <span>📐 {room.sizeSqm} m²</span>
          <span>🏢 Floor {room.floor}</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {room.amenities?.slice(0, 4).map((a) => (
            <span
              key={a}
              className="text-xs bg-aurelia-panelLight border border-aurelia-border rounded px-2 py-1 text-aurelia-muted"
            >
              {a}
            </span>
          ))}
          {room.amenities?.length > 4 && (
            <span className="text-xs text-aurelia-muted px-1 py-1">+{room.amenities.length - 4}</span>
          )}
        </div>

        <button
          disabled={!isAvailable || reserving}
          onClick={() => onReserve(room)}
          className={`mt-auto w-full py-3 rounded-md font-semibold uppercase text-sm tracking-wide transition-colors ${
            isAvailable
              ? "bg-gold-gradient text-aurelia-bg hover:opacity-90"
              : "bg-aurelia-panelLight text-aurelia-muted cursor-not-allowed"
          }`}
        >
          {isAvailable ? (reserving ? "Reserving..." : "Reserve Now") : "Not Available"}
        </button>
      </div>
    </div>
  );
}
