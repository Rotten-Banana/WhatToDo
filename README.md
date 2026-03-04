## WhatToDo – Recursive Decision Wheel

WhatToDo is a **React + TypeScript** web application that helps you decide *what to do next* using a visual, weighted **wheel of choices**.  
You can create nested lists (a “tree” of todos), assign priorities, and then spin the wheel to randomly select the next item, biased by priority.

The app is a **pure front‑end** SPA that:
- **Persists data in `localStorage`** in the browser (no backend dependency)
- Supports **nested / hierarchical todo items**
- Uses a **weighted random spin** based on item priority
- Provides a clean, modern UI optimized for desktop browsers

---

## Application Overview

### Tech stack

- **Frontend**: React 19, TypeScript, Vite
- **State management**: React Context (`TodoContext`) for todo tree and navigation
- **Persistence**: `LocalStorageTodoService` storing JSON under the key `recursive_todo_wheel_v1`
- **Styling / UI**: Custom components (`Wheel`, `WheelItem`, `ItemModal`, `Button`) with CSS

### Core concepts

- **Todo items (`TodoItem`)**
  - Fields include `id`, `title`, `priority`, `completed`, `children`, and `parentId`.
  - Items can be nested arbitrarily deep to represent categories and sub‑tasks.

- **Wheel view**
  - The `Wheel` component renders all items at the current level as slices around a circular wheel.
  - Each slice represents an item; clicking a slice either:
    - Navigates into its children (if it has any), or
    - Shows it as the selected “winner”.

- **Priority & weighted spin**
  - When you click **Spin!**, the app computes a weighted random choice:
    - Each item’s weight is `priority` (default 1).
    - Higher priority items are more likely to be selected.
  - The wheel animates several full rotations then stops with the chosen item at the pointer.

- **Navigation**
  - The app tracks the current “path” of item IDs in `currentPath`.
  - **Back** moves up one level in the hierarchy.
  - Adding items at the root or as children updates the tree and is persisted.

---

## Local development

- **Install dependencies**

```bash
npm install
```

- **Run the app locally (Vite dev server)**

```bash
npm run dev
```

This starts the app (by default on `http://localhost:5173`) with hot module reloading.

- **Build for production**

```bash
npm run build
```

- **Preview the production build**

```bash
npm run preview
```

- **Lint the code**

```bash
npm run lint
```

---

## Docker image

The project includes a **Docker configuration** for containerizing the frontend:

- **Image name**: `13rottenbanana/whattodo`
- **Definition**: `docker-compose.yml` and `Dockerfile`

`docker-compose.yml`:


### Build and run locally with Docker

- **Build the image**

```bash
docker compose build whattodo
```

- **Run the container**

```bash
docker compose up whattodo
```

The container is built from the production bundle and served on port 80 inside the container (exposed according to your `Dockerfile` / compose configuration).

---

## CI/CD Overview

This repo is wired with a **GitHub Actions → Docker Hub → ArgoCD + Kubernetes** flow:

1. **GitHub Actions** builds and pushes a Docker image on every push to `main`.
2. The image is published to **Docker Hub** repository `13rottenbanana/whattodo`.
3. **ArgoCD Image Updater** watches this image and updates the Kubernetes manifests (by digest).
4. **ArgoCD** continuously syncs the `k8s` manifests from this GitHub repo into the cluster.
5. Kubernetes rolls out the new Deployment using the updated image.

The following sections describe each piece in more detail.

---

## CI – GitHub Actions (build & push image)

The workflow is defined in `.github/workflows/build-image.yaml`:


- **Trigger**: any push to the `main` branch.
- **Login**: uses `docker/login-action` with Docker Hub credentials stored as GitHub secrets.
- **Build**: runs `docker compose build whattodo`, using the `Dockerfile` at repo root.
- **Push**: runs `docker compose push whattodo`, publishing to `13rottenbanana/whattodo`.
- **Cleanup**: prunes dangling images to keep the runner clean.

**Result**: Every merge to `main` produces a new Docker image in Docker Hub, ready for deployment.

---

## CD – Kubernetes Manifests

Kubernetes manifests live under the `k8s/` directory.

### Deployment

`k8s/deployement.yaml`:

- **Namespace**: `test`
- **Replicas**: 1
- **Container image**: `13rottenbanana/whattodo` (tag/digest managed by ArgoCD Image Updater)
- **Port**: exposes container port 80 (suitable for a static web server / reverse proxy)
- **Resources**: small CPU and memory requests/limits for lightweight frontend workloads.

Additional manifests (e.g. `service.yaml`, `httproute.yaml`) expose the app inside the cluster and, depending on your ingress/controller, to the outside world.

---

## CD – ArgoCD & Image Updater

ArgoCD configuration is defined in `argoCDConfig.yaml`:

- **ArgoCD Application**
  - Watches the Git repo `Rotten-Banana/WhatToDo`, branch `main`, path `k8s`.
  - Deploys manifests into the `test` namespace of the in‑cluster Kubernetes API.
  - **Automated sync**:
    - `prune: true` removes resources no longer defined in Git.
    - `selfHeal: true` reconciles drift if in‑cluster resources are modified manually.

- **ArgoCD Image Updater**
  - Annotation `argocd-image-updater.argoproj.io/image-list` declares the tracked image:
    - Logical name `whattodo` → image `13rottenbanana/whattodo`.
  - `argocd-image-updater.argoproj.io/whattodo.update-strategy: digest`:
    - Uses **digest‑based updates** so ArgoCD can deploy the exact image built by CI.

**End‑to‑end flow:**

1. Developer pushes code to `main`.
2. GitHub Actions builds and pushes a new Docker image to `13rottenbanana/whattodo`.
3. ArgoCD Image Updater detects the new image digest and updates the Kubernetes manifests (or Application parameters) accordingly.
4. ArgoCD notices the change in Git (or in Application parameters), and syncs the updated spec to the cluster.
5. Kubernetes rolls out the new `whattodo` Deployment with the updated image.

---

## Summary

- **WhatToDo** is a recursive, wheel‑based decision helper built with React + TypeScript, persisting data in the browser via `localStorage`.
- The app is containerized with Docker and published to **Docker Hub**.
- A **GitHub Actions** workflow builds and pushes the image on every push to `main`.
- **ArgoCD + Image Updater + Kubernetes** provide automated, GitOps‑style continuous delivery of the latest image to the `test` namespace.
