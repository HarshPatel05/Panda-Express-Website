# react/Dockerfile
FROM node:18

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies and build the React app
RUN npm install
COPY . .
RUN npm run build

# Expose port 3000 for React app
EXPOSE 3000

# Start React app
CMD ["npm", "start"]
