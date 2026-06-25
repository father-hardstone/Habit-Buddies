import type {NextConfig} from 'next';
import {loadEnvConfig} from '@next/env';

loadEnvConfig(process.cwd());

const optionalOpenTelemetryExporters = [
  '@opentelemetry/exporter-jaeger',
  '@opentelemetry/exporter-zipkin',
  '@opentelemetry/exporter-otlp-http',
  '@opentelemetry/exporter-otlp-grpc',
  '@opentelemetry/exporter-otlp-proto',
] as const;

function supabaseImagePatterns(): NonNullable<
  NextConfig['images']
>['remotePatterns'] {
  const patterns: NonNullable<NextConfig['images']>['remotePatterns'] = [
    {
      protocol: 'https',
      hostname: '*.supabase.co',
      port: '',
      pathname: '/storage/v1/object/public/**',
    },
  ];

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (supabaseUrl) {
    try {
      const { hostname } = new URL(supabaseUrl);
      if (hostname) {
        patterns.unshift({
          protocol: 'https',
          hostname,
          port: '',
          pathname: '/**',
        });
      }
    } catch {
      // ignore invalid env URL
    }
  }

  return patterns;
}

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: [
    'genkit',
    '@genkit-ai/core',
    '@genkit-ai/googleai',
    '@genkit-ai/next',
    '@opentelemetry/sdk-node',
  ],
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      ...supabaseImagePatterns(),
    ],
  },
  webpack: (config) => {
    config.resolve ??= {};
    config.resolve.alias = {
      ...config.resolve.alias,
      ...Object.fromEntries(
        optionalOpenTelemetryExporters.map((pkg) => [pkg, false]),
      ),
    };
    return config;
  },
  async redirects() {
    return [
      {
        source: '/admin/dashboard',
        destination: '/admin',
        permanent: true,
      },
      {
        source: '/admin/dashboard/users',
        destination: '/admin/users',
        permanent: true,
      },
      {
        source: '/admin/dashboard/groups',
        destination: '/admin/groups',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
