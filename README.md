# MICAS
> MinION Classification & Alerting System


## Prerequisites

- NPM & NodeJS.
- Python3 and PIP

## Installation

```sh
$ git clone https://github.com/coadunate/xWIMP.git
$ cd MICAS
$ cd static
$ npm install
```
## Deployment

- Inside the `MICAS` directory, you need to go to `server` directory and run the
  following command to deploy the application:

```sh
$ virtualenv -p python3 env_micas
$ source env_micas/bin/activate
$ curl https://bootstrap.pypa.io/get-pip.py | python3
$ pip install -r requirements.txt
$ python server/micas.py
```

## API

Write about the function of API in this program and how it can be used.
