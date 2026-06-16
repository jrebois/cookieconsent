FROM mcr.microsoft.com/devcontainers/javascript-node:24-bookworm

ENV PNPM_HOME="/home/node/.local/share/pnpm"
ENV PATH="${PNPM_HOME}:${PATH}"

RUN corepack enable \
    && corepack prepare pnpm@latest --activate
