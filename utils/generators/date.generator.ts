import moment from 'moment';

export function getDate(date: Date, dateFormat: string) {
  return moment(date).format(dateFormat);
}
