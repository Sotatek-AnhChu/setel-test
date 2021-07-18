

Defaule account:

username: testuser

password: testuser 

# Order App
## Requirement
- Docker 19.03.8
- Docker-compose 3.8
- Mongodb 4.2
- Redis 6.2.4
- git
- Node 14

Mongodb and redis run in docker and expose port to local host.

## Setup enviroment variable and run database.

Docker compose require enviroment variable to start.
- cp .env-example .env 
- docker-compose up

Keep terminal window run.
##  Setup dependency 
Install dependency for nodejs.
- git init
- npm ci

We need git init because Husky need git to install node module

Run app

- npm run start

Run test

- npm run test

Run test coverate

- npm run test:cov

Last line of console log is the port of app. (default 3025)
Swagger address: http://localhost:{port}/api
