export default function setCookie(key: string, value: string) {
    const currentDate = new Date();
    const expirationDate = new Date(currentDate.setFullYear(currentDate.getFullYear() + 10));
    const expires = expirationDate.toUTCString();
    document.cookie = `${key}=${value}; SameSite=Strict; Expires=${expires}; Path=/`;
};