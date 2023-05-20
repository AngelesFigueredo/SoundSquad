const formatDate = (dateString) => {
  const date = new Date(dateString);
  const daysOfWeek = ['Dom.', 'Lun.', 'Mar.', 'Mié.', 'Jue.', 'Vie.', 'Sáb.'];
  const months = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ];
  const dayOfWeek = daysOfWeek[date.getDay()];
  const dayOfMonth = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  const formattedDate = `${dayOfWeek} ${dayOfMonth} de ${month} ${year}`;

  return formattedDate;
}

const formatTime = (timeString) => {
  const date = new Date(`1970-01-01T${timeString}`);
  const hours = date.getHours() % 12 || 12;
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = date.getHours() < 12 ? 'am' : 'pm';
  return `${hours}:${minutes}${ampm}`;
};
  