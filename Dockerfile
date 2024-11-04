# Stage 1: Build the React app
FROM node:18 AS build

# Set working directory for React app
WORKDIR /react

# Copy React app's package.json and package-lock.json
COPY react/package*.json ./

# Install dependencies and build the React app
RUN npm install
COPY react/ ./
RUN npm run build

# Stage 2: Set up the Express server
FROM node:18

# Set working directory for Express app
WORKDIR /express

# Copy Express server's package.json and package-lock.json
COPY express/package*.json ./

# Install dependencies for Express
RUN npm install

# Copy both the Express server and the built React files
COPY express/ ./
COPY --from=build /app/client/build ./public

# Expose the desired port (change if needed)
EXPOSE 5000

# Start the Express server
CMD ["node", "server.js"]
