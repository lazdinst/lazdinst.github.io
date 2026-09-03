import { describe, expect, it } from "vitest";
import { bearingDeg, destinationPoint, haversineM, headingDelta } from "./haversine";
import { createProjection } from "./projection";
import { pointInPolygon } from "./polygon";

describe("geo", () => {
  it("haversine matches a known distance", () => {
    // Moss Landing harbor to Castroville, roughly 5.6 km.
    const d = haversineM({ lat: 36.805, lng: -121.786 }, { lat: 36.766, lng: -121.755 });
    expect(d).toBeGreaterThan(5000);
    expect(d).toBeLessThan(6000);
  });

  it("bearing points east for a pure longitude increase", () => {
    const b = bearingDeg({ lat: 36.79, lng: -121.78 }, { lat: 36.79, lng: -121.7 });
    expect(Math.abs(b - 90)).toBeLessThan(0.1);
  });

  it("destination point round-trips through haversine and bearing", () => {
    const origin = { lat: 36.79, lng: -121.78 };
    const dest = destinationPoint(origin, 37, 3200);
    expect(Math.abs(haversineM(origin, dest) - 3200)).toBeLessThan(0.5);
    expect(Math.abs(bearingDeg(origin, dest) - 37)).toBeLessThan(0.05);
  });

  it("projection round-trips to sub-millimeter precision", () => {
    const projection = createProjection({ lat: 36.79, lng: -121.78 });
    const point = { lat: 36.83, lng: -121.72 };
    const back = projection.toLatLng(projection.toXY(point));
    expect(Math.abs(back.lat - point.lat)).toBeLessThan(1e-9);
    expect(Math.abs(back.lng - point.lng)).toBeLessThan(1e-9);
    const xy = projection.toXY(point);
    expect(Math.abs(Math.hypot(xy.x, xy.y) - haversineM(projection.center, point))).toBeLessThan(5);
  });

  it("point in polygon", () => {
    const square = [
      { lat: 0, lng: 0 },
      { lat: 0, lng: 1 },
      { lat: 1, lng: 1 },
      { lat: 1, lng: 0 },
    ];
    expect(pointInPolygon({ lat: 0.5, lng: 0.5 }, square)).toBe(true);
    expect(pointInPolygon({ lat: 1.5, lng: 0.5 }, square)).toBe(false);
  });

  it("heading delta wraps", () => {
    expect(headingDelta(350, 10)).toBe(20);
    expect(headingDelta(10, 350)).toBe(-20);
  });
});
