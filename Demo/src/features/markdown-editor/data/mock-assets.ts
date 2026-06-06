import type { MockAsset } from "../types";

export const mockAssets: MockAsset[] = [
  {
    name: "openfoodfacts-yuka-sample.csv",
    path: "assets/data/openfoodfacts-yuka-sample.csv",
    kind: "file",
    description: "Mock product dataset for scan, search, and explore behavior.",
  },
  {
    name: "yuka-app-icon.png",
    path: "assets/brand/yuka-app-icon.png",
    kind: "image",
    description: "Placeholder app icon reference for the mobile shell.",
  },
  {
    name: "explore-screen.png",
    path: "assets/screens/explore-screen.png",
    kind: "image",
    description: "Mock visual reference for the Explore product rows.",
  },
  {
    name: "product-details-expanded.png",
    path: "assets/screens/product-details-expanded.png",
    kind: "image",
    description: "Mock visual reference for nutrient detail expansion.",
  },
];
