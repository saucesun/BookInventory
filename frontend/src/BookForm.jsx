import { useState, useEffect } from 'react'

const emptyBook = { title: '', author: '', quantity: '', price: '' }

function BookForm({ onSave, editing, onCancel, error }) {
  const [book, setBook] = useState(emptyBook)

  // If a book is being edited, load its data into the form
  useEffect(() => {
    setBook(editing ? editing : emptyBook)
  }, [editing])

  const handleChange = (e) => {
    setBook({ ...book, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const ok = await onSave(book)
    if (ok) setBook(emptyBook) // clear only if the save worked
  }

  return (
    <form className="card form" onSubmit={handleSubmit}>
      <h2>{editing ? 'Edit book' : 'Add a book'}</h2>

      <div className="fields">
        <label className="wide">
          Title
          <input name="title" value={book.title} onChange={handleChange} placeholder="Noli Me Tangere" />
        </label>
        <label className="wide">
          Author
          <input name="author" value={book.author} onChange={handleChange} placeholder="Jose Rizal" />
        </label>
        <label>
          Quantity
          <input name="quantity" type="number" min="0" value={book.quantity} onChange={handleChange} placeholder="0" />
        </label>
        <label>
          Price (PHP)
          <input name="price" type="number" min="0" step="0.01" value={book.price} onChange={handleChange} placeholder="0.00" />
        </label>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="actions">
        <button type="submit" className="primary">{editing ? 'Save changes' : 'Add book'}</button>
        {editing && <button type="button" className="outline" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  )
}

export default BookForm
