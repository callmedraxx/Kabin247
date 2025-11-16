export const changeTheme = (theme: string) => {
  localStorage.setItem('theme', theme);
  document.querySelector('html')?.setAttribute('data-theme', theme);
};
