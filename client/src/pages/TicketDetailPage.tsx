import { useParams } from 'react-router-dom'

function TicketDetailPage() {
  const { id } = useParams()

  return (
    <div style={{ padding: 24 }}>
      <h1>Ticket Details</h1>
      <p>Placeholder for ticket {id ?? 'unknown'}.</p>
    </div>
  )
}

export default TicketDetailPage
