import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircleIcon, 
  DocumentTextIcon, 
  ChartBarIcon, 
  ClockIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  BellIcon,
  CogIcon,
  ArrowRightIcon,
  StarIcon
} from '@heroicons/react/24/outline';

const Home = () => {
  const navigate = useNavigate();
  const [displayedText, setDisplayedText] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const fullText = 'Your journey to seamless onboarding starts here';
  
  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index <= fullText.length) {
        setDisplayedText(fullText.slice(0, index));
        index++;
      } else {
        setIsTypingComplete(true);
        setTimeout(() => {
          setDisplayedText('');
          setIsTypingComplete(false);
          index = 0;
        }, 90000); 
      }
    }, 250); 
    return () => clearInterval(timer);
  }, [isTypingComplete]);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleGetStarted = () => {
    navigate('/register');
  };

  const handleSignIn = () => {
    navigate('/login');
  };

  const features = [
    {
      icon: CheckCircleIcon,
      title: 'Smart Task Management',
      description: 'Automated task assignment and tracking with real-time progress monitoring for seamless onboarding workflows.',
      color: 'from-blue-500 to-indigo-600'
    },
    {
      icon: DocumentTextIcon,
      title: 'Document Handling',
      description: 'Secure document upload, review, and approval system with version control and digital signatures.',
      color: 'from-purple-500 to-pink-600'
    },
    {
      icon: ChartBarIcon,
      title: 'Advanced Analytics',
      description: 'Comprehensive dashboards and reports to track onboarding metrics and identify bottlenecks.',
      color: 'from-green-500 to-teal-600'
    },
    {
      icon: ClockIcon,
      title: 'Time Tracking',
      description: 'Monitor completion times, set deadlines, and send automated reminders to keep everyone on track.',
      color: 'from-orange-500 to-red-600'
    },
    {
      icon: UserGroupIcon,
      title: 'Team Collaboration',
      description: 'Enable seamless communication between HR, managers, and new hires throughout the onboarding process.',
      color: 'from-cyan-500 to-blue-600'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Role-Based Access',
      description: 'Secure permission system ensuring data privacy with customizable access levels for different user roles.',
      color: 'from-violet-500 to-purple-600'
    }
  ];

  const stats = [
    { value: '10,000+', label: 'Employees Onboarded' },
    { value: '500+', label: 'Companies Trust Us' },
    { value: '95%', label: 'Satisfaction Rate' },
    { value: '50%', label: 'Time Saved' }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                OnboardPro
              </span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <button onClick={() => scrollToSection('home')} className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Home</button>
              <button onClick={() => scrollToSection('features')} className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Features</button>
              <button onClick={() => scrollToSection('about')} className="text-gray-700 hover:text-blue-600 font-medium transition-colors">About</button>
              <button onClick={() => scrollToSection('contact')} className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Contact</button>
            </div>
            
            <div className="flex items-center space-x-4">
              <button 
                onClick={handleSignIn}
                className="text-gray-700 hover:text-blue-600 font-medium px-4 py-2 border border-blue-200 rounded-lg hover:bg-blue-50 transition-all"
              >
                Log In
              </button>
              <button 
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2.5 rounded-lg hover:from-blue-700 hover:to-indigo-700 font-medium shadow-lg hover:shadow-xl transition-all"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section 
        id="home" 
        className="relative pt-32 pb-20 px-6 min-h-screen flex items-center"
        style={{
          backgroundImage: 'url(/images/background.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/40 to-indigo-900/40"></div>
        
        <div className="max-w-7xl mx-auto relative z-10 w-full">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 max-w-2xl text-center lg:text-left">
        
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight min-h-[200px]" style={{ fontFamily: 'Georgia, serif' }}>
                {displayedText.split('seamless onboarding').map((part, index, array) => (
                  <React.Fragment key={index}>
                    <span className="text-white drop-shadow-lg">
                      {part}
                    </span>
                    {index < array.length - 1 && (
                      <span className="text-blue-200 italic drop-shadow-lg">
                        seamless onboarding
                      </span>
                    )}
                  </React.Fragment>
                ))}
                {!isTypingComplete && <span className="animate-pulse text-white">|</span>}
              </h1>
              
              <p className="text-xl text-white/90 mb-8 leading-relaxed">
                Streamline employee onboarding with automated workflows, document management, and real-time progress tracking. Empower HR teams and delight new hires.
              </p>
              
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                <button 
                  onClick={handleGetStarted}
                  className="bg-white text-blue-600 px-8 py-4 rounded-xl hover:bg-blue-50 font-semibold shadow-xl hover:shadow-2xl transition-all flex items-center gap-2 group"
                >
                  Start Free Trial
                  <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={() => scrollToSection('features')}
                  className="bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-xl hover:bg-white/20 font-semibold border-2 border-white/30 transition-all"
                >
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl lg:text-5xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-blue-100 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Powerful Features for Modern HR
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to create an exceptional onboarding experience
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 group"
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                Why Choose OnboardPro?
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                OnboardPro is built by HR professionals for HR professionals. We understand the challenges of onboarding and have created a platform that addresses every pain point.
              </p>
              <div className="space-y-4">
                {[
                  'Reduce onboarding time by 50%',
                  'Automate repetitive tasks',
                  'Improve new hire satisfaction',
                  'Gain actionable insights',
                  'Ensure compliance',
                  'Scale effortlessly'
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircleIcon className="w-6 h-6 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700 font-medium">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl p-12 shadow-2xl">
                <div className="grid grid-cols-2 gap-6">
                  {[
                    { icon: UserGroupIcon, label: 'Multi-Role', value: 'Support' },
                    { icon: BellIcon, label: 'Real-Time', value: 'Notifications' },
                    { icon: CogIcon, label: 'Easy', value: 'Integration' },
                    { icon: ShieldCheckIcon, label: 'Enterprise', value: 'Security' }
                  ].map((item, index) => (
                    <div key={index} className="bg-white/10 backdrop-blur-sm p-6 rounded-xl text-center">
                      <item.icon className="w-8 h-8 text-white mx-auto mb-3" />
                      <div className="text-white font-semibold text-sm">{item.label}</div>
                      <div className="text-blue-200 text-xs">{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Get In Touch
            </h2>
            <p className="text-xl text-gray-600">
              Have questions? We'd love to hear from you
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[
              { icon: '📧', title: 'Email', value: 'support@onboardpro.com' },
              { icon: '📞', title: 'Phone', value: '+94 77 123 4567' },
              { icon: '💬', title: 'Live Chat', value: 'Available 24/7' }
            ].map((contact, index) => (
              <div key={index} className="text-center p-6 bg-gray-50 rounded-xl">
                <div className="text-4xl mb-3">{contact.icon}</div>
                <div className="font-bold text-gray-900 mb-1">{contact.title}</div>
                <div className="text-gray-600 text-sm">{contact.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-xl font-bold">OnboardPro</span>
              </div>
              <p className="text-gray-400 text-sm">
                Transforming employee onboarding with intelligent automation and seamless workflows.
              </p>
            </div>
            
            <div>
              <h3 className="font-bold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><button onClick={() => scrollToSection('features')} className="hover:text-white transition-colors">Features</button></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><button onClick={() => scrollToSection('about')} className="hover:text-white transition-colors">About Us</button></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><button onClick={() => scrollToSection('contact')} className="hover:text-white transition-colors">Contact</button></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">GDPR</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © 2026 OnboardPro. All rights reserved.
            </p>
            <div className="flex gap-6">
              {['LinkedIn', 'Twitter', 'Facebook', 'Instagram'].map((social) => (
                <a key={social} href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                  {social}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;