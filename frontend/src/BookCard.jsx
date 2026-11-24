// Work out the stock label and style for a book
function stockStatus(qty) {
  if (qty === 0) return { label: 'Out of stock', cls: 'out' }
  if (qty <= 5) return { label: `Low stock: ${qty} left`, cls: 'low' }
  return { label: `${qty} in stock`, cls: 'ok' }
}

// One card per book
function BookCard({ book, peso, onEdit, onDelete }) {
  const status = stockStatus(book.quantity)

  return (
    <article className="book">
      <div>
        <h3>{book.title}</h3>
        <p className="author">{book.author}</p>
      </div>

      <div className="meta">
        <span className={`chip ${status.cls}`}>{status.label}</span>
        <span className="price">{peso(book.price)}</span>
      </div>

      <div className="actions">
        <button className="outline" onClick={() => onEdit(book)}>Edit</button>
        <button className="remove" onClick={() => onDelete(book.id)}>Delete</button>
      </div>
    </article>
  )
}

export default BookCard
