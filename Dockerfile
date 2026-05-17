FROM node:20-alpine

WORKDIR /app

# Copiamos archivos de dependencias
COPY package.json package-lock.json ./

# Instalamos todas las dependencias (dev incluidas, necesarias para compilar y hot-reload)
RUN npm ci

# El código fuente se monta como volumen en docker-compose (no se copia)
# Esto permite hot-reload sin reconstruir la imagen

EXPOSE 3001

# Arrancamos en modo desarrollo con watch (hot-reload)
CMD ["npm", "run", "start:dev"]
