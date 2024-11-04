# express/Dockerfile
FROM node:18

# Set working directory for Express app
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install
COPY . .

# Expose port 5000 for Express server
EXPOSE 5000

# Start the Express server
CMD ["node", "server.js"]
