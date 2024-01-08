# Stage 1
FROM httpd:2.4-alpine as base

# Create a file with the hashed password
RUN echo "PORTAINER_HASH_PASSWORD=$(htpasswd -nb -B admin $PORTAINER_ADMIN_PASSWORD | cut -d ":" -f 2)" > /tmp/password.txt

# Stage 2
FROM portainer/portainer-ce

# Copy the hashed password file from stage 1
COPY --from=base /tmp/password.txt /tmp/password.txt

# Use the hashed password from the file to set admin password in portainer
CMD ["--admin-password", "$(cat /tmp/password.txt)"]
