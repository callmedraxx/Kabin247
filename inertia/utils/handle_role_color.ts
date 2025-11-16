export default function handleRoleColor(roleId: number) {
  switch (roleId) {
    case 1:
      return 'bg-red-500 hover:bg-red-600 text-white data-[active]:bg-red-500 disabled:bg-red-500 disabled:hover:bg-red-500';
    case 2:
      return 'bg-green-500 hover:bg-green-600 text-white data-[active]:bg-green-500 disabled:bg-red-500 disabled:hover:bg-red-500';
    case 3:
      return 'bg-blue-500 hover:bg-blue-600 text-white data-[active]:bg-blue-500 disabled:bg-red-500 disabled:hover:bg-red-500';
    case 4:
      return 'bg-primary-500 hover:bg-primary-600 text-white data-[active]:bg-primary-500 disabled:bg-red-500 disabled:hover:bg-red-500';
    case 5:
      return 'bg-purple-500 hover:bg-purple-600 text-white data-[active]:bg-purple-500 disabled:bg-red-500 disabled:hover:bg-red-500';
    case 6:
      return 'bg-sky-500 hover:bg-sky-600 text-white data-[active]:bg-sky-500 disabled:bg-red-500 disabled:hover:bg-red-500';
    case 7:
      return 'bg-teal-500 hover:bg-teal-600 text-white data-[active]:bg-teal-500 disabled:bg-red-500 disabled:hover:bg-red-500';
    default:
      return 'bg-secondary-500 hover:bg-secondary-600 text-white data-[active]:bg-secondary-500 disabled:bg-red-500 disabled:hover:bg-red-500';
  }
}
