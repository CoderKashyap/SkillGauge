# QuizMaster Application

A full-stack Quiz application with authentication, skill-based quizzes, and scoring.

## Tech Stack

- **Frontend:** React, TypeScript, React Hook Form, Wouter, TailwindCSS
- **Backend:** Node.js, TypeScript, Express, MySQL, Drizzle ORM
- **Other:** Zod for validation, Toast notifications

---

## Setup Instructions



```bash

1. Clone the repo:
git clone https://github.com/CoderKashyap/SkillGauge.git

2. Install dependencies
npm install

3. Setup .env file:
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=quizdb
JWT_SECRET=yourjwtsecret

4. Run migrations or ensure database schema is created (see DB schema below)

5. Start application:
npm run dev




**API Documentation**

**Auth**

POST /api/auth/login
Request: { username: string, password: string }
Response: { user, token }

POST /api/auth/register
Request: { username, password, role }
Response: { user, token }

**Quizzes**

GET /api/skills — List skills
GET /api/questions?skillId=:id — Fetch questions by skill
POST /api/quiz-attempts — Submit quiz answers

Request:
{
  "skillId": "1",
  "answers": [
    { "questionId": 1, "selectedAnswer": "One" },
    { "questionId": 2, "selectedAnswer": "Two" }
  ]
}


Response:
{
  "id": 22,
  "userId": 1,
  "skillId": 1,
  "score": 1,
  "totalQuestions": 2
}




**Database Schema**


The application uses a MySQL database with the following tables and relationships.

### 1. Users

Stores registered users, including their login credentials and roles.

| Column    | Type           | Description                            |
|------------|----------------|----------------------------------------|
| id         | INT            | Primary key, auto-incremented.         |
| username   | VARCHAR(50)    | Unique username for login.             |
| password   | VARCHAR(255)   | Hashed user password.                  |
| role       | ENUM('admin', 'user') | Defines whether the user is an admin or a regular user. |
| createdAt  | DATETIME       | Timestamp of account creation.         |

---

### 2. Skills

Represents different skill categories that quizzes belong to.

| Column    | Type           | Description                            |
|------------|----------------|----------------------------------------|
| id         | INT            | Primary key, auto-incremented.         |
| name       | VARCHAR(100)   | Name of the skill (e.g., JavaScript, Node.js). |
| createdAt  | DATETIME       | Timestamp of creation.                 |

---

### 3. Questions

Contains all questions associated with a specific skill.

| Column        | Type            | Description                            |
|----------------|-----------------|----------------------------------------|
| id             | INT             | Primary key, auto-incremented.         |
| skillId        | INT             | Foreign key referencing `skills(id)`.  |
| questionText   | TEXT            | The quiz question text.                |
| options        | JSON            | Array of multiple-choice options.      |
| correctAnswer  | VARCHAR(255)    | The correct answer.                    |
| difficulty     | ENUM('easy', 'medium', 'hard') | Difficulty level of the question. |
| createdAt      | DATETIME        | Timestamp of creation.                 |

---

### 4. Quiz Attempts

Stores each attempt made by a user when they take a quiz.

| Column         | Type        | Description                            |
|----------------|-------------|----------------------------------------|
| id             | INT         | Primary key, auto-incremented.         |
| userId         | INT         | Foreign key referencing `users(id)`.   |
| skillId        | INT         | Foreign key referencing `skills(id)`.  |
| score          | INT         | Number of correct answers.             |
| totalQuestions | INT         | Total number of questions in the quiz. |
| createdAt      | DATETIME    | Timestamp of the attempt.              |

---

### 5. Quiz Answers

Stores each answer submitted for a specific quiz attempt.

| Column         | Type         | Description                            |
|----------------|--------------|----------------------------------------|
| id             | INT          | Primary key, auto-incremented.         |
| attemptId      | INT          | Foreign key referencing `quizAttempts(id)`. |
| questionId     | INT          | Foreign key referencing `questions(id)`. |
| selectedAnswer | VARCHAR(255) | The answer chosen by the user.         |
| isCorrect      | BOOLEAN      | Indicates if the answer was correct.   |
| createdAt      | DATETIME     | Timestamp of the record.               |

---

### Relationships

- A **user** can have multiple **quiz attempts**.
- Each **skill** can have multiple **questions**.
- A **quiz attempt** can have multiple **quiz answers**.
- Each **question** can appear in multiple **quiz answers**.
- All foreign key relationships are set to cascade on delete to maintain data integrity.

