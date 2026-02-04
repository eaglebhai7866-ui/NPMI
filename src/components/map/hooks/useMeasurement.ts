import { useState, useRef, useCallback, useEffect } from "react";
import maplibregl from "maplibre-gl";
import type { MeasureMode } from "../types";
import { calculateLineDistance, calculatePolygonArea, calculateDistance } from "../utils";

interface SegmentMeasurement {
  from: number;
  to: number;
  distance: number;
}

interface UseMeasurementProps {
  map: maplibregl.Map | null;
}

export const useMeasurement = ({ map }: UseMeasurementProps) => {
  const [measureMode, setMeasureMode] = useState<MeasureMode>("none");
  const [measurePoints, setMeasurePoints] = useState<[number, number][]>([]);
  const [measureResult, setMeasureResult] = useState<{ distance?: number; area?: number; segments?: SegmentMeasurement[] } | null>(null);
  const measureMarkersRef = useRef<maplibregl.Marker[]>([]);
  const segmentLabelsRef = useRef<maplibregl.Marker[]>([]);
  const removePointRef = useRef<((index: number) => void) | null>(null);

  // Global click handler for delete buttons using event delegation
  useEffect(() => {
    const handleDeleteClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const deleteBtn = target.closest('button[data-point-index]') as HTMLButtonElement;
      
      if (deleteBtn && removePointRef.current) {
        e.stopPropagation();
        const index = parseInt(deleteBtn.getAttribute('data-point-index') || '0');
        removePointRef.current(index);
      }
    };

    document.addEventListener('click', handleDeleteClick, true);
    
    return () => {
      document.removeEventListener('click', handleDeleteClick, true);
    };
  }, []);

  const toggleMeasureMode = useCallback((mode: "distance" | "area") => {
    if (measureMode === mode) {
      setMeasureMode("none");
      clearMeasurement();
    } else {
      setMeasureMode(mode);
      clearMeasurement();
    }
  }, [measureMode]);

  const clearMeasurement = useCallback(() => {
    setMeasurePoints([]);
    setMeasureResult(null);
    
    measureMarkersRef.current.forEach(marker => marker.remove());
    measureMarkersRef.current = [];
    
    segmentLabelsRef.current.forEach(label => label.remove());
    segmentLabelsRef.current = [];
    
    if (map) {
      if (map.getLayer("measure-line")) {
        map.removeLayer("measure-line");
      }
      if (map.getLayer("measure-fill")) {
        map.removeLayer("measure-fill");
      }
      if (map.getSource("measure-geojson")) {
        map.removeSource("measure-geojson");
      }
    }
  }, [map]);

  const updateMeasurementVisualization = useCallback((points: [number, number][]) => {
    if (!map || points.length === 0) return;

    const geojsonData: GeoJSON.FeatureCollection = {
      type: "FeatureCollection",
      features: []
    };

    if (measureMode === "distance" && points.length >= 2) {
      // Line only - no polygon
      geojsonData.features.push({
        type: "Feature",
        properties: { type: "line" },
        geometry: {
          type: "LineString",
          coordinates: points
        }
      });
    } else if (measureMode === "area" && points.length >= 3) {
      // Polygon with fill
      geojsonData.features.push({
        type: "Feature",
        properties: { type: "polygon" },
        geometry: {
          type: "Polygon",
          coordinates: [[...points, points[0]]]
        }
      });
    }

    if (!map.getSource("measure-geojson")) {
      map.addSource("measure-geojson", {
        type: "geojson",
        data: geojsonData
      });

      // Fill layer - only for polygons
      map.addLayer({
        id: "measure-fill",
        type: "fill",
        source: "measure-geojson",
        paint: {
          "fill-color": "#8b5cf6",
          "fill-opacity": 0.2
        },
        filter: ["==", ["get", "type"], "polygon"]
      });

      // Line layer - for both lines and polygon borders
      map.addLayer({
        id: "measure-line",
        type: "line",
        source: "measure-geojson",
        paint: {
          "line-color": "#8b5cf6",
          "line-width": 3,
          "line-dasharray": [2, 1]
        }
      });
    } else {
      (map.getSource("measure-geojson") as maplibregl.GeoJSONSource).setData(geojsonData);
    }
  }, [map, measureMode]);

  const updateSegmentLabels = useCallback((points: [number, number][], segments: SegmentMeasurement[]) => {
    if (!map) return;

    // Remove old labels
    segmentLabelsRef.current.forEach(label => label.remove());
    segmentLabelsRef.current = [];

    // Add segment labels
    segments.forEach((segment, index) => {
      const fromPoint = points[segment.from];
      const toPoint = points[segment.to];
      
      // Calculate midpoint
      const midLng = (fromPoint[0] + toPoint[0]) / 2;
      const midLat = (fromPoint[1] + toPoint[1]) / 2;

      // Format distance
      const distanceText = segment.distance >= 1000
        ? `${(segment.distance / 1000).toFixed(2)} km`
        : `${segment.distance.toFixed(0)} m`;

      // Create label element
      const el = document.createElement("div");
      el.className = "segment-label";
      el.innerHTML = `
        <div class="bg-purple-600 text-white px-2 py-1 rounded-lg text-xs font-semibold shadow-lg border border-purple-400 whitespace-nowrap animate-fade-in">
          ${distanceText}
        </div>
      `;

      const label = new maplibregl.Marker({ element: el, anchor: "center" })
        .setLngLat([midLng, midLat])
        .addTo(map);

      segmentLabelsRef.current.push(label);
    });
  }, [map]);

  // Handle map click for measurement
  useEffect(() => {
    if (!map || measureMode === "none") return;

    const handleClick = (e: maplibregl.MapMouseEvent) => {
      // Don't add point if clicking on a marker or delete button
      const target = e.originalEvent.target as HTMLElement;
      if (target.closest('.measure-marker') || target.closest('button')) return;
      
      const point: [number, number] = [e.lngLat.lng, e.lngLat.lat];
      
      setMeasurePoints(prev => {
        const newPoints = [...prev, point];
        const pointIndex = newPoints.length - 1;
        
        // Add draggable marker with delete button
        const el = document.createElement("div");
        el.className = "measure-marker";
        el.setAttribute('data-marker-index', `${pointIndex}`);
        el.innerHTML = `
          <div class="relative group">
            <div class="w-6 h-6 bg-purple-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center transform transition-transform hover:scale-110 animate-scale-in cursor-move">
              <span class="text-[10px] text-white font-bold">${newPoints.length}</span>
            </div>
            <button class="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600 flex items-center justify-center text-xs font-bold" data-point-index="${pointIndex}">×</button>
          </div>
        `;
        
        const marker = new maplibregl.Marker({ 
          element: el, 
          draggable: true,
          anchor: 'center'
        })
          .setLngLat(point)
          .addTo(map);
        
        // Handle marker drag
        marker.on('dragend', () => {
          const lngLat = marker.getLngLat();
          const markerIndex = measureMarkersRef.current.indexOf(marker);
          
          setMeasurePoints(prevPoints => {
            const updatedPoints = [...prevPoints];
            updatedPoints[markerIndex] = [lngLat.lng, lngLat.lat];
            
            // Recalculate segments
            const segments: SegmentMeasurement[] = [];
            
            if (measureMode === "distance" && updatedPoints.length >= 2) {
              for (let i = 0; i < updatedPoints.length - 1; i++) {
                const distance = calculateDistance(
                  updatedPoints[i][1], updatedPoints[i][0],
                  updatedPoints[i + 1][1], updatedPoints[i + 1][0]
                );
                segments.push({ from: i, to: i + 1, distance });
              }
              
              const totalDistance = calculateLineDistance(updatedPoints);
              setMeasureResult({ distance: totalDistance, segments });
              updateSegmentLabels(updatedPoints, segments);
              
            } else if (measureMode === "area" && updatedPoints.length >= 3) {
              for (let i = 0; i < updatedPoints.length; i++) {
                const nextIndex = (i + 1) % updatedPoints.length;
                const distance = calculateDistance(
                  updatedPoints[i][1], updatedPoints[i][0],
                  updatedPoints[nextIndex][1], updatedPoints[nextIndex][0]
                );
                segments.push({ from: i, to: nextIndex, distance });
              }
              
              const area = calculatePolygonArea(updatedPoints);
              setMeasureResult({ area, segments });
              updateSegmentLabels(updatedPoints, segments);
            }
            
            updateMeasurementVisualization(updatedPoints);
            return updatedPoints;
          });
        });
        
        measureMarkersRef.current.push(marker);
        
        // Calculate segments
        const segments: SegmentMeasurement[] = [];
        
        if (measureMode === "distance" && newPoints.length >= 2) {
          // Calculate each segment for line
          for (let i = 0; i < newPoints.length - 1; i++) {
            const distance = calculateDistance(
              newPoints[i][1], newPoints[i][0],
              newPoints[i + 1][1], newPoints[i + 1][0]
            );
            segments.push({ from: i, to: i + 1, distance });
          }
          
          const totalDistance = calculateLineDistance(newPoints);
          setMeasureResult({ distance: totalDistance, segments });
          updateSegmentLabels(newPoints, segments);
          
        } else if (measureMode === "area" && newPoints.length >= 3) {
          // Calculate each side of polygon
          for (let i = 0; i < newPoints.length; i++) {
            const nextIndex = (i + 1) % newPoints.length;
            const distance = calculateDistance(
              newPoints[i][1], newPoints[i][0],
              newPoints[nextIndex][1], newPoints[nextIndex][0]
            );
            segments.push({ from: i, to: nextIndex, distance });
          }
          
          const area = calculatePolygonArea(newPoints);
          setMeasureResult({ area, segments });
          updateSegmentLabels(newPoints, segments);
        }
        
        updateMeasurementVisualization(newPoints);
        
        return newPoints;
      });
    };

    map.on("click", handleClick);
    map.getCanvas().style.cursor = "crosshair";

    return () => {
      map.off("click", handleClick);
      map.getCanvas().style.cursor = "";
    };
  }, [map, measureMode, updateMeasurementVisualization, updateSegmentLabels]);

  const removePoint = useCallback((index: number) => {
    // Remove marker first
    if (measureMarkersRef.current[index]) {
      measureMarkersRef.current[index].remove();
    }
    measureMarkersRef.current = measureMarkersRef.current.filter((_, i) => i !== index);
    
    setMeasurePoints(prev => {
      const newPoints = prev.filter((_, i) => i !== index);
      
      // Update all remaining markers with new numbers and positions
      measureMarkersRef.current.forEach((marker, i) => {
        const el = marker.getElement();
        const span = el.querySelector("span");
        
        if (span) {
          span.textContent = `${i + 1}`;
        }
        
        // Update delete button data attribute
        const deleteBtn = el.querySelector("button");
        if (deleteBtn) {
          deleteBtn.setAttribute('data-point-index', `${i}`);
        }
      });
      
      // Recalculate segments
      if (newPoints.length >= 2) {
        const segments: SegmentMeasurement[] = [];
        
        if (measureMode === "distance") {
          for (let i = 0; i < newPoints.length - 1; i++) {
            const distance = calculateDistance(
              newPoints[i][1], newPoints[i][0],
              newPoints[i + 1][1], newPoints[i + 1][0]
            );
            segments.push({ from: i, to: i + 1, distance });
          }
          
          const totalDistance = calculateLineDistance(newPoints);
          setMeasureResult({ distance: totalDistance, segments });
          updateSegmentLabels(newPoints, segments);
          
        } else if (measureMode === "area" && newPoints.length >= 3) {
          for (let i = 0; i < newPoints.length; i++) {
            const nextIndex = (i + 1) % newPoints.length;
            const distance = calculateDistance(
              newPoints[i][1], newPoints[i][0],
              newPoints[nextIndex][1], newPoints[nextIndex][0]
            );
            segments.push({ from: i, to: nextIndex, distance });
          }
          
          const area = calculatePolygonArea(newPoints);
          setMeasureResult({ area, segments });
          updateSegmentLabels(newPoints, segments);
        }
        
        updateMeasurementVisualization(newPoints);
      } else {
        // Less than 2 points - clear everything
        setMeasureResult(null);
        segmentLabelsRef.current.forEach(label => label.remove());
        segmentLabelsRef.current = [];
        
        // Clear visualization
        if (map) {
          if (map.getLayer("measure-line")) {
            map.removeLayer("measure-line");
          }
          if (map.getLayer("measure-fill")) {
            map.removeLayer("measure-fill");
          }
          if (map.getSource("measure-geojson")) {
            map.removeSource("measure-geojson");
          }
        }
      }
      
      return newPoints;
    });
  }, [map, measureMode, updateMeasurementVisualization, updateSegmentLabels]);

  // Update ref whenever removePoint changes
  useEffect(() => {
    removePointRef.current = removePoint;
  }, [removePoint]);

  return {
    measureMode,
    measurePoints,
    measureResult,
    toggleMeasureMode,
    clearMeasurement,
    removePoint,
  };
};
