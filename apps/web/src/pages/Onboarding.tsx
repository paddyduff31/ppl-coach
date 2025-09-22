import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Card, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Textarea } from '../components/ui/textarea'
import {
  Target,
  User,
  Barbell,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Heart,
  CalendarCheck
} from '@phosphor-icons/react'
import { useUser } from '../hooks/useUser'

interface UserProfile {
  name: string
  email: string
  age: string
  experience: 'beginner' | 'intermediate' | 'advanced'
  goals: string[]
  equipment: string[]
  daysPerWeek: number
  notes: string
}

const EQUIPMENT_OPTIONS = [
  'Barbell',
  'Dumbbells',
  'Pull-up Bar',
  'Bench',
  'Squat Rack',
  'Cable Machine',
  'Resistance Bands',
  'Bodyweight Only'
]

const GOAL_OPTIONS = [
  'Build Muscle',
  'Lose Weight',
  'Get Stronger',
  'Improve Endurance',
  'General Fitness',
  'Athletic Performance'
]

export default function Onboarding() {
  const navigate = useNavigate()
  const { createUser, isCreatingUser } = useUser()
  const [step, setStep] = useState(1)
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    email: '',
    age: '',
    experience: 'beginner',
    goals: [],
    equipment: [],
    daysPerWeek: 3,
    notes: ''
  })

  const totalSteps = 5

  const updateProfile = (field: keyof UserProfile, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }))
  }

  const toggleArrayItem = (field: 'goals' | 'equipment', item: string) => {
    setProfile(prev => ({
      ...prev,
      [field]: prev[field].includes(item)
        ? prev[field].filter(i => i !== item)
        : [...prev[field], item]
    }))
  }

  const completeOnboarding = async () => {
    try {
      // Create user profile via API
      await createUser(profile.email, profile.name)
      
      // Save additional profile data to localStorage
      localStorage.setItem('ppl-coach-profile', JSON.stringify(profile))
      localStorage.setItem('ppl-coach-onboarded', 'true')
      
      navigate({ to: '/' })
    } catch (error) {
      console.error('Failed to create user profile:', error)
      // You could add error handling UI here
    }
  }

  const nextStep = () => setStep(Math.min(step + 1, totalSteps))
  const prevStep = () => setStep(Math.max(step - 1, 1))

  const canProceed = () => {
    switch (step) {
      case 1: return profile.name.trim() && profile.email.trim()
      case 2: return profile.age.trim() && profile.experience
      case 3: return profile.goals.length > 0
      case 4: return profile.equipment.length > 0
      case 5: return profile.daysPerWeek > 0
      default: return true
    }
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center">
              <User className="h-12 w-12 mx-auto text-primary mb-4" />
              <h2 className="text-2xl font-bold">Welcome to PPL Coach!</h2>
              <p className="text-muted-foreground">Let's start with the basics</p>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="Enter your full name"
                  value={profile.name}
                  onChange={(e) => updateProfile('name', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={profile.email}
                  onChange={(e) => updateProfile('email', e.target.value)}
                />
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            <div className="text-center">
              <Heart className="h-12 w-12 mx-auto text-primary mb-4" />
              <h2 className="text-2xl font-bold">About You</h2>
              <p className="text-muted-foreground">Help us customize your experience</p>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="25"
                  value={profile.age}
                  onChange={(e) => updateProfile('age', e.target.value)}
                />
              </div>
              <div>
                <Label>Training Experience</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {[
                    { key: 'beginner', label: 'Beginner', desc: '< 1 year' },
                    { key: 'intermediate', label: 'Intermediate', desc: '1-3 years' },
                    { key: 'advanced', label: 'Advanced', desc: '3+ years' }
                  ].map((level) => (
                    <Button
                      key={level.key}
                      variant={profile.experience === level.key ? 'default' : 'outline'}
                      onClick={() => updateProfile('experience', level.key)}
                      className="flex flex-col h-auto py-3"
                    >
                      <span className="font-medium">{level.label}</span>
                      <span className="text-xs text-muted-foreground">{level.desc}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-4">
            <div className="text-center">
              <Target className="h-12 w-12 mx-auto text-primary mb-4" />
              <h2 className="text-2xl font-bold">Your Goals</h2>
              <p className="text-muted-foreground">What do you want to achieve? (Select all that apply)</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {GOAL_OPTIONS.map((goal) => (
                <Button
                  key={goal}
                  variant={profile.goals.includes(goal) ? 'default' : 'outline'}
                  onClick={() => toggleArrayItem('goals', goal)}
                  className="h-auto py-4 flex items-center justify-center"
                >
                  {goal}
                </Button>
              ))}
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-4">
            <div className="text-center">
              <Barbell className="h-12 w-12 mx-auto text-primary mb-4" />
              <h2 className="text-2xl font-bold">Available Equipment</h2>
              <p className="text-muted-foreground">What equipment do you have access to?</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {EQUIPMENT_OPTIONS.map((equipment) => (
                <Button
                  key={equipment}
                  variant={profile.equipment.includes(equipment) ? 'default' : 'outline'}
                  onClick={() => toggleArrayItem('equipment', equipment)}
                  className="h-auto py-4 flex items-center justify-center"
                >
                  {equipment}
                </Button>
              ))}
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-4">
            <div className="text-center">
              <CalendarCheck className="h-12 w-12 mx-auto text-primary mb-4" />
              <h2 className="text-2xl font-bold">Training Schedule</h2>
              <p className="text-muted-foreground">How often can you train per week?</p>
            </div>
            <div className="space-y-4">
              <div>
                <Label>Days per week</Label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {[3, 4, 5, 6].map((days) => (
                    <Button
                      key={days}
                      variant={profile.daysPerWeek === days ? 'default' : 'outline'}
                      onClick={() => updateProfile('daysPerWeek', days)}
                      className="h-auto py-3"
                    >
                      {days} days
                    </Button>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {profile.daysPerWeek <= 3 && 'Perfect for beginners - PPL once per week'}
                  {profile.daysPerWeek === 4 && 'Good balance - Upper/Lower or PPL + accessory'}
                  {profile.daysPerWeek === 5 && 'Intermediate - PPL with extra sessions'}
                  {profile.daysPerWeek >= 6 && 'Advanced - PPL twice per week'}
                </p>
              </div>
              <div>
                <Label htmlFor="notes">Additional Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any injuries, preferences, or special considerations..."
                  value={profile.notes}
                  onChange={(e) => updateProfile('notes', e.target.value)}
                />
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Step {step} of {totalSteps}</span>
            <span>{Math.round((step / totalSteps) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Main Card */}
        <Card className="border-0 shadow-xl">
          <CardContent className="p-8">
            {renderStep()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={step === 1}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </Button>

          {step < totalSteps ? (
            <Button
              onClick={nextStep}
              disabled={!canProceed()}
              className="flex items-center gap-2"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={completeOnboarding}
              disabled={!canProceed() || isCreatingUser}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4" />
              {isCreatingUser ? 'Creating Profile...' : 'Complete Setup'}
            </Button>
          )}
        </div>

      </div>
    </div>
  )
}