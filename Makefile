# BASE_FILE = -f srcs/docker-compose.yml
# OVERRIDE_FILE= -f srcs/docker-compose.override.yml

# ENV ?= dev

# ifeq ($(ENV), dev)
# COMPOSE_FILE = $(BASE_FILE) $(OVERRIDE_FILE)
# endif

# ifeq ($(ENV), prod)
# COMPOSE_FILE = $(BASE_FILE)
# endif

COMPOSE_FILE = -f srcs/docker-compose.yml

all: build up

build:
	docker compose $(COMPOSE_FILE) build

up:
	docker compose $(COMPOSE_FILE) up -d

down:
	docker compose $(COMPOSE_FILE) down

logs:
	docker compose $(COMPOSE_FILE) logs -f

#erase all images and volumes USE WITH CAUTION!!!
clean:
	docker compose $(COMPOSE_FILE) down --rmi all --volumes
	docker image prune -a -f
	rm -r ./srcs/requirements/front-end/react-app/node_modules

fclean: clean
	docker volume prune -f

.PHONY: all build up down logs