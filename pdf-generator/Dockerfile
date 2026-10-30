FROM node:20-bookworm-slim AS base
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends \
      chromium \
      curl \
      fontconfig \
      fonts-liberation \
      fonts-dejavu \
      fonts-inter-variable \
      fonts-ebgaramond \
      fonts-ebgaramond-extra \
      fonts-roboto-slab \
      fonts-yrsa-rasa \
      fonts-solide-mirage \
      fonts-lato \
      ca-certificates \
      tini \
    && rm -rf /var/lib/apt/lists/*

# Playfair Display (variable weight 400-900, upright + italic) from the
# google/fonts repo. Pinned to a recent commit for reproducibility.
ARG GOOGLE_FONTS_REF=main
RUN mkdir -p /usr/share/fonts/truetype/playfair-display && \
    curl -fsSL -o /usr/share/fonts/truetype/playfair-display/PlayfairDisplay-Variable.ttf \
      "https://raw.githubusercontent.com/google/fonts/${GOOGLE_FONTS_REF}/ofl/playfairdisplay/PlayfairDisplay%5Bwght%5D.ttf" && \
    curl -fsSL -o /usr/share/fonts/truetype/playfair-display/PlayfairDisplay-Italic-Variable.ttf \
      "https://raw.githubusercontent.com/google/fonts/${GOOGLE_FONTS_REF}/ofl/playfairdisplay/PlayfairDisplay-Italic%5Bwght%5D.ttf" && \
    fc-cache -f
ENV PUPPETEER_SKIP_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

FROM base AS deps
COPY package.json ./
RUN npm install

FROM base AS dev
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV PORT=4001
EXPOSE 4001
ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["npm", "run", "start:dev"]

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build && npm prune --omit=dev

FROM base AS prod
ENV NODE_ENV=production PORT=4001
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./package.json
EXPOSE 4001
ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["node", "dist/main.js"]
