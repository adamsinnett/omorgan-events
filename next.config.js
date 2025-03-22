/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
    NEXT_PUBLIC_HASURA_URL: process.env.NEXT_PUBLIC_HASURA_URL,
    HASURA_ADMIN_SECRET: process.env.HASURA_ADMIN_SECRET,
  },
};

module.exports = nextConfig;
