import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useAppStore } from '../stores/appStore';

const touristMarkers = [
  { coords: [-12.0464, -77.0299] as [number, number], name: 'Plaza de Armas', icon: '🏛️' },
  { coords: [-12.0789, -77.0756] as [number, number], name: 'Museo Larco', icon: '🏺' },
  { coords: [-12.1215, -77.0285] as [number, number], name: 'Parque Kennedy', icon: '🌳' },
  { coords: [-12.1294, -77.0373] as [number, number], name: 'Malecón', icon: '🌊' },
  { coords: [-12.0607, -77.0328] as [number, number], name: 'Parque de la Reserva', icon: '⛲' },
  { coords: [-12.1196, -77.0282] as [number, number], name: 'Huaca Pucllana', icon: '🏺' },
  { coords: [-12.1433, -77.0218] as [number, number], name: 'Barranco', icon: '🎨' },
  { coords: [-12.0219, -77.1143] as [number, number], name: 'Aeropuerto', icon: '✈️' },
];

export default function MapView() {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const { userLocation, currentCity, selectedDestination, selectedRoute } = useAppStore();

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const center: [number, number] = currentCity?.center || [-12.0464, -77.0428];
    const zoom = currentCity?.zoom || 13;

    mapRef.current = L.map(mapContainerRef.current, {
      center,
      zoom,
      zoomControl: false,
      attributionControl: false,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
    }).addTo(mapRef.current);

    L.control.zoom({ position: 'bottomright' }).addTo(mapRef.current);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    const center: [number, number] = currentCity?.center || [-12.0464, -77.0428];
    mapRef.current.setView(center, currentCity?.zoom || 13);
  }, [currentCity]);

  useEffect(() => {
    if (!mapRef.current || !userLocation) return;

    const userIcon = L.divIcon({
      className: 'custom-user-marker',
      html: `<div style="width:20px;height:20px;background:#3b82f6;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });

    const marker = L.marker(userLocation, { icon: userIcon }).addTo(mapRef.current);
    return () => { mapRef.current?.removeLayer(marker); };
  }, [userLocation]);

  useEffect(() => {
    if (!mapRef.current || !selectedDestination) return;

    const destIcon = L.divIcon({
      className: 'custom-dest-marker',
      html: `<div style="width:32px;height:32px;background:#dc2626;border:3px solid white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;"><span style="transform:rotate(45deg);font-size:14px;">📍</span></div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
    });

    const marker = L.marker(selectedDestination.coords, { icon: destIcon }).addTo(mapRef.current);
    return () => { mapRef.current?.removeLayer(marker); };
  }, [selectedDestination]);

  // Add tourist attraction markers
  useEffect(() => {
    if (!mapRef.current) return;
    const markers: L.Marker[] = [];

    touristMarkers.forEach((spot) => {
      const icon = L.divIcon({
        className: 'tourist-marker',
        html: `<div style="width:28px;height:28px;background:white;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.2);font-size:14px;border:2px solid #e2e8f0;">${spot.icon}</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });
      const marker = L.marker(spot.coords, { icon })
        .bindPopup(`<strong>${spot.name}</strong>`)
        .addTo(mapRef.current!);
      markers.push(marker);
    });

    return () => { markers.forEach(m => mapRef.current?.removeLayer(m)); };
  }, [currentCity]);

  useEffect(() => {
    if (!mapRef.current || !selectedRoute || !userLocation || !selectedDestination) return;

    const allCoords: [number, number][] = [];

    selectedRoute.steps.forEach((step) => {
      if (step.pathCoords) {
        allCoords.push(...step.pathCoords);
      }
      if (step.fromCoords) allCoords.push(step.fromCoords);
      if (step.toCoords) allCoords.push(step.toCoords);
    });

    if (allCoords.length < 2) {
      allCoords.push(userLocation, selectedDestination.coords);
    }

    const polyline = L.polyline(allCoords, {
      color: '#0f766e',
      weight: 5,
      opacity: 0.8,
    }).addTo(mapRef.current);

    return () => { mapRef.current?.removeLayer(polyline); };
  }, [selectedRoute]);

  return (
    <div ref={mapContainerRef} className="w-full h-full" />
  );
}
