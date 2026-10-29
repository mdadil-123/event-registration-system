const [searchTerm, setSearchTerm] = useState('');

// Filtered events directly in frontend or trigger API call
const filteredEvents = events.filter((ev) =>
  ev.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  ev.venue?.toLowerCase().includes(searchTerm.toLowerCase())
);

// JSX Input:
<input
  type="text"
  placeholder="Search events by topic, technology, or city..."
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  style={{
    width: '100%',
    padding: '0.85rem 1.25rem',
    borderRadius: '8px',
    background: '#0f172a',
    border: '1px solid #334155',
    color: '#fff',
    fontSize: '1rem'
  }}
/>