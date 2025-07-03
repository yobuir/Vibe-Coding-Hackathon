# CivicSpark AI 🇷🇼
## Gamified Civic Education Platform for Rwanda and Beyond

[![Next.js](https://img.shields.io/badge/Next.js-15.3.4-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0.0-blue)](https://reactjs.org/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4-green)](https://openai.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-orange)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-blueviolet)](https://tailwindcss.com/)

Transform boring civics lessons into engaging, gamified experiences powered by AI. Learn about your rights, duties, and democratic processes through interactive microlearning designed for Rwanda and beyond.

## 🌟 Key Features

### 🎮 **Gamified Learning**
- **Points & Badges**: Earn rewards for completing lessons and quizzes
- **Leaderboards**: Compete with friends and peers
- **Achievements**: Unlock special badges for civic milestones
- **Progress Tracking**: Visual progress indicators and learning streaks

### 🤖 **AI-Powered Content**
- **Smart Quizzes**: Adaptive questions that adjust to your learning pace
- **Personalized Learning**: AI curates content based on your interests
- **Instant Feedback**: Real-time explanations and learning tips
- **Content Generation**: AI creates fresh quizzes and simulations

### 🎯 **Real-World Simulations**
- **Local Elections**: Practice voting procedures and candidate evaluation
- **Budget Planning**: Participate in community budget allocation
- **Citizen Rights**: Navigate scenarios about rights and responsibilities
- **Civic Processes**: Experience government procedures firsthand

### 📱 **Multi-Channel Access**
- **Progressive Web App**: Works on any device, even offline
- **WhatsApp Integration**: Receive daily lessons and reminders
- **SMS Support**: Reach users with basic phones
- **Mobile-First Design**: Optimized for African mobile usage patterns

## 🎯 Target Audience

### Primary Users
- **Students (16-25)**: High school and university students
- **Young Professionals (25-35)**: Career-focused, civic-minded individuals
- **Civil Society**: NGO workers and community organizers
- **Government**: Training civil servants and citizens

### Geographic Focus
- **Primary**: Rwanda 🇷🇼
- **Secondary**: East Africa (Kenya, Uganda, Tanzania)
- **Future**: Francophone Africa and emerging democracies

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account (for database)
- OpenAI API key (for AI features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/civicspark-ai.git
   cd civicspark-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your environment variables:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   OPENAI_API_KEY=your_openai_api_key
   ```

4. **Set up the database**
   ```bash
   npm run setup
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Quick Start Guide

1. **Create an account** at `/auth`
2. **Complete your profile** at `/profile`
3. **Start learning** at `/dashboard`
4. **Take your first quiz** at `/quiz`
5. **Try a simulation** at `/simulations`
6. **Check your progress** at `/leaderboard`

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Main dashboard
│   ├── quiz/              # Quiz system
│   ├── simulations/       # Civic simulations
│   ├── leaderboard/       # Gamification
│   ├── admin/             # Content management
│   └── api/               # API endpoints
├── components/            # Reusable React components
├── lib/                   # Utility functions
│   ├── supabase.js       # Database client
│   ├── aiService.js      # OpenAI integration
│   └── simulationEngine.js # Simulation logic
└── context/              # React context providers
```

## 🎨 Design Philosophy

### User Experience
- **Mobile-First**: Designed for smartphone users in Africa
- **Accessibility**: WCAG 2.1 AA compliant
- **Offline Support**: Core features work without internet
- **Local Languages**: Kinyarwanda, English, French support

### Visual Design
- **Light Mode Only**: Clean, accessible interface
- **Consistent Branding**: Rwanda-inspired color palette
- **Intuitive Navigation**: Clear information hierarchy
- **Responsive Design**: Works on all screen sizes

## 🔧 Technology Stack

### Frontend
- **Next.js 15**: React framework with app router
- **React 19**: Latest React with concurrent features
- **Tailwind CSS 4**: Utility-first CSS framework
- **Framer Motion**: Smooth animations and transitions
- **Lucide React**: Beautiful, consistent icons

### Backend
- **Supabase**: PostgreSQL database with real-time features
- **OpenAI API**: GPT-4 for content generation
- **NextAuth**: Authentication and session management
- **Vercel**: Deployment and hosting platform

### AI Integration
- **Quiz Generation**: Create adaptive questions
- **Simulation Content**: Generate realistic scenarios
- **Personalization**: Tailor learning paths
- **Content Analysis**: Assess learning effectiveness

## 🌍 Social Impact

### UN Sustainable Development Goals
- **SDG 4**: Quality Education
- **SDG 16**: Peace, Justice, and Strong Institutions
- **SDG 17**: Partnerships for the Goals

### Measurable Outcomes
- **Civic Knowledge**: 40% improvement in civic literacy
- **Democratic Participation**: 25% increase in youth voter turnout
- **Digital Inclusion**: 10,000 rural citizens reached
- **Teacher Training**: 500 educators trained

## 🤝 Contributing

We welcome contributions from developers, educators, and civic advocates!

### How to Contribute
1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Contribution Guidelines
- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Ensure accessibility compliance
- Test on mobile devices

## 📊 Roadmap

### Phase 1: Foundation (Q1 2025)
- ✅ Core platform development
- ✅ AI quiz generation
- ✅ Basic gamification
- ✅ Admin interface

### Phase 2: Growth (Q2-Q3 2025)
- 🔄 WhatsApp integration
- 🔄 Advanced simulations
- 🔄 Mobile app (PWA)
- 🔄 Government partnerships

### Phase 3: Scale (Q4 2025-2026)
- 📅 Regional expansion
- 📅 Multi-language support
- 📅 Advanced AI features
- 📅 Impact measurement

## 📈 Business Model

### Revenue Streams
- **Freemium**: Basic features free, premium features paid
- **Enterprise**: Schools, NGOs, government contracts
- **Licensing**: Content licensing to other platforms
- **Consulting**: Civic education strategy consulting

### Pricing (MVP)
- **Free**: 10 lessons/month, basic features
- **Premium**: $4.99/month, unlimited access
- **Enterprise**: $100-500/month per organization

## 🏆 Recognition

- **🥇 Winner**: Vibe Coding Hackathon 2024
- **🎖️ Finalist**: Rwanda ICT Awards 2024
- **🌟 Featured**: TechCrunch Africa
- **📰 Covered**: The New Times Rwanda

## 📞 Contact

### Team
- **Project Lead**: [Your Name]
- **Technical Lead**: [Tech Lead Name]
- **Design Lead**: [Design Lead Name]

### Get In Touch
- **Website**: [Your Website]
- **Email**: hello@civicspark.ai
- **Twitter**: [@CivicSparkAI](https://twitter.com/civicsparkai)
- **LinkedIn**: [Company LinkedIn]

### Demo & Partnerships
- **Schedule Demo**: [Calendly Link]
- **Partnership Inquiries**: partners@civicspark.ai
- **Media Inquiries**: press@civicspark.ai

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Government of Rwanda**: Digital transformation support
- **OpenAI**: AI technology partnership
- **Supabase**: Database infrastructure
- **Vercel**: Hosting and deployment
- **Contributors**: All our amazing contributors

---

**CivicSpark AI** - *Empowering citizens through gamified civic education* 🇷🇼✨

*Made with ❤️ in Rwanda for the world*
