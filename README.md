# 🚀 Slack Clone - Professional Full-Stack Project

A sophisticated, Slack-inspired real-time communication platform built with modern web technologies. This project demonstrates excellence in building complex UI/UX, real-time database integration, and scalable application architecture.

### [Live Preview](https://slack-clone-gamma-azure.vercel.app/)

## ✨ Key Features

- **Real-Time Messaging**: Instant message delivery and updates powered by Convex.
- **High-Fidelity Workspace Selection**: Redesigned `/workspace-select` page matching Slack's official "Launch" interface.
- **Mobile App (PWA)**: Support for installation on mobile and desktop home screens for a native app experience.
- **Premium Sidebar Styling**: Glassmorphic active states for channels and DMs with a "Premium Tint" aesthetic.
- **Dynamic Channels**: Create and manage multiple workspace channels for organized discussions.
- **Draggable Layout**: Premium, responsive UI with resizable sidebar and chat panels.
- **Secure Authentication**: Modern session management and user profiling.

## 🛠️ Tech Stack

- **Frontend**: [Next.js 15](https://nextjs.org/) (App Router), [React](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/)
- **Backend**: [Convex](https://convex.dev/) (Real-time Database & Functions)
- **Authentication**: [Better Auth](https://www.better-auth.com/)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/), [Lucide React](https://lucide.dev/)
- **Rich Text Editor**: [TipTap](https://tiptap.dev/)
- **PWA**: Native manifest-based standalone support

## 🏗️ Getting Started

### Prerequisites

- Node.js (Latest LTS)
- NPM or PNPM

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/saksak218/Slack-Clone.git
    cd Slack-Clone
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env.local` file and add your Convex and Auth details:

    ```env
    CONVEX_DEPLOYMENT=your_deployment_id
    NEXT_PUBLIC_CONVEX_URL=your_convex_url
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📁 Project Structure

```text
├── app/              # Next.js App Router & Pages
├── components/       # Reusable UI components
├── convex/           # Backend schema and functions
├── lib/              # Utility functions and shared logic
├── hooks/            # Custom React hooks
└── public/           # Static assets, manifest, and icons
```

---

<p align="center">
  Built with ❤️ by Suleman Altaf
</p>
