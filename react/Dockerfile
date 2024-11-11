FROM node:18 AS build

COPY package.json package-lock.json ./

RUN npm install

COPY . .

RUN npm run build

# Use a lightweight HTTP server to serve the built React app
FROM nginx:alpine

# Copy the built React app from the build stage to the Nginx html directory
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 80 for the React app
EXPOSE 80

# Run Nginx to serve the React app
CMD ["nginx", "-g", "daemon off;"]