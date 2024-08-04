// App.js

import React, { useRef, useState } from "react";
import { MapContainer, TileLayer, useMapEvents, CircleMarker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from 'leaflet';

// Using an ES6 transpiler like Babel -- getting react rangeslider to control the alpha 
//import Slider from 'react-rangeslider'

// To include the default styles
//import 'react-rangeslider/lib/index.css'

const hostname = "https://samyooole.dev/"

function MapEventHandler({ onMapChange }) {
  const map = useMapEvents({
    moveend: () => {
      const center = map.getCenter();
      const bounds = map.getBounds();
      const zoom = map.getZoom();
      onMapChange(center, bounds, zoom);
    },
    zoomend: () => {
      const center = map.getCenter();
      const bounds = map.getBounds();
      const zoom = map.getZoom();
      onMapChange(center, bounds, zoom);
    }
  });
  return null;
}

const CustomTileLayer = ( {implementedalphaValue} ) => {
  const url = "./tiles/{z}/{x}/{y}.png";
  
  const customGetTileUrl = (coords) => {
    const zoom = Math.min(coords.z, 12);
    const scale = Math.pow(2, coords.z - zoom);
    
    const newCoords = {
      x: Math.floor(coords.x / scale),
      y: Math.floor(coords.y / scale),
      z: zoom
    };
    
    return L.Util.template(url, {...newCoords});
  };

  return (
    <TileLayer
      url={url}
      tileSize={256}
      minZoom={1}
      minNativeZoom={7}
      maxNativeZoom={12}
      maxZoom={20}
      getTileUrl={customGetTileUrl}
      opacity={implementedalphaValue/100}
    />
  );
};

const SimpleMap = () => {
  const mapRef = useRef(null);
  const latitude = 35.5;
  const longitude = -79.390926;
  const [data, setData] = useState([]);
  const [alphaValue, setalphaValue] = useState(90);

  const handleMapChange = async (center, bounds, zoom) => {
    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();

    const lonmin = sw.lng;
    const lonmax = ne.lng;
    const latmin = sw.lat;
    const latmax = ne.lat;
    console.log(zoom);

    if (zoom > 15) {
      setalphaValue(60);
      try {
        const response = await fetch(`${hostname}?lonmin=${lonmin}&lonmax=${lonmax}&latmin=${latmin}&latmax=${latmax}`, {
          method: "GET"
        });
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    } else {
      setData([]);
    }

    if (zoom <= 15){
      setalphaValue(90);
    }
  };

  const handleSliderChange = (sliderValue) => {
    setalphaValue(sliderValue);
  };

  const getColor = (party) => {
    switch (party) {
      case 'REP':
        return 'red';
      case 'DEM':
        return 'blue';
      case 'UNA':
        return 'grey';
      default:
        return 'grey'; // for any other party
    }
  };

  return (
    <div style={{ position: "relative", height: "100vh", width: "100vw" }}>
      <MapContainer
        center={[latitude, longitude]}
        zoom={8}
        maxZoom={18}
        ref={mapRef}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
  
        <CustomTileLayer
        implementedalphaValue = {alphaValue} />
        <MapEventHandler onMapChange={handleMapChange} />
        {data.map((voter) => (
          <CircleMarker
            key={voter.ncid}
            center={[voter.latitude, voter.longitude]}
            radius={5}
            fillColor={getColor(voter.party)}
            color={getColor(voter.party)}
            weight={1}
            opacity={1}
            fillOpacity={0.7}
          />
        ))}
      </MapContainer>
      

      
      
      
      
    </div>
  );
};


export default SimpleMap;




/* put this back in when you can figure out a slider that works
<div 
        style={{ 
          position: "absolute", 
          top: "75px", 
          left: "21px", 
          zIndex: 1000 
        }}
      >
        <Slider
          min={0}
          max={100}
          value={alphaValue}
          orientation='vertical'
          tooltip = {false}
          onChange={handleSliderChange}
          style={{ height: '100%' }}
        />
        </div>
*/