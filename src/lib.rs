// Book Library Storage - Simple On-Chain Book Management with Reading Progress & Chapter Notes
use near_sdk::{env, log, near, AccountId};
use std::collections::{HashMap, HashSet};

/// Individual book entry stored on-chain with reading progress tracking and chapter notes
#[near(serializers = [json, borsh])]
#[derive(Clone)]
pub struct BookEntry {
    pub isbn: String,
    pub title: String,
    pub author: String,
    pub acquisition_date: String, // ISO format: YYYY-MM-DD
    pub condition: String,         // e.g., "Like New", "Good", "Fair"
    pub personal_comments: String,
    pub media_hash: Option<String>, // IPFS/Arweave hash for photos

    // Reading Progress Tracking
    pub reading_status: ReadingStatus,
    pub current_chapter: u32,     // Chapter number currently reading
    pub total_chapters: Option<u32>, // Total chapters in book
    pub chapters_read: HashSet<u32>, // Set of completed chapter numbers
    pub last_read_position: String, // e.g., "page 45", "23%", "chapter 3 paragraph 2"
    pub last_read_date: Option<String>, // ISO format: YYYY-MM-DD

    // Chapter Notes - Maps chapter number to personal note
    pub chapter_notes: HashMap<u32, String>,
}

/// Reading status of a book
#[near(serializers = [json, borsh])]
#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum ReadingStatus {
    ToRead,
    Reading,
    Completed,
    OnHold,
    Abandoned,
}

/// Progress update details
#[near(serializers = [json, borsh])]
pub struct ProgressUpdate {
    pub current_chapter: Option<u32>,
    pub chapters_completed: Vec<u32>,     // Chapters just completed
    pub last_read_position: Option<String>,
    pub last_read_date: Option<String>,
    pub reading_status: Option<ReadingStatus>,
}

/// Library contract storing book collections by account
#[near(contract_state)]
pub struct Contract {
    /// Maps account_id to their library of books
    /// Using HashMap for simplicity, LookupMap for production if > 1000 books
    libraries: HashMap<AccountId, Vec<BookEntry>>,

    /// Maps account_id to list of accounts they follow
    followed_accounts: HashMap<AccountId, Vec<AccountId>>,
}

impl Default for Contract {
    fn default() -> Self {
        Self {
            libraries: HashMap::new(),
            followed_accounts: HashMap::new(),
        }
    }
}

#[near]
impl Contract {
    /// Add a new book to the caller's library
    pub fn add_book(&mut self, book: BookEntry) {
        let account_id = env::predecessor_account_id();

        // Validate ISBN not already in user's library
        if let Some(library) = self.libraries.get(&account_id) {
            if library.iter().any(|b| b.isbn == book.isbn) {
                env::panic_str("Book with this ISBN already exists in your library");
            }
        }

        log!("Adding book: {} by {}", book.title, book.author);
        self.libraries.entry(account_id).or_insert_with(Vec::new).push(book);
    }

    /// Get all books for a specific account (public read)
    pub fn get_library(&self, account_id: AccountId) -> Vec<BookEntry> {
        self.libraries.get(&account_id).cloned().unwrap_or_default()
    }

    /// Get a specific book by ISBN from an account's library
    pub fn get_book(&self, account_id: AccountId, isbn: String) -> Option<BookEntry> {
        self.libraries
            .get(&account_id)
            .and_then(|library| library.iter().find(|b| b.isbn == isbn).cloned())
    }

    /// Update book details (only owner can modify)
    pub fn update_book(&mut self, isbn: String, updated_book: BookEntry) {
        let account_id = env::predecessor_account_id();

        let library = self.libraries.get_mut(&account_id)
            .expect("Library not found");

        let book_index = library.iter().position(|b| b.isbn == isbn)
            .expect("Book not found in your library");

        log!("Updating book: {}", updated_book.title);
        library[book_index] = updated_book;
    }

    /// Delete a book from library (only owner can delete)
    pub fn delete_book(&mut self, isbn: String) {
        let account_id = env::predecessor_account_id();

        let library = self.libraries.get_mut(&account_id)
            .expect("Library not found");

        let book_index = library.iter().position(|b| b.isbn == isbn)
            .expect("Book not found in your library");

        let removed_book = library.remove(book_index);
        log!("Deleted book: {}", removed_book.title);
    }

    /// Get total number of books across all libraries
    pub fn get_total_books(&self) -> u32 {
        self.libraries.values().map(|lib| lib.len() as u32).sum()
    }

    /// Update reading progress for a book
    pub fn update_reading_progress(&mut self, isbn: String, progress: ProgressUpdate) {
        let account_id = env::predecessor_account_id();

        let library = self.libraries.get_mut(&account_id)
            .expect("Library not found");

        let book = library.iter_mut().find(|b| b.isbn == isbn)
            .expect("Book not found in your library");

        log!("Updating reading progress for: {}", book.title);

        // Update current chapter if provided
        if let Some(chapter) = progress.current_chapter {
            book.current_chapter = chapter;
            log!("Current chapter: {}", chapter);
        }

        // Add completed chapters to set
        for chapter_num in progress.chapters_completed {
            book.chapters_read.insert(chapter_num);
            log!("Completed chapter: {}", chapter_num);
        }

        // Update last read position
        if let Some(position) = progress.last_read_position {
            log!("Last read position: {}", position);
            book.last_read_position = position;
        }

        // Update last read date
        if let Some(date) = progress.last_read_date {
            book.last_read_date = Some(date);
        }

        // Update reading status
        if let Some(status) = progress.reading_status {
            book.reading_status = status;
            log!("Reading status changed to: {:?}", status);
        }
    }

    /// Add or update a note for a specific chapter
    pub fn add_chapter_note(&mut self, isbn: String, chapter: u32, note: String) {
        let account_id = env::predecessor_account_id();

        let library = self.libraries.get_mut(&account_id)
            .expect("Library not found");

        let book = library.iter_mut().find(|b| b.isbn == isbn)
            .expect("Book not found in your library");

        // Validate chapter number
        if let Some(total) = book.total_chapters {
            if chapter > total {
                env::panic_str(&format!("Chapter number {} exceeds total chapters {}", chapter, total));
            }
        } else if chapter == 0 {
            env::panic_str("Chapter number must be at least 1");
        }

        book.chapter_notes.insert(chapter, note);
        log!("Added/updated note for chapter {} of {}", chapter, book.title);
    }

    /// Get a note for a specific chapter
    pub fn get_chapter_note(&self, account_id: AccountId, isbn: String, chapter: u32) -> Option<String> {
        self.libraries
            .get(&account_id)
            .and_then(|library| {
                library.iter()
                    .find(|b| b.isbn == isbn)
                    .and_then(|book| book.chapter_notes.get(&chapter).cloned())
            })
    }

    /// Get all chapter notes for a book
    pub fn get_all_chapter_notes(&self, account_id: AccountId, isbn: String) -> HashMap<u32, String> {
        self.libraries
            .get(&account_id)
            .and_then(|library| {
                library.iter()
                    .find(|b| b.isbn == isbn)
                    .map(|book| book.chapter_notes.clone())
            })
            .unwrap_or_default()
    }

    /// Delete a note for a specific chapter
    pub fn delete_chapter_note(&mut self, isbn: String, chapter: u32) {
        let account_id = env::predecessor_account_id();

        let library = self.libraries.get_mut(&account_id)
            .expect("Library not found");

        let book = library.iter_mut().find(|b| b.isbn == isbn)
            .expect("Book not found in your library");

        if book.chapter_notes.remove(&chapter).is_some() {
            log!("Deleted note for chapter {} of {}", chapter, book.title);
        } else {
            log!("No note found for chapter {} - nothing to delete", chapter);
        }
    }

    /// Get reading statistics for an account's library
    pub fn get_reading_stats(&self, account_id: AccountId) -> ReadingStats {
        let library = self.libraries.get(&account_id).cloned().unwrap_or_default();

        let total_books = library.len();
        let reading = library.iter().filter(|b| b.reading_status == ReadingStatus::Reading).count();
        let completed = library.iter().filter(|b| b.reading_status == ReadingStatus::Completed).count();
        let to_read = library.iter().filter(|b| b.reading_status == ReadingStatus::ToRead).count();

        ReadingStats {
            total_books: total_books as u32,
            currently_reading: reading as u32,
            completed: completed as u32,
            to_read: to_read as u32,
            on_hold: (total_books - reading - completed - to_read) as u32,
        }
    }

    /// Get books currently being read
    pub fn get_currently_reading(&self, account_id: AccountId) -> Vec<BookEntry> {
        self.get_library(account_id)
            .into_iter()
            .filter(|b| b.reading_status == ReadingStatus::Reading)
            .collect()
    }

    /// Mark book as completed
    pub fn mark_completed(&mut self, isbn: String) {
        let account_id = env::predecessor_account_id();

        let library = self.libraries.get_mut(&account_id)
            .expect("Library not found");

        let book = library.iter_mut().find(|b| b.isbn == isbn)
            .expect("Book not found in your library");

        book.reading_status = ReadingStatus::Completed;
        book.last_read_date = Some(env::block_timestamp().to_string()); // Use current date in real implementation
        log!("Marked {} as completed", book.title);

        // Mark all chapters as read if total_chapters is set
        if let Some(total) = book.total_chapters {
            for i in 1..=total {
                book.chapters_read.insert(i);
            }
            log!("Marked all {} chapters as completed", total);
        }
    }

    /// Mark book as currently reading
    pub fn start_reading(&mut self, isbn: String, starting_chapter: Option<u32>) {
        let account_id = env::predecessor_account_id();

        let library = self.libraries.get_mut(&account_id)
            .expect("Library not found");

        let book = library.iter_mut().find(|b| b.isbn == isbn)
            .expect("Book not found in your library");

        book.reading_status = ReadingStatus::Reading;
        book.current_chapter = starting_chapter.unwrap_or(1);
        log!("Started reading {} from chapter {}", book.title, book.current_chapter);
    }

    /// Follow another account to track their library
    pub fn follow_account(&mut self, account_id_to_follow: AccountId) {
        let account_id = env::predecessor_account_id();

        // Prevent self-follow
        if account_id == account_id_to_follow {
            panic!("Cannot follow yourself");
        }

        // Get or create followed list for this account
        let followed = self.followed_accounts.entry(account_id.clone()).or_default();

        // Check if already following
        if followed.contains(&account_id_to_follow) {
            log!("Already following {}", account_id_to_follow);
            return;
        }

        followed.push(account_id_to_follow.clone());
        log!("Now following {}", account_id_to_follow);
    }

    /// Unfollow an account
    pub fn unfollow_account(&mut self, account_id_to_unfollow: AccountId) {
        let account_id = env::predecessor_account_id();

        let followed = self.followed_accounts.get_mut(&account_id)
            .expect("You don't have any followed accounts");

        // Remove account_id_to_unfollow if present
        let original_len = followed.len();
        followed.retain(|id| id != &account_id_to_unfollow);

        if followed.len() < original_len {
            log!("Unfollowed {}", account_id_to_unfollow);
        } else {
            log!("Not following {}", account_id_to_unfollow);
        }
    }

    /// Get list of accounts you follow
    pub fn get_followed_accounts(&self) -> Vec<AccountId> {
        let account_id = env::predecessor_account_id();

        match self.followed_accounts.get(&account_id) {
            Some(followed) => followed.clone(),
            None => Vec::new(),
        }
    }

    /// Get another user's library (view-only access)
    pub fn get_user_library(&self, account_id: AccountId) -> Vec<BookEntry> {
        match self.libraries.get(&account_id) {
            Some(library) => library.clone(),
            None => Vec::new(),
        }
    }

    /// Get another user's reading stats
    pub fn get_user_stats(&self, account_id: AccountId) -> ReadingStats {
        let library = match self.libraries.get(&account_id) {
            Some(lib) => lib,
            None => return ReadingStats {
                total_books: 0,
                currently_reading: Vec::new(),
                completed: 0,
                to_read: 0,
                on_hold: 0,
            },
        };

        let mut stats = ReadingStats {
            total_books: library.len(),
            currently_reading: Vec::new(),
            completed: 0,
            to_read: 0,
            on_hold: 0,
        };

        for book in library {
            match book.reading_status {
                ReadingStatus::Reading => stats.currently_reading.push(book),
                ReadingStatus::Completed => stats.completed += 1,
                ReadingStatus::ToRead => stats.to_read += 1,
                ReadingStatus::OnHold => stats.on_hold += 1,
                ReadingStatus::Abandoned => {}
            }
        }

        stats
    }
}

/// Reading statistics for an account's library
#[near(serializers = [json, borsh])]
pub struct ReadingStats {
    pub total_books: u32,
    pub currently_reading: u32,
    pub completed: u32,
    pub to_read: u32,
    pub on_hold: u32,
}

/*
 * The rest of this file holds the inline tests for the code above
 * Learn more about Rust tests: https://doc.rust-lang.org/book/ch11-01-writing-tests.html
 */
#[cfg(test)]
mod tests {
    use super::*;
    use near_sdk::testing_env;

    fn get_context(predecessor: AccountId) -> near_sdk::test_utils::VMContextBuilder {
        let mut builder = near_sdk::test_utils::VMContextBuilder::new();
        builder
            .predecessor_account_id(predecessor)
            .attached_deposit(near_sdk::NearToken::from_yoctonear(0));
        builder
    }

    fn create_sample_book() -> BookEntry {
        BookEntry {
            isbn: "978-0451524935".to_string(),
            title: "1984".to_string(),
            author: "George Orwell".to_string(),
            acquisition_date: "2024-01-15".to_string(),
            condition: "Good".to_string(),
            personal_comments: "Still relevant today".to_string(),
            media_hash: None,
            reading_status: ReadingStatus::ToRead,
            current_chapter: 0,
            total_chapters: Some(10),
            chapters_read: HashSet::new(),
            last_read_position: "Not started".to_string(),
            last_read_date: None,
            chapter_notes: HashMap::new(),
        }
    }

    #[test]
    fn add_and_get_book() {
        let context = get_context("alice.testnet".parse().unwrap());
        testing_env!(context.build());

        let mut contract = Contract::default();
        contract.add_book(create_sample_book());

        let library = contract.get_library("alice.testnet".parse().unwrap());
        assert_eq!(library.len(), 1);
        assert_eq!(library[0].title, "1984");
        assert_eq!(library[0].reading_status, ReadingStatus::ToRead);
    }

    #[test]
    fn duplicate_isbn_fails() {
        let context = get_context("alice.testnet".parse().unwrap());
        testing_env!(context.build());

        let mut contract = Contract::default();
        contract.add_book(create_sample_book());

        // Should panic on duplicate
        let result = std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| {
            contract.add_book(create_sample_book());
        }));
        assert!(result.is_err());
    }

    #[test]
    fn start_reading() {
        let context = get_context("alice.testnet".parse().unwrap());
        testing_env!(context.build());

        let mut contract = Contract::default();
        contract.add_book(create_sample_book());
        contract.start_reading("978-0451524935".to_string(), Some(1));

        let book = contract.get_book("alice.testnet".parse().unwrap(), "978-0451524935".to_string()).unwrap();
        assert_eq!(book.reading_status, ReadingStatus::Reading);
        assert_eq!(book.current_chapter, 1);
    }

    #[test]
    fn update_reading_progress() {
        let context = get_context("alice.testnet".parse().unwrap());
        testing_env!(context.build());

        let mut contract = Contract::default();
        contract.add_book(create_sample_book());
        contract.start_reading("978-0451524935".to_string(), Some(1));

        let progress = ProgressUpdate {
            current_chapter: Some(3),
            chapters_completed: vec![1, 2],
            last_read_position: Some("page 45".to_string()),
            last_read_date: Some("2024-12-22".to_string()),
            reading_status: None,
        };

        contract.update_reading_progress("978-0451524935".to_string(), progress);

        let book = contract.get_book("alice.testnet".parse().unwrap(), "978-0451524935".to_string()).unwrap();
        assert_eq!(book.current_chapter, 3);
        assert!(book.chapters_read.contains(&1));
        assert!(book.chapters_read.contains(&2));
        assert_eq!(book.last_read_position, "page 45");
        assert_eq!(book.last_read_date, Some("2024-12-22".to_string()));
    }

    #[test]
    fn mark_completed() {
        let context = get_context("alice.testnet".parse().unwrap());
        testing_env!(context.build());

        let mut contract = Contract::default();
        contract.add_book(create_sample_book());
        contract.start_reading("978-0451524935".to_string(), Some(1));

        contract.mark_completed("978-0451524935".to_string());

        let book = contract.get_book("alice.testnet".parse().unwrap(), "978-0451524935".to_string()).unwrap();
        assert_eq!(book.reading_status, ReadingStatus::Completed);
        // All chapters should be marked as read
        assert_eq!(book.chapters_read.len(), 10);
    }

    #[test]
    fn add_chapter_note() {
        let context = get_context("alice.testnet".parse().unwrap());
        testing_env!(context.build());

        let mut contract = Contract::default();
        contract.add_book(create_sample_book());

        contract.add_chapter_note("978-0451524935".to_string(), 3, "Great quote on page 45 about freedom".to_string());

        let note = contract.get_chapter_note("alice.testnet".parse().unwrap(), "978-0451524935".to_string(), 3);
        assert!(note.is_some());
        assert_eq!(note.unwrap(), "Great quote on page 45 about freedom");
    }

    #[test]
    fn update_existing_chapter_note() {
        let context = get_context("alice.testnet".parse().unwrap());
        testing_env!(context.build());

        let mut contract = Contract::default();
        contract.add_book(create_sample_book());

        // Add initial note
        contract.add_chapter_note("978-0451524935".to_string(), 3, "Initial note".to_string());

        // Update note
        contract.add_chapter_note("978-0451524935".to_string(), 3, "Updated note with more detail".to_string());

        let note = contract.get_chapter_note("alice.testnet".parse().unwrap(), "978-0451524935".to_string(), 3);
        assert_eq!(note.unwrap(), "Updated note with more detail");
    }

    #[test]
    fn get_all_chapter_notes() {
        let context = get_context("alice.testnet".parse().unwrap());
        testing_env!(context.build());

        let mut contract = Contract::default();
        contract.add_book(create_sample_book());

        // Add notes for multiple chapters
        contract.add_chapter_note("978-0451524935".to_string(), 3, "Great quote on page 45".to_string());
        contract.add_chapter_note("978-0451524935".to_string(), 5, "This was confusing".to_string());
        contract.add_chapter_note("978-0451524935".to_string(), 7, "Key insight about Winston".to_string());

        let notes = contract.get_all_chapter_notes("alice.testnet".parse().unwrap(), "978-0451524935".to_string());
        assert_eq!(notes.len(), 3);
        assert_eq!(notes.get(&3).unwrap(), "Great quote on page 45");
        assert_eq!(notes.get(&5).unwrap(), "This was confusing");
        assert_eq!(notes.get(&7).unwrap(), "Key insight about Winston");
    }

    #[test]
    fn delete_chapter_note() {
        let context = get_context("alice.testnet".parse().unwrap());
        testing_env!(context.build());

        let mut contract = Contract::default();
        contract.add_book(create_sample_book());

        // Add note
        contract.add_chapter_note("978-0451524935".to_string(), 3, "Note to delete".to_string());

        // Verify note exists
        let note = contract.get_chapter_note("alice.testnet".parse().unwrap(), "978-0451524935".to_string(), 3);
        assert!(note.is_some());

        // Delete note
        contract.delete_chapter_note("978-0451524935".to_string(), 3);

        // Verify note is gone
        let note = contract.get_chapter_note("alice.testnet".parse().unwrap(), "978-0451524935".to_string(), 3);
        assert!(note.is_none());
    }

    #[test]
    fn get_reading_stats() {
        let context = get_context("alice.testnet".parse().unwrap());
        testing_env!(context.build());

        let mut contract = Contract::default();

        // Add multiple books with different statuses
        let mut book1 = create_sample_book();
        book1.isbn = "978-0451524935".to_string();
        book1.reading_status = ReadingStatus::Reading;
        contract.add_book(book1);

        let mut book2 = create_sample_book();
        book2.isbn = "978-0061120084".to_string();
        book2.title = "To Kill a Mockingbird".to_string();
        book2.reading_status = ReadingStatus::Completed;
        contract.add_book(book2);

        let mut book3 = create_sample_book();
        book3.isbn = "978-0743273565".to_string();
        book3.title = "The Great Gatsby".to_string();
        book3.reading_status = ReadingStatus::ToRead;
        contract.add_book(book3);

        let stats = contract.get_reading_stats("alice.testnet".parse().unwrap());
        assert_eq!(stats.total_books, 3);
        assert_eq!(stats.currently_reading, 1);
        assert_eq!(stats.completed, 1);
        assert_eq!(stats.to_read, 1);
    }

    #[test]
    fn get_currently_reading() {
        let context = get_context("alice.testnet".parse().unwrap());
        testing_env!(context.build());

        let mut contract = Contract::default();

        // Add books
        let mut book1 = create_sample_book();
        book1.isbn = "978-0451524935".to_string();
        book1.reading_status = ReadingStatus::Reading;
        contract.add_book(book1);

        let mut book2 = create_sample_book();
        book2.isbn = "978-0061120084".to_string();
        book2.title = "To Kill a Mockingbird".to_string();
        book2.reading_status = ReadingStatus::Completed;
        contract.add_book(book2);

        let reading = contract.get_currently_reading("alice.testnet".parse().unwrap());
        assert_eq!(reading.len(), 1);
        assert_eq!(reading[0].title, "1984");
    }

    #[test]
    fn update_book() {
        let context = get_context("alice.testnet".parse().unwrap());
        testing_env!(context.build());

        let mut contract = Contract::default();
        contract.add_book(create_sample_book());

        let mut updated_book = create_sample_book();
        updated_book.personal_comments = "Re-read in 2025 - still terrifying".to_string();
        updated_book.total_chapters = Some(12);
        contract.update_book("978-0451524935".to_string(), updated_book);

        let updated = contract.get_book("alice.testnet".parse().unwrap(), "978-0451524935".to_string()).unwrap();
        assert_eq!(updated.personal_comments, "Re-read in 2025 - still terrifying");
        assert_eq!(updated.total_chapters, Some(12));
    }

    #[test]
    fn delete_book() {
        let context = get_context("alice.testnet".parse().unwrap());
        testing_env!(context.build());

        let mut contract = Contract::default();
        contract.add_book(create_sample_book());
        contract.delete_book("978-0451524935".to_string());

        let library = contract.get_library("alice.testnet".parse().unwrap());
        assert_eq!(library.len(), 0);
    }

    #[test]
    fn get_total_books() {
        let context = get_context("alice.testnet".parse().unwrap());
        testing_env!(context.build());

        let mut contract = Contract::default();
        contract.add_book(create_sample_book());

        let mut book2 = create_sample_book();
        book2.isbn = "978-0061120084".to_string();
        book2.title = "To Kill a Mockingbird".to_string();
        contract.add_book(book2);

        // Bob adds 1 book
        let context = get_context("bob.testnet".parse().unwrap());
        testing_env!(context.build());

        let mut book3 = create_sample_book();
        book3.isbn = "978-0743273565".to_string();
        book3.title = "The Great Gatsby".to_string();
        contract.add_book(book3);

        assert_eq!(contract.get_total_books(), 3);
    }
}
