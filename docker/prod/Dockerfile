FROM node:20-alpine as builder

WORKDIR /app

# Copy dependency files
COPY package.json package-lock.json ./

RUN npm ci

COPY . .

RUN npm run build

FROM node:20-alpine as production

ENV NODE_ENV=production

WORKDIR /app

# Copy only what's needed
COPY package.json package-lock.json ./
RUN npm ci --only=production --ignore-scripts && npm cache clean --force

COPY --from=builder /app/dist ./dist

EXPOSE 5501

USER node

CMD ["node", "dist/src/server.js"]
