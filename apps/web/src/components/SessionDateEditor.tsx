import { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Calendar, Check, X } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface SessionDateEditorProps {
  sessionId: string
  currentDate: string
  sessionName?: string
  children: React.ReactNode
}

export function SessionDateEditor({ sessionId, currentDate, sessionName, children }: SessionDateEditorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [newDate, setNewDate] = useState(currentDate.split('T')[0]) // Convert to YYYY-MM-DD format
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    try {
      setIsSaving(true)
      await new Promise((resolve) => setTimeout(resolve, 300))
      toast.success(`Session ${sessionId} date updated (local preview)`)
      setIsOpen(false)
    } catch {
      toast.error('Failed to update session date')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setNewDate(currentDate.split('T')[0])
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Change Session Date
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {sessionName && (
            <p className="text-sm text-gray-600">
              Moving: <span className="font-medium">{sessionName}</span>
            </p>
          )}
          <div>
            <label htmlFor="session-date" className="block text-sm font-medium text-gray-700 mb-2">
              New Date
            </label>
            <Input
              id="session-date"
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex items-center gap-2 pt-4">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1"
            >
              <Check className="h-4 w-4 mr-2" />
              {isSaving ? 'Updating...' : 'Save'}
            </Button>
            <Button
              variant="outline"
              onClick={handleCancel}
              className="flex-1"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
