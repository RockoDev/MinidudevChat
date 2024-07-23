export const unique = array => array.filter((value, index, array) => array.indexOf(value) === index)

export const range = (start, len) => new Array(len).fill().map((_, i) => start + i)

export const rangeWithPadding = (num, start = 0, end = 0) => range(num - start, (num - (num - start)) + end + 1)

export const getDurationText = duration => {
  const hours = Math.floor(duration / 3600)
  const minutes = Math.floor((duration % 3600) / 60)
  const seconds = duration % 60
  if ( hours > 0 ) return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}
