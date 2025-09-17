FROM node:20-alpine

WORKDIR /app

# Copy only what's needed first (for caching)
COPY package*.json tsconfig.json ./

RUN npm install --production

# Copy source code
COPY . .

# Build TypeScript -> compiles src/app.ts into dist/app.js
RUN npm run build

EXPOSE 5000

# Start server (compiled JS entry)
CMD ["node", "dist/app.js"]
