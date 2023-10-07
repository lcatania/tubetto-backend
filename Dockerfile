FROM oven/bun:latest
WORKDIR /opt/app

COPY --from=node:18 /usr/local/bin/node /usr/local/bin/node
COPY ./src ./src
COPY ./prisma ./prisma
COPY ./package.json ./
COPY ./bun.lockb ./

# Install packages
RUN bun install
RUN bunx prisma generate

# Run generation
RUN bunx prisma generate