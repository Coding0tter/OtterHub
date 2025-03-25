#!/bin/sh

sudo docker build -f ../Dockerfile.base -t theultimateapp-base ../
sudo docker compose --parallel 1 up --build -d
