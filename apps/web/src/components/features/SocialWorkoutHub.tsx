import { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import {
  Users,
  Crown,
  Trophy,
  Fire,
  Lightning,
  Barbell,
  Eye,
  ChatCircle,
  Share
} from '@phosphor-icons/react'
import { cn } from '../../utils/utils'

interface TrainingPartner {
  id: string
  name: string
  avatar: string
  level: number
  streak: number
  isOnline: boolean
  currentWorkout?: string
  lastSeen: Date
  stats: {
    totalWorkouts: number
    currentStreak: number
    bestLift: string
    totalVolume: number
  }
}

interface WorkoutSession {
  id: string
  userId: string
  userName: string
  exercise: string
  weight: number
  reps: number
  isLive: boolean
  timestamp: Date
  reactions: { emoji: string; count: number }[]
}

interface LiveChallenge {
  id: string
  title: string
  description: string
  participants: string[]
  timeRemaining: number
  currentLeader: string
  leaderScore: number
}

export function SocialWorkoutHub() {
  const [activeTab, setActiveTab] = useState<'feed' | 'partners' | 'live'>('feed')
  const [partners, setPartners] = useState<TrainingPartner[]>([])
  const [liveFeed, setLiveFeed] = useState<WorkoutSession[]>([])
  const [liveChallenges, setLiveChallenges] = useState<LiveChallenge[]>([])

  // Mock data initialization
  useEffect(() => {
    const mockPartners: TrainingPartner[] = [
      {
        id: '1',
        name: 'Alex Chen',
        avatar: '👨‍💼',
        level: 47,
        streak: 12,
        isOnline: true,
        currentWorkout: 'Push Day',
        lastSeen: new Date(),
        stats: {
          totalWorkouts: 245,
          currentStreak: 12,
          bestLift: '180kg Deadlift',
          totalVolume: 125000
        }
      },
      {
        id: '2', 
        name: 'Sarah Kim',
        avatar: '👩‍🦳',
        level: 52,
        streak: 28,
        isOnline: true,
        currentWorkout: 'Leg Day',
        lastSeen: new Date(),
        stats: {
          totalWorkouts: 312,
          currentStreak: 28,
          bestLift: '140kg Squat',
          totalVolume: 180000
        }
      },
      {
        id: '3',
        name: 'Mike Johnson',
        avatar: '🧔',
        level: 35,
        streak: 5,
        isOnline: false,
        lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        stats: {
          totalWorkouts: 156,
          currentStreak: 5,
          bestLift: '120kg Bench',
          totalVolume: 85000
        }
      }
    ]

    const mockLiveFeed: WorkoutSession[] = [
      {
        id: '1',
        userId: '1',
        userName: 'Alex Chen',
        exercise: 'Bench Press',
        weight: 100,
        reps: 8,
        isLive: true,
        timestamp: new Date(Date.now() - 2 * 60 * 1000),
        reactions: [
          { emoji: '🔥', count: 3 },
          { emoji: '💪', count: 5 }
        ]
      },
      {
        id: '2',
        userId: '2',
        userName: 'Sarah Kim',
        exercise: 'Squats',
        weight: 120,
        reps: 12,
        isLive: false,
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        reactions: [
          { emoji: '🔥', count: 8 },
          { emoji: '👏', count: 4 },
          { emoji: '🏆', count: 2 }
        ]
      }
    ]

    const mockChallenges: LiveChallenge[] = [
      {
        id: '1',
        title: 'Squat Battle',
        description: 'Most total squat volume in the next hour',
        participants: ['Alex Chen', 'Sarah Kim', 'Mike Johnson', '+7 others'],
        timeRemaining: 3420, // seconds
        currentLeader: 'Sarah Kim',
        leaderScore: 2400
      }
    ]

    setPartners(mockPartners)
    setLiveFeed(mockLiveFeed)
    setLiveChallenges(mockChallenges)
  }, [])

  const formatTimeAgo = (date: Date) => {
    const diffMs = Date.now() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays}d ago`
  }

  const formatTimeRemaining = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const reactToSet = (sessionId: string, emoji: string) => {
    setLiveFeed(prev => prev.map(session => {
      if (session.id === sessionId) {
        const existingReaction = session.reactions.find(r => r.emoji === emoji)
        if (existingReaction) {
          existingReaction.count += 1
        } else {
          session.reactions.push({ emoji, count: 1 })
        }
      }
      return session
    }))
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Social Workout Hub</h1>
        <p className="text-gray-600">Train together, motivate each other, compete and grow!</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit mx-auto">
        <button
          onClick={() => setActiveTab('feed')}
          className={cn(
            "px-6 py-2 rounded-md font-medium transition-all",
            activeTab === 'feed' 
              ? "bg-white text-gray-900 shadow-sm" 
              : "text-gray-500 hover:text-gray-700"
          )}
        >
          <Lightning className="h-4 w-4 mr-2 inline" />
          Live Feed
        </button>
        <button
          onClick={() => setActiveTab('partners')}
          className={cn(
            "px-6 py-2 rounded-md font-medium transition-all",
            activeTab === 'partners' 
              ? "bg-white text-gray-900 shadow-sm" 
              : "text-gray-500 hover:text-gray-700"
          )}
        >
          <Users className="h-4 w-4 mr-2 inline" />
          Training Partners
        </button>
        <button
          onClick={() => setActiveTab('live')}
          className={cn(
            "px-6 py-2 rounded-md font-medium transition-all",
            activeTab === 'live' 
              ? "bg-white text-gray-900 shadow-sm" 
              : "text-gray-500 hover:text-gray-700"
          )}
        >
          <Trophy className="h-4 w-4 mr-2 inline" />
          Live Challenges
        </button>
      </div>

      {/* Live Feed Tab */}
      {activeTab === 'feed' && (
        <div className="space-y-4">
          {liveFeed.map((session) => (
            <Card key={session.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-lg">
                      👤
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{session.userName}</span>
                        {session.isLive && (
                          <Badge className="bg-red-500 text-white">
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse mr-1" />
                            LIVE
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">{formatTimeAgo(session.timestamp)}</div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Share className="h-4 w-4" />
                  </Button>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-4">
                    <Barbell className="h-8 w-8 text-blue-600" />
                    <div>
                      <h3 className="font-semibold text-lg">{session.exercise}</h3>
                      <p className="text-2xl font-bold text-blue-600">
                        {session.weight}kg × {session.reps} reps
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {session.reactions.map((reaction, index) => (
                      <button
                        key={index}
                        onClick={() => reactToSet(session.id, reaction.emoji)}
                        className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                      >
                        <span>{reaction.emoji}</span>
                        <span className="text-sm font-medium">{reaction.count}</span>
                      </button>
                    ))}
                  </div>
                  
                  <div className="flex gap-1">
                    {['🔥', '💪', '👏', '🏆'].map((emoji) => (
                      <Button
                        key={emoji}
                        variant="ghost"
                        size="sm"
                        onClick={() => reactToSet(session.id, emoji)}
                        className="hover:bg-gray-100"
                      >
                        {emoji}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Training Partners Tab */}
      {activeTab === 'partners' && (
        <div className="grid gap-4">
          {partners.map((partner) => (
            <Card key={partner.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-xl">
                        {partner.avatar}
                      </div>
                      {partner.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{partner.name}</h3>
                        <Badge variant="outline">Level {partner.level}</Badge>
                        {partner.streak > 7 && (
                          <Badge className="bg-orange-100 text-orange-700">
                            <Fire className="h-3 w-3 mr-1" />
                            {partner.streak} day streak
                          </Badge>
                        )}
                      </div>
                      
                      <div className="text-sm text-gray-600">
                        {partner.isOnline && partner.currentWorkout ? (
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            Working out: {partner.currentWorkout}
                          </div>
                        ) : (
                          `Last seen ${formatTimeAgo(partner.lastSeen)}`
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      Watch
                    </Button>
                    <Button variant="outline" size="sm">
                      <ChatCircle className="h-4 w-4 mr-1" />
                      Chat
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t">
                  <div className="text-center">
                    <div className="font-semibold text-blue-600">{partner.stats.totalWorkouts}</div>
                    <div className="text-xs text-gray-500">Workouts</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-green-600">{partner.stats.currentStreak}</div>
                    <div className="text-xs text-gray-500">Streak</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-purple-600">{partner.stats.bestLift}</div>
                    <div className="text-xs text-gray-500">Best Lift</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-orange-600">{(partner.stats.totalVolume / 1000).toFixed(0)}k</div>
                    <div className="text-xs text-gray-500">Volume</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Live Challenges Tab */}
      {activeTab === 'live' && (
        <div className="space-y-4">
          {liveChallenges.map((challenge) => (
            <Card key={challenge.id} className="overflow-hidden border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-600" />
                    {challenge.title}
                  </CardTitle>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-red-600">
                      {formatTimeRemaining(challenge.timeRemaining)}
                    </div>
                    <div className="text-xs text-gray-500">remaining</div>
                  </div>
                </div>
                <p className="text-gray-600">{challenge.description}</p>
              </CardHeader>
              
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-yellow-600" />
                    <span className="font-semibold">{challenge.currentLeader}</span>
                    <Badge className="bg-yellow-100 text-yellow-800">Leading</Badge>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold">{challenge.leaderScore.toLocaleString()}kg</div>
                    <div className="text-xs text-gray-500">total volume</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm text-gray-600">
                    <Users className="h-4 w-4 inline mr-1" />
                    {challenge.participants.join(', ')}
                  </div>
                </div>
                
                <Button className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600">
                  <Lightning className="h-4 w-4 mr-2" />
                  Join Challenge
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
