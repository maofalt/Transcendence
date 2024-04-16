#!/bin/bash

# Get a list of all staged files
staged_files=$(git diff --name-only --cached)

# Check if there are any staged files
if [ -z "$staged_files" ]; then
  echo "No files are staged for commit."
  exit 0
fi

# Loop through each staged file
for file in $staged_files; do
  # Commit each file individually with a commit message
  git commit -m "delete $file" $file
done

echo "All files have been committed individually."
