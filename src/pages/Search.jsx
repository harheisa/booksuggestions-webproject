import { useState } from 'react';
import { Container, Form, Button, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import { FaSearch, FaBookmark, FaCheck } from 'react-icons/fa';

function Search() {
  const [query, setQuery] = useState('');
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);
  const [savedIds, setSavedIds] = useState(() => {
    const saved = JSON.parse(localStorage.getItem('readingList')) || [];
    return saved.map((book) => book.key);
  });

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      const apiUrl = "https://openlibrary.org/search.json?q=" + encodeURIComponent(query) + "&limit=12";
      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error('Search failed.');
      }

      const data = await response.json();
      setBooks(data.docs || []);
    } catch (err) {
      console.error(err);
      setError('Error in searching books. Check your internet connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const addToReadingList = (book) => {
    const currentList = JSON.parse(localStorage.getItem('readingList')) || [];

    if (!currentList.some((item) => item.key === book.key)) {
      const bookToSave = {
        key: book.key,
        title: book.title,
        author: book.author_name ? book.author_name[0] : 'Unknown author',
        year: book.first_publish_year || 'Unknown date',
        coverId: book.cover_i || null,
        read: false,
        rating: 0
      };

      const updatedList = [...currentList, bookToSave];
      localStorage.setItem('readingList', JSON.stringify(updatedList));
      setSavedIds([...savedIds, book.key]);
    }
  };

  return (
    <Container className="my-4">
      <h1 className="mb-3">Search for books</h1>
      <p style={{ color: 'var(--text-muted)' }}>
        Search for books with a book's name, the author's name, genre...
      </p>

      <Form onSubmit={handleSearch} className="mb-4">
        <Row className="g-2">
          <Col xs={12} md={9} lg={10}>
            <Form.Control
              type="text"
              placeholder="Type 'Python', or 'Dune' or 'H.P. Lovecraft'..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </Col>
          <Col xs={12} md={3} lg={2}>
            <Button type="submit" className="btn-accent w-100" disabled={loading}>
              <FaSearch className="me-2" />
              Hae
            </Button>
          </Col>
        </Row>
      </Form>

      {error && <Alert variant="danger">{error}</Alert>}

      {loading && (
        <div className="text-center my-5">
          <Spinner animation="border" role="status" style={{ color: 'var(--accent-color)' }}>
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-2">Searching for books...</p>
        </div>
      )}

      {!loading && searched && books.length === 0 && !error && (
        <Alert variant="secondary">No results. Try again with a different word or name.</Alert>
      )}

      <Row xs={1} sm={2} md={3} lg={4} className="g-4">
        {books.map((book) => {
          const isSaved = savedIds.includes(book.key);
          const coverUrl = book.cover_i
            ? "https://covers.openlibrary.org/b/id/" + book.cover_i + "-M.jpg"
            : "https://placehold.co" + "/300x450?text=No+cover";

          return (
            <Col key={book.key}>
              <Card className="h-100 book-card">
                <Card.Img
                  variant="top"
                  src={coverUrl}
                  alt={book.title}
                  style={{ height: '260px', objectFit: 'cover' }}
                />
                <Card.Body className="d-flex flex-column">
                  <Card.Title className="fs-6 fw-bold">{book.title}</Card.Title>
                  <Card.Text className="small mb-3" style={{ color: 'var(--text-muted)' }}>
                    {book.author_name ? book.author_name[0] : 'Unknown author'}
                    {book.first_publish_year && ` (${book.first_publish_year})`}
                  </Card.Text>

                  <Button
                    variant={isSaved ? 'outline-secondary' : 'primary'}
                    className={`mt-auto w-100 ${!isSaved ? 'btn-accent' : ''}`}
                    onClick={() => addToReadingList(book)}
                    disabled={isSaved}
                  >
                    {isSaved ? (
                      <>
                        <FaCheck className="me-2" />
                        Saved on the reading list
                      </>
                    ) : (
                      <>
                        <FaBookmark className="me-2" />
                        Add to your reading list
                      </>
                    )}
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>
    </Container>
  );
}

export default Search;
