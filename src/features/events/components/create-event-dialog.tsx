"use client"

import { useState, useMemo, useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { z } from "zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { EnhancedDatePicker } from "@/components/ui/enhanced-date-picker"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { CalendarIcon } from "@radix-ui/react-icons"
import { IconLoader, IconPlus, IconX, IconPhoto } from "@tabler/icons-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { eventService } from "@/gateway/services"
import { uploadToCloudinary } from "@/utils/cloudinary"

const createEventSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
  startDate: z.date({ required_error: "Start date is required" }),
  endDate: z.date({ required_error: "End date is required" }),
  images: z.array(z.string()).min(1, "At least one image is required"),
})

type CreateEventFormValues = z.infer<typeof createEventSchema>

interface CreateEventDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateEventDialog({ open, onOpenChange }: CreateEventDialogProps) {
  const queryClient = useQueryClient()
  const [imageInput, setImageInput] = useState("")
  const [uploadingImages, setUploadingImages] = useState(false)

  const form = useForm<CreateEventFormValues>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      title: "",
      description: "",
      startDate: undefined,
      endDate: undefined,
      images: [],
    },
  })

  const { mutateAsync: createEvent, isPending } = useMutation({
    mutationFn: eventService.createEvent,
    onSuccess: () => {
      toast.success("Event created successfully!")
      queryClient.invalidateQueries({ queryKey: ['events'] })
      form.reset()
      onOpenChange(false)
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : "Failed to create event"
      toast.error(errorMessage)
    },
  })

  const onSubmit = async (values: CreateEventFormValues) => {
    await createEvent({
      title: values.title,
      description: values.description,
      startDate: values.startDate.toISOString(),
      endDate: values.endDate.toISOString(),
      images: values.images,
    })
  }

  const addImage = () => {
    if (imageInput.trim()) {
      const currentImages = form.getValues("images")
      form.setValue("images", [...currentImages, imageInput.trim()])
      setImageInput("")
    }
  }

  const removeImage = useCallback((index: number) => {
    const currentImages = form.getValues("images")
    form.setValue("images", currentImages.filter((_, i) => i !== index))
  }, [form])

  // Get images from form watch
  const images = form.watch("images")
  
  // Memoized image preview component to prevent unnecessary re-renders
  const ImagePreview = useMemo(() => {
    if (!images || images.length === 0) return null

    return (
      <div className="space-y-2">
        <p className="text-sm font-medium">Uploaded Images ({images.length})</p>
        <div className="grid grid-cols-2 gap-2">
          {images.map((image: string, index: number) => (
            <div key={`${image}-${index}`} className="relative group border rounded-lg overflow-hidden">
              <img 
                src={image} 
                alt={`Event image ${index + 1}`}
                className="w-full h-24 object-cover"
                onError={(e) => {
                  // Prevent infinite retries by setting a data attribute
                  if (!e.currentTarget.dataset.errorHandled) {
                    e.currentTarget.dataset.errorHandled = 'true'
                    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2Y3ZjdmNyIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+SW1hZ2UgRXJyb3I8L3RleHQ+PC9zdmc+'
                  }
                }}
                loading="lazy"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeImage(index)}
              >
                <IconX className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    )
  }, [images, removeImage])

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    // Limit the number of files to prevent excessive uploads
    const maxFiles = 10
    const filesToUpload = Array.from(files).slice(0, maxFiles)
    
    if (files.length > maxFiles) {
      toast.warning(`Only the first ${maxFiles} files will be uploaded`)
    }

    setUploadingImages(true)
    try {
      const uploadPromises = filesToUpload.map(file => uploadToCloudinary(file))
      const uploadResults = await Promise.all(uploadPromises)
      const uploadedUrls = uploadResults.map(result => result.secure_url)
      
      const currentImages = form.getValues("images")
      form.setValue("images", [...currentImages, ...uploadedUrls])
      
      toast.success(`${uploadedUrls.length} image(s) uploaded successfully!`)
    } catch (error) {
      // Log error for debugging in development
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.error('Upload error:', error)
      }
      toast.error('Failed to upload images. Please try again.')
    } finally {
      setUploadingImages(false)
      // Reset the input
      event.target.value = ''
    }
  }, [form])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Event</DialogTitle>
          <DialogDescription>
            Create a new AMSA event for members to register and participate.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter event title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter event description" 
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <EnhancedDatePicker
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                          enableYearMonthDropdowns={true}
                          yearRange={{ from: new Date().getFullYear() - 5, to: new Date().getFullYear() + 5 }}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>End Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <EnhancedDatePicker
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => {
                            const startDate = form.getValues("startDate")
                            return date < new Date() || (startDate && date < startDate)
                          }}
                          initialFocus
                          enableYearMonthDropdowns={true}
                          yearRange={{ from: new Date().getFullYear() - 5, to: new Date().getFullYear() + 5 }}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="images"
              render={() => (
                <FormItem>
                  <FormLabel>Event Images</FormLabel>
                  <div className="space-y-4">
                    {/* File Upload Section */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="image-upload"
                        disabled={uploadingImages}
                      />
                      <label
                        htmlFor="image-upload"
                        className="cursor-pointer flex flex-col items-center space-y-2"
                      >
                        {uploadingImages ? (
                          <>
                            <IconLoader className="h-8 w-8 animate-spin text-gray-400" />
                            <span className="text-sm text-gray-500">Uploading images...</span>
                          </>
                        ) : (
                          <>
                            <IconPhoto className="h-8 w-8 text-gray-400" />
                            <div className="text-sm text-gray-600">
                              <span className="font-medium text-blue-600 hover:text-blue-500">
                                Click to upload
                              </span>{" "}
                              or drag and drop
                            </div>
                            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB each</p>
                          </>
                        )}
                      </label>
                    </div>

                    {/* Manual URL Input */}
                    <div className="flex gap-2">
                      <Input
                        placeholder="Or enter image URL manually"
                        value={imageInput}
                        onChange={(e) => setImageInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            addImage()
                          }
                        }}
                      />
                      <Button type="button" onClick={addImage} size="sm" variant="outline">
                        <IconPlus className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Image Preview */}
                    {ImagePreview}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <IconLoader className="h-4 w-4 animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  'Create Event'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
