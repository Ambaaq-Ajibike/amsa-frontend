import { getRequest, postRequest } from '../apiService'
import type {
  CreateEventRequest,
  Event,
  EventParticipant,
  EventQueryParams,
  EventParticipantsQueryParams,
  PaginatedResponse
} from '../types/api'

export const eventService = {
  // Get all events with pagination and filters
  getEvents: async (params: EventQueryParams = {}): Promise<PaginatedResponse<Event>> => {
    const searchParams = new URLSearchParams()
    
    if (params.status) searchParams.append('Status', params.status)
    if (params.page) searchParams.append('Page', params.page.toString())
    if (params.pageSize) searchParams.append('PageSize', params.pageSize.toString())
    if (params.sortBy) searchParams.append('SortBy', params.sortBy)
    if (params.keyword) searchParams.append('Keyword', params.keyword)
    if (params.isAscending !== undefined) searchParams.append('IsAscending', params.isAscending.toString())

    const queryString = searchParams.toString()
    return getRequest<PaginatedResponse<Event>>(`/events${queryString ? `?${queryString}` : ''}`)
  },

  // Get all events (no pagination)
  getAllEvents: async (): Promise<Event[]> => {
    return getRequest<Event[]>('/events/all')
  },

  // Get user's events
  getUserEvents: async (status?: 'upcoming' | 'ongoing' | 'completed'): Promise<PaginatedResponse<Event>> => {
    const searchParams = new URLSearchParams()
    if (status) searchParams.append('Status', status)
    
    const queryString = searchParams.toString()
    return getRequest<PaginatedResponse<Event>>(`/events${queryString ? `?${queryString}` : ''}`)
  },

  // Get user's registered events
  getUserRegisteredEvents: async (): Promise<Event[]> => {
    return getRequest<Event[]>('/events/me/events')
  },

  // Get event by ID
  getEventById: async (id: string): Promise<Event> => {
    return getRequest<Event>(`/events/${id}`)
  },

  // Create new event
  createEvent: async (eventData: CreateEventRequest): Promise<Event> => {
    return postRequest<Event, CreateEventRequest>('/events', eventData)
  },

  // Register for event
  registerForEvent: async (eventId: string): Promise<void> => {
    return postRequest<void, object>(`/events/${eventId}/register`, {})
  },

  // Get event participants
  getEventParticipants: async (params: EventParticipantsQueryParams): Promise<PaginatedResponse<EventParticipant>> => {
    const searchParams = new URLSearchParams()
    
    searchParams.append('EventId', params.eventId)
    if (params.isPresent !== undefined) searchParams.append('IsPresent', params.isPresent.toString())
    if (params.page) searchParams.append('Page', params.page.toString())
    if (params.pageSize) searchParams.append('PageSize', params.pageSize.toString())
    if (params.sortBy) searchParams.append('SortBy', params.sortBy)
    if (params.keyword) searchParams.append('Keyword', params.keyword)
    if (params.isAscending !== undefined) searchParams.append('IsAscending', params.isAscending.toString())

    const queryString = searchParams.toString()
    return getRequest<PaginatedResponse<EventParticipant>>(`/events/users?${queryString}`)
  },

  // Mark participant as present
  markParticipantPresent: async (eventId: string, userId: string): Promise<void> => {
    return postRequest<void, object>(`/events/${eventId}/users/${userId}/mark-present`, {})
  }
}
