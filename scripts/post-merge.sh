#!/bin/bash
set -e
pnpm install --frozen-lockfile
pnpm --filter db push --force 2>&1 | grep -v "Do you want to truncate" || true
