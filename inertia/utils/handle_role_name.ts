export default function handleRoleName(roleId: number) {
  switch (roleId) {
    case 1:
      return 'Admin';
    case 2:
      return 'Manager';
    case 3:
      return 'POS Operator';
    case 4:
      return 'Display';
    case 5:
      return 'Kitchen';
    case 6:
      return 'Customer';
    case 7:
      return 'Delivery Person';
    default:
      return 'Unknown';
  }
}
