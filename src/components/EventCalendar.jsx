import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import frLocale from '@fullcalendar/core/locales/fr';
import AuthService from '../services/AuthService';

function EventCalendar() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    setError('');

    try {
      const eventsData = await AuthService.getMyEvents();

      const formattedEvents = Array.isArray(eventsData)
        ? eventsData.map((event) => ({
            id: event.id?.toString() || Math.random().toString(),
            title: event.titre || event.nom || 'Événement',
            start: event.dateDebut || event.date_debut || event.start,
            end: event.dateFin || event.date_fin || event.end,
            allDay: event.allDay || false,
            backgroundColor: 'rgba(0,0,0,0)', // on laisse la couleur au CSS
            borderColor: 'rgba(0,0,0,0)',
            textColor: '#1c422c',
            extendedProps: {
              description: event.description || event.descriptif || '',
              lieu: event.lieu || event.adresse || '',
              formateur: event.formateur || '',
            },
          }))
        : [];

      setEvents(formattedEvents);
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des événements');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEventClick = (clickInfo) => {
    const event = clickInfo.event;
    const extendedProps = event.extendedProps;

    const details = [
      extendedProps.description && `Description: ${extendedProps.description}`,
      extendedProps.lieu && `Lieu: ${extendedProps.lieu}`,
      extendedProps.formateur && `Formateur: ${extendedProps.formateur}`,
    ]
      .filter(Boolean)
      .join('\n');

    if (details) {
      alert(`${event.title}\n\n${details}`);
    }
  };

  if (loading) {
    return (
      <div className="planning-wrapper">
        Chargement du planning...
      </div>
    );
  }

  if (error) {
    return (
      <div className="planning-error">
        <strong>Erreur :</strong> {error}
        <button onClick={loadEvents}>Réessayer</button>
      </div>
    );
  }

  return (
    <div className="planning-card">
      <div className="planning-header">
        <span className="planning-day-label">
          {new Date().toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' })}
        </span>
      </div>

      <div className="planning-calendar-container">
        <FullCalendar
          plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
          initialView="timeGridDay"
          initialDate={new Date()}
          headerToolbar={false}
          events={events}
          eventClick={handleEventClick}
          locale={frLocale}
          firstDay={1}
          height="auto"
          slotMinTime="07:00:00"
          slotMaxTime="18:00:00"
          allDaySlot={false}
          weekends={true}
          eventDisplay="block"
          selectable={false}
          editable={false}
          slotLabelFormat={{
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          }}
          eventTimeFormat={{
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          }}
          dayHeaderShown={false}
          dayCellClassNames={() => 'fc-custom-day'}
        />
      </div>
    </div>
  );
}

export default EventCalendar;
