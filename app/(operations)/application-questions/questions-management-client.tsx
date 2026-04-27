'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import type { ApplicationSection, ApplicationQuestion, QuestionType } from '@/lib/types'
import { 
  createQuestionAction, 
  updateQuestionAction, 
  deleteQuestionAction,
  toggleQuestionActiveAction
} from './actions'
import { Plus, Edit, Trash2, GripVertical, ChevronDown, ChevronRight, Eye, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface QuestionsManagementClientProps {
  sections: ApplicationSection[]
}

const questionTypeLabels: Record<QuestionType, string> = {
  short_text: 'Short Text',
  long_text: 'Long Text',
  single_choice: 'Single Choice',
  multiple_choice: 'Multiple Choice',
  date: 'Date',
  number: 'Number',
  email: 'Email',
  phone: 'Phone',
  checkbox: 'Checkbox',
  agreement: 'Agreement',
}

const defaultQuestion: Partial<ApplicationQuestion> = {
  question_text: '',
  question_description: '',
  question_type: 'short_text',
  options: [],
  required: false,
  active: true,
  order_index: 0,
}

export function QuestionsManagementClient({ sections: initialSections }: QuestionsManagementClientProps) {
  const router = useRouter()
  const [sections, setSections] = useState(initialSections)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(sections.map(s => s.key)))
  const [selectedSection, setSelectedSection] = useState<string | null>(sections[0]?.key || null)
  
  // Dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false)
  
  // Form state
  const [editingQuestion, setEditingQuestion] = useState<Partial<ApplicationQuestion> | null>(null)
  const [editingSectionKey, setEditingSectionKey] = useState<string>('')
  const [editingSectionTitle, setEditingSectionTitle] = useState<string>('')
  const [questionToDelete, setQuestionToDelete] = useState<string | null>(null)
  const [optionInput, setOptionInput] = useState('')

  const toggleSection = (key: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(key)) {
        newSet.delete(key)
      } else {
        newSet.add(key)
      }
      return newSet
    })
  }

  const handleAddQuestion = (sectionKey: string, sectionTitle: string) => {
    const section = sections.find(s => s.key === sectionKey)
    const maxOrder = Math.max(0, ...(section?.questions.map(q => q.order_index) || []))
    
    setEditingQuestion({
      ...defaultQuestion,
      section_key: sectionKey,
      section_title: sectionTitle,
      order_index: maxOrder + 1,
    })
    setEditingSectionKey(sectionKey)
    setEditingSectionTitle(sectionTitle)
    setEditDialogOpen(true)
  }

  const handleEditQuestion = (question: ApplicationQuestion) => {
    setEditingQuestion(question)
    setEditingSectionKey(question.section_key)
    setEditingSectionTitle(question.section_title)
    setEditDialogOpen(true)
  }

  const handleSaveQuestion = async () => {
    if (!editingQuestion?.question_text) return
    
    const questionData = {
      section_key: editingSectionKey,
      section_title: editingSectionTitle,
      section_intro: editingQuestion.section_intro || null,
      question_text: editingQuestion.question_text,
      question_description: editingQuestion.question_description || null,
      question_type: editingQuestion.question_type as QuestionType,
      options: editingQuestion.options || [],
      required: editingQuestion.required || false,
      order_index: editingQuestion.order_index || 0,
      active: editingQuestion.active ?? true,
    }
    
    if (editingQuestion.id) {
      await updateQuestionAction(editingQuestion.id, questionData)
    } else {
      await createQuestionAction(questionData)
    }
    
    setEditDialogOpen(false)
    setEditingQuestion(null)
    router.refresh()
  }

  const handleDeleteQuestion = async () => {
    if (!questionToDelete) return
    await deleteQuestionAction(questionToDelete)
    setDeleteDialogOpen(false)
    setQuestionToDelete(null)
    router.refresh()
  }

  const handleToggleActive = async (questionId: string, active: boolean) => {
    await toggleQuestionActiveAction(questionId, active)
    router.refresh()
  }

  const addOption = () => {
    if (!optionInput.trim() || !editingQuestion) return
    setEditingQuestion({
      ...editingQuestion,
      options: [...(editingQuestion.options || []), optionInput.trim()]
    })
    setOptionInput('')
  }

  const removeOption = (index: number) => {
    if (!editingQuestion) return
    setEditingQuestion({
      ...editingQuestion,
      options: editingQuestion.options?.filter((_, i) => i !== index) || []
    })
  }

  const currentSection = sections.find(s => s.key === selectedSection)

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col md:flex-row">
      {/* Sections List - Left Panel */}
      <div className="w-full border-b border-border bg-sidebar/30 md:w-72 md:border-b-0 md:border-r">
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="font-semibold text-foreground">Sections</h2>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setPreviewDialogOpen(true)}
            className="gap-1.5"
          >
            <Eye className="h-4 w-4" />
            Preview
          </Button>
        </div>
        <div className="max-h-[200px] overflow-y-auto p-2 md:max-h-none">
          {sections.map(section => (
            <button
              key={section.key}
              onClick={() => setSelectedSection(section.key)}
              className={cn(
                'flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-colors',
                selectedSection === section.key
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground hover:bg-sidebar-accent'
              )}
            >
              <span className="truncate">{section.title}</span>
              <Badge variant="secondary" className="ml-2 shrink-0">
                {section.questions.length}
              </Badge>
            </button>
          ))}
        </div>
      </div>

      {/* Questions List - Main Panel */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {currentSection ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold text-foreground">{currentSection.title}</h1>
                <p className="text-sm text-muted-foreground">
                  {currentSection.questions.length} questions
                </p>
              </div>
              <Button
                onClick={() => handleAddQuestion(currentSection.key, currentSection.title)}
                className="gap-1.5"
              >
                <Plus className="h-4 w-4" />
                Add Question
              </Button>
            </div>

            {currentSection.intro && (
              <Card className="bg-muted/30">
                <CardContent className="py-4">
                  <p className="text-sm text-muted-foreground italic">
                    Section intro: {currentSection.intro}
                  </p>
                </CardContent>
              </Card>
            )}

            <div className="space-y-3">
              {currentSection.questions
                .sort((a, b) => a.order_index - b.order_index)
                .map((question, index) => (
                <Card 
                  key={question.id} 
                  className={cn(
                    'transition-opacity',
                    !question.active && 'opacity-50'
                  )}
                >
                  <CardContent className="flex items-start gap-4 p-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <GripVertical className="h-5 w-5 cursor-grab" />
                      <span className="w-6 text-center text-sm font-medium">{index + 1}</span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground">
                            {question.question_text}
                            {question.required && (
                              <span className="ml-1 text-destructive">*</span>
                            )}
                          </p>
                          {question.question_description && (
                            <p className="mt-1 text-sm text-muted-foreground">
                              {question.question_description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant="outline" className="text-xs">
                            {questionTypeLabels[question.question_type]}
                          </Badge>
                          {!question.active && (
                            <Badge variant="secondary" className="text-xs">
                              Inactive
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {question.options && question.options.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {question.options.map((option, i) => (
                            <Badge key={i} variant="secondary" className="text-xs font-normal">
                              {option}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <Switch
                        checked={question.active}
                        onCheckedChange={(checked) => handleToggleActive(question.id, checked)}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditQuestion(question)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => {
                          setQuestionToDelete(question.id)
                          setDeleteDialogOpen(true)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-muted-foreground">Select a section to view questions</p>
          </div>
        )}
      </div>

      {/* Edit Question Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingQuestion?.id ? 'Edit Question' : 'Add Question'}
            </DialogTitle>
            <DialogDescription>
              {editingSectionTitle}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Question Text *</Label>
              <Textarea
                value={editingQuestion?.question_text || ''}
                onChange={(e) => setEditingQuestion(prev => prev ? { ...prev, question_text: e.target.value } : prev)}
                placeholder="Enter your question..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Textarea
                value={editingQuestion?.question_description || ''}
                onChange={(e) => setEditingQuestion(prev => prev ? { ...prev, question_description: e.target.value } : prev)}
                placeholder="Additional context for the question..."
                rows={2}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Question Type</Label>
                <Select
                  value={editingQuestion?.question_type || 'short_text'}
                  onValueChange={(value) => setEditingQuestion(prev => prev ? { ...prev, question_type: value as QuestionType } : prev)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(questionTypeLabels) as QuestionType[]).map(type => (
                      <SelectItem key={type} value={type}>
                        {questionTypeLabels[type]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Order Index</Label>
                <Input
                  type="number"
                  value={editingQuestion?.order_index || 0}
                  onChange={(e) => setEditingQuestion(prev => prev ? { ...prev, order_index: parseInt(e.target.value) || 0 } : prev)}
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  checked={editingQuestion?.required || false}
                  onCheckedChange={(checked) => setEditingQuestion(prev => prev ? { ...prev, required: checked } : prev)}
                />
                <Label>Required</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={editingQuestion?.active ?? true}
                  onCheckedChange={(checked) => setEditingQuestion(prev => prev ? { ...prev, active: checked } : prev)}
                />
                <Label>Active</Label>
              </div>
            </div>

            {/* Options for choice questions */}
            {(editingQuestion?.question_type === 'single_choice' || editingQuestion?.question_type === 'multiple_choice') && (
              <div className="space-y-2">
                <Label>Options</Label>
                <div className="flex gap-2">
                  <Input
                    value={optionInput}
                    onChange={(e) => setOptionInput(e.target.value)}
                    placeholder="Add an option..."
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addOption())}
                  />
                  <Button type="button" onClick={addOption} variant="outline">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {editingQuestion?.options?.map((option, index) => (
                    <Badge key={index} variant="secondary" className="gap-1">
                      {option}
                      <button onClick={() => removeOption(index)} className="ml-1 hover:text-destructive">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveQuestion}>
              {editingQuestion?.id ? 'Save Changes' : 'Create Question'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Question</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this question? This will also affect any existing 
              applications that reference this question. Consider deactivating instead.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteQuestion}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Preview Dialog */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Application Form Preview</DialogTitle>
            <DialogDescription>
              This is how the application form will appear to applicants
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {sections.map(section => (
              <Card key={section.key}>
                <CardHeader>
                  <CardTitle className="text-lg">{section.title}</CardTitle>
                  {section.intro && (
                    <CardDescription className="whitespace-pre-line">
                      {section.intro}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  {section.questions
                    .filter(q => q.active)
                    .sort((a, b) => a.order_index - b.order_index)
                    .map(question => (
                    <div key={question.id} className="space-y-2">
                      <p className="text-sm font-medium">
                        {question.question_text}
                        {question.required && <span className="text-destructive ml-1">*</span>}
                      </p>
                      {question.question_description && (
                        <p className="text-xs text-muted-foreground">{question.question_description}</p>
                      )}
                      <div className="rounded border border-dashed border-border bg-muted/30 p-2 text-xs text-muted-foreground">
                        [{questionTypeLabels[question.question_type]}]
                        {question.options && question.options.length > 0 && (
                          <span className="ml-2">Options: {question.options.join(', ')}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
