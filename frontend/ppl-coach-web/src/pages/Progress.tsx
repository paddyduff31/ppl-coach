import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ScatterChart,
  Scatter
} from 'recharts'
import { 
  TrendUp, 
  Calendar, 
  Target, 
  Barbell,
  Pulse,
  ChartLine,
  Trophy,
  Clock
} from '@phosphor-icons/react'

// Mock data for development
const e1rmData = [
  { week: 1, bench: 100, squat: 120, deadlift: 140, ohp: 50, rpe: 8.0 },
  { week: 2, bench: 102.5, squat: 123, deadlift: 143.5, ohp: 51.25, rpe: 8.2 },
  { week: 3, bench: 105, squat: 126, deadlift: 147, ohp: 52.5, rpe: 8.1 },
  { week: 4, bench: 107.5, squat: 129, deadlift: 150.5, ohp: 53.75, rpe: 8.3 },
  { week: 5, bench: 110, squat: 132, deadlift: 154, ohp: 55, rpe: 8.0 },
  { week: 6, bench: 112.5, squat: 135, deadlift: 157.5, ohp: 56.25, rpe: 8.1 },
]

const volumeData = [
  { muscle: 'Chest', sets: 12, volume: 2400, rpe: 8.1 },
  { muscle: 'Shoulders', sets: 10, volume: 1800, rpe: 7.8 },
  { muscle: 'Triceps', sets: 8, volume: 1200, rpe: 8.0 },
  { muscle: 'Back', sets: 14, volume: 2800, rpe: 8.2 },
  { muscle: 'Biceps', sets: 6, volume: 900, rpe: 7.9 },
  { muscle: 'Legs', sets: 16, volume: 3200, rpe: 8.3 },
]

const rpeData = [
  { week: 1, push: 8.0, pull: 7.8, legs: 8.2 },
  { week: 2, push: 8.2, pull: 8.0, legs: 8.1 },
  { week: 3, push: 8.1, pull: 7.9, legs: 8.3 },
  { week: 4, push: 8.3, pull: 8.1, legs: 8.0 },
  { week: 5, push: 8.0, pull: 8.2, legs: 8.1 },
  { week: 6, push: 8.1, pull: 8.0, legs: 8.2 },
]

const personalRecords = [
  { exercise: 'Bench Press', weight: '110 kg', date: '2024-01-15', previous: '107.5 kg', improvement: '+2.5 kg' },
  { exercise: 'Squat', weight: '132 kg', date: '2024-01-11', previous: '129 kg', improvement: '+3 kg' },
  { exercise: 'Deadlift', weight: '154 kg', date: '2024-01-11', previous: '150.5 kg', improvement: '+3.5 kg' },
  { exercise: 'Overhead Press', weight: '55 kg', date: '2024-01-15', previous: '53.75 kg', improvement: '+1.25 kg' },
]

const weeklyStats = {
  totalSessions: 18,
  totalVolume: 45600,
  averageRpe: 8.1,
  personalRecords: 4,
  streak: 12,
  consistency: 95
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#ff00ff']

export default function Progress() {
  const [activeTab, setActiveTab] = useState<'strength' | 'volume' | 'rpe' | 'body' | 'analytics'>('strength')

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Progress Tracking</h1>
        <p className="text-muted-foreground">Monitor your PPL progression and strength gains</p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Cycle</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Week 6</div>
            <p className="text-xs text-muted-foreground">
              PPL Training Program
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
            <Barbell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weeklyStats.totalVolume.toLocaleString()} kg</div>
            <p className="text-xs text-muted-foreground">
              This cycle
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average RPE</CardTitle>
            <Pulse className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weeklyStats.averageRpe}</div>
            <p className="text-xs text-muted-foreground">
              Perfect intensity
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Personal Records</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weeklyStats.personalRecords}</div>
            <p className="text-xs text-muted-foreground">
              This cycle
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b">
        {[
          { key: 'strength', label: 'Strength Progression', icon: TrendUp },
          { key: 'volume', label: 'Volume Analysis', icon: Barbell },
          { key: 'rpe', label: 'RPE Tracking', icon: Pulse },
          { key: 'body', label: 'Body Metrics', icon: Target },
          { key: 'analytics', label: 'Advanced Analytics', icon: ChartLine },
        ].map((tab) => (
          <Button
            key={tab.key}
            variant={activeTab === tab.key ? 'default' : 'ghost'}
            onClick={() => setActiveTab(tab.key as any)}
            className="rounded-none border-b-2 border-transparent data-[active=true]:border-primary flex items-center gap-2"
            data-active={activeTab === tab.key}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Strength Progression Tab */}
      {activeTab === 'strength' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Estimated 1RM Progression</CardTitle>
              <CardDescription>Based on your best sets each week using PPL training</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={e1rmData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="bench" stroke="#8884d8" name="Bench Press" strokeWidth={3} />
                  <Line type="monotone" dataKey="squat" stroke="#82ca9d" name="Squat" strokeWidth={3} />
                  <Line type="monotone" dataKey="deadlift" stroke="#ffc658" name="Deadlift" strokeWidth={3} />
                  <Line type="monotone" dataKey="ohp" stroke="#ff7300" name="Overhead Press" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {personalRecords.map((pr) => (
              <Card key={pr.exercise}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{pr.exercise}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold">{pr.weight}</div>
                    <div className="text-sm text-muted-foreground">
                      Previous: {pr.previous}
                    </div>
                    <div className="text-sm text-green-600 font-medium">
                      {pr.improvement}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {pr.date}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Volume Analysis Tab */}
      {activeTab === 'volume' && (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Volume by Muscle Group</CardTitle>
                <CardDescription>Sets per muscle group this week</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={volumeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="muscle" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="sets" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Volume Distribution</CardTitle>
                <CardDescription>Volume breakdown by muscle group</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={volumeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ muscle, volume }) => `${muscle}: ${volume}kg`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="volume"
                    >
                      {volumeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Volume Progression Over Time</CardTitle>
              <CardDescription>Weekly volume trends</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={e1rmData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="bench" stackId="1" stroke="#8884d8" fill="#8884d8" />
                  <Area type="monotone" dataKey="squat" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                  <Area type="monotone" dataKey="deadlift" stackId="1" stroke="#ffc658" fill="#ffc658" />
                  <Area type="monotone" dataKey="ohp" stackId="1" stroke="#ff7300" fill="#ff7300" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* RPE Tracking Tab */}
      {activeTab === 'rpe' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>RPE Trends by Day Type</CardTitle>
              <CardDescription>Rate of Perceived Exertion over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={rpeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis domain={[7, 9]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="push" stroke="#8884d8" name="Push Day" strokeWidth={3} />
                  <Line type="monotone" dataKey="pull" stroke="#82ca9d" name="Pull Day" strokeWidth={3} />
                  <Line type="monotone" dataKey="legs" stroke="#ffc658" name="Legs Day" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              { day: 'Push Day', avgRpe: 8.1, trend: '+0.1', color: 'text-blue-600' },
              { day: 'Pull Day', avgRpe: 8.0, trend: '+0.2', color: 'text-green-600' },
              { day: 'Legs Day', avgRpe: 8.2, trend: '0.0', color: 'text-yellow-600' },
            ].map((day) => (
              <Card key={day.day}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{day.day}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold">{day.avgRpe}</div>
                    <div className="text-sm text-muted-foreground">
                      Average RPE
                    </div>
                    <div className={`text-sm font-medium ${day.color}`}>
                      {day.trend} from last cycle
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Body Metrics Tab */}
      {activeTab === 'body' && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Weight</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">72.5 kg</div>
                <p className="text-sm text-muted-foreground">
                  +1.5 kg from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Body Fat</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">14.2%</div>
                <p className="text-sm text-muted-foreground">
                  -0.8% from last month
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Measurements</CardTitle>
              <CardDescription>Body measurements over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  { part: 'Chest', current: '102 cm', change: '+2 cm' },
                  { part: 'Arms', current: '35 cm', change: '+1 cm' },
                  { part: 'Waist', current: '78 cm', change: '-1 cm' },
                  { part: 'Thighs', current: '58 cm', change: '+1.5 cm' },
                ].map((measurement) => (
                  <div key={measurement.part} className="flex justify-between items-center border-b pb-2">
                    <span className="font-medium">{measurement.part}</span>
                    <div className="text-right">
                      <div className="font-medium">{measurement.current}</div>
                      <div className="text-sm text-green-600">{measurement.change}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Advanced Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Strength vs Volume Correlation</CardTitle>
                <CardDescription>Relationship between volume and strength gains</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart data={e1rmData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="bench" name="Bench Press (kg)" />
                    <YAxis dataKey="rpe" name="RPE" />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Scatter dataKey="rpe" fill="#8884d8" />
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Consistency Metrics</CardTitle>
                <CardDescription>Your training consistency</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Workout Streak</span>
                    <span className="font-bold text-lg">{weeklyStats.streak} days</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Consistency Rate</span>
                    <span className="font-bold text-lg">{weeklyStats.consistency}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Total Sessions</span>
                    <span className="font-bold text-lg">{weeklyStats.totalSessions}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Average Session Time</span>
                    <span className="font-bold text-lg">45 min</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>PPL Training Effectiveness</CardTitle>
              <CardDescription>Analysis of your progression</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">+12.5%</div>
                  <div className="text-sm text-muted-foreground">Strength Gain</div>
                  <div className="text-xs text-muted-foreground">6 weeks</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">8.1</div>
                  <div className="text-sm text-muted-foreground">Average RPE</div>
                  <div className="text-xs text-muted-foreground">Perfect intensity</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">95%</div>
                  <div className="text-sm text-muted-foreground">Program Adherence</div>
                  <div className="text-xs text-muted-foreground">Excellent</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}