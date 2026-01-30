/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ['three', '@react-three/fiber', '@react-three/drei', '@react-three/postprocessing'],
    webpack: (config) => {
        config.externals = [...(config.externals || []), { canvas: 'canvas' }];
        return config;
    },
    experimental: {
        optimizePackageImports: ['three', '@react-three/fiber', '@react-three/drei'],
    },
};

export default nextConfig;
