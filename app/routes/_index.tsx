import type { MetaFunction } from "@remix-run/node";

import trees from "../images/trees.jpg";
import water from "../images/water.jpg";
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
  const random = Math.random() * totalWeight;
  let currentWeight = 0;

  items.forEach((item, index) => {
    currentWeight += weights[index];
    if (random < currentWeight) return item;
  });

  // Shouldn't get here but fallback just in case
  return items[0];
};

class KMeans {
  public static cluster(k: number, points: Uint8Array[]) {
    // Initialize and pick centroids
    const centroids = KMeans.generateInitialCentroids("k-means++", k, points);

    // Initialize clusters
    let clusters: Uint8Array[][];

    let converged = false;

    while (!converged) {
      clusters = new Array(k);
    }
  }

  public static generateInitialCentroids(
    method: "k-means++",
    k: number,
    points: Uint8Array[]
  ): Uint8Array[] {
    const centroids = [randomElement(points)];
    while (centroids.length < k) {
      const weights = points.map((point) => {
        return Math.min(
          ...centroids.map((centroid) => KMeans.distance(centroid, point))
        );
      });

      const centroid = weightedRandom(points, weights);
      centroids.push(centroid);
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
  const [color, setColor] = useState("#FAAFFF");

  const onLoad: React.ReactEventHandler<HTMLImageElement> = useCallback(
    (event) => {
      const pixels = getPixelData(event);

      console.log(
        KMeans.generateInitialCentroids("k-means++", 3, pixels).map(rgbToHex)
      );
    },
    [setColor]
  );

  return (
    <div className="grid">
      <img src={src} width={500} onLoad={onLoad} />
      <div className="h-10 w-full" style={{ backgroundColor: color }}></div>
    </div>
  );
};
