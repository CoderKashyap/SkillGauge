CREATE TABLE `questions` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`skill_id` varchar(36) NOT NULL,
	`question_text` text NOT NULL,
	`options` json NOT NULL,
	`correct_answer` text NOT NULL,
	`difficulty` varchar(20) NOT NULL DEFAULT 'medium',
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `questions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quiz_answers` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`attempt_id` varchar(36) NOT NULL,
	`question_id` varchar(36) NOT NULL,
	`selected_answer` text NOT NULL,
	`is_correct` boolean NOT NULL,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `quiz_answers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quiz_attempts` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`user_id` varchar(36) NOT NULL,
	`skill_id` varchar(36) NOT NULL,
	`score` int NOT NULL,
	`total_questions` int NOT NULL,
	`started_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`completed_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `quiz_attempts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `skills` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`name` varchar(100) NOT NULL,
	`description` text,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `skills_id` PRIMARY KEY(`id`),
	CONSTRAINT `skills_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`username` varchar(100) NOT NULL,
	`email` varchar(150) NOT NULL,
	`password` text NOT NULL,
	`role` varchar(50) NOT NULL DEFAULT 'user',
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_username_unique` UNIQUE(`username`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
ALTER TABLE `questions` ADD CONSTRAINT `questions_skill_id_skills_id_fk` FOREIGN KEY (`skill_id`) REFERENCES `skills`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `quiz_answers` ADD CONSTRAINT `quiz_answers_attempt_id_quiz_attempts_id_fk` FOREIGN KEY (`attempt_id`) REFERENCES `quiz_attempts`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `quiz_answers` ADD CONSTRAINT `quiz_answers_question_id_questions_id_fk` FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `quiz_attempts` ADD CONSTRAINT `quiz_attempts_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `quiz_attempts` ADD CONSTRAINT `quiz_attempts_skill_id_skills_id_fk` FOREIGN KEY (`skill_id`) REFERENCES `skills`(`id`) ON DELETE cascade ON UPDATE no action;