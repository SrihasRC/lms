-- Sample Data for Library Management System
-- Run this after creating the schema and setting up at least one admin user through Supabase Auth

-- Insert sample books with real ISBNs for Open Library cover images
INSERT INTO books (isbn, title, author, publisher, publication_year, genre, description, total_copies, available_copies, location) VALUES
('9780134685991', 'Effective Java', 'Joshua Bloch', 'Addison-Wesley', 2018, 'Programming', 'A comprehensive guide to writing robust, efficient, and maintainable Java code.', 3, 3, 'Section A - Shelf 1'),
('9780132350884', 'Clean Code', 'Robert C. Martin', 'Prentice Hall', 2008, 'Programming', 'A handbook of agile software craftsmanship with practical advice on writing clean code.', 5, 5, 'Section A - Shelf 2'),
('9780201633610', 'Design Patterns', 'Gang of Four', 'Addison-Wesley', 1994, 'Programming', 'Elements of reusable object-oriented software design patterns.', 2, 2, 'Section A - Shelf 3'),
('9781617294136', 'Spring in Action', 'Craig Walls', 'Manning', 2018, 'Programming', 'Comprehensive guide to Spring Framework for Java developers.', 4, 4, 'Section A - Shelf 4'),
('9780596517748', 'JavaScript: The Good Parts', 'Douglas Crockford', 'O''Reilly', 2008, 'Programming', 'Explores the elegant and useful parts of JavaScript.', 3, 3, 'Section B - Shelf 1'),
('9781491950296', 'Building Microservices', 'Sam Newman', 'O''Reilly', 2015, 'Programming', 'Designing fine-grained systems with microservices architecture.', 2, 2, 'Section B - Shelf 2'),
('9780134757599', 'Refactoring', 'Martin Fowler', 'Addison-Wesley', 2018, 'Programming', 'Improving the design of existing code through refactoring techniques.', 3, 3, 'Section A - Shelf 5'),
('9781449355739', 'Designing Data-Intensive Applications', 'Martin Kleppmann', 'O''Reilly', 2017, 'Database', 'The big ideas behind reliable, scalable, and maintainable systems.', 4, 4, 'Section C - Shelf 1'),
('9780132350884', 'The Pragmatic Programmer', 'Andrew Hunt', 'Addison-Wesley', 2019, 'Programming', 'Your journey to mastery in software development.', 5, 5, 'Section A - Shelf 6'),
('9780321125215', 'Domain-Driven Design', 'Eric Evans', 'Addison-Wesley', 2003, 'Software Architecture', 'Tackling complexity in the heart of software.', 2, 2, 'Section D - Shelf 1'),

('9780262033848', 'Introduction to Algorithms', 'Thomas H. Cormen', 'MIT Press', 2009, 'Computer Science', 'Comprehensive introduction to algorithms and data structures.', 6, 6, 'Section E - Shelf 1'),
('9780596007126', 'Head First Design Patterns', 'Eric Freeman', 'O''Reilly', 2004, 'Programming', 'A brain-friendly guide to design patterns.', 4, 4, 'Section A - Shelf 7'),
('9781449369415', 'Learning Python', 'Mark Lutz', 'O''Reilly', 2013, 'Programming', 'Powerful object-oriented programming in Python.', 5, 5, 'Section B - Shelf 3'),
('9780137081073', 'The Clean Coder', 'Robert C. Martin', 'Prentice Hall', 2011, 'Programming', 'A code of conduct for professional programmers.', 3, 3, 'Section A - Shelf 8'),
('9781593279509', 'Eloquent JavaScript', 'Marijn Haverbeke', 'No Starch Press', 2018, 'Programming', 'A modern introduction to programming with JavaScript.', 4, 4, 'Section B - Shelf 4'),

('9780141439518', '1984', 'George Orwell', 'Penguin Books', 1949, 'Fiction', 'A dystopian social science fiction novel.', 8, 8, 'Section F - Shelf 1'),
('9780061120084', 'To Kill a Mockingbird', 'Harper Lee', 'Harper Perennial', 1960, 'Fiction', 'A gripping tale of racial injustice and childhood innocence.', 6, 6, 'Section F - Shelf 2'),
('9780743273565', 'The Great Gatsby', 'F. Scott Fitzgerald', 'Scribner', 1925, 'Fiction', 'A portrait of the Jazz Age in all its decadence.', 5, 5, 'Section F - Shelf 3'),
('9780545010221', 'Harry Potter and the Deathly Hallows', 'J.K. Rowling', 'Scholastic', 2007, 'Fantasy', 'The final installment of the Harry Potter series.', 10, 10, 'Section G - Shelf 1'),
('9780316769174', 'The Catcher in the Rye', 'J.D. Salinger', 'Little Brown', 1951, 'Fiction', 'A story of teenage rebellion and alienation.', 4, 4, 'Section F - Shelf 4'),

('9780307277671', 'The Lean Startup', 'Eric Ries', 'Crown Business', 2011, 'Business', 'How constant innovation creates radically successful businesses.', 5, 5, 'Section H - Shelf 1'),
('9781591846444', 'Start with Why', 'Simon Sinek', 'Portfolio', 2009, 'Business', 'How great leaders inspire everyone to take action.', 4, 4, 'Section H - Shelf 2'),
('9780062316097', 'Sapiens', 'Yuval Noah Harari', 'Harper', 2015, 'History', 'A brief history of humankind from stone age to modern age.', 7, 7, 'Section I - Shelf 1'),
('9780143127741', 'Thinking, Fast and Slow', 'Daniel Kahneman', 'Penguin', 2011, 'Psychology', 'The two systems that drive the way we think.', 5, 5, 'Section J - Shelf 1'),
('9780345816023', 'Educated', 'Tara Westover', 'Random House', 2018, 'Biography', 'A memoir about education and self-discovery.', 6, 6, 'Section K - Shelf 1');

-- Note: To add more sample data or test transactions, you would need actual user IDs from the profiles table
-- These can be added after users sign up through the application

-- Example query to check books (run after seeding)
-- SELECT id, title, author, genre, available_copies FROM books ORDER BY genre, title;
