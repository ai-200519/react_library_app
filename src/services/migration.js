import ApiService from './api';

class MigrationService {
  constructor() {
    this.isMigrating = false;
  }

  async migrateFromLocalStorage() {
    if (this.isMigrating) {
      return { success: false, message: 'Migration already in progress' };
    }

    try {
      this.isMigrating = true;
      
      // Get local data
      const localBooks = JSON.parse(localStorage.getItem('userBooks') || '[]');
      const localShelves = JSON.parse(localStorage.getItem('userShelves') || '[]');
      
      if (localBooks.length === 0 && localShelves.length === 0) {
        return { success: true, message: 'No local data to migrate' };
      }

      let migratedBooks = 0;
      let migratedShelves = 0;
      let errors = [];

      // Step 1: Migrate shelves first (books depend on shelves)
      const shelfIdMap = new Map(); // Maps old shelf IDs to new ones

      for (const shelf of localShelves) {
        try {
          const newShelf = await ApiService.createShelf({
            name: shelf.name,
            description: shelf.description || null,
          });
          shelfIdMap.set(shelf.id, newShelf.id);
          migratedShelves++;
        } catch (error) {
          console.warn(`Failed to migrate shelf: ${shelf.name}`, error);
          errors.push(`Shelf "${shelf.name}": ${error.message}`);
        }
      }

      // Step 2: Migrate books and update shelf references
      for (const book of localBooks) {
        try {
          // Update shelf IDs in book metadata
          const bookData = { ...book };
          if (bookData.meta?.shelves) {
            const updatedShelves = bookData.meta.shelves
              .map(oldShelfId => shelfIdMap.get(oldShelfId))
              .filter(Boolean); // Remove any unmapped shelf IDs
            bookData.meta.shelves = updatedShelves;
          }

          await ApiService.createBook(bookData);
          migratedBooks++;
        } catch (error) {
          console.warn(`Failed to migrate book: ${book.title}`, error);
          errors.push(`Book "${book.title}": ${error.message}`);
        }
      }

      // Step 3: Clear localStorage if migration was successful
      if (migratedBooks > 0 || migratedShelves > 0) {
        // Create backup before clearing
        const backupData = {
          books: localBooks,
          shelves: localShelves,
          timestamp: new Date().toISOString(),
        };
        localStorage.setItem('migrationBackup', JSON.stringify(backupData));
        
        // Clear original data
        localStorage.removeItem('userBooks');
        localStorage.removeItem('userShelves');
      }

      return {
        success: true,
        message: `Migration completed: ${migratedBooks} books, ${migratedShelves} shelves`,
        details: {
          books: migratedBooks,
          shelves: migratedShelves,
          errors: errors.length > 0 ? errors : null,
        },
      };
      
    } catch (error) {
      console.error('Migration failed:', error);
      return {
        success: false,
        message: 'Migration failed',
        error: error.message,
      };
    } finally {
      this.isMigrating = false;
    }
  }

  async restoreFromBackup() {
    try {
      const backup = localStorage.getItem('migrationBackup');
      if (!backup) {
        return { success: false, message: 'No backup found' };
      }

      const backupData = JSON.parse(backup);
      
      // Restore to localStorage
      localStorage.setItem('userBooks', JSON.stringify(backupData.books));
      localStorage.setItem('userShelves', JSON.stringify(backupData.shelves));
      
      return {
        success: true,
        message: `Restored ${backupData.books.length} books and ${backupData.shelves.length} shelves from backup`,
      };
    } catch (error) {
      console.error('Restore failed:', error);
      return {
        success: false,
        message: 'Restore failed',
        error: error.message,
      };
    }
  }

  hasLocalData() {
    const localBooks = JSON.parse(localStorage.getItem('userBooks') || '[]');
    const localShelves = JSON.parse(localStorage.getItem('userShelves') || '[]');
    return localBooks.length > 0 || localShelves.length > 0;
  }

  hasBackup() {
    return !!localStorage.getItem('migrationBackup');
  }
}

export default new MigrationService();