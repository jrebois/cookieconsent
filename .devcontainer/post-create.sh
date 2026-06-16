#!/usr/bin/env bash
set -euo pipefail

echo "Installing root dependencies..."
pnpm install

echo "Installing playground dependencies..."
pnpm --dir playground install

echo "Dev container ready."
echo "  pnpm dev          - watch and rebuild the library"
echo "  pnpm build        - build dist bundles"
echo "  pnpm test         - run Jest tests"
echo "  pnpm docs:dev     - start VitePress docs on port 5173"
echo "  pnpm --dir playground dev - start Astro playground on port 4321"
