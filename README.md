# 📚 OSLearn (OSL) – Open-Source Language Learning Platform

**OSLearn** is a community-driven platform where anyone can create, upload, and share language courses.  
From popular languages to rare or constructed ones, OSLearn supports vocabulary drills, grammar lessons, and pronunciation guides — all in an open, collaborative environment.

---

## ✨ Features

- **Course Creation**  
  Build courses in multiple formats — text, multiple choice, audio, and more.  
  Group lessons into units with **progress tracking**.

- **Learner Dashboard**  
  Monitor progress, set learning goals, get daily reminders, and revisit tricky topics.

- **Review & Quiz Engine**  
  Flashcards and quizzes with **spaced repetition**.  
  Auto-generated reviews based on learner performance.

- **Course Discovery**  
  Browse or search by language, popularity, difficulty, or tags.  
  Preview course content before enrolling.

- **Community Contributions**  
  Rate courses, leave feedback, upvote helpful explanations, and suggest edits to open content.

---

## 🛠️ Tech Stack

| Layer        | Technology                                                            |
| ------------ | --------------------------------------------------------------------- |
| **Frontend** | [Next.js](https://nextjs.org/)                                        |
| **Backend**  | [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction) |
| **Database** | [Supabase](https://supabase.com/)                                     |
| **Content**  | [Notion](https://www.notion.so/) (Dev Planning)                       |
| **Testing**  | [Jest](https://jestjs.io/)                                            |
| **Storage**  | Supabase Storage (audio, images, files)                               |

---

## 📚 Core Modules

### **API**

- **Course API** – CRUD for courses, units, and lessons
- **User Progress API** – Track scores, lesson completion, streaks
- **Quiz Engine API** – Deliver and score quizzes/flashcards
- **Community API** – Ratings, comments, edits, moderation

### **UI Pages**

- **Course Explorer** – Browse/search and preview courses
- **Lesson Player** – Interactive lessons with quizzes and media
- **Course Builder** – Markdown-style content creation and editing
- **Review Dashboard** – Personalized recap and practice
- **User Profile** – Track progress, created courses, and contributions

---

## 🗄️ Database Entities

- **Courses** – Title, description, language, tags, author, difficulty
- **Lessons** – Linked to courses, includes content & media
- **User Progress** – Tracks completed lessons, quiz scores, streaks
- **Community Feedback** – Ratings, comments, upvotes, suggested edits
- **Media Storage** – Audio, images, supplementary files

---

## 🚀 Getting Started

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/your-org/oslearn.git
cd oslearn
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Set Environment Variables

Create a `.env.local` file in the root directory:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key
```

### 4️⃣ Run the Development Server

```bash
npm run dev
```

#### Then open http://localhost:3000 in your browser.

### 🧪 Testing

```bash
npm test
```