FROM ubuntu:20.04

# initial machine setup
RUN apt-get update && apt-get install -y python3-distutils python3-apt curl redis-server
RUN curl https://bootstrap.pypa.io/get-pip.py -o ~/get-pip.py
RUN python3.8 ~/get-pip.py
RUN alias python=python3.8
RUN alias pip=pip3.8

# download MICAS v0.1.0
RUN mkdir /home/micas
WORKDIR /home/micas
RUN curl -kL https://github.com/coadunate/MICAS/archive/refs/tags/v0.1.0.tar.gz --output micas.tar.gz
RUN tar -xzvf micas.tar.gz

# install backend dependencies
WORKDIR /home/micas/MICAS-0.1.0
RUN pip3.8 install -r requirements.txt

# install NPM 
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash
RUN source ~/.bashrc
RUN nvm install v14.5.0

# install frontend dependencies
WORKDIR /home/micas/MICAS-0.1.0/frontend
RUN rm -rf node_modules
RUN npm install
