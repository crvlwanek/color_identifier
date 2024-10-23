import type { MetaFunction } from "@remix-run/node";

import trees from "../images/trees.jpg";
import water from "../images/water.jpg";
import prettyTree from "../images/prettyTree.jpg";
import { useCallback, useState } from "react";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  return (
    <div className="flex">
      <Image src={trees} />
      <Image src={water} />
      <Image src={prettyTree} />
    </div>
  );
}

const getPixelData = (
  event: React.SyntheticEvent<HTMLImageElement, Event>
): Uint8Array[] => {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) throw new Error("Missing context");

  const image = event.target as HTMLImageElement;

  canvas.width = image.width;
  canvas.height = image.height;

  context.drawImage(image, 0, 0);

  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const { data } = imageData;

  const pixels: Uint8Array[] = [];
  for (let i = 0; i < data.length; i += 4) {
    const pixel = new Uint8Array(3);

    pixel[0] = data[i];
    pixel[1] = data[i + 1];
    pixel[2] = data[i + 2];

    pixels.push(pixel);
  }

  return pixels;
};

export const rgbToHex = (rgb: Uint8Array): string => {
  const [r, g, b] = rgb;
  return `#${r.toString(16).padStart(2, "0")}${g
    .toString(16)
    .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
};

/** Generates a random number between 0 and limit */
const randomNumber = (limit: number): number => {
  return Math.floor(Math.random() * limit);
};

const randomElement = <T,>(array: T[]): T => {
  return array[randomNumber(array.length)];
};

const weightedRandom = <T,>(items: T[], weights: number[]): T => {
  const totalWeight = weights.reduce((prev, curr) => prev + curr, 0);

  let random = Math.random() * totalWeight;
  let currentWeight = 0;

  for (let i = 0; i < items.length; i++) {
    currentWeight += weights[i];
    if (random < currentWeight) {
      return items[i];
    }
  }

  throw new Error("Shouldn't be here!");
};

class KMeans {
  public static cluster(k: number, points: Uint8Array[]) {
    // Initialize and pick centroids
    let centroids = KMeans.generateInitialCentroids("k-means++", k, points);

    // Initialize clusters
    let clusters: Uint8Array[][];
    let converged = false;
    let iterationCount = 0;

    while (!converged) {
      clusters = Array.from({ length: k }, () => []);
      points.forEach((point) => {
        const distances = centroids.map((centroid) =>
          KMeans.distance(centroid, point)
        );
        const minDistance = Math.min(...distances);
        const index = distances.indexOf(minDistance);
        clusters[index].push(point);
      });

      const newCentroids = clusters.map((cluster) => {
        const r = Math.round(
          cluster
            .map((point) => point[0])
            .reduce((prev, curr) => prev + curr, 0) / cluster.length
        );

        const g = Math.round(
          cluster
            .map((point) => point[1])
            .reduce((prev, curr) => prev + curr, 0) / cluster.length
        );

        const b = Math.round(
          cluster
            .map((point) => point[2])
            .reduce((prev, curr) => prev + curr, 0) / cluster.length
        );

        const centroid = new Uint8Array(3);
        centroid[0] = r;
        centroid[1] = g;
        centroid[2] = b;

        return centroid;
      });

      if (this.areEqual(centroids, newCentroids)) {
        converged = true;
      }
      iterationCount++;
      centroids = newCentroids;
    }

    console.log(iterationCount);
    return centroids;
  }

  public static areEqual(
    centroids: Uint8Array[],
    other: Uint8Array[]
  ): boolean {
    const centroidSet = new Set(centroids.map(rgbToHex));
    return other.map(rgbToHex).every((val) => centroidSet.has(val));
  }

  // https://en.wikipedia.org/wiki/K-means%2B%2B
  public static generateInitialCentroids(
    method: "k-means++",
    k: number,
    points: Uint8Array[]
  ): Uint8Array[] {
    const centroids = [randomElement(points)];
    while (centroids.length < k) {
      const weights = points.map((point) => {
        return (
          Math.max(
            ...centroids.map((centroid) => KMeans.distance(centroid, point))
          ) ** 2
        );
      });

      centroids.push(weightedRandom(points, weights));
    }

    return centroids;
  }

  /** Finds the distance between 2 vec3's */
  public static distance(a: Uint8Array, b: Uint8Array): number {
    const dx = a[0] - b[0];
    const dy = a[1] - b[1];
    const dz = a[2] - b[2];

    return Math.sqrt(dx ** 2 + dy ** 2 + dz ** 2);
  }
}

type ImageProps = {
  src: string;
};

const Image = ({ src }: ImageProps) => {
  const [colors, setColors] = useState<string[]>([]);

  const onLoad: React.ReactEventHandler<HTMLImageElement> = useCallback(
    (event) => {
      const pixels = getPixelData(event);

      const generatedColors = KMeans.cluster(6, pixels).map(rgbToHex);
      setColors(generatedColors);
      console.log(generatedColors);
    },
    [setColors]
  );

  return (
    <div className="grid">
      <img src={src} width={500} onLoad={onLoad} />
      <div className="flex">
        {colors.length === 0 && <div>Loading...</div>}
        {colors.map((color) => (
          <div
            key={color}
            style={{ backgroundColor: color }}
            className="w-10 h-10"
          />
        ))}
      </div>
    </div>
  );
};
