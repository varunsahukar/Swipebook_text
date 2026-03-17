# Swipebook 

**Swipebook Text** is a modern textbook analysis chatbot web application built with **React**, **TypeScript**, **Vite**, **Tailwind CSS**, and **shadcn/ui**.  
It allows users to upload documents, ask custom prompts, and get intelligent summaries or answers powered by a **Large Language Model (LLM)**.

---

##  Features

-  **Document Upload**: Upload textbooks or study materials for analysis  
-  **Interactive Chat**: Ask questions or enter prompts related to the uploaded document  
-  **Smart Responses**: Receive instant summaries, explanations, or answers from the chatbot  
-  **Authentication**: Clean login and signup flow  
-  **Conversation Management**: Sidebar with “New Chat” functionality to manage multiple chats  

---

## Tech Stack

| Layer           | Technology                       |
|-----------------|---------------------------------|
| Frontend        | React + TypeScript               |
| Styling         | Tailwind CSS + shadcn/ui         |
| Build Tool      | Vite                             |
| Authentication  | Custom (Login / Signup pages)    |
| AI Engine       | Large Language Model (LLM) backend |
| Deployment      | Vercel                           |

---

## ⚡ Installation & Setup

Make sure you have **Node.js (v18+)** and **npm** installed.  
You can install Node via [nvm](https://github.com/nvm-sh/nvm).

```bash
# 1. Clone the repository
git clone https://github.com/varunsahukar/Swipebook_text.git

# 2. Navigate into the project directory
cd Swipebook_text

# 3. Install dependencies
npm install

# 4. Start the development server
npm run dev



Project Structure 
Swipebook_text/
├── public/          # Static assets
├── src/
│   ├── components/  # Reusable UI components
│   ├── pages/       # Login, Signup, Chat pages
│   ├── hooks/       # Custom React hooks
│   ├── services/    # API calls and LLM integrations
│   └── App.tsx      # Main application entry
├── package.json
└── vite.config.ts
