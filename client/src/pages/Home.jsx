import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import RoomCard from "../components/RoomCard";
import { useAuth } from "../context/AuthContext";

const amenities = [
  { icon: "🏊", title: "Infinity Pool", desc: "Panoramic rooftop pool open year-round." },
  { icon: "🧖", title: "Serenity Spa", desc: "Full-service spa with signature treatments." },
  { icon: "🍽️", title: "Le Marais Restaurant", desc: "Contemporary French fine dining." },
  {
    icon: "🏋️",
    title: "Fitness Centre",
    desc: "State-of-the-art equipment, personal trainers, and yoga studio.",
  },
];

export default function Home() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState({ checkIn: "", checkOut: "", guests: 2 });
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    api
      .get("/rooms?sort=price_asc")
      .then((res) => setRooms(res.data.slice(0, 3)))
      .catch(() => setRooms([]))
      .finally(() => setLoading(false));
  }, []);

  const handleFindRooms = (e) => {
    e.preventDefault();
    navigate("/rooms", { state: search });
  };

  const handleReserve = (room) => {
    if (!user) return navigate("/login");
    navigate("/rooms", { state: { focusRoomId: room._id } });
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1600&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-aurelia-bg/60 via-aurelia-bg/80 to-aurelia-bg" />
        <div className="relative max-w-5xl mx-auto text-center px-6 pt-24 pb-16">
          <p className="uppercase tracking-[0.3em] text-aurelia-gold text-sm mb-6">
            Est. 1924 · Grand Hotel Collection
          </p>
          <h1 className="font-serif text-5xl md:text-6xl leading-tight text-aurelia-text">
            Where Every Stay
          </h1>
          <h1 className="font-serif italic text-5xl md:text-6xl leading-tight text-aurelia-gold mt-2">
            Becomes Legend
          </h1>
          <p className="text-aurelia-muted mt-8 max-w-2xl mx-auto text-lg">
            Six floors of curated luxury. Rooms crafted for discerning guests who expect
            nothing less than extraordinary.
          </p>

          <form
            onSubmit={handleFindRooms}
            className="mt-12 bg-aurelia-panel border border-aurelia-border rounded-lg p-6 grid grid-cols-1 md:grid-cols-4 gap-4 text-left"
          >
            <div>
              <label className="text-xs uppercase tracking-wide text-aurelia-gold">Check-in</label>
              <input
                type="date"
                value={search.checkIn}
                onChange={(e) => setSearch({ ...search, checkIn: e.target.value })}
                className="mt-2 w-full bg-aurelia-bg border border-aurelia-border rounded-md px-3 py-2 text-aurelia-text"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wide text-aurelia-gold">Check-out</label>
              <input
                type="date"
                value={search.checkOut}
                onChange={(e) => setSearch({ ...search, checkOut: e.target.value })}
                className="mt-2 w-full bg-aurelia-bg border border-aurelia-border rounded-md px-3 py-2 text-aurelia-text"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wide text-aurelia-gold">Guests</label>
              <select
                value={search.guests}
                onChange={(e) => setSearch({ ...search, guests: Number(e.target.value) })}
                className="mt-2 w-full bg-aurelia-bg border border-aurelia-border rounded-md px-3 py-2 text-aurelia-text"
              >
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>
                    {n} Guest{n > 1 ? "s" : ""}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="self-end bg-gold-gradient text-aurelia-bg font-semibold uppercase tracking-wide rounded-md py-3"
            >
              Find Rooms
            </button>
          </form>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-aurelia-border bg-aurelia-panel/40">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 px-6 py-10 text-center">
          {[
            ["102", "Rooms & Suites"],
            ["6", "Room Categories"],
            ["4★★", "Michelin Stars"],
            ["100yr", "Heritage Since 1924"],
          ].map(([value, label]) => (
            <div key={label}>
              <p className="font-serif text-3xl text-aurelia-gold">{value}</p>
              <p className="text-aurelia-muted text-xs uppercase tracking-wide mt-2">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Rooms */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="uppercase text-aurelia-gold text-sm tracking-wide">Curated Selection</p>
            <h2 className="font-serif text-4xl mt-2">Featured Rooms</h2>
          </div>
          <button
            onClick={() => navigate("/rooms")}
            className="text-aurelia-gold uppercase text-sm tracking-wide hover:underline"
          >
            View All
          </button>
        </div>

        {loading ? (
          <p className="text-aurelia-muted">Loading rooms...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <RoomCard key={room._id} room={room} onReserve={handleReserve} />
            ))}
          </div>
        )}
      </section>

      {/* Amenities */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="text-center mb-10">
          <p className="uppercase text-aurelia-gold text-sm tracking-wide">Experience</p>
          <h2 className="font-serif text-4xl mt-2">Hotel Amenities</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {amenities.map((a) => (
            <div key={a.title} className="bg-aurelia-panel border border-aurelia-border rounded-lg p-6">
              <span className="text-3xl">{a.icon}</span>
              <h3 className="font-serif text-lg mt-4">{a.title}</h3>
              <p className="text-aurelia-muted text-sm mt-2">{a.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center px-6 pb-24">
        <p className="uppercase text-aurelia-gold text-sm tracking-wide">Ready to Arrive?</p>
        <h2 className="font-serif text-4xl md:text-5xl mt-3">
          Reserve Your <span className="italic text-aurelia-gold">Perfect Stay</span>
        </h2>
        <p className="text-aurelia-muted mt-6 max-w-xl mx-auto">
          Complimentary airport transfer, late checkout on request, and dedicated concierge
          service for every guest.
        </p>
        <button
          onClick={() => navigate("/rooms")}
          className="mt-8 bg-gold-gradient text-aurelia-bg font-semibold uppercase tracking-wide rounded-md px-8 py-3"
        >
          Explore Rooms
        </button>
      </section>
    </div>
  );
}
