FROM portainer/portainer-ce

# RUN apk update && apk upgrade && apk add --no-cache bash
# Run command to create admin user
# RUN /usr/local/bin/docker-entrypoint.sh -c /dev/null --admin-password $PORTAINER_ADMIN_PASSWORD --admin-username $PORTAINER_ADMIN_USERNAME

COPY . /

CMD ["--admin-password", "${PORTAINER_ADMIN_PASSWORD}"] 
# , "--admin-username", "${PORTAINER_ADMIN_USERNAME}"]
