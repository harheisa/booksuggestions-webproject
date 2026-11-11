import { useState, useEffect } from 'react';
import { Container, Button, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import { FaDice, FaBookmark, FaCheck } from 'react-icons/fa';

const GENRES = new Array(
  { id: 'science_fiction', label: 'Sci-fi' },
  { id: 'fantasy', label: 'Fantasy' },
  { id: 'mystery_and_detective_stories', label: 'Mystery & Detective Stories' },
  { id: 'history', label: 'History' },
  { id: 'classics', label: 'Classics' },
  { id: 'biography', label: 'Biographies' },
  { id: 'romance', label: 'Romance' },
  { id: 'psychology', label: 'Psychology' }
);

function Home() {
  const [selectedGenre, setSelectedGenre] = useState(GENRES.at(0));
  const [books, setBooks] = useState(new Array());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [surpriseMessage, setSurpriseMessage] = useState('');
  const [savedIds, setSavedIds] = useState(() => {
    const saved = localStorage.getItem('readingList');
    const parsed = saved ? JSON.parse(saved) : new Array();
    return parsed.map((book) => book.key);
  });

  // Search for books each time the genre changes
  useEffect(() => {
    const fetchBooksBySubject = async () => {
      setLoading(true);
      setError(null);

      try {
        const apiUrl =
          'https://openlibrary.org/subjects/' + selectedGenre.id + '.json?limit=8';

        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error('Search for recommendations failed.');
        }

        const data = await response.json();
        setBooks(data.works || new Array());
      } catch (err) {
        console.error(err);
        setError('Loading recommendations failed. Try again in a moment.');
      } finally {
        setLoading(false);
      }
    };

    fetchBooksBySubject();
  }, [selectedGenre]);

  // random genre (different than the current one)
  const handleSurpriseMe = () => {
    const otherGenres = GENRES.filter((g) => g.id !== selectedGenre.id);
    const randomIndex = Math.floor(Math.random() * otherGenres.length);
    const chosen = otherGenres.at(randomIndex);

    setSelectedGenre(chosen);
    setSurpriseMessage(`Try something from this genre: ${chosen.label}`);
  };

  // Saves recommended book to reading list
  const addToReadingList = (book) => {
    const saved = localStorage.getItem('readingList');
    const currentList = saved ? JSON.parse(saved) : new Array();

    if (!currentList.some((item) => item.key === book.key)) {
      const authorName =
        book.authors && book.authors.length > 0
          ? book.authors.at(0).name
          : 'Unknown author';

      const bookToSave = {
        key: book.key,
        title: book.title,
        author: authorName,
        year: book.first_publish_year || 'Unknown date',
        coverId: book.cover_id || null,
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
      <div className="p-4 mb-4 rounded-3 border" style={{ backgroundColor: 'var(--bg-card)' }}>
        <h1 className="mb-2">Recommendations</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Browse recommended books by genre, or let the machine make a random suggestion.
        </p>

        {/* Genre-picker and Random Book button */}
        <div className="d-flex flex-wrap gap-2 mt-3 align-items-center">
          {GENRES.map((genre) => (
            <Button
              key={genre.id}
              variant={selectedGenre.id === genre.id ? 'primary' : 'outline-secondary'}
              size="sm"
              className={selectedGenre.id === genre.id ? 'btn-accent' : ''}
              onClick={() => {
                setSelectedGenre(genre);
                setSurpriseMessage('');
              }}
            >
              {genre.label}
            </Button>
          ))}

          <Button
            variant="dark"
            size="sm"
            onClick={handleSurpriseMe}
            className="ms-md-auto d-flex align-items-center"
          >
            <FaDice className="me-2" />
            Random Book
          </Button>
        </div>

        {surpriseMessage && (
          <Alert variant="success" className="mt-3 mb-0 py-2">
            {surpriseMessage}
          </Alert>
        )}
      </div>

      <h2 className="h4 mb-3">Genre: {selectedGenre.label}</h2>

      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" role="status" style={{ color: 'var(--accent-color)' }}>
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-2">Making recommendations...</p>
        </div>
      ) : (
        <Row xs={1} sm={2} md={3} lg={4} className="g-4">
          {books.map((book) => {
            const isSaved = savedIds.includes(book.key);
            const authorName =
              book.authors && book.authors.length > 0
                ? book.authors.at(0).name
                : 'Unknown author';

            const coverUrl = book.cover_id
              ? 'https://covers.openlibrary.org/b/id/' + book.cover_id + '-M.jpg'
              : 'https://placehold.co/300x450?text=No+cover+available';

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
                      {authorName}
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
      )}
    </Container>
  );
}

export default Home;
