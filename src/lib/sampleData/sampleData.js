// Sample data generation utilities for CivicSparkAI
import { faker } from '@faker-js/faker';

// Helper to generate a random integer between min and max (inclusive)
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Helper to pick a random item from an array
const randomItem = (array) => array[Math.floor(Math.random() * array.length)];

// Generate sample quiz data
export const generateQuizzes = (count = 10) => {
  const topics = ['Government', 'Democracy', 'Civil Rights', 'Constitution', 'Local Government', 
                 'Elections', 'Civic Responsibility', 'Public Policy', 'Legal System', 'International Relations'];
  
  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    title: `${randomItem(topics)} Quiz ${index + 1}`,
    description: faker.lorem.paragraph(),
    topic: randomItem(topics),
    difficulty_level: randomItem(['Beginner', 'Intermediate', 'Advanced']),
    time_limit: randomInt(10, 30), // minutes
    passing_score: randomInt(60, 80),
    created_at: faker.date.past(),
    updated_at: faker.date.recent(),
    is_published: Math.random() > 0.1, // 90% are published
    questions: generateQuizQuestions(randomInt(5, 10))
  }));
};

// Generate sample quiz questions with answer options
const generateQuizQuestions = (count = 5) => {
  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    question_text: faker.lorem.sentence() + '?',
    explanation: faker.lorem.paragraph(),
    points: randomInt(1, 5),
    type: randomItem(['multiple_choice', 'true_false']),
    answer_options: generateAnswerOptions()
  }));
};

// Generate answer options for a question
const generateAnswerOptions = () => {
  const count = randomInt(2, 4);
  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    option_text: faker.lorem.sentence(),
    is_correct: index === 0 // First option is correct
  }));
};

// Generate sample lessons data
export const generateLessons = (count = 8) => {
  const topics = ['Government Structure', 'Voting Rights', 'Constitutional Law', 'Civil Liberties',
                 'Local Politics', 'Public Administration', 'Civic Engagement', 'Policy Making'];
  
  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    title: `${randomItem(topics)} Lesson ${index + 1}`,
    description: faker.lorem.paragraph(),
    content: faker.lorem.paragraphs(5),
    topic: randomItem(topics),
    difficulty_level: randomItem(['Beginner', 'Intermediate', 'Advanced']),
    estimated_duration: randomInt(15, 60), // minutes
    created_at: faker.date.past(),
    updated_at: faker.date.recent(),
    is_published: Math.random() > 0.1, // 90% are published
    resources: generateLessonResources()
  }));
};

// Generate additional resources for lessons
const generateLessonResources = () => {
  return Array.from({ length: randomInt(2, 5) }, () => ({
    title: faker.lorem.words(3),
    url: faker.internet.url(),
    type: randomItem(['article', 'video', 'document'])
  }));
};

// Generate sample simulation data
export const generateSimulations = (count = 5) => {
  const scenarios = ['City Council Meeting', 'Court Proceedings', 'Election Campaign',
                    'Legislative Session', 'Public Debate', 'Crisis Management'];
  
  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    title: `${randomItem(scenarios)} Simulation`,
    description: faker.lorem.paragraph(),
    scenario: faker.lorem.paragraphs(2),
    roles: generateSimulationRoles(),
    objectives: Array.from({ length: randomInt(3, 5) }, () => faker.lorem.sentence()),
    estimated_duration: randomInt(30, 120), // minutes
    difficulty_level: randomItem(['Beginner', 'Intermediate', 'Advanced']),
    max_participants: randomInt(4, 12),
    is_published: Math.random() > 0.2 // 80% are published
  }));
};

// Generate roles for simulations
const generateSimulationRoles = () => {
  return Array.from({ length: randomInt(4, 8) }, () => ({
    title: faker.person.jobTitle(),
    description: faker.lorem.paragraph(),
    responsibilities: Array.from({ length: randomInt(2, 4) }, () => faker.lorem.sentence())
  }));
};

// Generate quiz attempts for a user
const generateQuizAttempts = (userId, quizCount = 10) => {
  return Array.from({ length: quizCount }, () => ({
    quiz_id: randomInt(1, 20), // Assuming we have 20 quizzes
    score: randomInt(0, 100),
    time_taken: randomInt(5, 30), // minutes
    completed_at: faker.date.recent(),
    questions_correct: randomInt(0, 10),
    total_questions: 10,
    passed: Math.random() > 0.2 // 80% pass rate
  }));
};

// Generate sample achievements data
export const generateAchievements = (count = 15) => {
  const types = ['Quiz Master', 'Simulation Expert', 'Lesson Completer', 'Community Leader',
                'Knowledge Seeker', 'Active Participant', 'Perfect Score'];
  
  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    title: `${randomItem(types)} Level ${randomInt(1, 3)}`,
    description: faker.lorem.sentence(),
    points: randomInt(50, 500),
    icon_url: faker.image.urlPicsumPhotos(),
    requirements: faker.lorem.sentence(),
    type: randomItem(types),
    rarity: randomItem(['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'])
  }));
};

// Generate user progress data
export const generateUserProgress = (userId) => {
  return {
    user_id: userId,
    total_points: randomInt(1000, 10000),
    quizzes_completed: randomInt(5, 50),
    lessons_completed: randomInt(3, 30),
    simulations_completed: randomInt(1, 10),
    achievements_earned: randomInt(3, 15),
    current_level: randomInt(1, 20),
    exp_points: randomInt(0, 1000),
    next_level_exp: 1000,
    quiz_average_score: randomInt(60, 100),
    time_spent_learning: randomInt(1000, 10000), // minutes
    last_activity_date: faker.date.recent(),
    learning_streak: randomInt(1, 30),
    favorite_topics: Array.from({ length: randomInt(2, 5) }, () => 
      randomItem(['Government', 'Democracy', 'Civil Rights', 'Constitution', 'Local Government']))
  };
};
