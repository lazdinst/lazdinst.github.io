import type { OperatingArea, Zone } from "../types";

/**
 * A 15 km box on Monterey Bay around Moss Landing, CA. Sea to the west,
 * Elkhorn Slough wetlands to the north-east, Castroville in the middle,
 * Fort Ord hills to the south. Terrain patches and zones are hand-drawn
 * approximations meant to line up with the basemap, not survey data.
 */
/** Shipped zone set; the runtime restores these on "reset zones". */
export const DEFAULT_ZONES: Zone[] = [
  {
    id: "nf-power",
    name: "Moss Landing power station",
    type: "no_fly",
    polygon: [
      { lat: 36.81, lng: -121.788 },
      { lat: 36.81, lng: -121.772 },
      { lat: 36.796, lng: -121.772 },
      { lat: 36.796, lng: -121.788 },
    ],
  },
  {
    id: "rs-wildlife",
    name: "Wildlife closure",
    type: "restricted",
    polygon: [
      { lat: 36.822, lng: -121.762 },
      { lat: 36.826, lng: -121.752 },
      { lat: 36.816, lng: -121.748 },
      { lat: 36.812, lng: -121.76 },
    ],
  },
  {
    id: "hz-range",
    name: "Live-fire range",
    type: "hazard",
    polygon: [
      { lat: 36.742, lng: -121.762 },
      { lat: 36.742, lng: -121.735 },
      { lat: 36.73, lng: -121.735 },
      { lat: 36.73, lng: -121.762 },
    ],
  },
  {
    id: "sw-bar",
    name: "Salinas river bar",
    type: "shallow_water",
    polygon: [
      { lat: 36.765, lng: -121.8 },
      { lat: 36.765, lng: -121.822 },
      { lat: 36.74, lng: -121.828 },
      { lat: 36.74, lng: -121.808 },
    ],
  },
  {
    id: "lc-nw",
    name: "NW comms shadow",
    type: "low_comms",
    polygon: [
      { lat: 36.853, lng: -121.858 },
      { lat: 36.853, lng: -121.83 },
      { lat: 36.825, lng: -121.83 },
      { lat: 36.825, lng: -121.858 },
    ],
  },
];

export const OPERATING_AREA: OperatingArea = {
  id: "monterey-bay",
  name: "Monterey Bay range",
  center: { lat: 36.79, lng: -121.78 },
  boundsSizeM: 15_000,
  cellSizeM: 60,
  seaPolygon: [
    { lat: 36.87, lng: -121.835 },
    { lat: 36.85, lng: -121.822 },
    { lat: 36.83, lng: -121.808 },
    { lat: 36.815, lng: -121.797 },
    { lat: 36.8, lng: -121.79 },
    { lat: 36.78, lng: -121.792 },
    { lat: 36.76, lng: -121.798 },
    { lat: 36.74, lng: -121.806 },
    { lat: 36.72, lng: -121.815 },
    { lat: 36.7, lng: -121.822 },
    { lat: 36.7, lng: -121.95 },
    { lat: 36.87, lng: -121.95 },
  ],
  terrainPatches: [
    {
      id: "wet-slough",
      name: "Elkhorn Slough",
      class: "wetland",
      polygon: [
        { lat: 36.808, lng: -121.784 },
        { lat: 36.818, lng: -121.77 },
        { lat: 36.832, lng: -121.752 },
        { lat: 36.826, lng: -121.74 },
        { lat: 36.812, lng: -121.748 },
        { lat: 36.802, lng: -121.765 },
        { lat: 36.8, lng: -121.78 },
      ],
    },
    {
      id: "urban-castroville",
      name: "Castroville",
      class: "urban",
      polygon: [
        { lat: 36.772, lng: -121.762 },
        { lat: 36.772, lng: -121.748 },
        { lat: 36.76, lng: -121.748 },
        { lat: 36.76, lng: -121.762 },
      ],
    },
    {
      id: "steep-ord",
      name: "Fort Ord hills",
      class: "steep",
      polygon: [
        { lat: 36.745, lng: -121.77 },
        { lat: 36.745, lng: -121.72 },
        { lat: 36.727, lng: -121.715 },
        { lat: 36.727, lng: -121.775 },
      ],
    },
    {
      id: "steep-prunedale",
      name: "Prunedale ridge",
      class: "steep",
      polygon: [
        { lat: 36.853, lng: -121.74 },
        { lat: 36.853, lng: -121.702 },
        { lat: 36.8, lng: -121.702 },
        { lat: 36.815, lng: -121.735 },
      ],
    },
  ],
  roads: [
    {
      id: "hwy-1",
      name: "Highway 1",
      halfWidthM: 90,
      points: [
        { lat: 36.853, lng: -121.822 },
        { lat: 36.84, lng: -121.805 },
        { lat: 36.82, lng: -121.792 },
        { lat: 36.805, lng: -121.787 },
        { lat: 36.79, lng: -121.786 },
        { lat: 36.775, lng: -121.788 },
        { lat: 36.76, lng: -121.792 },
        { lat: 36.745, lng: -121.797 },
        { lat: 36.727, lng: -121.803 },
      ],
    },
    {
      id: "hwy-156",
      name: "Highway 156",
      halfWidthM: 90,
      points: [
        { lat: 36.775, lng: -121.788 },
        { lat: 36.766, lng: -121.762 },
        { lat: 36.768, lng: -121.745 },
        { lat: 36.772, lng: -121.72 },
        { lat: 36.778, lng: -121.702 },
      ],
    },
    {
      id: "hwy-183",
      name: "Highway 183",
      halfWidthM: 90,
      points: [
        { lat: 36.76, lng: -121.755 },
        { lat: 36.745, lng: -121.745 },
        { lat: 36.73, lng: -121.735 },
      ],
    },
    {
      id: "depot-rd",
      name: "Depot road",
      halfWidthM: 70,
      points: [
        { lat: 36.782, lng: -121.735 },
        { lat: 36.772, lng: -121.742 },
        { lat: 36.768, lng: -121.748 },
      ],
    },
    {
      id: "farm-rd",
      name: "Farm road",
      halfWidthM: 70,
      points: [
        { lat: 36.782, lng: -121.735 },
        { lat: 36.8, lng: -121.712 },
      ],
    },
    {
      id: "rally-a-spur",
      name: "Rally A spur",
      halfWidthM: 70,
      points: [
        { lat: 36.836, lng: -121.802 },
        { lat: 36.838, lng: -121.79 },
      ],
    },
    {
      id: "ridge-track",
      name: "Ridge track",
      halfWidthM: 60,
      points: [
        { lat: 36.73, lng: -121.735 },
        { lat: 36.728, lng: -121.748 },
      ],
    },
  ],
  zones: DEFAULT_ZONES,
  relays: [
    { id: "rly-depot", name: "Depot mast", position: { lat: 36.782, lng: -121.735 }, rangeM: 5500 },
    { id: "rly-dock", name: "Dock mast", position: { lat: 36.806, lng: -121.786 }, rangeM: 5000 },
    { id: "rly-ridge", name: "Ridge repeater", position: { lat: 36.733, lng: -121.725 }, rangeM: 6500 },
  ],
  depots: [
    {
      id: "depot-alpha",
      name: "Depot Alpha",
      position: { lat: 36.782, lng: -121.735 },
      domains: ["air", "ground"],
    },
    {
      id: "moss-dock",
      name: "Moss Landing dock",
      position: { lat: 36.808, lng: -121.796 },
      domains: ["sea"],
    },
  ],
  waypoints: [
    { id: "rally-a", label: "RALLY-A", position: { lat: 36.838, lng: -121.79 }, domains: ["air", "ground"] },
    { id: "rally-b", label: "RALLY-B", position: { lat: 36.748, lng: -121.78 }, domains: ["air", "ground"] },
    { id: "ridge-op", label: "RIDGE-OP", position: { lat: 36.728, lng: -121.748 }, domains: ["air", "ground"] },
    { id: "farm-east", label: "FARM-EAST", position: { lat: 36.8, lng: -121.712 }, domains: ["air", "ground"] },
    { id: "overlook", label: "OVERLOOK", position: { lat: 36.835, lng: -121.735 }, domains: ["air"] },
    { id: "shoal-1", label: "SHOAL-1", position: { lat: 36.79, lng: -121.83 }, domains: ["sea", "air"] },
    { id: "channel-n", label: "CHANNEL-N", position: { lat: 36.845, lng: -121.845 }, domains: ["sea", "air"] },
    { id: "buoy-s", label: "BUOY-S", position: { lat: 36.735, lng: -121.84 }, domains: ["sea", "air"] },
  ],
  surveyAreas: [
    {
      id: "svy-farm",
      label: "Farm block",
      polygon: [
        { lat: 36.806, lng: -121.73 },
        { lat: 36.806, lng: -121.708 },
        { lat: 36.79, lng: -121.708 },
        { lat: 36.79, lng: -121.73 },
      ],
    },
    {
      id: "svy-coast",
      label: "North beach",
      polygon: [
        { lat: 36.848, lng: -121.83 },
        { lat: 36.848, lng: -121.812 },
        { lat: 36.826, lng: -121.812 },
        { lat: 36.826, lng: -121.83 },
      ],
    },
    {
      id: "svy-bay",
      label: "Bay grid",
      polygon: [
        { lat: 36.8, lng: -121.86 },
        { lat: 36.8, lng: -121.836 },
        { lat: 36.78, lng: -121.836 },
        { lat: 36.78, lng: -121.86 },
      ],
    },
  ],
};
