import { supabase } from './supabase';

/**
 * Seeds initial quiz data
 */
export const seedQuizzes = async () => {
  try {
    // Check if we already have quizzes
    const { data: existingQuizzes, error: checkError } = await supabase
      .from('quizzes')
      .select('id')
      .limit(1);
    
    if (!checkError && existingQuizzes.length > 0) {
      console.log('Quiz data already exists, skipping seed');
      return { success: true, skipped: true };
    }
    
    // Seed quizzes
    const quizzes = [
      {
        title: "U.S. Constitution Basics",
        description: "Test your knowledge about the fundamental principles of the U.S. Constitution.",
        difficulty_level: "beginner",
        category: "constitution",
        tags: ["constitution", "government", "history"],
        time_limit_seconds: 300,
        passing_score: 70,
        is_published: true
      },
      {
        title: "Branches of Government",
        description: "Learn about the three branches of government and how they work together.",
        difficulty_level: "beginner",
        category: "government",
        tags: ["government", "civics", "structure"],
        time_limit_seconds: 300,
        passing_score: 70,
        is_published: true
      },
      {
        title: "Voting Rights and Responsibilities",
        description: "Understand the history and importance of voting rights in America.",
        difficulty_level: "intermediate",
        category: "voting",
        tags: ["voting", "rights", "democracy"],
        time_limit_seconds: 300,
        passing_score: 70,
        is_published: true
      }
    ];
    
    const { data: quizData, error: quizError } = await supabase
      .from('quizzes')
      .insert(quizzes)
      .select();
      
    if (quizError) {
      console.error('Error seeding quizzes:', quizError);
      return { success: false, error: quizError };
    }
    
    // Seed quiz questions for the first quiz
    if (quizData && quizData.length > 0) {
      const constitutionQuizId = quizData[0].id;
      
      const questions = [
        {
          quiz_id: constitutionQuizId,
          question_text: "When was the U.S. Constitution signed?",
          question_type: "multiple_choice",
          points: 1,
          explanation: "The U.S. Constitution was signed on September 17, 1787, by delegates to the Constitutional Convention in Philadelphia.",
          order_position: 1
        },
        {
          quiz_id: constitutionQuizId,
          question_text: "How many articles are in the original U.S. Constitution?",
          question_type: "multiple_choice",
          points: 1,
          explanation: "The original Constitution contained seven articles outlining the national frame of government.",
          order_position: 2
        },
        {
          quiz_id: constitutionQuizId,
          question_text: "The Bill of Rights consists of how many amendments?",
          question_type: "multiple_choice",
          points: 1,
          explanation: "The Bill of Rights consists of the first ten amendments to the Constitution.",
          order_position: 3
        },
        {
          quiz_id: constitutionQuizId,
          question_text: "The Constitution establishes three branches of government. True or False?",
          question_type: "true_false",
          points: 1,
          explanation: "True. The Constitution establishes the executive, legislative, and judicial branches.",
          order_position: 4
        }
      ];
      
      const { data: questionData, error: questionError } = await supabase
        .from('quiz_questions')
        .insert(questions)
        .select();
        
      if (questionError) {
        console.error('Error seeding quiz questions:', questionError);
        return { success: false, error: questionError };
      }
      
      // Seed answer options
      if (questionData && questionData.length > 0) {
        const answerOptions = [
          // Question 1
          {
            question_id: questionData[0].id,
            option_text: "July 4, 1776",
            is_correct: false,
            order_position: 1
          },
          {
            question_id: questionData[0].id,
            option_text: "September 17, 1787",
            is_correct: true,
            order_position: 2
          },
          {
            question_id: questionData[0].id,
            option_text: "March 4, 1789",
            is_correct: false,
            order_position: 3
          },
          {
            question_id: questionData[0].id,
            option_text: "December 15, 1791",
            is_correct: false,
            order_position: 4
          },
          
          // Question 2
          {
            question_id: questionData[1].id,
            option_text: "5",
            is_correct: false,
            order_position: 1
          },
          {
            question_id: questionData[1].id,
            option_text: "7",
            is_correct: true,
            order_position: 2
          },
          {
            question_id: questionData[1].id,
            option_text: "10",
            is_correct: false,
            order_position: 3
          },
          {
            question_id: questionData[1].id,
            option_text: "12",
            is_correct: false,
            order_position: 4
          },
          
          // Question 3
          {
            question_id: questionData[2].id,
            option_text: "5",
            is_correct: false,
            order_position: 1
          },
          {
            question_id: questionData[2].id,
            option_text: "8",
            is_correct: false,
            order_position: 2
          },
          {
            question_id: questionData[2].id,
            option_text: "10",
            is_correct: true,
            order_position: 3
          },
          {
            question_id: questionData[2].id,
            option_text: "12",
            is_correct: false,
            order_position: 4
          },
          
          // Question 4 (true/false)
          {
            question_id: questionData[3].id,
            option_text: "True",
            is_correct: true,
            order_position: 1
          },
          {
            question_id: questionData[3].id,
            option_text: "False",
            is_correct: false,
            order_position: 2
          }
        ];
        
        const { error: optionsError } = await supabase
          .from('answer_options')
          .insert(answerOptions);
          
        if (optionsError) {
          console.error('Error seeding answer options:', optionsError);
          return { success: false, error: optionsError };
        }
      }
    }
    
    return { success: true, data: quizData };
  } catch (error) {
    console.error('Error in seedQuizzes:', error);
    return { success: false, error };
  }
};

/**
 * Seeds initial lesson data
 */
export const seedLessons = async () => {
  try {
    // Check if we already have lessons
    const { data: existingLessons, error: checkError } = await supabase
      .from('lessons')
      .select('id')
      .limit(1);
    
    if (!checkError && existingLessons.length > 0) {
      console.log('Lesson data already exists, skipping seed');
      return { success: true, skipped: true };
    }
    
    // Seed lessons
    const lessons = [
      {
        title: "Understanding the U.S. Constitution",
        description: "Learn about the foundational document of American democracy.",
        content: `
# The United States Constitution

## Introduction
The United States Constitution is the supreme law of the United States of America. It was completed on September 17, 1787, with its adoption by the Constitutional Convention in Philadelphia, Pennsylvania, and was later ratified by special conventions in each state.

## Structure
The Constitution consists of seven articles:
1. Article I: Legislative Branch
2. Article II: Executive Branch
3. Article III: Judicial Branch
4. Article IV: States' Relations
5. Article V: Amendment Process
6. Article VI: Federal Power
7. Article VII: Ratification

## The Bill of Rights
The first ten amendments to the Constitution are known as the Bill of Rights. These amendments guarantee essential rights and civil liberties, such as:
- Freedom of speech, religion, and the press
- Right to bear arms
- Protection from unreasonable search and seizure
- Right to due process of law
- Trial by jury

## Later Amendments
Since the Bill of Rights, the Constitution has been amended 17 more times. Some significant amendments include:
- 13th Amendment: Abolished slavery (1865)
- 14th Amendment: Guaranteed equal protection under the law (1868)
- 19th Amendment: Granted women the right to vote (1920)
- 26th Amendment: Lowered the voting age to 18 (1971)

## Significance
The Constitution established America's national government and fundamental laws, and guaranteed certain basic rights for its citizens. It has served as a model for many other nations' constitutions.
        `,
        category: "constitution",
        tags: ["constitution", "government", "history"],
        difficulty_level: "beginner",
        estimated_duration_minutes: 20,
        is_published: true
      },
      {
        title: "The Three Branches of Government",
        description: "Explore the three branches of the U.S. federal government and the system of checks and balances.",
        content: `
# The Three Branches of Government

## Introduction
The United States government is divided into three branches, as established by the Constitution: the legislative, executive, and judicial branches. This separation of powers creates a system of checks and balances to prevent any one branch from becoming too powerful.

## Legislative Branch
The legislative branch, consisting of the House of Representatives and Senate (collectively known as Congress), is responsible for making laws.

**Key powers:**
- Creating and passing laws
- Declaring war
- Impeachment and removal of federal officials
- Approving treaties and federal appointments
- Control over the federal budget

## Executive Branch
The executive branch, headed by the President, is responsible for implementing and enforcing laws.

**Key powers:**
- Serving as commander-in-chief of the armed forces
- Executing and enforcing laws passed by Congress
- Appointing federal officials
- Conducting foreign policy
- Vetoing legislation

## Judicial Branch
The judicial branch, consisting of the Supreme Court and lower federal courts, interprets the law and evaluates its constitutionality.

**Key powers:**
- Interpreting the Constitution and laws
- Determining the constitutionality of laws
- Resolving disputes between states
- Hearing cases involving constitutional rights

## Checks and Balances
Each branch has powers that can limit or check the other branches:

- **Legislative over Executive:** Congress can override presidential vetoes, control the budget, and impeach and remove the President.
- **Legislative over Judicial:** Congress can create lower courts, impeach judges, and propose constitutional amendments.
- **Executive over Legislative:** The President can veto legislation.
- **Executive over Judicial:** The President nominates federal judges.
- **Judicial over Legislative:** The Supreme Court can rule laws unconstitutional.
- **Judicial over Executive:** The Supreme Court can rule executive actions unconstitutional.

This intricate system ensures that no single branch becomes too powerful, maintaining the balance essential for a functioning democracy.
        `,
        category: "government",
        tags: ["government", "branches", "checks and balances"],
        difficulty_level: "beginner",
        estimated_duration_minutes: 25,
        is_published: true
      },
      {
        title: "Voting Rights in America: A History",
        description: "Discover the evolution of voting rights in the United States from the founding era to today.",
        content: `
# Voting Rights in America: A History

## Introduction
The right to vote in the United States has expanded dramatically since the nation's founding. Initially limited to property-owning white men, voting rights have been extended through constitutional amendments, federal legislation, and Supreme Court decisions.

## Early America (1776-1865)
In the early republic, voting was primarily restricted to white male landowners. Requirements included:
- Property ownership
- Religious qualifications (in some states)
- Paying taxes
- By 1856, most states had dropped property requirements for white men

## Post-Civil War Era (1865-1900)
After the Civil War, significant changes occurred:

**15th Amendment (1870):**
- Prohibited denying voting rights "on account of race, color, or previous condition of servitude"
- Gave Black men the legal right to vote

**Reconstruction (1865-1877):**
- Black voter registration and political participation increased dramatically

**Post-Reconstruction Restrictions:**
- Poll taxes
- Literacy tests
- Grandfather clauses
- Violent intimidation

## Women's Suffrage Movement (1848-1920)
Women fought for decades to gain voting rights:

**Seneca Falls Convention (1848):**
- First women's rights convention
- Declaration of Sentiments modeled after Declaration of Independence

**19th Amendment (1920):**
- Prohibited denying voting rights on the basis of sex
- Enfranchised women nationwide

## Civil Rights Era (1940s-1960s)
Major advancements occurred during the civil rights movement:

**24th Amendment (1964):**
- Eliminated poll taxes in federal elections

**Voting Rights Act of 1965:**
- Banned literacy tests
- Provided federal oversight in districts with history of discrimination
- Dramatically increased Black voter registration and representation

## Modern Era (1971-Present)
Continued expansion of voting rights:

**26th Amendment (1971):**
- Lowered voting age from 21 to 18

**Later Developments:**
- National Voter Registration Act (1993)
- Help America Vote Act (2002)
- Ongoing debates over voter ID laws, early voting, and mail-in ballots

## Conclusion
The story of voting rights in America reflects the nation's ongoing struggle to fulfill its democratic ideals. While significant progress has been made, ensuring equal access to the ballot remains a contemporary issue in American politics.
        `,
        category: "voting",
        tags: ["voting", "rights", "history", "civil rights"],
        difficulty_level: "intermediate",
        estimated_duration_minutes: 30,
        is_published: true
      }
    ];
    
    const { data, error } = await supabase
      .from('lessons')
      .insert(lessons)
      .select();
      
    if (error) {
      console.error('Error seeding lessons:', error);
      return { success: false, error };
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('Error in seedLessons:', error);
    return { success: false, error };
  }
};

/**
 * Seeds initial achievement data
 */
export const seedAchievements = async () => {
  try {
    // Check if we already have achievements
    const { data: existingAchievements, error: checkError } = await supabase
      .from('achievements')
      .select('id')
      .limit(1);
    
    if (!checkError && existingAchievements.length > 0) {
      console.log('Achievement data already exists, skipping seed');
      return { success: true, skipped: true };
    }
    
    // Seed achievements
    const achievements = [
      {
        name: "Constitution Scholar",
        description: "Complete all lessons related to the U.S. Constitution",
        icon_url: "/badges/constitution.svg",
        points: 50,
        achievement_type: "lesson_completion",
        conditions: { category: "constitution", min_lessons: 1 }
      },
      {
        name: "Civic Starter",
        description: "Complete your first lesson",
        icon_url: "/badges/starter.svg",
        points: 10,
        achievement_type: "lesson_completion",
        conditions: { min_lessons: 1 }
      },
      {
        name: "Democracy Defender",
        description: "Complete 5 lessons about voting and democracy",
        icon_url: "/badges/democracy.svg",
        points: 75,
        achievement_type: "lesson_completion",
        conditions: { category: "voting", min_lessons: 1 }
      },
      {
        name: "Perfect Score",
        description: "Achieve 100% on any quiz",
        icon_url: "/badges/perfect.svg",
        points: 25,
        achievement_type: "quiz_score",
        conditions: { min_score_percentage: 100 }
      },
      {
        name: "Quiz Master",
        description: "Complete 5 quizzes with passing scores",
        icon_url: "/badges/quiz.svg",
        points: 50,
        achievement_type: "quiz_score",
        conditions: { min_quizzes: 5 }
      },
      {
        name: "Civic Streak",
        description: "Log in for 7 consecutive days",
        icon_url: "/badges/streak.svg",
        points: 30,
        achievement_type: "streak",
        conditions: { days: 7 }
      }
    ];
    
    const { data, error } = await supabase
      .from('achievements')
      .insert(achievements)
      .select();
      
    if (error) {
      console.error('Error seeding achievements:', error);
      return { success: false, error };
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('Error in seedAchievements:', error);
    return { success: false, error };
  }
};

/**
 * Seeds quiz attempts for testing users
 */
export const seedQuizAttempts = async () => {
  try {
    // Check if we already have quiz attempts
    const { data: existingAttempts, error: checkError } = await supabase
      .from('quiz_attempts')
      .select('id')
      .limit(1);
    
    if (!checkError && existingAttempts.length > 0) {
      console.log('Quiz attempts already exist, skipping seed');
      return { success: true, skipped: true };
    }

    // Get existing quizzes and test users
    const { data: quizzes } = await supabase.from('quizzes').select('id, title');
    const { data: users } = await supabase.from('user_profiles').select('id');

    if (!quizzes?.length || !users?.length) {
      console.log('No quizzes or users found to create attempts');
      return { success: false, error: 'No quizzes or users found' };
    }

    // Generate attempts for each user
    const attempts = [];
    for (const user of users) {
      // Each user attempts 2-5 random quizzes
      const numAttempts = Math.floor(Math.random() * 4) + 2;
      const userQuizzes = [...quizzes].sort(() => Math.random() - 0.5).slice(0, numAttempts);

      for (const quiz of userQuizzes) {
        attempts.push({
          user_id: user.id,
          quiz_id: quiz.id,
          score: Math.floor(Math.random() * 41) + 60, // Score between 60-100
          completed_at: new Date().toISOString(),
          total_questions: 10,
          questions_correct: Math.floor(Math.random() * 6) + 5, // 5-10 correct answers
          time_taken_seconds: Math.floor(Math.random() * 240) + 60 // 1-5 minutes
        });
      }
    }

    const { error: insertError } = await supabase
      .from('quiz_attempts')
      .insert(attempts);

    if (insertError) {
      console.error('Error seeding quiz attempts:', insertError);
      return { success: false, error: insertError };
    }

    // Calculate and update leaderboard
    await updateLeaderboard();

    return { success: true };
  } catch (error) {
    console.error('Error in seedQuizAttempts:', error);
    return { success: false, error };
  }
};

/**
 * Updates the leaderboard based on quiz performance
 */
export const updateLeaderboard = async () => {
  try {
    // The leaderboard is now calculated dynamically via stored procedures
    // This function validates that the procedures work correctly
    const { data: leaderboardData, error } = await supabase
      .rpc('calculate_leaderboard_rankings');

    if (error) {
      console.error('Error calculating leaderboard:', error);
      return { success: false, error };
    }

    console.log(`Leaderboard calculated successfully with ${leaderboardData?.length || 0} users`);
    return { success: true, data: leaderboardData };
  } catch (error) {
    console.error('Error in updateLeaderboard:', error);
    return { success: false, error };
  }
};

// Update seedAllData to include quiz attempts
export const seedAllData = async () => {
  const results = await Promise.all([
    seedQuizzes(),
    seedLessons(),
    seedAchievements(),
    seedQuizAttempts() // Add quiz attempts seeding
  ]);
  
  return {
    success: results.every(result => result.success),
    results
  };
};
