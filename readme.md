# Inspire Dream Blog Website

Inspire Dream is a blog website which include multiple user blog writing features. It use Next.JS
fontend and Express.JS backend. The data are stored inside MySQL database and CI/CD is deployed by
Docker Compose. It efficiently utilize Nginx Web Server to handle multiple incoming requests and
include auto back up system using Node Crons. The project has been successfully experienced fully
functional on Cent OS Stream Linux Distro (VPS).

The project is built open-source and you are free to collaborate and recreate on it. If you have any
prospective ideas or something confused, it is always welcome to reach out to me.

To learn and need help to deploy, I am ready to gratefully corporate with you, dear friend. You can easily contact my visiting [sailinhtut.dev](https://sailinhtut.dev).

> Made with ❤️ by Sai Lin Htut

## Installation
**System Requirements**
- Cent OS Stream 9+
    - RAM 1GB+, Storage 20GB+
- Docker & Docker Compose 
- Nginx Web Server

Step 1: Please build linux server by choosing Cent OS Distro.

Step 2: Install `docker` by running these commands.
```bash
sudo dnf remove docker \
                docker-client \
                docker-client-latest \
                docker-common \
                docker-latest \
                docker-latest-logrotate \
                docker-logrotate \
                docker-engine

sudo dnf -y install dnf-plugins-core
sudo dnf config-manager \
    --add-repo https://download.docker.com/linux/centos/docker-ce.repo

sudo dnf install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

sudo systemctl start docker
sudo systemctl enable docker

sudo docker run hello-world
```

Step 3: Install `nginx` web server by running these commands.
```bash
sudo dnf install nginx -y
```

Step 4: Install `git` application by running these commands.
```bash
sudo dnf install git -y
```

Step 5: Clone `inspire-dream-fontend` and `inspire-dream-backend` in following structures.
```bash
root
   └ repositories
                 ├ inspire-dream-fontend
                 └ inspire-dream-backend
   
```

