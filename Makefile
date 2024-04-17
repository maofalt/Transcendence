BASE_FILE = -f srcs/docker-compose.yml
OVERRIDE_FILE = -f srcs/docker-compose.prod.yml

HOST_NAME ?= localhost
HOST_IP ?= localhost

ENV ?= dev

COMPOSE_FILE = -f srcs/docker-compose.yml

ifeq ($(ENV), dev)
COMPOSE_FILE = $(BASE_FILE)
endif

ifeq ($(ENV), prod)
COMPOSE_FILE = $(BASE_FILE) $(OVERRIDE_FILE)
endif


all: build up logs

build: set-ip set-codeespace-url set-permissions decrypt-mama replace
	docker-compose $(COMPOSE_FILE) build

up:
	docker-compose $(COMPOSE_FILE) up -d

down:
	docker-compose $(COMPOSE_FILE) down

logs:
	docker-compose $(COMPOSE_FILE) logs -f

#erase all images and volumes USE WITH CAUTION!!!
clean:
	docker-compose $(COMPOSE_FILE) down --rmi all --volumes --remove-orphans
	docker system prune -f

fclean: clean
	rm -rf ./srcs/requirements/front-end/vanilla/node_modules

.PHONY: all build up down logs

set-ip:
	export "LOCAL_IP=$(shell hostname -i)"; export "HOST_IP=$(HOST_IP)"; export "HOST_NAME=$(HOST_NAME)"

set-codeespace-url:
	export "CODESPACE_URL=${CODESPACE_NAME}"

set-permissions:
	chmod 600 srcs/requirements/traefik/config/ssl/acme.json

decrypt-mama:
	gpg -d -o srcs/.env srcs/.env.gpg

replace:
	sed -e 's/HOST_IP/$(HOST_IP)/g' -e 's/HOST_NAME/$(HOST_NAME)/g' \
	srcs/requirements/traefik/config/traefik.template.yml > srcs/requirements/traefik/config/traefik.yml
