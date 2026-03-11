import React from 'react';
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Heart, 
  Users, 
  Flag, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  BookOpen,
  Scale,
  MessageCircle
} from 'lucide-react';
import { moderationAPI } from '../../services/api';

const CommunityGuidelinesPage = () => {
  const { data: guidelines } = useQuery(
    ['community-guidelines'],
    () => moderationAPI.getGuidelines(),
    { staleTime: 30 * 60 * 1000 } // Cache for 30 minutes
  );

  const principles = [
    {
      icon: Heart,
      title: 'Respect & Kindness',
      description: 'Treat all community members with respect and kindness. We believe in fostering a positive environment for everyone.',
      color: 'text-red-600'
    },
    {
      icon: Shield,
      title: 'Safety First',
      description: 'User safety is our top priority. We have zero tolerance for harassment, threats, or harmful content.',
      color: 'text-blue-600'
    },
    {
      icon: Users,
      title: 'Inclusive Community',
      description: 'Firehub welcomes creators and viewers from all backgrounds. Discrimination has no place here.',
      color: 'text-green-600'
    },
    {
      icon: Scale,
      title: 'Fair & Transparent',
      description: 'Our moderation decisions are fair, consistent, and transparent. Appeals are welcome and reviewed carefully.',
      color: 'text-purple-600'
    }
  ];

  const violations = [
    {
      type: 'Prohibited',
      icon: XCircle,
      color: 'text-red-600',
      items: [
        'Hate speech, discrimination, or harassment',
        'Violence, graphic content, or threats',
        'Spam, scams, or misleading information',
        'Copyright infringement or stolen content',
        'Doxxing or sharing private information',
        'Illegal activities or content'
      ]
    },
    {
      type: 'Restricted',
      icon: AlertTriangle,
      color: 'text-yellow-600',
      items: [
        'Mature content must be properly labeled',
        'Political content should be respectful',
        'Commercial content must follow guidelines',
        'Content involving minors has strict rules',
        'Medical advice must include disclaimers',
        'Financial advice requires proper warnings'
      ]
    },
    {
      type: 'Encouraged',
      icon: CheckCircle,
      color: 'text-green-600',
      items: [
        'Original, creative, and high-quality content',
        'Educational and informative videos',
        'Positive community engagement',
        'Constructive feedback and discussions',
        'Proper attribution and credits',
        'Accessible content with captions'
      ]
    }
  ];

  const reportingSteps = [
    {
      step: 1,
      title: 'Identify Violation',
      description: 'Recognize content that violates our community guidelines'
    },
    {
      step: 2,
      title: 'Use Report Button',
      description: 'Click the flag icon on any video or user profile to report'
    },
    {
      step: 3,
      title: 'Provide Details',
      description: 'Select the violation type and provide additional context'
    },
    {
      step: 4,
      title: 'Review Process',
      description: 'Our team reviews reports within 24-48 hours'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-r from-primary-600 to-accent-600 p-4 rounded-full">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Community Guidelines
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            These guidelines help create a safe, respectful, and welcoming environment for all Firehub users.
          </p>
          {guidelines && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
              Last updated: {new Date(guidelines.last_updated).toLocaleDateString()}
            </p>
          )}
        </motion.div>

        {/* Core Principles */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Our Core Principles
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {principles.map((principle, index) => (
              <motion.div
                key={principle.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-lg bg-gray-100 dark:bg-gray-700`}>
                    <principle.icon className={`h-6 w-6 ${principle.color}`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {principle.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {principle.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Content Standards */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Content Standards
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {violations.map((category, index) => (
              <motion.div
                key={category.type}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-3">
                    <category.icon className={`h-6 w-6 ${category.color}`} />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {category.type}
                    </h3>
                  </div>
                </div>
                <div className="p-6">
                  <ul className="space-y-3">
                    {category.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start space-x-2">
                        <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                          category.type === 'Prohibited' ? 'bg-red-400' :
                          category.type === 'Restricted' ? 'bg-yellow-400' : 'bg-green-400'
                        }`} />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Detailed Guidelines */}
        {guidelines && guidelines.sections && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-16"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
              Detailed Guidelines
            </h2>
            <div className="space-y-8">
              {guidelines.sections.map((section, index) => (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700"
                >
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    {section.title}
                  </h3>
                  <ul className="space-y-3">
                    {section.rules.map((rule, ruleIndex) => (
                      <li key={ruleIndex} className="flex items-start space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-600 dark:text-gray-400">
                          {rule}
                        </span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Reporting Process */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            How to Report Violations
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 border border-gray-200 dark:border-gray-700">
            <div className="grid md:grid-cols-4 gap-6">
              {reportingSteps.map((step, index) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="text-center"
                >
                  <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">
                    {step.step}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {step.description}
                  </p>
                </motion.div>
              ))}
            </div>
            <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center space-x-3">
                <Flag className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <h4 className="font-medium text-blue-900 dark:text-blue-100">
                    Need to report something?
                  </h4>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    Look for the flag icon (🚩) on any video or user profile to submit a report. 
                    All reports are reviewed confidentially by our moderation team.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Enforcement */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Enforcement & Appeals
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 border border-gray-200 dark:border-gray-700">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Possible Actions
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                    <span className="text-gray-600 dark:text-gray-400">Content removal</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-orange-400 rounded-full" />
                    <span className="text-gray-600 dark:text-gray-400">Account warning</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-red-400 rounded-full" />
                    <span className="text-gray-600 dark:text-gray-400">Temporary suspension</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-gray-400 rounded-full" />
                    <span className="text-gray-600 dark:text-gray-400">Account termination</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Appeal Process
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  If you believe a moderation action was taken in error, you can appeal the decision. 
                  Appeals are reviewed by a different team member within 3-5 business days.
                </p>
                <button className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                  <MessageCircle className="h-4 w-4" />
                  <span>Contact Support</span>
                </button>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center bg-gray-100 dark:bg-gray-800 rounded-lg p-8"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Questions about our guidelines?
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Our community guidelines are designed to foster a safe and welcoming environment. 
            If you have questions or suggestions, we'd love to hear from you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="inline-flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
              <MessageCircle className="h-5 w-5" />
              <span>Contact Support</span>
            </button>
            <button className="inline-flex items-center space-x-2 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <BookOpen className="h-5 w-5" />
              <span>Terms of Service</span>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CommunityGuidelinesPage; 