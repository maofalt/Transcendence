#!/bin/bash

# Prompt user for passphrase
read -s -p "Enter passphrase for encryption/decryption: " ENV_PASSPHRASE
echo

# Prompt user for passphrase confirmation
read -s -p "Confirm passphrase: " CONFIRM_PASSPHRASE
echo

# Check if the passphrases match
if [ "$ENV_PASSPHRASE" != "$CONFIRM_PASSPHRASE" ]; then
    echo "Passphrases do not match. Exiting."
    exit 1
fi

# Directory where scripts will be placed
HOOKS_DIR=".git/hooks"

# Create pre-commit script
cat <<EOL > "$HOOKS_DIR/pre-commit"
#!/bin/bash
ENV_LOCATION="srcs/"
ENV_FILE="\$ENV_LOCATION.env"
ENV_EXAMPLE_FILE="\$ENV_LOCATION.env.example"
ENV_GPG_FILE="\$ENV_LOCATION.env.gpg"
ENV_PASSPHRASE="$ENV_PASSPHRASE"

# Encrypt .env using GPG with passphrase option
rm -f \$ENV_GPG_FILE
gpg --batch --passphrase "\$ENV_PASSPHRASE" -c \$ENV_FILE

# Add the encrypted file to the staging area and delete it
git add -f \$ENV_GPG_FILE
# rm -f \$ENV_GPG_FILE

## Generate example .env file ##
if [ -f "\$ENV_FILE" ]; then
    # Create or truncate the .env.example file
    > "\$ENV_EXAMPLE_FILE"

    # Read each line from the .env file
    while IFS= read -r line; do
        # Check if the line is not empty and does not start with #
        if [[ ! -z "\$line" && "\$line" != \#* ]]; then
            # Extract the variable name
            variable_name=\$(echo "\$line" | cut -d'=' -f1)
            
            # Append the variable name to the .env.example file
            echo "\$variable_name=''" >> "\$ENV_EXAMPLE_FILE"
        else
            # Append the line to the .env.example file
            echo "\$line" >> "\$ENV_EXAMPLE_FILE"
        fi
    done < "\$ENV_FILE"

    # Process the last line, if it doesn't end with a newline character
    if [ ! -z "\$line" ]; then
        variable_name=\$(echo "\$line" | cut -d'=' -f1)
        echo "\$variable_name=''" >> "\$ENV_EXAMPLE_FILE"
    else
        echo "\$line" >> "\$ENV_EXAMPLE_FILE"
    fi

    echo "Generated \$ENV_EXAMPLE_FILE successfully."

    # Add the example file to the staging area
    git add "\$ENV_EXAMPLE_FILE"
fi
EOL

# Create post-merge script
cat <<EOL > "$HOOKS_DIR/post-merge"
#!/bin/bash
ENV_LOCATION="srcs/"
ENV_FILE="\$ENV_LOCATION.env"
ENV_EXAMPLE_FILE="\$ENV_LOCATION.env.example"
ENV_GPG_FILE="\$ENV_LOCATION.env.gpg"
ENV_PASSPHRASE="$ENV_PASSPHRASE"

# Decrypt .env.gpg using GPG with passphrase option
if [ -f "\$ENV_GPG_FILE" ]; then
	gpg --batch --passphrase="\$ENV_PASSPHRASE" -d \$ENV_GPG_FILE > \$ENV_FILE
fi

# Remove the encrypted file
rm -f \$ENV_GPG_FILE

git rm --cached srcs/.env.gpg

EOL

# Create post-checkout script
cat <<EOL > "$HOOKS_DIR/post-checkout"
#!/bin/bash
ENV_LOCATION="srcs/"
ENV_FILE="\$ENV_LOCATION.env"
ENV_EXAMPLE_FILE="\$ENV_LOCATION.env.example"
ENV_GPG_FILE="\$ENV_LOCATION.env.gpg"
ENV_PASSPHRASE="$ENV_PASSPHRASE"

# Decrypt .env.gpg using GPG with passphrase option
if [ -f "\$ENV_GPG_FILE" ]; then
	gpg --batch --passphrase="\$ENV_PASSPHRASE" -d \$ENV_GPG_FILE > \$ENV_FILE
fi

# Remove the encrypted file
rm -f \$ENV_GPG_FILE

git rm --cached srcs/.env.gpg

EOL

# Make the scripts executable
chmod +x "$HOOKS_DIR/pre-commit" "$HOOKS_DIR/post-merge" "$HOOKS_DIR/post-checkout"

echo "Scripts have been generated and placed in $HOOKS_DIR directory."
