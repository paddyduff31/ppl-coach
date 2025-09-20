import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Badge } from '../components/ui/badge'
import { 
  User, 
  Barbell, 
  Target, 
  Clock, 
  Palette, 
  Download, 
  Upload, 
  Trash,
  Check,
  X,
  Plus,
  Minus
} from '@phosphor-icons/react'

const mockUserProfile = {
  name: 'John Doe',
  email: 'john@example.com',
  weight: 72.5,
  height: 175,
  age: 28,
  experience: 'Intermediate',
  goals: ['Strength', 'Muscle Mass'],
  units: 'kg',
  theme: 'system',
  notifications: true,
  restPeriods: {
    light: 60,
    moderate: 120,
    heavy: 180,
    maxEffort: 300
  }
}

const availableGoals = [
  'Strength',
  'Muscle Mass',
  'Fat Loss',
  'Endurance',
  'Power',
  'Rehabilitation'
]

const experienceLevels = [
  'Beginner',
  'Intermediate', 
  'Advanced',
  'Elite'
]

export default function Settings() {
  const [profile, setProfile] = useState(mockUserProfile)
  const [isEditing, setIsEditing] = useState(false)
  const [newGoal, setNewGoal] = useState('')

  const handleSave = () => {
    // In a real app, this would save to the backend
    console.log('Saving profile:', profile)
    setIsEditing(false)
  }

  const addGoal = () => {
    if (newGoal && !profile.goals.includes(newGoal)) {
      setProfile(prev => ({
        ...prev,
        goals: [...prev.goals, newGoal]
      }))
      setNewGoal('')
    }
  }

  const removeGoal = (goal: string) => {
    setProfile(prev => ({
      ...prev,
      goals: prev.goals.filter(g => g !== goal)
    }))
  }

  const updateRestPeriod = (type: keyof typeof profile.restPeriods, value: number) => {
    setProfile(prev => ({
      ...prev,
      restPeriods: {
        ...prev.restPeriods,
        [type]: Math.max(30, Math.min(600, value)) // 30 seconds to 10 minutes
      }
    }))
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground text-lg">Manage your profile and preferences</p>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Check className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
            <CardDescription>Your personal details and training background</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label htmlFor="weight">Weight ({profile.units})</Label>
                <Input
                  id="weight"
                  type="number"
                  value={profile.weight}
                  onChange={(e) => setProfile(prev => ({ ...prev, weight: parseFloat(e.target.value) || 0 }))}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  value={profile.height}
                  onChange={(e) => setProfile(prev => ({ ...prev, height: parseInt(e.target.value) || 0 }))}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={profile.age}
                  onChange={(e) => setProfile(prev => ({ ...prev, age: parseInt(e.target.value) || 0 }))}
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="experience">Experience Level</Label>
              <select
                id="experience"
                value={profile.experience}
                onChange={(e) => setProfile(prev => ({ ...prev, experience: e.target.value }))}
                disabled={!isEditing}
                className="w-full p-2 border rounded-md"
              >
                {experienceLevels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Training Goals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Training Goals
            </CardTitle>
            <CardDescription>What are you working towards?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {profile.goals.map((goal) => (
                <Badge key={goal} variant="secondary" className="flex items-center gap-1">
                  {goal}
                  {isEditing && (
                    <button
                      onClick={() => removeGoal(goal)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </Badge>
              ))}
            </div>

            {isEditing && (
              <div className="flex gap-2">
                <Input
                  placeholder="Add new goal..."
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addGoal()}
                />
                <Button onClick={addGoal} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            )}

            <div className="text-sm text-muted-foreground">
              Available goals: {availableGoals.join(', ')}
            </div>
          </CardContent>
        </Card>

        {/* Units & Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Barbell className="h-5 w-5" />
              Units & Preferences
            </CardTitle>
            <CardDescription>Measurement units and display preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="units">Weight Units</Label>
              <select
                id="units"
                value={profile.units}
                onChange={(e) => setProfile(prev => ({ ...prev, units: e.target.value }))}
                disabled={!isEditing}
                className="w-full p-2 border rounded-md"
              >
                <option value="kg">Kilograms (kg)</option>
                <option value="lb">Pounds (lb)</option>
              </select>
            </div>

            <div>
              <Label htmlFor="theme">Theme</Label>
              <select
                id="theme"
                value={profile.theme}
                onChange={(e) => setProfile(prev => ({ ...prev, theme: e.target.value }))}
                disabled={!isEditing}
                className="w-full p-2 border rounded-md"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="notifications">Notifications</Label>
                <p className="text-sm text-muted-foreground">Get reminders for workouts</p>
              </div>
              <Button
                variant={profile.notifications ? "default" : "outline"}
                size="sm"
                onClick={() => setProfile(prev => ({ ...prev, notifications: !prev.notifications }))}
                disabled={!isEditing}
              >
                {profile.notifications ? 'On' : 'Off'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Rest Periods */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Rest Periods
            </CardTitle>
            <CardDescription>Default rest times for different set intensities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(profile.restPeriods).map(([type, time]) => (
              <div key={type} className="flex items-center justify-between">
                <div>
                  <Label className="capitalize">{type.replace(/([A-Z])/g, ' $1').trim()}</Label>
                  <p className="text-sm text-muted-foreground">
                    {type === 'light' && 'Light sets, isolation exercises'}
                    {type === 'moderate' && 'Moderate sets, compound movements'}
                    {type === 'heavy' && 'Heavy sets, main lifts'}
                    {type === 'maxEffort' && 'Max effort, personal records'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateRestPeriod(type as keyof typeof profile.restPeriods, time - 15)}
                    disabled={!isEditing || time <= 30}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-16 text-center font-mono">
                    {Math.floor(time / 60)}:{(time % 60).toString().padStart(2, '0')}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateRestPeriod(type as keyof typeof profile.restPeriods, time + 15)}
                    disabled={!isEditing || time >= 600}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Data Management
            </CardTitle>
            <CardDescription>Export, import, or manage your data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Button variant="outline" className="justify-start">
                <Download className="h-4 w-4 mr-2" />
                Export Workout Data
              </Button>
              <Button variant="outline" className="justify-start">
                <Upload className="h-4 w-4 mr-2" />
                Import Workout Data
              </Button>
              <Button variant="outline" className="justify-start">
                <Download className="h-4 w-4 mr-2" />
                Export Progress Charts
              </Button>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium text-destructive mb-2">Danger Zone</h4>
              <Button variant="destructive" className="w-full">
                <Trash className="h-4 w-4 mr-2" />
                Delete All Data
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                This will permanently delete all your workout data and cannot be undone.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Norwegian 4x4 Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Norwegian 4x4 Settings
            </CardTitle>
            <CardDescription>Configure your 4x4 progression parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="progressionRate">Progression Rate (%)</Label>
              <Input
                id="progressionRate"
                type="number"
                step="0.1"
                value="2.5"
                disabled={!isEditing}
                className="w-24"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Weekly weight increase percentage
              </p>
            </div>

            <div>
              <Label htmlFor="targetRpe">Target RPE</Label>
              <Input
                id="targetRpe"
                type="number"
                min="6"
                max="10"
                step="0.5"
                value="8.0"
                disabled={!isEditing}
                className="w-24"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Rate of Perceived Exertion for main sets
              </p>
            </div>

            <div>
              <Label htmlFor="cycleLength">Cycle Length (weeks)</Label>
              <Input
                id="cycleLength"
                type="number"
                min="3"
                max="6"
                value="4"
                disabled={!isEditing}
                className="w-24"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Length of each 4x4 cycle
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}