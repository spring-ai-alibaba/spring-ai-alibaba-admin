#!/bin/bash
cd docker/middleware/
docker compose up -d --build
sleep 5
cd ../../spring-ai-alibaba-admin-server
mvn clean install -DskipTests

