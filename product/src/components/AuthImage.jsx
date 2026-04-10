import React, { useState, useEffect } from "react";
import api from "../api/axios";

const FALLBACK_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Crect width='300' height='200' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='16' fill='%23aaa'%3ENo Image%3C/text%3E%3C/svg%3E";

const AuthImage = ({ dbPath, alt = "image", style = {}, className = "" }) => {
  const [src, setSrc] = useState(null);

  useEffect(() => {
    let objectUrl = null;
    let cancelled = false;

    const loadImage = async () => {
      if (!dbPath) {
        setSrc(FALLBACK_IMAGE);
        return;
      }

      // 1. If it is already a Cloudinary link (http) or data/blob URI, use it directly!
      if (dbPath.startsWith("http") || dbPath.startsWith("data:") || dbPath.startsWith("blob:")) {
        setSrc(dbPath);
        return;
      }

      // 2. If it's an OLD locally uploaded image, fall back to the API fetch logic
      const cleanPath = dbPath.replace(/\\/g, "/").replace(/^public\//, "");
      const imageEndpoint = cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`;

      try {
        const response = await api.get(imageEndpoint, {
          responseType: "blob",
        });
        if (!cancelled) {
          objectUrl = URL.createObjectURL(response.data);
          setSrc(objectUrl);
        }
      } catch (err) {
        console.warn("AuthImage: failed to load image via API:", imageEndpoint);
        if (!cancelled) {
          setSrc(FALLBACK_IMAGE);
        }
      }
    };

    setSrc(null); // reset while loading
    loadImage();

    return () => {
      cancelled = true;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [dbPath]);

  if (!src) {
    return (
      <div
        style={{
          width: style.width || "100%",
          height: style.height || "100%",
          background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
          backgroundSize: "200% 100%",
          animation: "shimmer 1.5s infinite",
          borderRadius: style.borderRadius || "0",
          ...style,
        }}
      />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      style={style}
      className={className}
      onError={(e) => {
        e.target.onerror = null;
        e.target.src = FALLBACK_IMAGE;
      }}
    />
  );
};

export default AuthImage;