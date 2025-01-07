/** @type {import('next').NextConfig} */
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve('./envs/.env') });

const nextConfig = {
  env: {
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,

  },
};

export default nextConfig;
