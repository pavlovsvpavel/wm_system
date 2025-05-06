#!/bin/sh
set -e

echo "----- Add Docker's official GPG key -----"
sudo apt-get update
sudo apt-get install ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

echo "----- Add the repository to Apt sources -----"
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update

echo "----- Installing Docker -----"
if ! sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin -y; then
    echo "Error: Failed to install Docker"
    exit 1
fi

echo "----- Add your user to docker group -----"
sudo usermod -aG docker "$USER"

echo "----- Installing pip -----"
sudo apt-get update
sudo apt-get install -y python3-pip

echo "----- Installing google-cloud-storage -----"
sudo -u ubuntu bash -c "pip3 install --user --break-system-packages google-cloud-storage==3.1.0"

echo "----- Installing python-decouple -----"
sudo -u ubuntu bash -c "pip3 install --user --break-system-packages python-decouple==3.8"

echo "----- Creating the app directory -----"
if ! mkdir -p /home/ubuntu/app; then
    echo "Error: Failed to create the app directory."
    exit 1
fi

echo "----- Navigating to app directory -----"
cd /home/ubuntu/app

echo "----- Cloning the repository -----"
REPO_DIR="wm_system"
REPO_URL="https://$GH_PAT@github.com/pavlovsvpavel/wm_system.git"

[ -d "$REPO_DIR" ] && rm -rf "$REPO_DIR"
if ! git clone "$REPO_URL"; then
    echo "ERROR: Failed to clone repository"
    echo "Possible causes:"
    echo "1. Invalid GH_PAT token"
    echo "2. Repository doesn't exist"
    echo "3. Network issues"
    exit 1
fi
echo "Successfully cloned repository"

echo "----- Navigating to project directory -----"
cd wm_system

echo "----- Create directory ./backend/envs -----"
mkdir -p ./backend/envs/ || {
    echo "Error: Failed to create directory ./backend/envs/"
    exit 1
}

echo "----- Copying backend .env file -----"
if ! cp -a /home/ubuntu/app/envs/backend/.env.prod ./backend/envs/; then
    echo "Error: Failed to copy .env.prod to ./backend/envs/"
    exit 1
fi

echo "----- Create directory ./frontend/envs -----"
mkdir -p ./frontend/envs/ || {
    echo "Error: Failed to create directory ./frontend/envs/"
    exit 1
}

echo "----- Copying frontend .env file -----"
if ! cp -a /home/ubuntu/app/envs/frontend/.env.prod ./frontend/envs/; then
    echo "Error: Failed to copy frontend .env file."
    exit 1
fi

echo "----- Building images and running containers -----"
if ! sudo COMPOSE_BAKE=true docker compose -f docker-compose-prod.yml up -d --build; then
    echo "Error: Failed to build and run Docker containers."
    exit 1
fi
