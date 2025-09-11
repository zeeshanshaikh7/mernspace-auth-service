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

# Create logs directory and set proper ownership BEFORE switching to node user
RUN mkdir -p /app/logs && chown -R node:node /app

# Copy only what's needed
COPY package.json package-lock.json ./
RUN npm ci --only=production --ignore-scripts && npm cache clean --force

COPY --from=builder --chown=node:node /app/dist ./dist

EXPOSE 5501

# Switch to node user AFTER setting permissions
USER node

CMD ["node", "dist/src/server.js"]