import { faker } from '@faker-js/faker'

export const users = Array.from({ length: 20 }, () => {
  const firstName = faker.person.firstName()
  const lastName = faker.person.lastName()
  return {
    memberNumber: faker.number.int({ min: 10000, max: 99999 }).toString(),
    firstName,
    lastName,
    username: faker.internet
      .username({ firstName, lastName })
      .toLocaleLowerCase(),
    email: faker.internet.email({ firstName }).toLocaleLowerCase(),
    phoneNumber: faker.phone.number({ style: 'international' }),
    status: faker.helpers.arrayElement([
      'in-school',
      'graduate',
    ]),
    role: faker.helpers.arrayElement([
      'president',
      'tajneed',
      'gensec',
      'pro',
    ]),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
  }
})
