# 2022NTUEEWeekGame

## Install
```bash
cp .env.default .env
yarn install
```

Run Mongodb in docker
```bash
docker run -d -p 27017:27017 --name weekgame-mongo mongo:latest
```

## Run
Development
```bash
yarn dev-server
```

Production
```bash
yarn build
yarn start
```

Docker
```bash
docker-compose up -d
```
