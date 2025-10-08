import { faker } from '@faker-js/faker'

export const participants = Array.from({ length: 20 }, () => {
  const firstName = faker.person.firstName()
  const unit = faker.location.state.name
  const lastName = faker.person.lastName()
  return {
    memberNumber: faker.number.int({ min: 10000, max: 99999 }).toString(),
    firstName,
    lastName,
    unit,
    email: faker.internet.email({ firstName }).toLocaleLowerCase(),
    phoneNumber: faker.phone.number({ style: 'international' }),
    status: faker.helpers.arrayElement([
      'in-school',
      'graduate',
    ]),
  }
})
