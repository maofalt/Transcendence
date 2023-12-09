COMPOSE_FILE := ./docker-compose.yml

all: ssl-gen build up

build:
	docker-compose -f $(COMPOSE_FILE) build

up:
	docker-compose -f $(COMPOSE_FILE) up -d

down:
	docker-compose -f $(COMPOSE_FILE) down

logs:
	docker-compose -f $(COMPOSE_FILE) logs -f

clean:
	docker compose -f $(COMPOSE_FILE) down --rmi all --volumes
	docker image prune -a -f

fclean: clean
	docker volume prune -f

.PHONY: all build up down logs