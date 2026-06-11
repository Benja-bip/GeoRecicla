import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { supabase } from "@/integrations/supabase/client";
import { demoPoints, haversineKm, directionsUrl, type RecyclingPoint } from "@/lib/points";
import { getAllComunaMapPoints } from "@/lib/comunas";
import { type Material } from "@/lib/materials-data";

const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

const userIcon = L.divIcon({
  className: "",
  html: `<div style="width:18px;height:18px;background:hsl(var(--primary));border:3px solid white;border-radius:50%;box-shadow:0 0 0 2px hsl(var(--primary));"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

interface MapViewProps {
  searchLocation?: { lat: number; lng: number; displayName: string } | null;
  materialFilter?: string | null;
  customMaterials?: Material[];
}

const FlyTo = ({ location }: { location: MapViewProps["searchLocation"] }) => {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => map.invalidateSize(), 200);
  }, [map]);
  useEffect(() => {
    if (location) map.flyTo([location.lat, location.lng], 14, { duration: 1 });
  }, [location, map]);
  return null;
};

const MapView = ({ searchLocation, materialFilter, customMaterials = [] }: MapViewProps) => {
  const [userPoints, setUserPoints] = useState<RecyclingPoint[]>([]);

  useEffect(() => {
    supabase
      .from("recycling_points")
      .select("id, name, address, latitude, longitude, materials, photo_url, notes")
      .then(({ data }) => {
        if (data) setUserPoints(data as RecyclingPoint[]);
      });

    const channel = supabase
      .channel("recycling_points_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "recycling_points" }, () => {
        supabase
          .from("recycling_points")
          .select("id, name, address, latitude, longitude, materials, photo_url, notes")
          .then(({ data }) => data && setUserPoints(data as RecyclingPoint[]));
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const comunaMapPoints: RecyclingPoint[] = getAllComunaMapPoints().map((p) => ({
    id: p.id,
    name: p.name,
    address: `${p.address} · ${p.comuna}`,
    latitude: p.latitude,
    longitude: p.longitude,
    materials: p.materials,
    photo_url: null,
    notes: p.type,
  }));

  const allPoints = [...demoPoints, ...comunaMapPoints, ...userPoints];

  // Aplicar filtro por material si está activo
  const filteredPoints = materialFilter
    ? allPoints.filter((p) =>
        p.materials.some((m) =>
          m.toLowerCase().includes(materialFilter.toLowerCase())
        )
      )
    : allPoints;

  const pointsToShow = searchLocation
    ? filteredPoints
        .map((p) => ({
          ...p,
          distanceKm: haversineKm(
            { lat: searchLocation.lat, lng: searchLocation.lng },
            { lat: p.latitude, lng: p.longitude }
          ),
        }))
        .sort((a, b) => a.distanceKm - b.distanceKm)
        .slice(0, 8)
    : filteredPoints;

  return (
    <div className="relative w-full aspect-[16/10] md:aspect-[16/7] rounded-2xl overflow-hidden shadow-eco border border-border">
      {/* Badge de filtro activo sobre el mapa */}
      {materialFilter && (
        <div className="absolute top-3 left-3 z-[1000] bg-card/95 backdrop-blur-sm border border-primary/30 rounded-full px-3 py-1 text-xs font-semibold text-primary shadow-sm">
          Mostrando: {materialFilter} · {pointsToShow.length} puntos
        </div>
      )}

      <MapContainer
        center={[-33.4489, -70.6693]}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
      >
        <FlyTo location={searchLocation} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {searchLocation && (
          <Marker position={[searchLocation.lat, searchLocation.lng]} icon={userIcon}>
            <Popup>
              <div className="space-y-1">
                <h3 className="font-bold">Tu ubicación</h3>
                <p className="text-xs text-muted-foreground">{searchLocation.displayName}</p>
              </div>
            </Popup>
          </Marker>
        )}
        {pointsToShow.map((p) => {
          const dist = (p as any).distanceKm ?? null;
          return (
            <Marker key={p.id} position={[p.latitude, p.longitude]}>
              <Popup>
                <div className="space-y-1 min-w-[180px]">
                  <h3 className="font-bold">{p.name}</h3>
                  {p.address && <p className="text-xs text-muted-foreground">{p.address}</p>}
                  {dist !== null && (
                    <p className="text-xs font-semibold text-primary">A {(dist as number).toFixed(2)} km</p>
                  )}
                  {p.photo_url && (
                    <img src={p.photo_url} alt={p.name} className="w-full h-24 object-cover rounded my-1" />
                  )}
                  {p.materials.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {p.materials.map((m) => (
                        <span
                          key={m}
                          className={`text-[10px] px-2 py-0.5 rounded-full ${
                            materialFilter && m.toLowerCase().includes(materialFilter.toLowerCase())
                              ? "bg-primary text-primary-foreground font-semibold"
                              : "bg-secondary"
                          }`}
                        >
                          {m}
                        </span>
                      ))}
                    </div>
                  )}
                  {p.notes && <p className="text-xs pt-1">{p.notes}</p>}
                  {searchLocation && (
                    <a
                      href={directionsUrl(
                        { lat: searchLocation.lat, lng: searchLocation.lng },
                        { lat: p.latitude, lng: p.longitude }
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-2 text-xs font-semibold text-primary underline"
                    >
                      Cómo llegar →
                    </a>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default MapView;
