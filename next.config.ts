import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Erlaubt (mehrere) PDF-Uploads beim manuellen Anlegen von Terminen.
      // Vercel selbst begrenzt Serverless-Function-Requests plattformseitig
      // auf ca. 4.5 MB, unabhängig von diesem Wert - für wirklich große oder
      // viele Dateien wäre Vercel Blob mit direktem Client-Upload nötig.
      bodySizeLimit: "20mb",
    },
  },
};

export default nextConfig;
