import { useState, useEffect } from 'react'
import BookForm from './BookForm'
import BookCard from './BookCard'
import './App.css'

// URL of the PHP backend hosted on XAMPP
const API = 'http://localhost/book-inventory/backend/api.php'

// Format numbers as Philippine pesos
const peso = (n) => n.toLocaleString('en-PH', { style: 'currency', currency: 'PHP' })

function App() {
  const [books, setBooks] = useState([])
  const [editing, setEditing] = useState(null) // book being edited
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')

  // Helper that sends a request to api.php with an action name
  const callApi = async (action, data = null) => {
    const options = { method: data ? 'POST' : 'GET' }
    if (data) {
      options.headers = { 'Content-Type': 'application/json' }
      options.body = JSON.stringify(data)
    }
    const res = await fetch(`${API}?action=${action}`, options)
    const result = await res.json()
    if (!res.ok) throw new Error(result.error || 'Something went wrong.')
    return result
  }

  // Load all books from the database
  const loadBooks = async () => {
    setBooks(await callApi('list'))
  }

  // Run once when the page loads
  useEffect(() => {
    loadBooks()
  }, [])

  // Create or update depending on whether the book has an id
  const saveBook = async (book) => {
    try {
      await callApi(book.id ? 'update' : 'create', book)
      setEditing(null)
      setError('')
      loadBooks()
      return true
    } catch (err) {
      setError(err.message)
      return false
    }
  }

  // Delete a book after the user confirms
  const deleteBook = async (id) => {
    if (window.confirm('Delete this book from the inventory?')) {
      await callApi('delete', { id })
      loadBooks()
    }
  }

  // Summary numbers for the stats bar
  const totalCopies = books.reduce((sum, b) => sum + b.quantity, 0)
  const totalValue = books.reduce((sum, b) => sum + b.quantity * b.price, 0)

  // Filter by title or author
  const q = search.toLowerCase()
  const filtered = books.filter(
    (b) => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q)
  )

  return (
    <>
      <header className="hero">
        <div className="hero-inner">
          <h1>Book Inventory</h1>
          <dl className="stats">
            <div><dt>Titles</dt><dd>{books.length}</dd></div>
            <div><dt>Copies in stock</dt><dd>{totalCopies}</dd></div>
            <div><dt>Stock value</dt><dd>{peso(totalValue)}</dd></div>
          </dl>
        </div>
      </header>

      <main className="wrapper">
        <BookForm
          onSave={saveBook}
          editing={editing}
          onCancel={() => { setEditing(null); setError('') }}
          error={error}
        />

        <div className="toolbar">
          <h2>Shelf</h2>
          <input
            type="search"
            placeholder="Search by title or author"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {books.length === 0 && <p className="empty">The shelf is empty. Add your first book above.</p>}
        {books.length > 0 && filtered.length === 0 && <p className="empty">No books match "{search}".</p>}

        <div className="grid">
          {filtered.map((b) => (
            <BookCard key={b.id} book={b} peso={peso} onEdit={setEditing} onDelete={deleteBook} />
          ))}
        </div>
      </main>
    </>
  )
}

export default App
