"use client";

import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import { FeatureCollection } from "geojson";

interface ThailandMapProps {
  districtSummary: { [key: string]: number };
}

const ThailandMap: React.FC<ThailandMapProps> = ({ districtSummary }) => {
  const [geoJsonData, setGeoJsonData] = useState<FeatureCollection | null>(
    null
  );

  useEffect(() => {
    const fetchGeoJson = async () => {
      const response = await fetch("/thailand-districts.geojson");
      const data = await response.json();
      setGeoJsonData(data);
    };

    fetchGeoJson();
  }, []);

  const getColor = (districtName: string) => {
    const count = districtSummary[districtName] || 0;
    if (count > 100) return "#800026";
    if (count > 50) return "#BD0026";
    if (count > 20) return "#E31A1C";
    if (count > 10) return "#FC4E2A";
    if (count > 5) return "#FD8D3C";
    if (count > 2) return "#FEB24C";
    if (count > 0) return "#FED976";
    return "#FFEDA0";
  };

  const style = (feature: GeoJSON.Feature) => {
    return {
      fillColor: getColor(feature.properties.amp_en),
      weight: 1,
      opacity: 1,
      color: "white",
      dashArray: "3",
      fillOpacity: 0.7,
    };
  };

  if (!geoJsonData) {
    return <div>Loading map...</div>;
  }

  return (
    <MapContainer
      center={[13.7563, 100.5018]}
      zoom={6}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <GeoJSON data={geoJsonData} style={style} />
    </MapContainer>
  );
};

export default ThailandMap;