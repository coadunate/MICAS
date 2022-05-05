# syntax=docker/dockerfile:1
FROM ubuntu:20.04

ARG BUILD_DATE
ARG VCS_REF
ARG BUILD_VERSION


# Labels.
LABEL maintainer="@s.horovatin@usask.ca"
LABEL org.label-schema.schema-version="1.0"
LABEL org.label-schema.build-date=$BUILD_DATE
LABEL org.label-schema.name="MICAS"
LABEL org.label-schema.description="An react application that notify's users of user defined thresholds being met on live ONT sequencing runs."
LABEL org.label-schema.vcs-url="https://github.com/coadunate/MICAS"
LABEL org.label-schema.vcs-ref=$VCS_REF
LABEL org.label-schema.version=$BUILD_VERSION


# Update aptitude with new repo
RUN apt-get update

# Install baseline dependancies
RUN apt-get install -y \
                apt-utils \
                git \
                python3-pip \
                curl

# Install Nodejs and npm
RUN curl -sL https://deb.nodesource.com/setup_16.x | bash -
RUN apt-get install -y \
                nodejs

# Install R-base
ARG DEBIAN_FRONTEND=noninteractive
RUN apt-get install -y \
                r-base

# Install redis
RUN apt install -y \
                redis-server

# Clone MICAS repo
RUN git clone https://github.com/coadunate/MICAS.git

# Set Work directory to MICAS repo
WORKDIR /MICAS

# Install MICAS requirments
RUN apt install -y \
                libffi-dev

RUN pip install -r ./requirements.txt

RUN ./install.sh

CMD ["./start.sh"]