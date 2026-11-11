import { useState } from 'react';
import { Container, Row, Col, Card, Button, Badge, Alert } from 'react-bootstrap';
import { FaStar, FaTrash, FaCheckCircle, FaRegCircle } from 'react-icons/fa';
import { Link } from 'react-router-dom';

function ReadingList() {
  const [books, setBooks] = useState(() => {
    const saved = localStorage.getItem('readingList');
    return saved ? JSON.parse(saved) : new Array();
  });

  // update React state and browser memory (localstorage)
  const updateList = (updatedBooks) => {
    setBooks(updatedBooks);
    localStorage.setItem('readingList', JSON.stringify(updatedBooks));
  };

  // book state Read / Not Read
  const toggleReadStatus = (key) => {
    const updated = books.map((book) =>
      book.key === key ? { ...book, read: !book.read } : book
    );
    updateList(updated);
  };

  // gives a rating to a book
  const setRating = (key, rating) => {
    const updated = books.map((book) =>
      book.key === key ? { ...book, rating: rating } : book
    );
    updateList(updated);
  };

  const removeBook = (key) => {
    const updated = books.filter((book) => book.key !== key);
    updateList(updated);
  };

  const readCount = books.filter((b) => b.read).length;

  return (
    <Container className="my-4">
      <div className="d-flex justify-content-between align-items-center flex-wrap mb-3">
        <div>
          <h1>My reading list</h1>
          <p style={{ color: 'var(--text-muted)' }} className="mb-0">
            Control the books you have saved, mark them as read and rate them from 1 to 5.
          </p>
        </div>
        {books.length > 0 && (
          <Badge bg="secondary" className="fs-6 py-2 px-3 mt-2 mt-md-0">
            Read: {readCount} / {books.length}
          </Badge>
        )}
      </div>

      {/* If list is empty, guide the user to the search */}
      {books.length === 0 ? (
        <Alert variant="light" className="border mt-4 p-4 text-center">
          <p className="mb-3">Your reading list looks empty.</p>
          <Button as={Link} to="/search" className="btn-accent">
            Search for books to add
          </Button>
        </Alert>
      ) : (
        <Row xs={1} sm={2} md={3} lg={4} className="g-4 mt-2">
          {books.map((book) => {
            const coverUrl = book.coverId
              ? 'https://covers.openlibrary.org/b/id/' + book.coverId + '-M.jpg'
              : 'https://placehold.co/300x450?text=No+cover+available';

            return (
              <Col key={book.key}>
                <Card className={`h-100 book-card ${book.read ? 'border-success' : ''}`}>
                  <Card.Img
                    variant="top"
                    src={coverUrl}
                    alt={book.title}
                    style={{
                      height: '240px',
                      objectFit: 'cover',
                      opacity: book.read ? 0.85 : 1
                    }}
                  />
                  <Card.Body className="d-flex flex-column">
                    <div className="mb-2">
                      {book.read ? (
                        <Badge bg="success">Read</Badge>
                      ) : (
                        <Badge bg="warning" text="dark">On the reading list</Badge>
                      )}
                    </div>

                    <Card.Title className="fs-6 fw-bold">{book.title}</Card.Title>
                    <Card.Text className="small mb-3" style={{ color: 'var(--text-muted)' }}>
                      {book.author} ({book.year})
                    </Card.Text>

                    <div className="mb-3">
                      <span className="small d-block mb-1" style={{ color: 'var(--text-muted)' }}>
                        My rating:
                      </span>
                      <div className="d-flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <FaStar
                            key={star}
                            size={20}
                            style={{
                              cursor: 'pointer',
                              color: star <= book.rating ? '#e6a817' : '#d1d5db'
                            }}
                            onClick={() => setRating(book.key, star)}
                            title={`Give ${star} stars`}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="mt-auto d-flex gap-2">
                      <Button
                        variant={book.read ? 'outline-success' : 'success'}
                        size="sm"
                        className="flex-grow-1"
                        onClick={() => toggleReadStatus(book.key)}
                      >
                        {book.read ? (
                          <>
                            <FaCheckCircle className="me-1" /> Read
                          </>
                        ) : (
                          <>
                            <FaRegCircle className="me-1" /> Mark as read
                          </>
                        )}
                      </Button>

                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => removeBook(book.key)}
                        title="Remove from list"
                      >
                        <FaTrash />
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
    </Container>
  );
}

export default ReadingList;
