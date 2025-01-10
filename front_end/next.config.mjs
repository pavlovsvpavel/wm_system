/** @type {import('next').NextConfig} */
import path from 'path';
import dotenv from 'dotenv';

const currentEnv = process.env.ENV || 'local';

const envFileMap = {
  local: '.env',         // Local testing
  dev: '.env.dev',       // Local Docker testing
  prod: '.env.prod',     // Cloud Docker testing
};

const envFilePath = path.resolve('./envs', envFileMap[currentEnv]);
dotenv.config({ path: envFilePath });

const nextConfig = {
  env: {
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    ENV: currentEnv,
  },
};

export default nextConfig;

