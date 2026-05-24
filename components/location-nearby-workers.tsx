"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { LocateFixed, MapPin, Navigation } from "lucide-react";
import { WorkerCard } from "@/components/worker-card";
import type { Worker } from "@/types/worker";

type CityPoint = {
  city: string;
  lat: number;
  lon: number;
};

const cityPoints: CityPoint[] = [
  { city: "Delhi", lat: 28.6139, lon: 77.209 },
  { city: "Mumbai", lat: 19.076, lon: 72.8777 },
  { city: "Bengaluru", lat: 12.9716, lon: 77.5946 },
  { city: "Pune", lat: 18.5204, lon: 73.8567 },
  { city: "Jaipur", lat: 26.9124, lon: 75.7873 },
  { city: "Ahmedabad", lat: 23.0225, lon: 72.5714 },
  { city: "Hyderabad", lat: 17.385, lon: 78.4867 },
  { city: "Chennai", lat: 13.0827, lon: 80.2707 },
  { city: "Kolkata", lat: 22.5726, lon: 88.3639 },
  { city: "Lucknow", lat: 26.8467, lon: 80.9462 },
  { city: "Patna", lat: 25.5941, lon: 85.1376 },
  { city: "Muzaffarpur", lat: 26.1197, lon: 85.391 }
];

function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const earthRadius = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function nearestCity(lat: number, lon: number) {
  return [...cityPoints].sort((a, b) => distanceKm(lat, lon, a.lat, a.lon) - distanceKm(lat, lon, b.lat, b.lon))[0].city;
}

export function LocationNearbyWorkers() {
  const [city, setCity] = useState("");
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [status, setStatus] = useState("Detecting your city...");
  const [loading, setLoading] = useState(false);
  const detectedLabel = useMemo(() => city || "your city", [city]);

  const loadWorkers = useCallback(async (nextCity: string) => {
    setLoading(true);
    const response = await fetch(`/api/nearby-workers?city=${encodeURIComponent(nextCity)}`);
    const payload = (await response.json()) as { workers: Worker[] };
    setWorkers(payload.workers ?? []);
    setLoading(false);
    setStatus(payload.workers?.length ? `Showing top workers near ${nextCity}.` : `No workers found near ${nextCity} yet.`);
  }, []);

  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setCity("Delhi");
      setStatus("Location is not supported. Showing Delhi workers.");
      void loadWorkers("Delhi");
      return;
    }

    setStatus("Please allow location to see nearby workers.");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextCity = nearestCity(position.coords.latitude, position.coords.longitude);
        setCity(nextCity);
        void loadWorkers(nextCity);
      },
      () => {
        setCity("Delhi");
        setStatus("Location permission was blocked. Showing Delhi workers.");
        void loadWorkers("Delhi");
      },
      {
        enableHighAccuracy: false,
        timeout: 8000,
        maximumAge: 1000 * 60 * 10
      }
    );
  }, [loadWorkers]);

  useEffect(() => {
    detectLocation();
  }, [detectLocation]);

  return (
    <section className="mx-auto max-w-6xl px-4 pb-12 sm:px-6 lg:px-8">
      <div className="rounded-2xl bg-white p-5 shadow-soft sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-brand">
              <LocateFixed className="h-4 w-4" aria-hidden="true" />
              Top rated near you
            </p>
            <h2 className="mt-2 text-2xl font-black text-ink sm:text-3xl">Top 10 workers in {detectedLabel}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">All categories mixed together, sorted by highest rating first.</p>
            <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-500">
              <MapPin className="h-4 w-4" aria-hidden="true" />
              {status}
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={detectLocation}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-brand px-5 text-sm font-bold text-white transition hover:bg-teal-800"
            >
              <Navigation className="h-4 w-4" aria-hidden="true" />
              Use my location
            </button>
            <Link
              href={city ? `/nearby?city=${encodeURIComponent(city)}` : "/nearby"}
              className="inline-flex h-11 items-center justify-center rounded-lg bg-slate-100 px-5 text-sm font-bold text-ink transition hover:bg-slate-200"
            >
              View all nearby
            </Link>
          </div>
        </div>

        <div className="mt-6">
          {loading ? (
            <div className="rounded-xl bg-slate-50 p-6 text-center text-sm font-bold text-slate-600">Finding top nearby workers...</div>
          ) : workers.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {workers.map((worker) => (
                <WorkerCard key={worker.id} worker={worker} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl bg-slate-50 p-6 text-center">
              <p className="font-black text-ink">No nearby workers yet</p>
              <p className="mt-2 text-sm text-slate-600">Workers can join and create profiles for your city.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}


