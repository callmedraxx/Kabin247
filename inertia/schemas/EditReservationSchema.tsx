import * as Yup from 'yup';

const EditReservationSchema = Yup.object().shape({
  reservationDate: Yup.date().required('Reservation date is required'),
  startTime: Yup.string().required('Start time is required'),
  endTime: Yup.string().required('End time is required'),
  numberOfPeople: Yup.number().required('Number of people is required'),
  tableNumber: Yup.string().required('Table number is required'),
  status: Yup.string().required('Status is required'),
});

export default EditReservationSchema;
