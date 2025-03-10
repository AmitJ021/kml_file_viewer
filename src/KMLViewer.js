import React, { useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { parseString } from "xml2js";

const KMLViewer = () => {
  const [kmlData, setKmlData] = useState(null);
  const [summary, setSummary] = useState(null);
  const [detailed, setDetailed] = useState(null);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        parseString(e.target.result, (err, result) => {
          if (err) {
            console.error("Error parsing KML", err);
            return;
          }
          processKML(result);
        });
      };
      reader.readAsText(file);
    }
  };

  const processKML = (data) => {
    let elements = {
      Placemark: 0,
      Point: 0,
      LineString: 0,
      MultiLineString: 0,
    };
    let totalLengths = {
      LineString: 0,
      MultiLineString: 0,
    };

    if (data.kml && data.kml.Document) {
      data.kml.Document[0].Placemark?.forEach((placemark) => {
        elements.Placemark++;
        if (placemark.Point) elements.Point++;
        if (placemark.LineString) {
          elements.LineString++;
          totalLengths.LineString += placemark.LineString[0].coordinates[0].length;
        }
        if (placemark.MultiLineString) {
          elements.MultiLineString++;
          totalLengths.MultiLineString += placemark.MultiLineString[0].coordinates[0].length;
        }
      });
    }

    setKmlData(data);
    setSummary(elements);
    setDetailed(totalLengths);
  };

  return (
    <div>
      <h2>KML File Viewer</h2>
      <input type="file" accept=".kml" onChange={handleFileUpload} />
      <button onClick={() => setSummary(summary)}>Summary</button>
      <button onClick={() => setDetailed(detailed)}>Detailed</button>
      
      {summary && (
        <div>
          <h3>Summary</h3>
          <table border="1">
            <thead>
              <tr>
                <th>Element Type</th>
                <th>Count</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(summary).map(([key, value]) => (
                <tr key={key}>
                  <td>{key}</td>
                  <td>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {detailed && (
        <div>
          <h3>Detailed</h3>
          <table border="1">
            <thead>
              <tr>
                <th>Element Type</th>
                <th>Total Length</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(detailed).map(([key, value]) => (
                <tr key={key}>
                  <td>{key}</td>
                  <td>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      <MapContainer center={[51.505, -0.09]} zoom={13} style={{ height: "500px", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      </MapContainer>
    </div>
  );
};

export default KMLViewer;
