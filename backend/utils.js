export const unique = array => array.filter((value, index, array) => array.indexOf(value) === index)
export const range = (start, len) => new Array(len).fill().map((_, i) => start + i)
export const rangeWithPadding = (num, start = 0, end = 0) => range(num - start, (num - (num - start)) + end + 1)
