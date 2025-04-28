# Delphi Frontend

## Overview

**Delphi** is an **automated programming analysis and assistance tool** designed to enhance the learning experience for beginner programmers. It serves as both a **virtual "pair programmer"** and an **assignment management system**. Delphi provides real-time feedback on programming assignments, combining automated grading, AI-driven code analysis, and a peer review system to promote active learning and reflective practices.

This repository contains the **frontend** codebase for Delphi, responsible for delivering a responsive and intuitive user experience for both students and educators.

Key functionalities include:
- Assignment creation and management.
- Code submission and automatic evaluation.
- Inline code reviews and peer feedback.
- AI-generated, guided error explanations and suggestions.
- Group management and peer collaboration.
- Secure user authentication and authorization via OAuth2 (Keycloak).

## Tech Stack

- **Framework:** React (with TypeScript)
- **Build Tool:** Vite
- **UI Libraries:** TailwindCSS, ShadCN
- **Editor:** Monaco Editor (VSCode-based code viewer)
- **State Management:** React Context API
- **Authentication:** OAuth2 / OpenID Connect via Keycloak
- **HTTP Requests:** REST API integration
- **Other Libraries:**
  - FilePond (file uploads)
  - react-markdown (rendering markdown content)
  - Custom adaptations for code review functionality

The frontend interacts with a backend API for user management, assignment workflows, code submissions, AI feedback, and peer reviews.

## Running the Frontend Locally

1. **Install dependencies**:
   ```bash
      npm install
   ```
2. Configure environment variables: Create a `.env` file at the root of the project with the following content:
  VITE_API_URL=https://your-backend-url/api
  VITE_KEYCLOAK_URL=https://your-keycloak-url
  VITE_KEYCLOAK_REALM=your-realm
  VITE_KEYCLOAK_CLIENT_ID=your-client-id
3. Start the development server:
  ```npm run dev```

# Backend Repository
The backend handles:
- Code execution and grading
- AI-assisted feedback generation
- Authentication and authorization (Keycloak)
- Group and assignment management
- Peer review system
- Exposes REST API endpoint for services and CRUD operations.

Backend Repository Link: [Backend](https://github.com/Szazlo/delphi-backend)
