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
    // Increase timeout for 3D scenes during build
    staticPageGenerationTimeout: 180,
};

export default nextConfig;
