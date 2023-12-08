# Base Image
FROM node:latest

# Set working directory
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy source files
COPY . ./

# Start the application
CMD ["npm", "run", "dev"]
