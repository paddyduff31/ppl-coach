import { useState } from 'react'
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
  Minus,
  Bell,
  Moon,
  Sun,
  Monitor,
  ChartLine,
  Shield,
  Gear
} from '@phosphor-icons/react'
import { cn } from '../utils/utils'

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

const themeOptions = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor }
]

export default function Settings() {
  const [profile, setProfile] = useState(mockUserProfile)
  const [isEditing, setIsEditing] = useState(false)
  const [newGoal, setNewGoal] = useState('')

  const handleSave = () => {
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
        [type]: Math.max(30, Math.min(600, value))
      }
    }))
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="pt-16 pb-12 px-8 border-b border-gray-100 animate-fade-in-up">
          <div className="text-center">
            <div className="inline-flex items-center gap-3 mb-6 animate-scale-in">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-gray-500 to-gray-600" />
              <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                Account Settings
              </span>
            </div>
            <h1 className="text-5xl font-semibold tracking-tight text-gray-900 mb-4 animate-fade-in-up">
              Settings
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed animate-fade-in-up">
              Personalize your training experience and manage your account
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex justify-center mt-8">
            <div className="flex gap-3">
              {isEditing ? (
                <>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsEditing(false)}
                    className="h-11"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSave}
                    className="h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </>
              ) : (
                <Button 
                  onClick={() => setIsEditing(true)}
                  className="h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Gear className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 py-12 space-y-12">
          {/* Profile Section */}
          <section className="animate-fade-in-up">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
                <p className="text-gray-500">Your personal details and training background</p>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-8 space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700 mb-2 block">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                    disabled={!isEditing}
                    className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-2 block">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                    disabled={!isEditing}
                    className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                <div>
                  <Label htmlFor="weight" className="text-sm font-medium text-gray-700 mb-2 block">
                    Weight ({profile.units})
                  </Label>
                  <Input
                    id="weight"
                    type="number"
                    value={profile.weight}
                    onChange={(e) => setProfile(prev => ({ ...prev, weight: parseFloat(e.target.value) || 0 }))}
                    disabled={!isEditing}
                    className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <Label htmlFor="height" className="text-sm font-medium text-gray-700 mb-2 block">
                    Height (cm)
                  </Label>
                  <Input
                    id="height"
                    type="number"
                    value={profile.height}
                    onChange={(e) => setProfile(prev => ({ ...prev, height: parseInt(e.target.value) || 0 }))}
                    disabled={!isEditing}
                    className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <Label htmlFor="age" className="text-sm font-medium text-gray-700 mb-2 block">
                    Age
                  </Label>
                  <Input
                    id="age"
                    type="number"
                    value={profile.age}
                    onChange={(e) => setProfile(prev => ({ ...prev, age: parseInt(e.target.value) || 0 }))}
                    disabled={!isEditing}
                    className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="experience" className="text-sm font-medium text-gray-700 mb-2 block">
                  Experience Level
                </Label>
                <select
                  id="experience"
                  value={profile.experience}
                  onChange={(e) => setProfile(prev => ({ ...prev, experience: e.target.value }))}
                  disabled={!isEditing}
                  className="w-full h-11 px-3 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-blue-500 bg-white"
                >
                  {experienceLevels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Training Goals */}
          <section className="animate-fade-in-up">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
                <Target className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Training Goals</h2>
                <p className="text-gray-500">What are you working towards?</p>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-8 space-y-6">
              <div className="flex flex-wrap gap-3">
                {profile.goals.map((goal) => (
                  <Badge 
                    key={goal} 
                    variant="secondary" 
                    className="px-4 py-2 text-sm bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border-blue-200 hover:from-blue-100 hover:to-purple-100"
                  >
                    {goal}
                    {isEditing && (
                      <button
                        onClick={() => removeGoal(goal)}
                        className="ml-2 hover:text-red-600 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </Badge>
                ))}
              </div>

              {isEditing && (
                <div className="flex gap-3">
                  <Input
                    placeholder="Add new goal..."
                    value={newGoal}
                    onChange={(e) => setNewGoal(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addGoal()}
                    className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                  <Button 
                    onClick={addGoal} 
                    className="h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              )}

              <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded-lg">
                <strong>Available goals:</strong> {availableGoals.join(', ')}
              </div>
            </div>
          </section>

          {/* Preferences */}
          <section className="animate-fade-in-up">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center">
                <Palette className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Preferences</h2>
                <p className="text-gray-500">Customize your app experience</p>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-8 space-y-8">
              {/* Theme Selection */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-4 block">Theme</Label>
                <div className="grid grid-cols-3 gap-3">
                  {themeOptions.map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() => !isEditing || setProfile(prev => ({ ...prev, theme: value }))}
                      disabled={!isEditing}
                      className={cn(
                        "flex flex-col items-center p-4 border-2 rounded-xl transition-all",
                        profile.theme === value
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300",
                        !isEditing && "cursor-not-allowed opacity-50"
                      )}
                    >
                      <Icon className="h-6 w-6 mb-2 text-gray-700" />
                      <span className="text-sm font-medium text-gray-900">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Units */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-3 block">Weight Units</Label>
                <div className="flex gap-3">
                  {['kg', 'lb'].map((unit) => (
                    <button
                      key={unit}
                      onClick={() => !isEditing || setProfile(prev => ({ ...prev, units: unit }))}
                      disabled={!isEditing}
                      className={cn(
                        "px-6 py-3 rounded-lg border-2 font-medium transition-all",
                        profile.units === unit
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-200 text-gray-700 hover:border-gray-300",
                        !isEditing && "cursor-not-allowed opacity-50"
                      )}
                    >
                      {unit === 'kg' ? 'Kilograms' : 'Pounds'} ({unit})
                    </button>
                  ))}
                </div>
              </div>

              {/* Notifications */}
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-gray-600" />
                  <div>
                    <div className="font-medium text-gray-900">Push Notifications</div>
                    <div className="text-sm text-gray-500">Get reminders for workouts</div>
                  </div>
                </div>
                <button
                  onClick={() => !isEditing || setProfile(prev => ({ ...prev, notifications: !prev.notifications }))}
                  disabled={!isEditing}
                  className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                    profile.notifications ? "bg-blue-600" : "bg-gray-200",
                    !isEditing && "cursor-not-allowed opacity-50"
                  )}
                >
                  <span
                    className={cn(
                      "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                      profile.notifications ? "translate-x-6" : "translate-x-1"
                    )}
                  />
                </button>
              </div>
            </div>
          </section>

          {/* Rest Periods */}
          <section className="animate-fade-in-up">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Rest Periods</h2>
                <p className="text-gray-500">Default rest times for different intensities</p>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-8 space-y-6">
              {Object.entries(profile.restPeriods).map(([type, time]) => (
                <div key={type} className="flex items-center justify-between py-3">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 mb-1 capitalize">
                      {type.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                    <div className="text-sm text-gray-500">
                      {type === 'light' && 'Light sets, isolation exercises'}
                      {type === 'moderate' && 'Moderate sets, compound movements'}
                      {type === 'heavy' && 'Heavy sets, main lifts'}
                      {type === 'maxEffort' && 'Max effort, personal records'}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateRestPeriod(type as keyof typeof profile.restPeriods, time - 15)}
                      disabled={!isEditing || time <= 30}
                      className="h-9 w-9 p-0"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <div className="w-20 text-center">
                      <div className="font-mono text-lg font-semibold text-gray-900">
                        {Math.floor(time / 60)}:{(time % 60).toString().padStart(2, '0')}
                      </div>
                      <div className="text-xs text-gray-500">min:sec</div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateRestPeriod(type as keyof typeof profile.restPeriods, time + 15)}
                      disabled={!isEditing || time >= 600}
                      className="h-9 w-9 p-0"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Data Management */}
          <section className="animate-fade-in-up">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <ChartLine className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Data Management</h2>
                <p className="text-gray-500">Export, import, and manage your data</p>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-8 space-y-6">
              <div className="grid gap-3">
                <Button 
                  variant="outline" 
                  className="justify-start h-12 text-left border-gray-200 hover:bg-gray-50"
                >
                  <Download className="h-5 w-5 mr-3 text-blue-600" />
                  <div>
                    <div className="font-medium">Export Workout Data</div>
                    <div className="text-sm text-gray-500">Download your complete workout history</div>
                  </div>
                </Button>
                <Button 
                  variant="outline" 
                  className="justify-start h-12 text-left border-gray-200 hover:bg-gray-50"
                >
                  <Upload className="h-5 w-5 mr-3 text-green-600" />
                  <div>
                    <div className="font-medium">Import Workout Data</div>
                    <div className="text-sm text-gray-500">Upload data from another app</div>
                  </div>
                </Button>
                <Button 
                  variant="outline" 
                  className="justify-start h-12 text-left border-gray-200 hover:bg-gray-50"
                >
                  <ChartLine className="h-5 w-5 mr-3 text-purple-600" />
                  <div>
                    <div className="font-medium">Export Progress Charts</div>
                    <div className="text-sm text-gray-500">Save your progress visualization</div>
                  </div>
                </Button>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="h-5 w-5 text-red-600" />
                  <div>
                    <div className="font-medium text-red-900">Danger Zone</div>
                    <div className="text-sm text-red-600">Irreversible actions</div>
                  </div>
                </div>
                <Button 
                  variant="destructive" 
                  className="w-full h-12 bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                >
                  <Trash className="h-5 w-5 mr-2" />
                  Delete All Data
                </Button>
                <p className="text-xs text-gray-500 mt-3 text-center">
                  This will permanently delete all your workout data and cannot be undone.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}