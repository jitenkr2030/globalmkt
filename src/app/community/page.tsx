import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import SocialTrading from '@/components/SocialTrading';
import { Users, MessageSquare, Calendar, Trophy, Star, ExternalLink, Github, Twitter, Discord, Slack, BookOpen, Video, Podcast, TrendingUp, BarChart3, Code, Globe, Eye, Clock } from 'lucide-react';
import Link from 'next/link';

export default function CommunityPage() {
  const communityStats = [
    { label: 'Active Members', value: '15,000+', icon: Users },
    { label: 'Forum Posts', value: '45,000+', icon: MessageSquare },
    { label: 'Events This Year', value: '120+', icon: Calendar },
    { label: 'Contributors', value: '2,500+', icon: Trophy }
  ];

  const discussionCategories = [
    {
      name: 'Trading Strategies',
      description: 'Share and discuss trading strategies and techniques',
      posts: 12450,
      contributors: 3200,
      icon: TrendingUp
    },
    {
      name: 'Technical Analysis',
      description: 'Chart patterns, indicators, and technical analysis discussions',
      posts: 8900,
      contributors: 2100,
      icon: BarChart3
    },
    {
      name: 'API Development',
      description: 'Developer discussions about API integration and development',
      posts: 6700,
      contributors: 1800,
      icon: Code
    },
    {
      name: 'Market Analysis',
      description: 'Daily market analysis and economic discussions',
      posts: 15600,
      contributors: 4100,
      icon: Globe
    },
    {
      name: 'Platform Feedback',
      description: 'Suggestions and feedback about the Global Markets platform',
      posts: 3400,
      contributors: 890,
      icon: MessageSquare
    },
    {
      name: 'Learning Resources',
      description: 'Educational content and learning materials for traders',
      posts: 5200,
      contributors: 1300,
      icon: BookOpen
    }
  ];

  const upcomingEvents = [
    {
      title: 'Global Trading Summit 2024',
      date: 'December 15, 2024',
      time: '9:00 AM EST',
      type: 'Conference',
      attendees: 2500,
      description: 'Annual summit featuring industry leaders and trading experts',
      registration: 'Open'
    },
    {
      title: 'API Workshop: Advanced Integration',
      date: 'November 30, 2024',
      time: '2:00 PM EST',
      type: 'Workshop',
      attendees: 150,
      description: 'Hands-on workshop for advanced API integration techniques',
      registration: 'Open'
    },
    {
      title: 'Community AMA: Engineering Team',
      date: 'December 5, 2024',
      time: '4:00 PM EST',
      type: 'AMA',
      attendees: 500,
      description: 'Ask Me Anything session with our engineering team',
      registration: 'Open'
    },
    {
      title: 'Algorithmic Trading Masterclass',
      date: 'December 12, 2024',
      time: '11:00 AM EST',
      type: 'Masterclass',
      attendees: 300,
      description: 'Learn advanced algorithmic trading strategies',
      registration: 'Limited'
    }
  ];

  const communityLeaders = [
    {
      name: 'Sarah Chen',
      role: 'Community Lead',
      expertise: 'Algorithmic Trading',
      contributions: 1250,
      joined: '2021',
      avatar: 'SC'
    },
    {
      name: 'Marcus Rodriguez',
      role: 'Technical Moderator',
      expertise: 'API Development',
      contributions: 980,
      joined: '2021',
      avatar: 'MR'
    },
    {
      name: 'Emily Watson',
      role: 'Content Creator',
      expertise: 'Market Analysis',
      contributions: 890,
      joined: '2022',
      avatar: 'EW'
    },
    {
      name: 'David Kim',
      role: 'Community Manager',
      expertise: 'Platform Features',
      contributions: 760,
      joined: '2022',
      avatar: 'DK'
    }
  ];

  const communityPlatforms = [
    {
      name: 'Discord Server',
      description: 'Real-time chat and community discussions',
      icon: Discord,
      members: '8,500+',
      link: '#discord',
      color: 'bg-purple-100 text-purple-800'
    },
    {
      name: 'GitHub Community',
      description: 'Open source projects and code contributions',
      icon: Github,
      members: '3,200+',
      link: '#github',
      color: 'bg-gray-100 text-gray-800'
    },
    {
      name: 'Twitter/X',
      description: 'Latest updates and market insights',
      icon: Twitter,
      members: '12,000+',
      link: '#twitter',
      color: 'bg-blue-100 text-blue-800'
    },
    {
      name: 'Slack Workspace',
      description: 'Professional networking and collaboration',
      icon: Slack,
      members: '2,100+',
      link: '#slack',
      color: 'bg-green-100 text-green-800'
    }
  ];

  const recentDiscussions = [
    {
      title: 'Best practices for high-frequency trading APIs',
      category: 'API Development',
      author: 'Alex Thompson',
      replies: 45,
      views: 1200,
      lastActivity: '2 hours ago',
      trending: true
    },
    {
      title: 'Market volatility patterns in Q4 2024',
      category: 'Market Analysis',
      author: 'Maria Garcia',
      replies: 32,
      views: 890,
      lastActivity: '4 hours ago',
      trending: true
    },
    {
      title: 'Building custom indicators with Python SDK',
      category: 'Technical Analysis',
      author: 'James Wilson',
      replies: 28,
      views: 650,
      lastActivity: '6 hours ago',
      trending: false
    },
    {
      title: 'Risk management strategies for crypto trading',
      category: 'Trading Strategies',
      author: 'Lisa Chang',
      replies: 67,
      views: 2100,
      lastActivity: '1 day ago',
      trending: true
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">Community</Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Join Our Global
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              {' '}Trading Community
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Connect with traders, developers, and market experts from around the world. 
            Share knowledge, collaborate on projects, and grow together.
          </p>
        </div>

        {/* Social Trading Section */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Social Trading Hub</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Follow top traders, copy their strategies, and share your own insights with the community
            </p>
          </div>
          <SocialTrading />
        </div>

        {/* Community Stats */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {communityStats.map((stat, index) => (
            <Card key={index} className="text-center">
              <CardContent className="pt-6">
                <stat.icon className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm font-medium text-gray-600">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Community Platforms */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Join Our Platforms</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {communityPlatforms.map((platform, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <platform.icon className="h-12 w-12 mb-4 text-blue-600" />
                  <CardTitle className="text-lg">{platform.name}</CardTitle>
                  <CardDescription>{platform.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Members</span>
                      <span className="font-medium">{platform.members}</span>
                    </div>
                    <Button className="w-full" size="sm">
                      Join Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Discussion Categories */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Discussion Categories</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {discussionCategories.map((category, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3">
                    <category.icon className="h-6 w-6 text-blue-600" />
                    <span>{category.name}</span>
                  </CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Posts</span>
                      <span className="font-medium">{category.posts.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Contributors</span>
                      <span className="font-medium">{category.contributors.toLocaleString()}</span>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full mt-4" size="sm">
                    Browse Category
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Discussions */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Recent Discussions</h2>
            <Button variant="outline">
              View All Discussions
            </Button>
          </div>
          <div className="space-y-4">
            {recentDiscussions.map((discussion, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold text-lg hover:text-blue-600 cursor-pointer">
                          {discussion.title}
                        </h3>
                        {discussion.trending && (
                          <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                            🔥 Trending
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                        <span className="flex items-center space-x-1">
                          <MessageSquare className="h-4 w-4" />
                          <span>{discussion.replies} replies</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Eye className="h-4 w-4" />
                          <span>{discussion.views} views</span>
                        </span>
                        <span>Last activity: {discussion.lastActivity}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{discussion.category}</Badge>
                        <span className="text-sm text-gray-500">by {discussion.author}</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Upcoming Events</h2>
            <Button>
              View All Events
            </Button>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {upcomingEvents.map((event, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline">{event.type}</Badge>
                    <Badge className={event.registration === 'Open' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                      {event.registration}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{event.title}</CardTitle>
                  <CardDescription>{event.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-sm">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span>{event.attendees} attending</span>
                    </div>
                    <Button className="w-full" size="sm">
                      Register Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Community Leaders */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Community Leaders</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {communityLeaders.map((leader, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-xl font-bold text-blue-600 mx-auto mb-4">
                    {leader.avatar}
                  </div>
                  <CardTitle className="text-lg">{leader.name}</CardTitle>
                  <CardDescription>{leader.role}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="text-gray-500">Expertise:</span>
                      <span className="font-medium ml-1">{leader.expertise}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-500">Contributions:</span>
                      <span className="font-medium ml-1">{leader.contributions}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-500">Joined:</span>
                      <span className="font-medium ml-1">{leader.joined}</span>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full mt-4" size="sm">
                    View Profile
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Community Guidelines */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="h-6 w-6 text-blue-600" />
              <span>Community Guidelines</span>
            </CardTitle>
            <CardDescription>
              Help us maintain a positive and productive community environment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">Be Respectful</h3>
                <p className="text-sm text-gray-600">
                  Treat all community members with respect and courtesy. Disagreements are welcome, 
                  but personal attacks and harassment are not tolerated.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-3">Stay On Topic</h3>
                <p className="text-sm text-gray-600">
                  Keep discussions relevant to the category and topic. Create new threads for 
                  different subjects to maintain organization.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-3">Share Knowledge</h3>
                <p className="text-sm text-gray-600">
                  Contribute valuable insights and help others learn. Our community thrives on 
                  shared knowledge and collaborative learning.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-3">Follow Platform Rules</h3>
                <p className="text-sm text-gray-600">
                  Adhere to our terms of service and community guidelines. Report any violations 
                  to our moderation team.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Join Our Community?</h2>
          <p className="text-xl mb-8 opacity-90">
            Connect with thousands of traders and developers. Share knowledge, learn from experts, 
            and grow your skills together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary">
              Join Discord Community
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
              Explore Forums
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}