import "./src/env.js";

const config = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'ygiovcet4jez46n1.public.blob.vercel-storage.com',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: '*.public.blob.vercel-storage.com',
                port: '',
                pathname: '/**',
            },
        ],
    },
};

export default config;