import { useState, useRef, useEffect } from 'react'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import {
  Camera,
  CameraSlash,
  Eye,
  Target,
  CheckCircle,
  Warning,
  Lightning,
  Play,
  Stop
} from '@phosphor-icons/react'
import { cn } from '../../utils/utils'

interface FormAnalysis {
  movement: string
  score: number // 0-100
  feedback: string
  corrections: string[]
  repsAnalyzed: number
  timestamp: Date
}

interface AIFormCoachProps {
  currentMovement?: string
  onFormAnalysis?: (analysis: FormAnalysis) => void
}

export function AIFormCoach({ currentMovement = 'squat', onFormAnalysis }: AIFormCoachProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isActive, setIsActive] = useState(false)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [currentAnalysis, setCurrentAnalysis] = useState<FormAnalysis | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  // Mock form analysis for demo purposes
  const analyzeForm = () => {
    setIsAnalyzing(true)
    
    // Simulate AI analysis delay
    setTimeout(() => {
      const mockAnalysis: FormAnalysis = {
        movement: currentMovement,
        score: Math.floor(Math.random() * 40) + 60, // 60-100 score
        feedback: getRandomFeedback(),
        corrections: getRandomCorrections(),
        repsAnalyzed: 1,
        timestamp: new Date()
      }
      
      setCurrentAnalysis(mockAnalysis)
      setIsAnalyzing(false)
      onFormAnalysis?.(mockAnalysis)
    }, 1500)
  }

  const getRandomFeedback = () => {
    const feedback = [
      "Great depth! Keep that chest up.",
      "Nice form! Try to control the descent more.",
      "Perfect bar path! Maintain that back arch.",
      "Good rep! Focus on driving through your heels.",
      "Excellent! Your knee tracking looks solid."
    ]
    return feedback[Math.floor(Math.random() * feedback.length)]
  }

  const getRandomCorrections = () => {
    const corrections = [
      ["Keep chest up", "Control descent speed"],
      ["Wider stance", "Deeper squat"],
      ["Neutral spine", "Engage core"],
      ["Full range of motion", "Pause at bottom"]
    ]
    return corrections[Math.floor(Math.random() * corrections.length)]
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
      
      setHasPermission(true)
      setIsActive(true)
    } catch (err) {
      setHasPermission(false)
      console.error('Camera access denied:', err)
    }
  }

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
    }
    setIsActive(false)
  }

  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600 bg-green-50'
    if (score >= 70) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  return (
    <Card className="w-full max-w-lg">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold">AI Form Coach</h3>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Target className="h-4 w-4" />
            {currentMovement}
          </div>
        </div>

        {/* Camera View */}
        <div className="relative mb-4 rounded-lg overflow-hidden bg-gray-100">
          {isActive ? (
            <video
              ref={videoRef}
              className="w-full h-48 object-cover"
              autoPlay
              muted
              playsInline
            />
          ) : (
            <div className="w-full h-48 flex items-center justify-center">
              <div className="text-center">
                <Camera className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Camera not active</p>
              </div>
            </div>
          )}
          
          {isActive && (
            <div className="absolute top-2 right-2">
              <div className="flex items-center gap-1 bg-red-500 text-white px-2 py-1 rounded-full text-xs">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                LIVE
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex gap-2 mb-4">
          {!isActive ? (
            <Button 
              onClick={startCamera} 
              className="flex-1"
              disabled={hasPermission === false}
            >
              <Camera className="h-4 w-4 mr-2" />
              Start Analysis
            </Button>
          ) : (
            <>
              <Button 
                onClick={analyzeForm} 
                disabled={isAnalyzing}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <Lightning className="h-4 w-4 mr-2" />
                {isAnalyzing ? 'Analyzing...' : 'Analyze Rep'}
              </Button>
              <Button 
                onClick={stopCamera} 
                variant="outline"
              >
                <Stop className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>

        {hasPermission === false && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2 text-red-700 text-sm">
              <Warning className="h-4 w-4" />
              Camera permission denied. Please enable camera access.
            </div>
          </div>
        )}

        {/* Analysis Results */}
        {currentAnalysis && (
          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Form Score</span>
              <div className={cn(
                "px-3 py-1 rounded-full text-sm font-bold",
                getScoreColor(currentAnalysis.score)
              )}>
                {currentAnalysis.score}/100
              </div>
            </div>
            
            <div>
              <div className="flex items-center gap-1 mb-1">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Feedback</span>
              </div>
              <p className="text-sm text-gray-600">{currentAnalysis.feedback}</p>
            </div>
            
            {currentAnalysis.corrections.length > 0 && (
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <Target className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Focus Points</span>
                </div>
                <ul className="text-sm text-gray-600 space-y-1">
                  {currentAnalysis.corrections.map((correction, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                      {correction}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}
