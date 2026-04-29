import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Volume2, Leaf, Users, Utensils, Droplets, Sun, Moon } from 'lucide-react'

const guidelines = [
  {
    icon: Volume2,
    title: 'Quiet Hours',
    description: 'Quiet hours are from 9:00 PM to 7:00 AM. Please be mindful of others resting and keep noise to a minimum during these times.',
  },
  {
    icon: Utensils,
    title: 'Meal Times',
    description: 'Brunch is served at 10:00 AM and dinner at 6:00 PM. Please arrive on time. If you will miss a meal, let the kitchen know in advance.',
  },
  {
    icon: Droplets,
    title: 'Water Conservation',
    description: 'We are off-grid and water is precious. Please take short showers and report any leaks immediately.',
  },
  {
    icon: Leaf,
    title: 'Substance-Free',
    description: 'Paz is a substance-free environment. No alcohol, tobacco, or recreational drugs are permitted on the property.',
  },
  {
    icon: Users,
    title: 'Community Participation',
    description: 'We ask all residents to contribute 1-2 hours daily to community tasks. This could be kitchen help, cleaning, or garden work.',
  },
  {
    icon: Sun,
    title: 'Digital Detox',
    description: 'We encourage minimal screen time. Please keep phone usage to designated areas and avoid screens during meals.',
  },
]

export default function PortalGuidelinesPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display text-paz-green mb-2">
          House Guidelines
        </h1>
        <p className="text-muted-foreground">
          Simple guidelines to help us live well together
        </p>
      </div>

      {/* Introduction */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <BookOpen className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-foreground mb-2">
                Living in Community
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Paz is a shared living space where we practice presence, simplicity, and respect for each other 
                and nature. These guidelines help us maintain harmony and create space for everyone to rest, 
                reflect, and reconnect.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Guidelines Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {guidelines.map((guideline) => {
          const Icon = guideline.icon
          return (
            <Card key={guideline.title} className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Icon className="h-5 w-5 text-primary" />
                  {guideline.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {guideline.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Daily Rhythm */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Moon className="h-5 w-5 text-primary" />
            Daily Rhythm
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Wake up / Sunrise</span>
              <span className="font-medium text-foreground">~5:30 AM</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Morning movement (optional)</span>
              <span className="font-medium text-foreground">7:00 AM</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Brunch</span>
              <span className="font-medium text-foreground">10:00 AM</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Dinner</span>
              <span className="font-medium text-foreground">6:00 PM</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Quiet hours begin</span>
              <span className="font-medium text-foreground">9:00 PM</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">Lights out</span>
              <span className="font-medium text-foreground">~9:30 PM</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact */}
      <Card className="border-border">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground mb-2">
            Questions or concerns? Reach out to Roberto:
          </p>
          <a 
            href="https://wa.me/50686182302" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary font-medium hover:underline"
          >
            +506 8618 2302 (WhatsApp)
          </a>
        </CardContent>
      </Card>
    </div>
  )
}
