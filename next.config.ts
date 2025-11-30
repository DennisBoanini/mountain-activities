import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options here */
    headers: () => [
        {
            source: "/",
            headers: [
                {
                    key: "Cache-Control",
                    value: "no-store",
                },
            ],
        },
    ],
};

export default nextConfig;
