FROM ubuntu:20.04

# Labels
ARG BUILD_DATE
ARG VCS_REF
ARG BUILD_VERSION
LABEL maintainer="@s.horovatin@usask.ca"
LABEL org.label-schema.schema-version="1.0"
LABEL org.label-schema.build-date=$BUILD_DATE
LABEL org.label-schema.name="MICAS"
LABEL org.label-schema.description="An react application that notify's users of user defined thresholds being met on live ONT sequencing runs."
LABEL org.label-schema.vcs-url="https://github.com/coadunate/MICAS"
LABEL org.label-schema.vcs-ref=$VCS_REF
LABEL org.label-schema.version=$BUILD_VERSION

# initial machine setup
RUN apt-get update && apt-get install -y git python3-distutils python3-apt python3-dev curl redis-server gcc libffi-dev
RUN curl https://bootstrap.pypa.io/get-pip.py -o ~/get-pip.py
RUN python3.8 ~/get-pip.py
RUN alias python=python3.8
RUN alias pip=pip3.8

# download MICAS master
RUN git clone -b master https://github.com/coadunate/MICAS.git

# install backend dependencies
WORKDIR /MICAS/
RUN pip install --upgrade pip
RUN pip install --default-timeout=100 -r requirements.txt

# install NPM 
RUN curl -sL https://deb.nodesource.com/setup_16.x | bash -
RUN apt-get install -y nodejs

# install minimap2
RUN apt install minimap2

# install lsof (for Sam)
RUN apt install lsof

# install frontend dependencies
WORKDIR /MICAS/frontend
RUN rm -rf node_modules
RUN npm install

EXPOSE 3000
EXPOSE 5000
EXPOSE 6379

WORKDIR /MICAS/
CMD ["./start.sh"]