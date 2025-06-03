
export default function AddSkuForm() {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget as HTMLFormElement)

    await fetch('/api/submit', {
      method: 'POST',
      body: form,
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" type="text" required />
      <input name="quantity" type="number" required />
      <input name="last_sold_date" type="datetime-local" required />
      <button type="submit">Submit</button>
    </form>
  )
}
