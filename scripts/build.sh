#!/bin/sh

docker build -f ../Dockerfile.base -t theultimateapp-base ../
docker compose up --build
