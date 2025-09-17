FROM node:20-slim

# install small tools used by some builds (optional but helpful)
RUN apt-get update && \
    apt-get install -y --no-install-recommends ca-certificates && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# copy minimal files first for cache
COPY package*.json tsconfig.json ./

# install from scratch (do not rely on host node_modules)
RUN npm install

# ensure esbuild binary is rebuilt for the container environment
RUN npm rebuild esbuild || true

# copy rest of project
COPY . .

# build app (tsc + vite build)
RUN npm run build

EXPOSE 3000

# vite preview must bind to 0.0.0.0 to be reachable from host
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "3000"]
