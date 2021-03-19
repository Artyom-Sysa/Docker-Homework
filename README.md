# Docker Homework
Implementation of homework of docker lessons

---
# Services: 
### 1. RabbitMQ

* Ports:
    * 5672 - internal port
    * 15672 - management dashboard
* Configure:
    * Environment variables:
        ```
          RABBITMQ_DEFAULT_USER - RabbitMQ user name
          RABBITMQ_DEFAULT_PASS - RabbitMQ user pasword
        ```
* Volumes:
  
    Located by path `./volumes/rabbitmq`

### 2. Redis

* Ports:
    * 6379 - internal port
* Configure:
    use all default settings
* Volumes:
  Located by path `./volumes/redis-data`

### 3. PostgreSQL
* Ports:
    * 5432 - internal port

* Configure:
    * Environment variables:
        ```
        POSTGRES_PASSWORD - user password
        POSTGRES_USER     - user name
        POSTGRES_DB       - work database name
        ```
* Volumes:
    * Located by path `./volumes/postgres-data`
    * Database initialization script location: `./init-sql.sql`
    
    
### 4. Publisher
* Configure:
    * env-file: 
      * Location: `./configs/publisher/.env.publisher`
      * Variables:
        ```
        DATA_SOURCE_URL - source of Ethereum blocks
        ```
    * Environment variables:
        ```
        RABBITMQ_DEFAULT_USER    - RabbitMQ user name
        RABBITMQ_DEFAULT_PASS    - RabbitMQ user pasword
        FETCH_BLOCKS_INTERVAL_MS - interval (milliseconds) between fetching block 
        ```

### 5. Consumer
* Configure:
    * Environment variables:
    ```
    RABBITMQ_DEFAULT_USER - RabbitMQ user name
    RABBITMQ_DEFAULT_PASS - RabbitMQ user pasword
    POSTGRES_PASSWORD     - PostgresSQL user password
    POSTGRES_USER         - PostgresSQL user name
    POSTGRES_DB           - PostgresSQL work database name
    ```

#### Publisher & Consumer healthchecks:
Publisher and consumer services have `/helth` api by path `127.0.0.1:3000/helth`. 
For checking health of service you can call this api with concrete ip of this service

All general configuration of environment variables between some services you can set one time (section of general vars in docker-compose file) and it would work for all services which use it

---
# Startup

#### Requirements:
* Docker
* Docker-compose
* Access to Docker Hub or another Docker registry (+ configurated Docker for it)

### Run:
```
docker-compose up
```