#!/bin/bash
echo "Starting JobUz backend..."

for i in 1 2 3 4 5; do
  echo "Attempt $i: Running prisma db push..."
  npx prisma db push --skip-generate --accept-data-loss && break
  echo "Attempt $i failed. Waiting 10s..."
  sleep 10
done

echo "Starting server..."
node src/server.js
