# Use official Node.js LTS lightweight container
FROM node:20-alpine

# Set application directory
WORKDIR /app

# Install dependencies first (leverages Docker layer cache)
COPY package*.json ./
RUN npm install --omit=dev

# Copy application source code
COPY . .

# Expose port (Google Cloud Run automatically sets PORT=8080)
ENV PORT=8080
EXPOSE 8080

# Run DocuForensic AI application
CMD ["node", "server.js"]

