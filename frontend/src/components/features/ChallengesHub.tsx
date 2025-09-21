import { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import {
  Trophy,
  Crown,
  Fire,
  Target,
  Users,
  TrendUp,
  Calendar,
  Lightning,
  Medal,
  Sparkle,
  Sword,
  Shield
} from '@phosphor-icons/react'
import { cn } from '../../utils/utils'

interface Challenge {
  id: string
  title: string
  description: string
  type: 'personal' | 'community' | 'streak'
  duration: number // days
  target: number
  current: number
  reward: string
  participants: number
  difficulty: 'easy' | 'medium' | 'hard'
  category: 'strength' | 'volume' | 'consistency' | 'endurance'
  startDate: Date
  endDate: Date
  isActive: boolean
  joined: boolean
}

interface Achievement {
  id: string
  title: string
  description: string
  icon: any
  rarity: 'common' | 'rare' | 'legendary'
  unlockedAt?: Date
  progress: number
  maxProgress: number
}

export function ChallengesHub() {
  const [activeTab, setActiveTab] = useState<'challenges' | 'achievements'>('challenges')
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [achievements, setAchievements] = useState<Achievement[]>([])

  // Mock data - in real app this would come from API
  useEffect(() => {
    const mockChallenges: Challenge[] = [
      {
        id: '1',
        title: '100K Volume Challenge',
        description: 'Lift 100,000kg total volume in 30 days',
        type: 'community',
        duration: 30,
        target: 100000,
        current: 67500,
        reward: '🏆 Volume Warrior Badge + 500 XP',
        participants: 2847,
        difficulty: 'hard',
        category: 'volume',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
        isActive: true,
        joined: true
      },
      {
        id: '2',
        title: 'Perfect Week Streak',
        description: 'Complete all 3 PPL sessions for 4 consecutive weeks',
        type: 'streak',
        duration: 28,
        target: 4,
        current: 2,
        reward: '⚡ Consistency Crown + 300 XP',
        participants: 1203,
        difficulty: 'medium',
        category: 'consistency',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-28'),
        isActive: true,
        joined: false
      },
      {
        id: '3',
        title: 'PR Hunting Season',
        description: 'Set 5 new personal records this month',
        type: 'personal',
        duration: 30,
        target: 5,
        current: 3,
        reward: '💎 PR Hunter Title + 400 XP',
        participants: 892,
        difficulty: 'medium',
        category: 'strength',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
        isActive: true,
        joined: true
      }
    ]

    const mockAchievements: Achievement[] = [
      {
        id: '1',
        title: 'First Steps',
        description: 'Complete your first workout',
        icon: Target,
        rarity: 'common',
        unlockedAt: new Date('2024-01-15'),
        progress: 1,
        maxProgress: 1
      },
      {
        id: '2',
        title: 'Iron Warrior',
        description: 'Squat 2x your bodyweight',
        icon: Sword,
        rarity: 'legendary',
        progress: 1.7,
        maxProgress: 2.0
      },
      {
        id: '3',
        title: 'Volume King',
        description: 'Complete 1,000,000kg lifetime volume',
        icon: Crown,
        rarity: 'legendary',
        progress: 750000,
        maxProgress: 1000000
      },
      {
        id: '4',
        title: 'Streak Master',
        description: 'Maintain a 30-day workout streak',
        icon: Fire,
        rarity: 'rare',
        unlockedAt: new Date('2024-01-10'),
        progress: 30,
        maxProgress: 30
      }
    ]

    setChallenges(mockChallenges)
    setAchievements(mockAchievements)
  }, [])

  const getDifficultyColor = (difficulty: Challenge['difficulty']) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-700'
      case 'medium': return 'bg-yellow-100 text-yellow-700'  
      case 'hard': return 'bg-red-100 text-red-700'
    }
  }

  const getRarityColor = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-700'
      case 'rare': return 'bg-blue-100 text-blue-700'
      case 'legendary': return 'bg-purple-100 text-purple-700'
    }
  }

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100)
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Challenges & Achievements</h1>
        <p className="text-gray-600">Push your limits and unlock epic rewards!</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit mx-auto">
        <button
          onClick={() => setActiveTab('challenges')}
          className={cn(
            "px-6 py-2 rounded-md font-medium transition-all",
            activeTab === 'challenges' 
              ? "bg-white text-gray-900 shadow-sm" 
              : "text-gray-500 hover:text-gray-700"
          )}
        >
          <Trophy className="h-4 w-4 mr-2 inline" />
          Challenges
        </button>
        <button
          onClick={() => setActiveTab('achievements')}
          className={cn(
            "px-6 py-2 rounded-md font-medium transition-all",
            activeTab === 'achievements' 
              ? "bg-white text-gray-900 shadow-sm" 
              : "text-gray-500 hover:text-gray-700"
          )}
        >
          <Medal className="h-4 w-4 mr-2 inline" />
          Achievements
        </button>
      </div>

      {/* Challenges Tab */}
      {activeTab === 'challenges' && (
        <div className="grid gap-6">
          {challenges.map((challenge) => (
            <Card key={challenge.id} className="overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-xl">{challenge.title}</CardTitle>
                      <Badge className={getDifficultyColor(challenge.difficulty)}>
                        {challenge.difficulty}
                      </Badge>
                      {challenge.type === 'community' && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                          <Users className="h-3 w-3 mr-1" />
                          Community
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-600">{challenge.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">
                      {getProgressPercentage(challenge.current, challenge.target).toFixed(0)}%
                    </div>
                    <div className="text-xs text-gray-500">
                      {challenge.current.toLocaleString()} / {challenge.target.toLocaleString()}
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="mb-4">
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${getProgressPercentage(challenge.current, challenge.target)}%` }}
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {challenge.participants.toLocaleString()} participants
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {challenge.duration} days
                    </div>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-500">Reward: </span>
                    <span className="font-medium">{challenge.reward}</span>
                  </div>
                </div>
                
                <Button 
                  className={cn(
                    "w-full",
                    challenge.joined 
                      ? "bg-gray-100 text-gray-600 cursor-default" 
                      : "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                  )}
                  disabled={challenge.joined}
                >
                  {challenge.joined ? (
                    <>
                      <Shield className="h-4 w-4 mr-2" />
                      Joined
                    </>
                  ) : (
                    <>
                      <Sword className="h-4 w-4 mr-2" />
                      Join Challenge
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Achievements Tab */}
      {activeTab === 'achievements' && (
        <div className="grid md:grid-cols-2 gap-6">
          {achievements.map((achievement) => {
            const Icon = achievement.icon
            const isUnlocked = !!achievement.unlockedAt
            const progress = achievement.maxProgress > 1 
              ? (achievement.progress / achievement.maxProgress) * 100
              : achievement.progress * 100
            
            return (
              <Card key={achievement.id} className={cn(
                "transition-all duration-200",
                isUnlocked 
                  ? "bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200" 
                  : "opacity-75"
              )}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "p-3 rounded-full",
                      isUnlocked 
                        ? "bg-gradient-to-br from-yellow-400 to-orange-400 text-white" 
                        : "bg-gray-100 text-gray-400"
                    )}>
                      <Icon className="h-6 w-6" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{achievement.title}</h3>
                        <Badge className={getRarityColor(achievement.rarity)}>
                          {achievement.rarity}
                        </Badge>
                        {isUnlocked && (
                          <Sparkle className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-3">{achievement.description}</p>
                      
                      {!isUnlocked && (
                        <div className="mb-2">
                          <div className="flex justify-between text-xs mb-1">
                            <span>Progress</span>
                            <span>{progress.toFixed(0)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-blue-400 to-purple-400 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                      
                      {isUnlocked && (
                        <div className="text-xs text-yellow-700">
                          Unlocked {achievement.unlockedAt?.toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
