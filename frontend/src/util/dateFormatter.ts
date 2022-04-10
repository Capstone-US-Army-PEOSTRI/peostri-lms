const dateFormatter = (dateString: string, words?: boolean) => {
    const date = new Date(dateString);

    const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

    if (words) return `${date.toLocaleDateString(undefined, dateOptions)} at ${date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: undefined })}`;

    return `${date.getHours()}:${date.getMinutes()} ${date.getMonth()}/${date.getDate()}/${date.getFullYear()}`
}

export const dateOptions = { hour12: false, weekday: undefined, year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: undefined  }

export default dateFormatter