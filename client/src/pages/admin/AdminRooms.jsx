import { useEffect, useState } from "react";
import api from "../../utils/api";
import { formatPKR } from "../../utils/currency";

const emptyForm = {
  roomNumber: "",
  name: "",
  type: "Standard",
  pricePerNight: "",
  capacity: 2,
  sizeSqm: "",
  floor: 1,
  amenities: "Wi-Fi, TV, Mini Bar, Safe",
  images: "",
  description: "",
  status: "available",
};

const statusOptions = ["available", "occupied", "cleaning", "maintenance"];
const statusStyles = {
  available: "bg-emerald-900/40 text-emerald-300 border-emerald-700/50",
  occupied: "bg-red-900/40 text-red-300 border-red-700/50",
  cleaning: "bg-amber-900/40 text-amber-300 border-amber-700/50",
  maintenance: "bg-slate-800/60 text-slate-300 border-slate-600/50",
};

export default function AdminRooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const load = () => {
    setLoading(true);
    api
      .get("/rooms")
      .then((res) => setRooms(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setUploadError("");
    setModalOpen(true);
  };

  const openEdit = (room) => {
    setEditingId(room._id);
    setForm({
      roomNumber: room.roomNumber,
      name: room.name,
      type: room.type,
      pricePerNight: room.pricePerNight,
      capacity: room.capacity,
      sizeSqm: room.sizeSqm,
      floor: room.floor,
      amenities: room.amenities.join(", "),
      images: (room.images || []).join(", "),
      description: room.description || "",
      status: room.status,
    });
    setError("");
    setUploadError("");
    setModalOpen(true);
  };

  const imageList = () => form.images.split(",").map((u) => u.trim()).filter(Boolean);

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploadError("");
    setUploading(true);
    try {
      const body = new FormData();
      files.forEach((file) => body.append("images", file));
      // Let the browser set the multipart Content-Type (with boundary) itself —
      // don't set it manually or the request body won't parse on the server.
      const { data } = await api.post("/uploads", body);
      setForm((f) => ({
        ...f,
        images: [...imageList(), ...data.urls].join(", "),
      }));
    } catch (err) {
      setUploadError(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = ""; // reset so picking the same file again re-triggers onChange
    }
  };

  const removeImage = (urlToRemove) => {
    setForm((f) => ({
      ...f,
      images: imageList()
        .filter((u) => u !== urlToRemove)
        .join(", "),
    }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    const payload = {
      ...form,
      pricePerNight: Number(form.pricePerNight),
      capacity: Number(form.capacity),
      sizeSqm: Number(form.sizeSqm),
      floor: Number(form.floor),
      amenities: form.amenities.split(",").map((a) => a.trim()).filter(Boolean),
      images: imageList(),
      isBookable: form.status === "available",
    };
    try {
      if (editingId) {
        await api.put(`/rooms/${editingId}`, payload);
      } else {
        await api.post("/rooms", payload);
      }
      setModalOpen(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save room");
    }
  };

  const changeStatus = async (room, status) => {
    await api.put(`/rooms/${room._id}/status`, { status });
    load();
  };

  const remove = async (room) => {
    if (!confirm(`Delete room ${room.roomNumber} — ${room.name}?`)) return;
    await api.delete(`/rooms/${room._id}`);
    load();
  };

  return (
    <div className="p-8 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="uppercase text-aurelia-gold text-sm tracking-wide">Inventory</p>
          <h1 className="font-serif text-3xl mt-2">Rooms</h1>
        </div>
        <button
          onClick={openCreate}
          className="bg-gold-gradient text-aurelia-bg font-semibold uppercase text-sm tracking-wide rounded-md px-5 py-2.5"
        >
          + Add Room
        </button>
      </div>

      {loading ? (
        <p className="text-aurelia-muted">Loading rooms...</p>
      ) : (
        <div className="bg-aurelia-panel border border-aurelia-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-aurelia-panelLight text-aurelia-muted uppercase text-xs">
              <tr>
                <th className="text-left px-5 py-3">Room</th>
                <th className="text-left px-5 py-3">Type</th>
                <th className="text-left px-5 py-3">Price / Night</th>
                <th className="text-left px-5 py-3">Capacity</th>
                <th className="text-left px-5 py-3">Status</th>
                <th className="text-right px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => (
                <tr key={room._id} className="border-t border-aurelia-border">
                  <td className="px-5 py-4">
                    <p className="text-aurelia-text">{room.name}</p>
                    <p className="text-xs text-aurelia-muted">#{room.roomNumber} · Floor {room.floor}</p>
                  </td>
                  <td className="px-5 py-4 text-aurelia-muted">{room.type}</td>
                  <td className="px-5 py-4 text-aurelia-gold">{formatPKR(room.pricePerNight)}</td>
                  <td className="px-5 py-4 text-aurelia-muted">{room.capacity} guests</td>
                  <td className="px-5 py-4">
                    <select
                      value={room.status}
                      onChange={(e) => changeStatus(room, e.target.value)}
                      className={`text-xs uppercase px-2 py-1 rounded border bg-transparent ${statusStyles[room.status]}`}
                    >
                      {statusOptions.map((s) => (
                        <option key={s} value={s} className="bg-aurelia-panel text-aurelia-text">
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-5 py-4 text-right space-x-3">
                    <button
                      onClick={() => openEdit(room)}
                      className="text-xs uppercase text-aurelia-gold hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => remove(room)}
                      className="text-xs uppercase text-red-400 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {rooms.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-aurelia-muted">
                    No rooms yet — add your first room.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
          <div className="bg-aurelia-panel border border-aurelia-border rounded-lg max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="font-serif text-xl mb-5">{editingId ? "Edit Room" : "Add Room"}</h3>
            <form onSubmit={submit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs uppercase text-aurelia-gold">Room Number</label>
                  <input
                    required
                    value={form.roomNumber}
                    onChange={(e) => setForm({ ...form, roomNumber: e.target.value })}
                    className="mt-2 w-full bg-aurelia-bg border border-aurelia-border rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase text-aurelia-gold">Room Name</label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="mt-2 w-full bg-aurelia-bg border border-aurelia-border rounded-md px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs uppercase text-aurelia-gold">Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="mt-2 w-full bg-aurelia-bg border border-aurelia-border rounded-md px-3 py-2"
                  >
                    {["Standard", "Deluxe", "Suite", "Presidential"].map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs uppercase text-aurelia-gold">Price / Night (PKR)</label>
                  <input
                    required
                    type="number"
                    min="0"
                    value={form.pricePerNight}
                    onChange={(e) => setForm({ ...form, pricePerNight: e.target.value })}
                    className="mt-2 w-full bg-aurelia-bg border border-aurelia-border rounded-md px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs uppercase text-aurelia-gold">Capacity</label>
                  <input
                    required
                    type="number"
                    min="1"
                    value={form.capacity}
                    onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                    className="mt-2 w-full bg-aurelia-bg border border-aurelia-border rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase text-aurelia-gold">Size (m²)</label>
                  <input
                    required
                    type="number"
                    min="1"
                    value={form.sizeSqm}
                    onChange={(e) => setForm({ ...form, sizeSqm: e.target.value })}
                    className="mt-2 w-full bg-aurelia-bg border border-aurelia-border rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase text-aurelia-gold">Floor</label>
                  <input
                    required
                    type="number"
                    min="1"
                    value={form.floor}
                    onChange={(e) => setForm({ ...form, floor: e.target.value })}
                    className="mt-2 w-full bg-aurelia-bg border border-aurelia-border rounded-md px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs uppercase text-aurelia-gold">Amenities (comma separated)</label>
                <input
                  value={form.amenities}
                  onChange={(e) => setForm({ ...form, amenities: e.target.value })}
                  className="mt-2 w-full bg-aurelia-bg border border-aurelia-border rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label className="text-xs uppercase text-aurelia-gold">Images</label>

                <label
                  className={`mt-2 flex items-center justify-center gap-2 w-full border border-aurelia-border rounded-md px-3 py-3 text-sm text-aurelia-muted ${
                    uploading ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:border-aurelia-gold hover:text-aurelia-text"
                  }`}
                >
                  {uploading ? "Uploading..." : "Upload from device (JPEG/PNG/WEBP/GIF, up to 5MB each)"}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    multiple
                    disabled={uploading}
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                {uploadError && <p className="text-red-400 text-xs mt-2">{uploadError}</p>}

                <input
                  value={form.images}
                  onChange={(e) => setForm({ ...form, images: e.target.value })}
                  placeholder="Or paste image URLs, comma separated"
                  className="mt-2 w-full bg-aurelia-bg border border-aurelia-border rounded-md px-3 py-2 text-sm"
                />

                {imageList().length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {imageList().map((url, i) => (
                      <div key={i} className="relative">
                        <img
                          src={url}
                          alt=""
                          className="w-16 h-16 object-cover rounded border border-aurelia-border"
                          onError={(e) => (e.target.style.display = "none")}
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(url)}
                          title="Remove image"
                          className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center leading-none"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs uppercase text-aurelia-gold">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="mt-2 w-full bg-aurelia-bg border border-aurelia-border rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label className="text-xs uppercase text-aurelia-gold">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="mt-2 w-full bg-aurelia-bg border border-aurelia-border rounded-md px-3 py-2"
                >
                  {statusOptions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 border border-aurelia-border rounded-md py-3 uppercase text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 bg-gold-gradient text-aurelia-bg font-semibold rounded-md py-3 uppercase text-sm disabled:opacity-50"
                >
                  {editingId ? "Save Changes" : "Create Room"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
