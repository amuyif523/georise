FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY tsconfig.json ./
COPY src ./src
COPY src/migrations ./migrations
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=base /app/package*.json ./
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/dist ./dist
COPY --from=base /app/migrations ./migrations
ENV PORT=8000
EXPOSE 8000
CMD ["node", "dist/server.js"]
