#!/bin/sh
set -e

# Wait for PostgreSQL to be ready (uses Node built-in net module)
node /app/docker/wait-for-db.js

# Run migrations before starting the app
echo "Running database migrations..."
node node_modules/typeorm/cli.js migration:run -d ./dist/src/data-source.js

echo "Starting application..."
exec "$@"
