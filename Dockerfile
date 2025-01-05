# syntax=docker/dockerfile:1

ARG NODE_VERSION=20.15.1

FROM node:${NODE_VERSION}-alpine

ENV NODE_ENV=production

WORKDIR /usr/src/app

# Install build dependencies for native modules
# RUN apk add --no-cache python3 make g++ libusb-dev linux-headers eudev-dev && \
#     ln -sf python3 /usr/bin/python

# Install dependencies with caching and omit devDependencies
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev

# Use root user to ensure proper permissions
USER root

# Copy the application code
COPY . .

# Expose port 80
EXPOSE 80

# Use JSON array syntax for CMD
CMD ["npm", "start"]