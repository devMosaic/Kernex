# Contributing to Kernex

Thank you for your interest in contributing to Kernex! This guide will help you understand the development process and how to submit your changes to the main repository.

## 1. Prerequisites

Before you begin, ensure you have the following installed:
*   **Node.js:** v18.0.0 or higher
*   **Git:** Latest version
*   **A GitHub Account**

You should also be familiar with:
*   **React & TypeScript** (for frontend contributions)
*   **Fastify & Node.js** (for backend contributions)

---

## 2. Setting Up Your Environment

1.  **Fork the Repository:**
    Go to the official Kernex repository on GitHub and click the **Fork** button. This creates a copy of the project under your own account.

2.  **Clone Your Fork:**
    ```bash
    git clone https://github.com/Arjun-M/kernex.git
    cd kernex
    ```

3.  **Add Upstream Remote:**
    To keep your fork in sync with the main project, add the original repository as 'upstream':
    ```bash
    git remote add upstream https://github.com/Arjun-M/Kernex.git
    ```

4.  **Install Dependencies:**
    ```bash
    npm install
    ```

5.  **Start Development Server:**
    ```bash
    npm run dev
    ```
    This launches the backend on port `3000` and the frontend on port `5173`.

---

## 3. Making Changes

1.  **Create a New Branch:**
    Always create a new branch for your feature or bug fix. Do not commit directly to `main`.
    ```bash
    git checkout -b feature/my-amazing-feature
    # or
    git checkout -b fix/login-bug
    ```

2.  **Code Standards:**
    *   **TypeScript:** Use strict typing where possible. Avoid `any`.
    *   **Style:** Follow the existing project structure (Functional Components, Hooks).
    *   **Icons:** Use `lucide-react` for UI icons.

3.  **Commit Your Changes:**
    Write clear, concise commit messages.
    ```bash
    git add .
    git commit -m "feat: Add new dashboard widget"
    ```

---

## 4. Submitting a Pull Request (PR)

1.  **Sync with Upstream:**
    Before pushing, make sure your branch is up to date with the latest changes from the main project to avoid conflicts.
    ```bash
    git fetch upstream
    git merge upstream/main
    ```

2.  **Push to Your Fork:**
    ```bash
    git push origin feature/my-amazing-feature
    ```

3.  **Open the PR:**
    *   Go to the original Kernex repository on GitHub.
    *   You should see a banner asking if you want to create a Pull Request from your pushed branch.
    *   Click **Compare & pull request**.

4.  **Fill out the Template:**
    *   **Description:** Explain *what* you changed and *why*.
    *   **Screenshots:** If your change is visual, include screenshots or a GIF.
    *   **Test Plan:** How can we verify your changes?

---

## 5. Review Process

*   The maintainers will review your code.
*   They might ask for changes or improvements.
*   Once approved, your code will be merged into the `main` branch.

**Welcome to the team!** 🚀
