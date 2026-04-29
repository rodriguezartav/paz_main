'use client'

import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'

interface GuestDisplayFieldsProps {
  isPublic: boolean
  guestDescription: string
  whatToBring: string
  safetyNote: string
  signupEnabled: boolean
  onIsPublicChange: (value: boolean) => void
  onGuestDescriptionChange: (value: string) => void
  onWhatToBringChange: (value: string) => void
  onSafetyNoteChange: (value: string) => void
  onSignupEnabledChange: (value: boolean) => void
}

export function GuestDisplayFields({
  isPublic,
  guestDescription,
  whatToBring,
  safetyNote,
  signupEnabled,
  onIsPublicChange,
  onGuestDescriptionChange,
  onWhatToBringChange,
  onSafetyNoteChange,
  onSignupEnabledChange,
}: GuestDisplayFieldsProps) {
  return (
    <div className="space-y-6 rounded-lg border border-border bg-muted/30 p-4">
      <div>
        <h3 className="mb-4 text-sm font-semibold text-foreground">Guest Display</h3>
        
        {/* Show on Guest Board Toggle */}
        <div className="flex items-center justify-between">
          <Label htmlFor="is_public" className="text-sm">
            Show on guest activity board
          </Label>
          <Switch
            id="is_public"
            checked={isPublic}
            onCheckedChange={onIsPublicChange}
          />
        </div>
      </div>
      
      {isPublic && (
        <>
          {/* Guest Description */}
          <div className="space-y-2">
            <Label htmlFor="guest_description" className="text-sm">
              Guest-facing description
            </Label>
            <Textarea
              id="guest_description"
              value={guestDescription}
              onChange={(e) => onGuestDescriptionChange(e.target.value)}
              placeholder="A brief description for guests..."
              rows={2}
              className="resize-none"
            />
          </div>
          
          {/* What to Bring */}
          <div className="space-y-2">
            <Label htmlFor="what_to_bring" className="text-sm">
              What to bring
            </Label>
            <Textarea
              id="what_to_bring"
              value={whatToBring}
              onChange={(e) => onWhatToBringChange(e.target.value)}
              placeholder="Sunscreen, water bottle, etc."
              rows={2}
              className="resize-none"
            />
          </div>
          
          {/* Safety Note */}
          <div className="space-y-2">
            <Label htmlFor="safety_note" className="text-sm">
              Safety note
            </Label>
            <Textarea
              id="safety_note"
              value={safetyNote}
              onChange={(e) => onSafetyNoteChange(e.target.value)}
              placeholder="Any safety considerations..."
              rows={2}
              className="resize-none"
            />
          </div>
          
          {/* Signup Enabled Toggle */}
          <div className="flex items-center justify-between">
            <Label htmlFor="signup_enabled" className="text-sm">
              Allow guest signups
            </Label>
            <Switch
              id="signup_enabled"
              checked={signupEnabled}
              onCheckedChange={onSignupEnabledChange}
            />
          </div>
        </>
      )}
    </div>
  )
}
