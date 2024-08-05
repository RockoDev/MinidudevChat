# Frontend

## Requerimientos
- [NodeJS 20](https://nodejs.org/).

## Configuración
1. Crear copia del archivo `.env.example` con el nombre `.env`
```sh
cp .env.example .env
```
2. Cambiar las variables que sean necesarias para conectarse a MongoDB y Ollama.
3. Seleccionar las plataformas (openai / ollama) y los modelos que se usarán.

## Instalar dependencias de NodeJS
```bash
npm install
```

## Montar servidor de desarrollo
```bash
npm run dev
```

## Preparar archivos para producción
```bash
npm run build
```

## Ejecutar servidor en producción
```bash
node .output/server/index.mjs
```
