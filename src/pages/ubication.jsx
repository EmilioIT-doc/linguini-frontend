import { useMemo, useState } from "react";
import axios from "axios";

import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from "react-leaflet";
import L from "leaflet";

// ✅ Fix íconos Leaflet (si no te salen los markers en Vite)
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const STORE = {
  name: "Linguini ITALIAN STREET FOOD",
  lat: 21.9299959,
  lng: -102.3034048,
};

function secondsToNice(seconds) {
  if (seconds == null) return "";
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h} h ${m} min`;
}

function calcShipping(km, { highway = false, rain = false } = {}) {
  let base = 0;

  if (km <= 1.9) base = 35;
  else if (km <= 3.0) base = 40;
  else if (km <= 5.5) base = 50;
  else if (km <= 8.0) base = 60;
  else if (km <= 10.0) base = 70;
  else base = 70;

  const extraKm = km > 10 ? Math.ceil(km - 10) : 0;
  const extraKmFee = extraKm * 5;

  const highwayFee = highway ? 15 : 0;
  const rainFee = rain ? 15 : 0;

  return {
    base,
    extraKm,
    extraKmFee,
    highwayFee,
    rainFee,
    total: base + extraKmFee + highwayFee + rainFee,
  };
}

// ✅ componente para que el mapa se ajuste a la ruta
function FitBounds({ points }) {
  const map = useMap();

  useMemo(() => {
    if (!points || points.length < 2) return;
    const bounds = L.latLngBounds(points);
    map.fitBounds(bounds, { padding: [30, 30] });
  }, [points, map]);

  return null;
}

export default function Ubication() {
  const [address, setAddress] = useState("");
  const [userCoords, setUserCoords] = useState(null); // interno (no se muestra)
  const [loading, setLoading] = useState(false);

  const [distanceKm, setDistanceKm] = useState(null);
  const [durationText, setDurationText] = useState(null);
  const [pricing, setPricing] = useState(null);

  const [highway, setHighway] = useState(false);
  const [rain, setRain] = useState(false);

  // ✅ Ruta dibujable: array de [lat, lng]
  const [routeLine, setRouteLine] = useState([]);

  const resetResults = () => {
    setDistanceKm(null);
    setDurationText(null);
    setPricing(null);
    setRouteLine([]);
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) return alert("Tu navegador no soporta geolocalización.");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserCoords(coords);
        resetResults();

        // reverse -> dirección bonita
        try {
          const r = await axios.get("http://localhost:8000/api/geo/reverse", {
            params: { lat: coords.lat, lng: coords.lng },
          });
          setAddress(r.data.label || "");
        } catch (e) {
          console.log(e);
          alert("Detecté tu ubicación, pero no pude obtener la dirección.");
        }
      },
      () => alert("No se pudo obtener tu ubicación. Activa permisos de ubicación."),
      { enableHighAccuracy: true, timeout: 12000 }
    );
  };

  const calculateDelivery = async () => {
    if (!address.trim() && !userCoords) {
      return alert("Escribe tu dirección o usa el botón de ubicación.");
    }

    setLoading(true);
    try {
      let coords = userCoords;

      // si no hay coords, geocodeamos la dirección
      if (!coords) {
        const geo = await axios.get("http://localhost:8000/api/geo/geocode", {
          params: { address },
        });
        coords = { lat: geo.data.lat, lng: geo.data.lng };
        setUserCoords(coords);
      }

      const start = `${coords.lng},${coords.lat}`;
      const end = `${STORE.lng},${STORE.lat}`;

      const dir = await axios.get("http://localhost:8000/api/geo/directions", {
        params: { start, end },
      });

      // ✅ pinta ruta
      const line = (dir.data.route || []).map(([lng, lat]) => [lat, lng]); // ORS -> [lng,lat]
      setRouteLine(line);

      const km = dir.data.distance_m / 1000;
      setDistanceKm(Number(km.toFixed(2)));
      setDurationText(secondsToNice(dir.data.duration_s));
      setPricing(calcShipping(km, { highway, rain }));
    } catch (e) {
      console.log(e);
      alert("No se pudo calcular. Revisa la dirección o el backend.");
    } finally {
      setLoading(false);
    }
  };

  // centro default del mapa (local)
  const center = [STORE.lat, STORE.lng];

  return (
    <section className="w-full mx-auto max-w-[1124px] px-6 py-12">
      <p className="mt-2 text-black/60 font-arch pl-4">
        Calcula distancia, tiempo y costo de envío a domicilio.
      </p>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* MAPA NUBE (Leaflet) */}
        <div className="relative">
          <div className="relative rounded-[40px] bg-white shadow-[0_18px_45px_rgba(0,0,0,0.18)] border border-white/60 overflow-hidden">

            <div className="relative px-6 pt-6 pb-3">
              <h2 className="font-arch text-xl text-[#111]">{STORE.name}</h2>
              <p className="font-arch text-sm text-black/60">Aguascalientes</p>
            </div>

            <div className="relative px-6 pb-6">
              <div className="overflow-hidden rounded-3xl border border-black/10">
                <MapContainer center={center} zoom={14} style={{ height: 340, width: "100%" }}>
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap contributors"
                  />

                  {/* Marker local */}
                  <Marker position={[STORE.lat, STORE.lng]}>
                    <Popup>{STORE.name}</Popup>
                  </Marker>

                  {/* Marker usuario (si existe) */}
                  {userCoords && (
                    <Marker position={[userCoords.lat, userCoords.lng]}>
                      <Popup>Tu ubicación</Popup>
                    </Marker>
                  )}

                  {/* Ruta (si ya calculaste) */}
                  {routeLine.length > 1 && (
                    <>
                      <Polyline positions={routeLine} />
                      <FitBounds points={routeLine} />
                    </>
                  )}
                </MapContainer>
              </div>
            </div>
          </div>
        </div>

        {/* CALCULADORA */}
        <div className="rounded-[32px] bg-white/80 backdrop-blur-md border border-white/60 shadow-[0_18px_45px_rgba(0,0,0,0.18)] p-7">
          <h2 className="font-arch text-2xl text-[#111]">Calcular envío</h2>

          <button
            onClick={useMyLocation}
            className="mt-4 w-full bg-[#e1ae52] text-white px-5 py-3 rounded-xl font-arch text-sm hover:opacity-90 cursor-pointer"
          >
            Usar mi ubicación (GPS)
          </button>

          <div className="mt-4">
            <label className="font-arch text-sm text-black/60">Tu dirección</label>
            <input
              value={address}
              onChange={(e) => {
                setAddress(e.target.value);
                setUserCoords(null); // fuerza a recalcular por dirección
                resetResults();
              }}
              placeholder="Ej. Av. Universidad 123, Aguascalientes"
              className="mt-2 w-full rounded-xl border border-black/10 px-4 py-3 outline-none focus:border-[#e1ae52]"
            />
          </div>

          <div className="mt-4 flex flex-col gap-2">
            <label className="flex items-center gap-2 font-arch text-sm text-black/70">
              <input type="checkbox" checked={highway} onChange={(e) => setHighway(e.target.checked)} />
              Kilómetro en carretera (+$15)
            </label>

            <label className="flex items-center gap-2 font-arch text-sm text-black/70">
              <input type="checkbox" checked={rain} onChange={(e) => setRain(e.target.checked)} />
              Tarifa de lluvia (+$15)
            </label>
          </div>

          <button
            onClick={calculateDelivery}
            disabled={loading}
            className="mt-5 w-full bg-[#111] text-white px-5 py-3 rounded-xl font-arch text-sm hover:opacity-90 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Calculando..." : "Calcular costo de envío"}
          </button>

          <div className="mt-6 rounded-2xl border border-black/10 bg-white p-5">
            {distanceKm == null ? (
              <p className="font-arch text-black/50 text-sm">
                Usa tu ubicación o escribe tu dirección y calcula.
              </p>
            ) : (
              <div className="font-arch">
                <p className="text-[#111]">
                  Distancia (ruta): <b>{distanceKm} km</b>
                </p>
                <p className="text-[#111]">
                  Tiempo estimado: <b>{durationText}</b>
                </p>

                {pricing && (
                  <div className="mt-3 text-sm text-black/70 space-y-1">
                    <p>Base: ${pricing.base}</p>
                    {pricing.extraKm > 0 && <p>Km extra (+{pricing.extraKm}): ${pricing.extraKmFee}</p>}
                    {pricing.highwayFee > 0 && <p>Carretera: ${pricing.highwayFee}</p>}
                    {pricing.rainFee > 0 && <p>Lluvia: ${pricing.rainFee}</p>}
                    <p className="pt-2 text-[#111] text-base">
                      Total envío: <b>${pricing.total}</b>
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
