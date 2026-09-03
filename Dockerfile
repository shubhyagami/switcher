# Multi-stage lightweight Node.js container for Switcher Tunnel Relay
FROM node:20-alpine AS runner

WORKDIR /app

# Install dependencies
COPY package.json ./
RUN npm install --omit=dev

# Copy server files
COPY . .

# Expose default Render port
ENV PORT=8080
ENV NODE_ENV=production

EXPOSE 8080

CMD ["node", "index.js"]
