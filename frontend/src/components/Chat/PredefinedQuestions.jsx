import React from 'react';

const PredefinedQuestions = ({ onQuestionSelect }) => {
  const questions = [
    // About Section
    {
      id: 'about_kaabhub',
      question: 'What is KaabHub?',
      type: 'about'
    },
    // Quick Questions Section
    {
      id: 'quick_posts_count',
      question: 'How many posts are available?',
      type: 'post'
    },
    {
      id: 'quick_questions_count',
      question: 'How many questions are available?',
      type: 'question'
    },
    {
      id: 'quick_opportunities_count',
      question: 'How many opportunities are available?',
      type: 'opportunity'
    },
    {
      id: 'quick_scholarships_count',
      question: 'How many scholarships are available in the scholarships section?',
      type: 'opportunity'
    },
    {
      id: 'quick_mentorship_count',
      question: 'How many courses are available in the mentorship section?',
      type: 'mentorship'
    },
    // Other Questions Section
    {
      id: 'opportunities_categories',
      question: 'What are the available scholarship categories?',
      type: 'opportunity'
    },
    {
      id: 'mentorships_categories',
      question: 'What are the available course categories?',
      type: 'mentorship'
    },
    {
      id: 'view_opportunities',
      question: 'View all scholarships',
      type: 'opportunity'
    },
    {
      id: 'view_mentorships',
      question: 'View all courses',
      type: 'mentorship'
    }
  ];

  const getTypeColor = (type) => {
    switch(type) {
      case 'about':
        return 'bg-[#8B5CF6]/10 hover:bg-[#8B5CF6]/20 text-[#8B5CF6]';
      case 'opportunity':
        return 'bg-[#136269]/10 hover:bg-[#136269]/20 text-[#136269]';
      case 'mentorship':
        return 'bg-[#5DB2B3]/10 hover:bg-[#5DB2B3]/20 text-[#5DB2B3]';
      case 'post':
        return 'bg-[#4A90E2]/10 hover:bg-[#4A90E2]/20 text-[#4A90E2]';
      case 'question':
        return 'bg-[#F5A623]/10 hover:bg-[#F5A623]/20 text-[#F5A623]';
      default:
        return 'bg-gray-100 hover:bg-gray-200 text-gray-700';
    }
  };

  return (
    <div className="w-full mb-4">
      <h3 className="text-sm font-medium text-gray-500 mb-2">Quick Questions</h3>
      <div className="grid grid-cols-1 gap-2">
        {questions.map((q) => (
          <button
            key={q.id}
            onClick={() => onQuestionSelect(q.question)}
            className={`text-left p-2 rounded-lg text-sm transition-colors ${getTypeColor(q.type)}`}
          >
            {q.question}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PredefinedQuestions; 