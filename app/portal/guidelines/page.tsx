import { getActiveGuidelines } from '@/lib/db/queries'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Volume2, Leaf, Users, Utensils, Droplets, Sun, Waves, TreePine, Heart, Home, Recycle, BedDouble, ShowerHead } from 'lucide-react'
import type { Guideline } from '@/lib/types'

// Map categories to icons
const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  shared_spaces: Volume2,
  kitchen: Utensils,
  waste: Recycle,
  rooms: BedDouble,
  laundry: ShowerHead,
  off_grid: Sun,
  ocean: Waves,
  jungle: TreePine,
  safety: Heart,
  participation: Users,
}

export default async function PortalGuidelinesPage() {
  const guidelines = await getActiveGuidelines()

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

      {/* Guidelines from Database */}
      <div className="space-y-4">
        {guidelines.map((guideline) => {
          const Icon = categoryIcons[guideline.category || ''] || Leaf
          return (
            <Card key={guideline.id} className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Icon className="h-5 w-5 text-primary" />
                  {guideline.title}
                </CardTitle>
                {guideline.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {guideline.description}
                  </p>
                )}
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {guideline.items.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-foreground">
                      <span className="text-primary mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )
        })}
      </div>

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
