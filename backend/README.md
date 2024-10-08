# Montar en local

> Si así lo quieres, puedes omitir esto y montar todo con Docker. [Ver detalles](#montar-con-docker).

## Requerimientos
- Servidor con [Python 3.12](https://www.python.org/) y [NodeJS 20](https://nodejs.org/).
- Instancia de [MongoDB 7.0)](https://www.mongodb.com/).
- Instancia de [Ollama](https://ollama.com/).

## Configuración
1. Crear copia del archivo `.env.example` con el nombre `.env`
```sh
cp .env.example .env
```
2. Cambiar las variables que sean necesarias para conectarse a MongoDB y Ollama.

## Instalar dependencias de Python
```sh
pip install --no-cache-dir -r requirements.txt
```

## Instalar dependencias de NodeJS
```sh
npm i
```

# Descargar modelos con Ollama
```sh
ollama pull nomic-embed-text
```
```sh
ollama pull phi3:medium-128k
```

# Montar con Docker

## Requerimientos
- [Docker](https://www.docker.com/).

## Configuración
Crear copia del archivo `.env.docker.example` con el nombre `.env`.\
No es necesario modificarlo en un entorno de desarrollo.
```sh
cp .env.docker.example .env
```

## Construir la imagen de Python y NodeJS
```sh
docker build -t rockodev/transcriber:1 .
```

## Montar MongoDB y Ollama
<small>*Para montar solo MongoDB con Docker y usar Ollama en el host:*</small>

```sh
docker compose up -d
```
<small>*Para montar MongoDB y Ollama con Docker*</small>

```sh
docker compose up -d -f docker-compose-with-ollama.yml
```

# Uso

El backend está dividido en varios procesos:

## Proceso Find
1. Busca nuevos videos en Twitch o YouTube.
1. Guarda los detalles básicos en la base de datos.
1. Descarga los audios en una carpeta.
```sh
node --env-file=.env 1_find.js --platform youtube --channel midudev
```
Parámetros:
> - `--platform` Default: "youtube". Los valores pueden ser "youtube" o "twitch", y definine en que plataforma se buscarán nuevos videos.
> - `--channel` Es el identificador del canal, solo contiene números, letras y guiones (_-) y definine en que plataforma se buscarán nuevos videos. Ejemplo: "midudev" o "midulive".
> - `--parallel` La primera vez que se ejecuta se puede agregar este parámetro para descargar los videos en paralelo.

Con Docker:
```sh
docker run --rm -v $(pwd):/usr/src/app rockodev/transcriber:1 -c "node --env-file=.env 1_find.js --platform youtube --channel midudev"
```
> - Si se montó MongoDB con Docker se debe agregar el parámetro `--network transcriber_services`.

## Proceso Transcribe
1. Busca un video registrado en la base de datos que no ha sido transcrito aún.
1. Lo transcribe usando los audios descargados en el proceso "Find".
1. Guarda la transcripción separada en párrafos en la base de datos.
```sh
node --env-file=.env 2_transcribe.js --limit 1
```
Parámetros:
> - `--limit` Default: 1. Indica el número máximo de videos que se transcribirán.

Con Docker:
```sh
docker run --rm -v $(pwd):/usr/src/app rockodev/transcriber:1 -c "node --env-file=.env 2_transcribe.js"
```

## Proceso Embeddings
1. Busca los parrafos registrados en la base de datos que no tengan embeddings aún.
1. Los genera.
1. Los guarda en la base de datos.
```sh
node --env-file=.env 3_embeddings.js --limit 5
```
Parámetros:
> - `--limit` Default: 5. Indica el número máximo de transcripciones de las que se generarán embeddings.
> - `--create-index` Si se agrega este parámetro se creará el vector search index.

Con Docker:
```sh
docker run --rm -v $(pwd):/usr/src/app rockodev/transcriber:1 -c "node --env-file=.env 3_embeddings.js"
```

<!-- docker run -it --rm -v $(pwd):/usr/src/app --network="transcriber_backend" rockodev/transcriber:1 -->
