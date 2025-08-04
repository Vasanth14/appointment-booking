const allRoles = {
  user: ['getSlots', 'createBookings', 'getBookings'],
  admin: ['getUsers', 'manageUsers', 'getSlots', 'manageSlots', 'getBookings', 'manageBookings'],
};

const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));

module.exports = {
  roles,
  roleRights,
};
