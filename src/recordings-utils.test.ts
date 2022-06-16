import { formatRelativeDay } from './recordings-utils'

beforeAll(() => {
  jest.useFakeTimers()
  jest.setSystemTime(new Date('2021-12-01T12:00:00'))
})

afterAll(() => {
  // set the system time back to normal
  jest.setSystemTime()
})

test.each([
  ['2021-12-01T11:00:00', 'Today'],
  ['2021-12-01T10:00:00', 'Today'],
  ['2021-11-30T21:00:00', 'Yesterday'],
  ['2021-11-30T09:00:00', 'Yesterday'],
  ['2021-11-29T09:00:00', new Date('2021-11-29T09:00:00').toLocaleDateString()]
])('format relative day works as expected for %s', (dateString, expected) => {
  expect(formatRelativeDay(new Date(dateString))).toEqual(expected)
})
