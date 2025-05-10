# Use the official Node.js image as the base image
# Use a multi-stage build to keep the final image small

# ---------- Build stage ----------
FROM node:18 AS builder

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY . .

# ---------- Production stage ----------
FROM node:18-slim AS final

WORKDIR /app

# Only copy the built app and dependencies
COPY --from=builder /app ./

# Install only production dependencies
RUN npm install --omit=dev

EXPOSE 5000

CMD ["node", "server.js"]
