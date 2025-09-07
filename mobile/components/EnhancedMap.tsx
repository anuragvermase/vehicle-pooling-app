// mobile/components/EnhancedMap.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Platform, View } from "react-native";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE, LatLng as RNLatLng } from "react-native-maps";
import { getRouteWithWaypoints, LatLng } from "../src/services/maps";

type Point = { lat: number; lng: number };

type EnhancedMapProps = {
  rides?: any[];
  selectedRide?: any | null;
  onRideSelect?: (ride: any) => void;
  center?: Point;
  zoom?: number; // hint; RN uses region deltas, we approximate
  showDirections?: boolean;
  origin?: Point | null;
  destination?: Point | null;
  viaPoints?: Point[];
  onMapPress?: (e: any) => void;
  isInteractive?: boolean;
  userLocation?: Point | null;
  style?: any;
  height?: number | string;
  onRouteInfo?: (info: { distanceText?: string; durationText?: string } | null) => void;
};

function toRegion(center: Point | undefined, zoom?: number) {
  const c = center ?? { lat: 12.9716, lng: 77.5946 };
  // crude zoom -> delta approximation
  const z = zoom ?? 11;
  const latitudeDelta = Math.max(0.02, 1 / Math.pow(2, (z - 8)));
  const longitudeDelta = latitudeDelta;
  return {
    latitude: c.lat,
    longitude: c.lng,
    latitudeDelta,
    longitudeDelta,
  };
}

function ridePosition(ride: any): Point | null {
  const c = ride?.startLocation?.coordinates || ride?.coordinates || null;
  if (c && typeof c.lat === "number" && typeof c.lng === "number") return c;
  if (typeof ride?.fromLat === "number" && typeof ride?.fromLng === "number") {
    return { lat: ride.fromLat, lng: ride.fromLng };
  }
  return null;
}

export default function EnhancedMap({
  rides = [],
  selectedRide = null,
  onRideSelect,
  center,
  zoom,
  showDirections = false,
  origin = null,
  destination = null,
  viaPoints = [],
  onMapPress,
  isInteractive = true,
  userLocation = null,
  style,
  height = 280,
  onRouteInfo,
}: EnhancedMapProps) {
  const mapRef = useRef<MapView | null>(null);
  const [routePoints, setRoutePoints] = useState<LatLng[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const initialRegion = useMemo(() => toRegion(center, zoom), [center, zoom]);

  // Fetch directions when asked
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setRoutePoints([]);
      if (showDirections && origin && destination) {
        try {
          const r = await getRouteWithWaypoints(origin, destination, viaPoints);
          if (!cancelled) {
            setRoutePoints(r.points);
            onRouteInfo?.({ distanceText: r.distanceText, durationText: r.durationText });
          }
          // fit route
          if (!cancelled && mapRef.current && r.points.length > 0) {
            mapRef.current.fitToCoordinates(r.points as RNLatLng[], {
              edgePadding: { top: 60, right: 60, bottom: 60, left: 60 },
              animated: true,
            });
          }
        } catch {}
      }
    })();
    return () => { cancelled = true; };
  }, [showDirections, origin?.lat, origin?.lng, destination?.lat, destination?.lng, JSON.stringify(viaPoints)]);

  const handleMarkerPress = useCallback((ride: any) => {
    const id = String(ride?._id || ride?.id || "");
    setSelectedId(id || null);
    onRideSelect?.(ride);
  }, [onRideSelect]);

  // compute markers
  const rideMarkers = useMemo(() => {
    return rides
      .map(r => ({ ride: r, pos: ridePosition(r) }))
      .filter(x => !!x.pos) as { ride: any; pos: Point }[];
  }, [rides]);

  const isIOS = Platform.OS === "ios";

  return (
    <View style={[{ width: "100%", height }, style]}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={{ flex: 1, borderRadius: 16, overflow: "hidden" }}
        initialRegion={initialRegion}
        onPress={onMapPress}
        scrollEnabled={isInteractive}
        zoomEnabled={isInteractive}
        rotateEnabled={isInteractive}
        pitchEnabled={isInteractive}
        showsPointsOfInterest={false}
      >
        {/* Directions polyline */}
        {routePoints.length > 0 && (
          <Polyline
            coordinates={routePoints as RNLatLng[]}
            strokeWidth={4}
            strokeColor={isIOS ? "#4F46E5" : "#4F46E5"}
          />
        )}

        {/* User location marker */}
        {userLocation && (
          <Marker
            coordinate={{ latitude: userLocation.lat, longitude: userLocation.lng }}
            title="You"
            pinColor="#4285F4"
          />
        )}

        {/* Ride markers */}
        {rideMarkers.map(({ ride, pos }) => {
          const id = String(ride?._id || ride?.id || Math.random());
          const isSel = selectedRide?._id === ride._id || selectedRide?.id === ride.id || selectedId === id;
          const price = ride.currentPrice || ride.pricePerSeat || ride.price || undefined;
          const title = `${ride?.startLocation?.name || ride?.from || "Ride"}`;
          return (
            <Marker
              key={id}
              coordinate={{ latitude: pos.lat, longitude: pos.lng }}
              title={title}
              description={price ? `₹${price}` : undefined}
              pinColor={isSel ? "#4F46E5" : "#10B981"}
              onPress={() => handleMarkerPress(ride)}
            />
          );
        })}

        {/* Via points markers */}
        {viaPoints.map((p, idx) => (
          <Marker
            key={`via-${idx}`}
            coordinate={{ latitude: p.lat, longitude: p.lng }}
            title={`Stop ${idx + 1}`}
            pinColor="#F59E0B"
          />
        ))}
      </MapView>
    </View>
  );
}
