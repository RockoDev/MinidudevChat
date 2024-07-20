FROM python:3.12.4

WORKDIR /usr/src/app

# Install ffmpeg
RUN apt-get -y update && apt-get -y install ffmpeg

# Install NodeJS
RUN apt-get -y update && apt-get -y install ca-certificates curl gnupg
RUN mkdir -p /etc/apt/keyrings
RUN curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
RUN echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_20.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list
RUN apt-get -y update && apt-get -y install nodejs

# Install Python dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Install NodeJS dependencies
COPY ["package.json", "package-lock.json", "../"]
RUN cd .. && npm ci && cd -

COPY ["load_model.py", "transcribe.py", "./"]

RUN python load_model.py

ENTRYPOINT ["/bin/bash"]
