# 🚀 Slack Clone - Professional Full-Stack Project

A sophisticated, Slack-inspired real-time communication platform built with modern web technologies. This project demonstrates excellence in building complex UI/UX, real-time database integration, and scalable application architecture.

![Slack Clone Preview](https://github.com/user-attachments/assets/preview-placeholder)

## ✨ Key Features

- **Real-Time Messaging**: Instant message delivery and updates powered by Convex.
- **Dynamic Channels**: Create and manage multiple workspace channels for organized discussions.
- **Draggable Layout**: Premium, responsive UI with resizable sidebar and chat panels.
- **Modern Authentication**: Secure user sessions and profile management.
- **Rich Aesthetics**: A polished "Classic Slack" design with smooth transitions and subtle micro-animations.

## 🛠️ Tech Stack

- **Frontend**: [Next.js](https://nextjs.org/) (App Router), [React](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/)
- **Backend**: [Convex](https://convex.dev/) (Real-time Database & Functions)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/), [Lucide React](https://lucide.dev/)
- **State Management**: React Hooks & Convex Subscriptions
- **Layout Control**: [React Resizable Panels](https://github.com/bvaughn/react-resizable-panels)

## 🏗️ Getting Started

### Prerequisites

- Node.js (Latest LTS)
- NPM or PNPM

### Installation

1. **Clone the repository:**

   ```bash
   git clone <your-repo-url>
   cd slack-clone
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env.local` file and add your Convex deployment details:

   ```env
   CONVEX_DEPLOYMENT=your_deployment_id
   NEXT_PUBLIC_CONVEX_URL=your_convex_url
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📁 Project Structure

```text
├── app/              # Next.js App Router & Pages
├── components/       # Reusable UI components
│   ├── ui/           # Primitive UI components (Shadcn)
│   └── ...           # Feature-specific components
├── convex/           # Backend schema and functions
├── lib/              # Utility functions and shared logic
└── public/           # Static assets
```

---

<p align="center">
  Built with ❤️ by RC
</p>
