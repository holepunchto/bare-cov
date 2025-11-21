function processInput(value) {
  let result

  if (typeof value === 'number') {
    if (value > 10) {
      result = value * 2
    } else {
      result = value + 5
    }
  } else if (typeof value === 'string') {
    if (value.length > 5) {
      result = value.toUpperCase()
    } else {
      result = value.toLowerCase()
    }
  } else {
    result = null
  }

  return result
}

processInput(12345)
