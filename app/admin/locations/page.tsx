"use client";

import { useEffect, useState } from "react";
import { supabaseAdmin as supabase } from "@/lib/supabase";
import { INDIAN_STATES_CITIES } from "@/lib/indian-cities";
import {
  MapPin,
  Plus,
  Search,
  Trash2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "@/lib/motion";

interface Location {
  id: string;
  state: string;
  city: string;
  is_active: boolean;
  created_at: string;
}

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [newState, setNewState] = useState("");
  const [newCity, setNewCity] = useState("");
  const [availableCities, setAvailableCities] = useState<string[]>([]);

  // State selection handler for new location form
  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const state = e.target.value;
    setNewState(state);
    setNewCity("");
    if (state && INDIAN_STATES_CITIES[state]) {
      setAvailableCities(INDIAN_STATES_CITIES[state]);
    } else {
      setAvailableCities([]);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  async function fetchLocations() {
    try {
      const { data, error } = await supabase
        .from("locations")
        .select("*")
        .order("state", { ascending: true })
        .order("city", { ascending: true });

      if (error) throw error;
      setLocations(data || []);
    } catch (err) {
      if (process.env.NODE_ENV === "development") console.error("Error fetching locations:", err);
      setError("Failed to load locations");
    } finally {
      setLoading(false);
    }
  }

  async function handleAddLocation(e: React.FormEvent) {
    e.preventDefault();
    setAdding(true);
    setError("");
    setSuccess("");

    try {
      if (!newState || !newCity) {
        throw new Error("Please select both state and city");
      }

      // Check for duplicate
      const exists = locations.some(
        (loc) =>
          loc.state.toLowerCase() === newState.toLowerCase() &&
          loc.city.toLowerCase() === newCity.toLowerCase()
      );

      if (exists) {
        throw new Error("This location already exists");
      }

      const { data, error } = await supabase
        .from("locations")
        .insert({
          state: newState,
          city: newCity,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;

      setLocations((prev) => [...prev, data]);
      setSuccess("Location added successfully");
      setNewState("");
      setNewCity("");
      setAvailableCities([]);
    } catch (err) {
      if (process.env.NODE_ENV === "development") console.error("Error adding location:", err);
      setError(err instanceof Error ? err.message : "Failed to add location");
    } finally {
      setAdding(false);
    }
  }

  async function handleDeleteLocation(id: string) {
    if (!confirm("Are you sure you want to remove this location?")) return;

    try {
      const { error } = await supabase.from("locations").delete().eq("id", id);

      if (error) throw error;

      setLocations((prev) => prev.filter((loc) => loc.id !== id));
      setSuccess("Location removed successfully");
    } catch (err) {
      if (process.env.NODE_ENV === "development") console.error("Error removing location:", err);
      setError("Failed to remove location");
    }
  }

  const filteredLocations = locations.filter(
    (loc) =>
      loc.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loc.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-page p-6">
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Manage Locations
        </h1>
        <p className="text-gray-500">
          Add or remove service locations (State & City)
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Add New Location Form */}
        <motion.div
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-2 mb-4 text-gray-800">
            <Plus className="w-5 h-5 text-blue-600" />
            <h2 className="font-semibold text-lg">Add New Location</h2>
          </div>

          <form onSubmit={handleAddLocation} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State
              </label>
              <select
                value={newState}
                onChange={handleStateChange}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                required
              >
                <option value="">Select State</option>
                {Object.keys(INDIAN_STATES_CITIES).map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={newCity}
                  onChange={(e) => setNewCity(e.target.value)}
                  list="city-suggestions"
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  placeholder="Enter or select city"
                  required
                  disabled={!newState}
                />
                <datalist id="city-suggestions">
                  {availableCities.map((city) => (
                    <option key={city} value={city} />
                  ))}
                </datalist>
              </div>
            </div>

            <button
              type="submit"
              disabled={adding || !newState || !newCity}
              className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {adding ? (
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Plus className="w-4 h-4" /> Add Location
                </>
              )}
            </button>
          </form>

          <AnimatePresence>
            {error && (
              <motion.div
                className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-start gap-2"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                {error}
              </motion.div>
            )}
            {success && (
              <motion.div
                className="mt-4 p-3 bg-green-50 text-green-600 rounded-lg text-sm flex items-start gap-2"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
                {success}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Locations List */}
        <motion.div
          className="md:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="p-4 border-b border-gray-100 flex flex-wrap gap-4 items-center justify-between bg-gray-50/50">
            <h2 className="font-semibold text-lg text-gray-800 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-gray-500" />
              Active Locations
              <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs">
                {locations.length}
              </span>
            </h2>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none w-full md:w-64"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3">State</th>
                  <th className="px-6 py-3">City</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      Loading locations...
                    </td>
                  </tr>
                ) : filteredLocations.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      {searchTerm
                        ? "No locations found matching your search"
                        : "No locations added yet"}
                    </td>
                  </tr>
                ) : (
                  filteredLocations.map((loc) => (
                    <tr
                      key={loc.id}
                      className="hover:bg-gray-50/50 transition-colors group"
                    >
                      <td className="px-6 py-3 font-medium text-gray-900">
                        {loc.state}
                      </td>
                      <td className="px-6 py-3 text-gray-600">{loc.city}</td>
                      <td className="px-6 py-3 text-right">
                        <button
                          onClick={() => handleDeleteLocation(loc.id)}
                          className="text-gray-400 hover:text-red-600 transition-colors p-1 rounded hover:bg-red-50"
                          title="Remove location"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
