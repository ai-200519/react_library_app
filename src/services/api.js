import DeviceIdService from '../lib/deviceId'

class ApiService {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'
    this.deviceId = DeviceIdService.getDeviceId()
    this.isOnline = navigator.onLine
    
    // Monitor network status
    this.setupNetworkMonitoring()
  }

  setupNetworkMonitoring() {
    window.addEventListener('online', () => {
      this.isOnline = true
      console.log('🌐 Back online - API service available')
    })
    
    window.addEventListener('offline', () => {
      this.isOnline = false
      console.log('📱 Gone offline - API service will use fallbacks')
    })
  }

  async request(endpoint, options = {}) {
    if (!this.isOnline) {
      throw new Error('No internet connection - working in offline mode')
    }

    const url = `${this.baseURL}${endpoint}`
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'X-Device-ID': this.deviceId,
      },
      ...options,
    }

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body)
    }

    try {
      console.log(`📡 API Request: ${config.method || 'GET'} ${endpoint}`)
      
      const response = await fetch(url, config)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log(`✅ API Success: ${config.method || 'GET'} ${endpoint}`)
      return data
      
    } catch (error) {
      console.error(`❌ API Error: ${config.method || 'GET'} ${endpoint}`, error)
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network error - check your connection and server status')
      }
      throw error
    }
  }

  // Health check
  async checkHealth() {
    try {
      const response = await fetch(`${this.baseURL.replace('/api', '')}/health`)
      if (!response.ok) throw new Error(`Health check failed: ${response.status}`)
      return await response.json()
    } catch (error) {
      console.error('Health check failed:', error)
      return { status: 'unhealthy', error: error.message }
    }
  }

  // Device management
  async registerDevice() {
    return this.request('/devices', {
      method: 'POST',
      body: { deviceId: this.deviceId },
    })
  }

  // Books API
  async getBooks() {
    const books = await this.request('/books')
    return books.map(book => this.transformFromBackendFormat(book))
  }

  async getBook(id) {
    const book = await this.request(`/books/${id}`)
    return this.transformFromBackendFormat(book)
  }

  async createBook(bookData) {
    const backendBook = this.transformToBackendFormat(bookData)
    const result = await this.request('/books', {
      method: 'POST',
      body: backendBook,
    })
    return this.transformFromBackendFormat(result)
  }

  async updateBook(id, bookData) {
    const backendBook = this.transformToBackendFormat(bookData)
    const result = await this.request(`/books/${id}`, {
      method: 'PUT',
      body: backendBook,
    })
    return this.transformFromBackendFormat(result)
  }

  async deleteBook(id) {
    return this.request(`/books/${id}`, {
      method: 'DELETE',
    })
  }

  // Shelves API
  async getShelves() {
    return this.request('/shelves')
  }

  async createShelf(shelfData) {
    return this.request('/shelves', {
      method: 'POST',
      body: shelfData,
    })
  }

  async updateShelf(id, shelfData) {
    return this.request(`/shelves/${id}`, {
      method: 'PUT',
      body: shelfData,
    })
  }

  async deleteShelf(id) {
    return this.request(`/shelves/${id}`, {
      method: 'DELETE',
    })
  }

  // Tags API
  async getTags() {
    return this.request('/tags')
  }

  async createTag(tagData) {
    return this.request('/tags', {
      method: 'POST',
      body: tagData,
    })
  }

  async updateTag(id, tagData) {
    return this.request(`/tags/${id}`, {
      method: 'PUT',
      body: tagData,
    })
  }

  async deleteTag(id) {
    return this.request(`/tags/${id}`, {
      method: 'DELETE',
    })
  }

  async updateBookReview(bookId, reviewData) {
    const backendBook = this.transformToBackendFormat(reviewData)
    const response = await fetch(`/books/${bookId}/review`, {
      method: 'PATCH',
      body: backendBook,
    });
    return this.transformFromBackendFormat(response);
  }

  // Quotes API
  async getBookQuotes(bookId) {
    return this.request(`/quotes/book/${bookId}`);
  }

  async addQuote(bookId, quoteData) {
      return this.request(`/quotes/book/${bookId}`, {
        method: 'POST',
        body: quoteData,
      });
  }

  async updateQuote(quoteId, quoteData) {
      return this.request(`/quotes/${quoteId}`, {
        method: 'PUT',
        body: quoteData,
      });
  }

  async deleteQuote(quoteId) {
      return this.request(`/quotes/${quoteId}`, {
        method: 'DELETE',
      });
  }

  async getFavoriteQuotes(bookId) {
      return this.request(`${API_BASE_URL}/quotes/book/${bookId}/favorites`);
  }

  // Data transformation methods
  transformToBackendFormat(frontendBook) {
    return {
      title: frontendBook.title,
      author: frontendBook.author,
      series: frontendBook.series || null,
      volume: frontendBook.volume || null,
      publication_date: frontendBook.publicationDate || null,
      isbn: frontendBook.isbn || null,
      language: frontendBook.language || null,
      pages: frontendBook.pages ? parseInt(frontendBook.pages) : null,
      genre: frontendBook.genre || null,
      description: frontendBook.description || null,
      image_url: frontendBook.imageUrl || null,
      rating: frontendBook.rating ? parseFloat(frontendBook.rating) : null,
      published_year: frontendBook.publishedYear ? parseInt(frontendBook.publishedYear) : null,
      work_key: frontendBook.workKey || null,
      pages_read: frontendBook.meta?.pagesRead || 0,
      date_started: frontendBook.meta?.dateStarted || null,
      date_finished: frontendBook.meta?.dateFinished || null,
      due_date: frontendBook.meta?.dueDate || null,
      lend_to: frontendBook.meta?.lendTo || null,
      personal_rating: frontendBook.personal_rating || null,
      personal_review: frontendBook.personal_review || null,
      reading_status: frontendBook.reading_status || null,
      reading_notes: frontendBook.reading_notes || null,
      borrow_from: frontendBook.meta?.borrowFrom || null,
      date_added: frontendBook.meta?.dateAdded || new Date().toISOString(),
      shelves: frontendBook.meta?.shelves || [],
      tags: frontendBook.meta?.tags || [],
    }
  }

  transformFromBackendFormat(backendBook) {
    return {
      id: backendBook.id,
      title: backendBook.title,
      author: backendBook.author,
      series: backendBook.series,
      volume: backendBook.volume,
      publicationDate: backendBook.publication_date,
      publishedYear: backendBook.published_year,
      isbn: backendBook.isbn,
      genre: backendBook.genre,
      description: backendBook.description,
      imageUrl: backendBook.image_url,
      language: backendBook.language,
      pages: backendBook.pages,
      rating: backendBook.rating,
      workKey: backendBook.work_key,
      personal_rating: backendBook.personal_rating,
      personal_review: backendBook.personal_review,
      reading_status: backendBook.reading_status,
      reading_notes: backendBook.reading_notes,
      meta: {
        pagesRead: backendBook.pages_read || 0,
        dateStarted: backendBook.date_started,
        dateFinished: backendBook.date_finished,
        dueDate: backendBook.due_date,
        lendTo: backendBook.lend_to,
        borrowFrom: backendBook.borrow_from,
        dateAdded: backendBook.date_added,
        shelves: this.extractShelfIds(backendBook.shelves),
        shelfName: this.extractShelfNames(backendBook.shelves),
        tags: Array.isArray(backendBook.tags) ? backendBook.tags : [],
      },
    }
  }

  extractShelfIds(shelves) {
    if (!Array.isArray(shelves)) return []
    return shelves.map(shelf => typeof shelf === 'object' ? shelf.id : shelf).filter(Boolean)
  }

  extractShelfNames(shelves) {
    if (!Array.isArray(shelves)) return ''
    const names = shelves
      .map(shelf => typeof shelf === 'object' ? shelf.name : '')
      .filter(Boolean)
    return names.join(', ')
  }

  // Batch operations for better performance
  async batchUpdateBooks(books) {
    const results = []
    const errors = []

    for (const book of books) {
      try {
        const result = await this.updateBook(book.id, book)
        results.push(result)
      } catch (error) {
        errors.push({ book: book.title, error: error.message })
      }
    }

    return { results, errors }
  }




  // Migration helper - moves localStorage data to database
  async migrateFromLocalStorage() {
    try {
      console.log('🔄 Starting data migration...')
      
      const localBooks = JSON.parse(localStorage.getItem('userBooks') || '[]')
      const localShelves = JSON.parse(localStorage.getItem('userShelves') || '[]')
      
      if (localBooks.length === 0 && localShelves.length === 0) {
        return { success: true, message: 'No local data to migrate' }
      }

      let migratedBooks = 0
      let migratedShelves = 0
      let errors = []

      // Step 1: Register device
      try {
        await this.registerDevice()
      } catch (error) {
        console.log('Device already registered or registration failed:', error.message)
      }

      // Step 2: Migrate shelves first (books depend on shelves)
      const shelfIdMap = new Map() // Maps old shelf IDs to new ones

      for (const shelf of localShelves) {
        try {
          const newShelf = await this.createShelf({
            name: shelf.name,
            description: shelf.description || null,
          })
          shelfIdMap.set(shelf.id, newShelf.id)
          migratedShelves++
          console.log(`✅ Migrated shelf: ${shelf.name}`)
        } catch (error) {
          console.warn(`❌ Failed to migrate shelf: ${shelf.name}`, error)
          errors.push(`Shelf "${shelf.name}": ${error.message}`)
        }
      }

      // Step 3: Migrate books and update shelf references
      for (const book of localBooks) {
        try {
          // Update shelf IDs in book metadata
          const bookData = { ...book }
          if (bookData.meta?.shelves) {
            const updatedShelves = bookData.meta.shelves
              .map(oldShelfId => shelfIdMap.get(oldShelfId))
              .filter(Boolean) // Remove any unmapped shelf IDs
            bookData.meta.shelves = updatedShelves
          }

          await this.createBook(bookData)
          migratedBooks++
          console.log(`✅ Migrated book: ${book.title}`)
        } catch (error) {
          console.warn(`❌ Failed to migrate book: ${book.title}`, error)
          errors.push(`Book "${book.title}": ${error.message}`)
        }
      }

      // Step 4: Create backup and clear localStorage if migration was successful
      if (migratedBooks > 0 || migratedShelves > 0) {
        const backupData = {
          books: localBooks,
          shelves: localShelves,
          timestamp: new Date().toISOString(),
          migratedBooks,
          migratedShelves,
        }
        localStorage.setItem('migrationBackup', JSON.stringify(backupData))
        
        // Clear original data
        localStorage.removeItem('userBooks')
        localStorage.removeItem('userShelves')
        
        console.log(`🎉 Migration completed: ${migratedBooks} books, ${migratedShelves} shelves`)
      }

      return {
        success: true,
        message: `Migration completed: ${migratedBooks} books, ${migratedShelves} shelves`,
        details: {
          books: migratedBooks,
          shelves: migratedShelves,
          errors: errors.length > 0 ? errors : null,
        },
      }
      
    } catch (error) {
      console.error('❌ Migration failed:', error)
      return {
        success: false,
        message: 'Migration failed',
        error: error.message,
      }
    }
  }

  // Restore from backup if migration went wrong
  async restoreFromBackup() {
    try {
      const backup = localStorage.getItem('migrationBackup')
      if (!backup) {
        return { success: false, message: 'No backup found' }
      }

      const backupData = JSON.parse(backup)
      
      // Restore to localStorage
      localStorage.setItem('userBooks', JSON.stringify(backupData.books))
      localStorage.setItem('userShelves', JSON.stringify(backupData.shelves))
      
      console.log('🔄 Restored from backup')
      
      return {
        success: true,
        message: `Restored ${backupData.books.length} books and ${backupData.shelves.length} shelves from backup`,
      }
    } catch (error) {
      console.error('Restore failed:', error)
      return {
        success: false,
        message: 'Restore failed',
        error: error.message,
      }
    }
  }

  // Offline support methods
  getReadingStatusOptions() {
    return [
      { value: 'to_read', label: 'À lire' },
      { value: 'currently_reading', label: 'En cours' },
      { value: 'finished', label: 'Terminé' },
      { value: 'abandoned', label: 'Abandonné' }
    ];
  }

  async getBookQuotesOfflineFirst(bookId) {
    try {
      // Try online first
      return await this.getBookQuotes(bookId);
    } catch (error) {
      // Fallback to localStorage if offline
      const quotes = JSON.parse(localStorage.getItem(`quotes_${bookId}`) || '[]');
      return quotes;
    }
  }

  // Queue offline changes for later sync
  queueOfflineChange(change) {
    const offlineChanges = JSON.parse(localStorage.getItem('offlineChanges') || '[]');
    offlineChanges.push({
      ...change,
      timestamp: Date.now(),
      id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    });
    localStorage.setItem('offlineChanges', JSON.stringify(offlineChanges));
  }

  // Sync offline changes when back online
  async syncOfflineChanges() {
    const offlineChanges = JSON.parse(localStorage.getItem('offlineChanges') || '[]');
    if (offlineChanges.length === 0) return;

    const synced = [];
    const failed = [];

    for (const change of offlineChanges) {
      try {
        switch (change.type) {
          case 'update_review':
            await this.updateBookReview(change.bookId, change.data);
            break;
          case 'add_quote':
            await this.addQuote(change.bookId, change.data);
            break;
          case 'update_quote':
            await this.updateQuote(change.quoteId, change.data);
            break;
          case 'delete_quote':
            await this.deleteQuote(change.quoteId);
            break;
          default:
            console.warn('Unknown offline change type:', change.type);
        }
        synced.push(change.id);
      } catch (error) {
        console.error('Failed to sync change:', change, error);
        failed.push(change);
      }
    }

    // Remove synced changes
    const remainingChanges = offlineChanges.filter(change => !synced.includes(change.id));
    localStorage.setItem('offlineChanges', JSON.stringify(remainingChanges));

    return { synced: synced.length, failed: failed.length };
  }

  // Sync helper - compare local vs remote data and sync
  async syncData() {
    try {
      console.log('🔄 Starting data sync...')
      
      // Get remote data
      const [remoteBooks, remoteShelves] = await Promise.all([
        this.getBooks(),
        this.getShelves(),
      ])

      // Get local data
      const localBooks = JSON.parse(localStorage.getItem('userBooks') || '[]')
      const localShelves = JSON.parse(localStorage.getItem('userShelves') || '[]')

      // Update localStorage with remote data
      localStorage.setItem('userBooks', JSON.stringify(remoteBooks))
      localStorage.setItem('userShelves', JSON.stringify(remoteShelves))

      console.log(`✅ Sync completed: ${remoteBooks.length} books, ${remoteShelves.length} shelves`)

      return {
        success: true,
        localCount: { books: localBooks.length, shelves: localShelves.length },
        remoteCount: { books: remoteBooks.length, shelves: remoteShelves.length },
        data: { books: remoteBooks, shelves: remoteShelves },
      }
    } catch (error) {
      console.error('❌ Sync failed:', error)
      throw error
    }
  }

  // Utility methods
  hasLocalData() {
    const localBooks = JSON.parse(localStorage.getItem('userBooks') || '[]')
    const localShelves = JSON.parse(localStorage.getItem('userShelves') || '[]')
    return localBooks.length > 0 || localShelves.length > 0
  }

  hasBackup() {
    return !!localStorage.getItem('migrationBackup')
  }

  isConnected() {
    return this.isOnline
  }

  // Debug helpers
  async testConnection() {
    try {
      const health = await this.checkHealth()
      console.log('🏥 Health check:', health)
      return health.status === 'ok'
    } catch (error) {
      console.error('🚨 Connection test failed:', error)
      return false
    }
  }

  getConnectionInfo() {
    return {
      baseURL: this.baseURL,
      deviceId: this.deviceId,
      isOnline: this.isOnline,
      hasLocalData: this.hasLocalData(),
      hasBackup: this.hasBackup(),
    }
  }
}

// Create and export singleton instance
const apiService = new ApiService()

// Auto-register device on initialization
apiService.registerDevice().catch(error => {
  console.warn('Device registration failed:', error.message)
})

export default apiService

// Also export the class for testing purposes
export { ApiService }