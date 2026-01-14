<div align="center">
  <h1>Kolabo</h1>
  <p><b>Real-time Collaborative Text Editor with Custom CRDT Implementation</b></p>

  <img src="https://img.shields.io/badge/TypeScript-3178C6.svg?style=for-the-badge&logo=typescript&logoColor=white" alt="Typescript" />
  <img src="https://img.shields.io/badge/Spring%20Boot-4.0.1-6DB33F.svg?style=for-the-badge&logo=springboot&logoColor=white" alt="Spring Boot" />
  <img src="https://img.shields.io/badge/React-19-61DAFB.svg?style=for-the-badge&logo=react&logoColor=white" alt="React" />
</div>

---

## Overview
Kolabo is a **production-grade collaborative text editor** built from the ground up without relying on external CRDT libraries.
This project demonstrates deep understanding of real-time communication patterns, conflict-resolution algorithms and database optimization strategies using
PostgreSQL and Redis - skills essential for building performant, large-scale multi-user applications.

> **Motivation**: Inspired by *Designing Data-Intensive Applications* by Martin Kleppmann, I wanted to implement the theoretical concepts from the book into a practical, working application
that showcases real-world engineering challenges

## Features

### Current
- **User Authentication** - Secure, session-based authentication with Redis-backed session storage
- **Document Management** - Create, own, and organize personal documents
- **Collaborative System** - Invite users to documents with granular permission control (Viewer/Editor)
- **Real-time Synchronization** - Instant updates across all connected clients via WebSockets
- **Conflict Resolution** - Custom position-based CRDT ensures consistency without merge conflicts
- **Dark/Ligh Mode** - Accessible UI with theme persistence
- **Modern, intuitive and accessible UI/UX** - Easily navigate through the application structure

### Coming Soon
- **Live Cursor Positions** - See collaborators' cursor positions in real-time
- **Cloud Persistence** - Automatic document state saving and recovery
- **Anonymus Sharing** - Invite users without accounts via shareable links
- **Optimized for Scale** — PostgreSQL and Redis caching strategies designed to maintain low-latency performance under high concurrent user loads

### Technology stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | React 19, TypeScript, Vite | Modern SPA with type safety |
| **UI Framework** | Tailwind CSS, Base UI, shadcn/ui | Accessible, customizable components |
| **Backend** | Spring Boot 4.0.1, Java 17 | Enterprise-grade REST API |
| **Real-time** | WebSocket (Spring WebSocket) | Bidirectional communication |
| **Database** | PostgreSQL | Primary data persistence |
| **Session Store** | Redis | Distributed session management |
| **Migrations** | Flyway | Database version control |
| **Validation** | Zod (frontend), Hibernate Validator (backend) | Schema validation |

---

## Highlights

### Custom CRDT Implementation
The core of Kolabo is a **position-based CRDT (Conflict-free Replicated Data Type)** implemented independently in both TypeScript (client) and Java (server). This ensures:
- **Eventual Consistency** - All clients converge to the same document state
- **No Central Authority** — Operations can be applied in any order
- **No Merge Conflicts** — Concurrent edits are automatically resolved

**Why even bother with building CRDT from scratch?** There are a few reasons to why I've wanted to learn something more to CRDTs beyond using pre-implemeneted methods from already existent libraries.
1. **Deep understanding** - Implementing core algorithms from first principles demonstrates mastery beyond library usage
2. **Customization** - Full control over optimization strategies and edge case handling
3. **Interview Talking Point** — Ability to explain trade-offs (operation-based vs state-based CRDTs, tombstone garbage collection, etc.)

### Real-time Architecture Patterns
The real-time sync layer transmits character-level operations via WebSocket,
minimizing payload size while maintaining edit granularity.

Operations are queued client-side and flushed at 200ms intervals to reduce network overhead
without sacrificing responsiveness. The UI follows an optimistic update pattern—local changes
render immediately while syncing occurs in the background, ensuring a snappy editing experience.
When connections drop, the client automatically reconnects and recovers document state seamlessly.

## Getting started

### Prerequisities
- **Node.js** v20+ with pnpm
- **Java** 17+
- **PostgreSQL** 15+
- **Redis** 7+

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/konradsic/kolabo.git
cd kolabo
```
2. **Set up the backend**
```bash
cd api
cp .env.example .env # And configure variables in .env
./mvnw spring-boot:run # or ./mvnw.cmd
```
3. **Set up the frontend**
```bash
cd web
pnpm install
pnpm build
pnpm preview # or host static Vite files elsewhere
```
4. **Access the application** Enter `http://localhost:4173` to access the web interface. The API will be available at `http://localhost:8080`
