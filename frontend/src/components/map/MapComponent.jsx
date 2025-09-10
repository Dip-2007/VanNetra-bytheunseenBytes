import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Popup, CircleMarker, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Sidebar from '../layout/Sidebar';

// Fix for default marker icon issue in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png'
});

// ✅ Fetch forest data from Global Forest Watch API
const fetchForestData = async (bbox) => {
  const url = `https://production-api.globalforestwatch.org/glad-alerts?geom=${encodeURIComponent(
    JSON.stringify(bbox)
  )}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer YOUR_GFW_API_KEY` // replace with your GFW API key
    }
  });
  const data = await res.json();
  return data; // GeoJSON with alert polygons
};

const MapComponent = ({ user, mockData }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeLayers, setActiveLayers] = useState(['fraRecords']);
  const [activeFilters, setActiveFilters] = useState({
    state: 'All States',
    claimType: 'All Types',
    claimStatus: 'All Statuses'
  });
  const [forestGeoJson, setForestGeoJson] = useState(null);

  const mapRef = useRef(null);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleToggleLayer = (layerId) => {
    setActiveLayers((prev) =>
      prev.includes(layerId) ? prev.filter((id) => id !== layerId) : [...prev, layerId]
    );
  };

  const handleFilterChange = (filterName, value) => {
    setActiveFilters((prev) => ({
      ...prev,
      [filterName]: value
    }));
  };

  // ✅ Fetch forest alerts for India bounding box
  useEffect(() => {
    const indiaBBox = {
      type: 'Polygon',
      coordinates: [
        [
          [68.17665, 6.554607], // SW
          [97.40256, 6.554607], // SE
          [97.40256, 37.097],   // NE
          [68.17665, 37.097],   // NW
          [68.17665, 6.554607]  // back to SW
        ]
      ]
    };

    fetchForestData(indiaBBox).then((data) => {
      setForestGeoJson(data);
    });
  }, []);

  // Filter FRA records
  const filteredRecords = mockData?.fraRecords.filter((record) => {
    if (activeFilters.state !== 'All States' && record.state !== activeFilters.state) return false;
    if (activeFilters.claimType !== 'All Types' && record.claimType !== activeFilters.claimType) return false;
    if (activeFilters.claimStatus !== 'All Statuses' && record.claimStatus !== activeFilters.claimStatus) return false;
    return true;
  });

  // Marker color by status
  const getMarkerColor = (status) => {
    switch (status) {
      case 'Approved': return '#22c55e';
      case 'Pending': return '#f59e0b';
      case 'Rejected': return '#ef4444';
      default: return '#3b82f6';
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] min-w-full">
      {/* Sidebar */}
      <Sidebar
        layers={mockData?.gisLayers}
        onToggleLayer={handleToggleLayer}
        onFilterChange={handleFilterChange}
        activeFilters={activeFilters}
        activeLayers={activeLayers}
        isOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
      />

      {/* Map */}
      <div className="flex-1 relative">
        {!sidebarOpen && (
          <button
            onClick={toggleSidebar}
            className="absolute top-4 left-4 z-[1000] bg-white p-2 rounded-md shadow-md"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        )}

        <MapContainer
          center={[20.5937, 78.9629]} // Center of India
          zoom={5}
          style={{ height: "100%", width: "100%" }}
          whenCreated={(mapInstance) => {
            mapRef.current = mapInstance;
          }}
        >
          {/* ✅ Base map tiles */}
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* ✅ FRA Records */}
          {activeLayers.includes('fraRecords') &&
            filteredRecords?.map((record) => (
              <CircleMarker
                key={record.id}
                center={record.coordinates}
                radius={8}
                pathOptions={{
                  fillColor: getMarkerColor(record.claimStatus),
                  color: '#fff',
                  weight: 2,
                  opacity: 1,
                  fillOpacity: 0.8
                }}
              >
                <Popup>
                  <div>
                    <h3 className="font-bold text-lg mb-1">{record.name}</h3>
                    <p>{record.village}, {record.district}</p>
                    <p><b>Type:</b> {record.claimType}</p>
                    <p><b>Area:</b> {record.area} hectares</p>
                    <p><b>Status:</b> {record.claimStatus}</p>
                  </div>
                </Popup>
              </CircleMarker>
            ))}

          {/* ✅ Forest Cover from GFW */}
          {activeLayers.includes('forestCover') && forestGeoJson && (
            <GeoJSON
              data={forestGeoJson}
              style={{ color: 'green', weight: 2, fillOpacity: 0.4 }}
              onEachFeature={(feature, layer) => {
                layer.bindPopup(`<b>Forest Alert</b><br/>ID: ${feature.id || 'N/A'}`);
              }}
            />
          )}
        </MapContainer>
      </div>
    </div>
  );
};

export default MapComponent;