# Use a specific version of Node.js with an Alpine base image
FROM node:18.19.1-alpine as angular

# Set the working directory
WORKDIR /app

# Copy the package.json and package-lock.json files
COPY package*.json ./

# Install the dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the Angular application
RUN npm run build

# Use the official HTTP server image
FROM httpd:2.4-alpine

# Set the working directory for the HTTP server
WORKDIR /usr/local/apache2/htdocs

# Copy the custom Apache configuration file
COPY httpd.conf /usr/local/apache2/conf/httpd.conf

# Copy the built Angular app from the previous stage
COPY --from=angular /app/dist/web-app/ .

# Expose port 80
EXPOSE 80