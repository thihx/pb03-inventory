# Build frontend + run API that serves the SPA (single free web service)
FROM node:22-bookworm-slim AS build
WORKDIR /app
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*
COPY package.json ./
COPY apps/api/package.json apps/api/package-lock.json ./apps/api/
COPY apps/web/package.json apps/web/package-lock.json ./apps/web/
RUN npm run install:all
COPY apps ./apps
RUN npm run build

FROM node:22-bookworm-slim
WORKDIR /app
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*
ENV NODE_ENV=production
ENV PORT=4003
COPY package.json ./
COPY apps/api/package.json apps/api/package-lock.json ./apps/api/
RUN npm install --prefix apps/api --omit=dev
COPY apps/api/src ./apps/api/src
COPY --from=build /app/apps/web/dist ./apps/web/dist
EXPOSE 4003
CMD ["npm", "start"]
