FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code (this will be overridden by volume mount in development)
COPY . .

# Expose port
EXPOSE 3000

# Start the application in development mode (with hot reload)
CMD ["npm", "run", "dev"]