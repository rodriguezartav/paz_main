# Paz Corcovado - Application Brief

## Overview

**Paz Corcovado** is an internal operations management system for a nature-led co-living space on the Osa Peninsula, Costa Rica. The application manages the full lifecycle of residents - from application through checkout - along with meal planning, room assignments, billing, and kitchen operations.

---

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui (Radix primitives)
- **Authentication**: Supabase Auth (cookie-based SSR)
- **State Management**: React hooks, Server Actions, SWR for client-side fetching
- **Icons**: Lucide React


---

## Project Structure

```plaintext
app/
├── (operations)/          # Admin area (uses AppShell with sidebar)
│   ├── dashboard/         # Overview dashboard
│   ├── residents/         # Resident management
│   ├── applications/      # Review incoming applications
│   ├── application-questions/  # Manage application form questions
│   ├── bills/             # Resident billing
│   ├── buildings/         # Building management
│   ├── rooms/             # Room management (beds, assignments)
│   ├── rates/             # Pricing rules and modifiers
│   ├── recipes/           # Recipe management
│   ├── ingredients/       # Ingredient inventory
│   ├── meal-planner/      # Weekly menu templates
│   ├── weekly-calendar/   # Actual meal plan instances
│   └── users/             # User/admin management
├── apply/                 # Public application form (no sidebar)
├── login/                 # Authentication
└── layout.tsx             # Root layout

components/
├── layout/                # AppShell, sidebar, mobile nav
├── residents/             # Resident-specific components
├── recipes/               # Recipe components
├── ingredients/           # Ingredient components
└── ui/                    # shadcn/ui components

lib/
├── db/queries.ts          # All Supabase database queries
├── types.ts               # TypeScript type definitions
├── supabase/              # Supabase client setup (server/client)
└── utils.ts               # Utility functions
```

---

## Core Data Models

### Residents System

```typescript
Resident {
  id, name, email, whatsapp, nationality, gender, age, diet
  arrival_date, departure_date, status, resident_type
  room, bed, nightly_rate, resident_since
  check_in_completed, release_accepted, health_insurance_confirmed
  media_release_accepted, orientation_completed
  application_id, notes
}

ResidentStatus: 'upcoming' | 'checked_in' | 'staying' | 'checking_out_today' | 'checked_out' | 'cancelled'
ResidentType: 'volunteer' | 'resident' | 'retreat'
Diet: 'eats_all' | 'vegetarian' | 'vegan'
```

### Application System

```typescript
Application {
  id, applicant_name, applicant_email, applicant_phone
  status, submitted_at, reviewed_at, reviewer_notes, internal_score
  answers[]
}

ApplicationQuestion {
  id, section_key, section_title, section_intro
  question_text, question_description, question_type
  options[], required, order_index, active
}

ApplicationStatus: 'pending' | 'reviewing' | 'accepted' | 'rejected' | 'waitlist' | 'needs_more_info'
QuestionType: 'short_text' | 'long_text' | 'single_choice' | 'multiple_choice' | 'date' | 'number' | 'email' | 'phone' | 'checkbox' | 'agreement'
```

### Billing System

```typescript
ResidentBill {
  id, resident_id, description
  amount, tax, total, amount_paid, amount_due
  status, payment_details, due_date
}

BillStatus: 'unpaid' | 'partially_paid' | 'paid'
```

### Pricing System

```typescript
RateRule {
  id, name, application_type, room_type
  base_nightly_rate, currency, is_active
}

ResidentPriceModifier {
  id, name, min_nights, max_nights
  adjustment_type, adjustment_value, is_active
}

// Rate calculation: base_rate + modifier (% or fixed based on stay length)
// < 8 nights = 'retreat' type, >= 8 nights = 'resident' type
```

### Accommodations

```typescript
Building { id, name, description, rooms[] }
Room { id, building_id, name, room_type, is_private, beds[] }
Bed { id, room_id, name, current_assignment }
ResidentBed { id, resident_id, bed_id, is_active }

RoomType: 'private' | 'double' | 'triple' | 'quad'
```

### Kitchen/Meal Planning

```typescript
Ingredient { id, name, type, measurement }
Recipe { id, name, english_name, meal_type, type, recipe_ingredients[] }
WeeklyMenuTemplate { id, name, meals[] }  // Reusable templates
WeeklyMealPlan { id, week_start_date, template_id, meals[] }  // Actual weeks

MealType: 'brunch' | 'dinner'
RecipeType: 'salad' | 'sauce' | 'soup' | 'main' | 'side' | 'dessert'
```

---

## Key Workflows

### 1. Application → Resident Conversion

1. Applicant fills out form at `/apply` (public, no sidebar)
2. Application shows intro screen explaining the filtering process
3. Multi-section form collects: personal info, dates, type (volunteer/resident), expectations
4. Admin reviews at `/applications/[id]` with:

1. **Fit Signals**: Green/Yellow/Red flags auto-detected from answers
2. **Rate Calculator**: Shows recommended rate based on stay length and room type



5. Admin accepts → Creates Resident with:

1. Data mapped from application answers (nationality, gender, diet, age)
2. `resident_type` from rate calculator (or 'volunteer' if selected)
3. `nightly_rate` from rate calculator
4. `resident_since` set to today





### 2. Fit Signal Mapping (Application Review)

**Green Flags:**

- Understands shared living
- Accepts substance-free environment
- Comfortable with digital detox
- Has insurance
- Wants shared life in nature


**Yellow Flags:**

- Needs more information
- Needs some online work time
- Going through mild transition
- No prior relevant experiences


**Red Flags:**

- Expects hotel-style service
- Expects cheap surf lodging
- Does not accept substance-free rules
- No insurance
- In strong emotional crisis
- Needs full-time coworking (5+ hours)
- Has food allergies
- Smoker


### 3. Resident Management

- **Check-in Process**: Checklist items (release, insurance, media release, orientation)
- **Room Assignment**: Assign bed from available rooms
- **Billing**: Create bills manually or auto-generate from stay dates/rate
- **Checkout**: Mark checked out, release bed


### 4. Rate Calculation

```plaintext
1. Get base rate from RateRule (by application_type + room_type)
2. Calculate nights between arrival/departure
3. If nights < 8 → type = 'retreat'
4. If nights >= 8 → type = 'resident'  
5. Apply ResidentPriceModifier based on night range
6. Final rate = base_rate + adjustment
```

---

## Database Patterns

### Queries Location

All database queries are in `lib/db/queries.ts` using Supabase client.

### Server Actions

Each feature has an `actions.ts` file with `'use server'` functions for mutations.

### Common Patterns

```typescript
// Server Component fetches data
const residents = await getResidents()

// Client Component for interactivity
<ResidentsPageClient residents={residents} />

// Server Action for mutations
'use server'
export async function updateResidentAction(id, data) {
  await updateResident(id, data)
  revalidatePath('/residents')
}
```

---

## UI Patterns

### Layout

- `AppShell` wraps all admin pages with collapsible sidebar
- `/apply` has its own layout without sidebar (public-facing)
- Mobile: Bottom navigation bar, collapsible sidebar


### Components

- Cards for data display
- Dialogs for forms/editing
- Badges for status indicators
- Tables for lists


### Styling

- Tailwind CSS v4 with CSS variables for theming
- Dark mode support via `next-themes`
- Design tokens in `globals.css` (--background, --foreground, --primary, etc.)


---

## Environment Variables

```plaintext
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY (for admin operations)
```

---

## Key Files to Understand

| File | Purpose
|-----|-----
| `lib/types.ts` | All TypeScript interfaces
| `lib/db/queries.ts` | All database operations
| `app/(operations)/layout.tsx` | Admin shell with sidebar
| `components/layout/sidebar-nav.tsx` | Navigation structure
| `app/apply/application-form-client.tsx` | Public application form
| `app/(operations)/applications/[id]/application-review-client.tsx` | Application review with fit signals
| `components/residents/resident-details-panel.tsx` | Main resident view/edit UI


---

## Business Context

Paz Corcovado is a co-living space focused on:

- **Intentional community**: Not a hostel or surf camp
- **Nature connection**: Rainforest + Pacific Ocean setting
- **Simple living**: No gurus, no complex methods
- **Filtering**: Applications filter out misaligned guests


The founder (Roberto) personally reviews every application using intuition. The system helps by:

1. Auto-flagging potential fit issues
2. Calculating fair rates based on stay length
3. Managing the operational complexity of a shared living space