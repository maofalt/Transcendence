BASE_FILE = -f srcs/docker-compose.yml
OVERRIDE_FILE= -f srcs/docker-compose.override.yml

ENV ?= dev

ifeq ($(ENV), dev)
COMPOSE_FILE = $(BASE_FILE) $(OVERRIDE_FILE)
endif

ifeq ($(ENV), prod)
COMPOSE_FILE = $(BASE_FILE)
endif

COMPOSE_FILE = -f srcs/docker-compose.yml

all: build up logs

build: set-ip set-codeespace-url set-permissions decrypt-mama
	docker-compose $(COMPOSE_FILE) build

up:
	docker-compose $(COMPOSE_FILE) up -d

down:
	docker-compose $(COMPOSE_FILE) down

logs:
	docker-compose $(COMPOSE_FILE) logs -f

#erase all images and volumes USE WITH CAUTION!!!
clean:
	docker-compose $(COMPOSE_FILE) down --rmi all --volumes
	docker image prune -a -f

fclean: clean
	docker volume prune -f
	rm -rf ./srcs/requirements/front-end/react-app/node_modules


.PHONY: all build up down logs

set-ip:
	export "LOCAL_IP=$(shell hostname -i)"

set-codeespace-url:
	export "CODESPACE_URL=${CODESPACE_NAME}"

set-permissions:
	chmod 600 srcs/requirements/traefik/config/ssl/acme.json

decrypt-mama:
	gpg srcs/.env.gpg

# set-xdg-env:
# 	@if [ -z "$$XDG_RUNTIME_DIR" ]; then \
# 		XDG_RUNTIME_DIR="/var/run"; \
# 	else \
# 		XDG_RUNTIME_DIR=$$XDG_RUNTIME_DIR; \
# 	fi; \
# 	if grep -q '^XDG_RUNTIME_DIR=' .env; then \
# 		sed -i 's/^XDG_RUNTIME_DIR=.*/XDG_RUNTIME_DIR='"$$XDG_RUNTIME_DIR"'/' .env; \
# 	else \
# 		echo 'XDG_RUNTIME_DIR='"$$XDG_RUNTIME_DIR"'' >> .env; \
# 	fi; \
# 	echo "XDG_RUNTIME_DIR in .env is now set to:" $$XDG_RUNTIME_DIR;
