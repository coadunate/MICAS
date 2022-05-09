#!/bin/bash
docker build --no-cache -t micas .
docker run -dp 3000:3000 -p 5000:5000 -v /:/MICAS/data micas 